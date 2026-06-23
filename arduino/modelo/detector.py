import base64
import json
import os
import re

import cv2
import requests
from dotenv import load_dotenv


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS = [
    model.strip()
    for model in os.getenv("GEMINI_FALLBACK_MODELS", "gemini-flash-latest,gemini-3.5-flash").split(",")
    if model.strip()
]
GEMINI_API_BASE_URL = os.getenv("GEMINI_API_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/models")

CLASES_PERMITIDAS = {
    "BIODEGRADABLE",
    "CARDBOARD",
    "CLOTH",
    "GLASS",
    "METAL",
    "PAPER",
    "PLASTIC",
    "DESCONOCIDO",
}

PUNTOS_CLASIFICACION = {
    "BIODEGRADABLE": 5,
    "CARDBOARD": 10,
    "CLOTH": 15,
    "GLASS": 20,
    "METAL": 25,
    "PAPER": 10,
    "PLASTIC": 15,
    "DESCONOCIDO": 0,
}


def _normalizar_clase(valor):
    clase = str(valor or "").upper().strip()
    clase = re.sub(r"[^A-Z]+", "_", clase).strip("_")
    aliases = {
        "CARTON": "CARDBOARD",
        "CARTON_CORRUGADO": "CARDBOARD",
        "CARDBOARD_BOX": "CARDBOARD",
        "CAJA": "CARDBOARD",
        "CAJA_DE_CARTON": "CARDBOARD",
        "PAPEL": "PAPER",
        "HOJA": "PAPER",
        "HOJA_DE_PAPEL": "PAPER",
        "PAPEL_BLANCO": "PAPER",
        "SERVILLETA": "PAPER",
        "PLASTICO": "PLASTIC",
        "BOTELLA_PLASTICA": "PLASTIC",
        "BOTELLA_DE_PLASTICO": "PLASTIC",
        "ENVASE_PLASTICO": "PLASTIC",
        "BOLSA_PLASTICA": "PLASTIC",
        "VIDRIO": "GLASS",
        "BOTELLA_DE_VIDRIO": "GLASS",
        "METALICO": "METAL",
        "LATA": "METAL",
        "TELA": "CLOTH",
        "ROPA": "CLOTH",
        "ORGANICO": "BIODEGRADABLE",
        "COMIDA": "BIODEGRADABLE",
        "FRUTA": "BIODEGRADABLE",
        "VERDURA": "BIODEGRADABLE",
        "UNKNOWN": "DESCONOCIDO",
        "NULL": "DESCONOCIDO",
        "NO_IDENTIFICADO": "DESCONOCIDO",
    }
    clase = aliases.get(clase, clase)
    return clase if clase in CLASES_PERMITIDAS else "DESCONOCIDO"


def _extraer_json(texto):
    texto = str(texto or "").strip()
    if not texto:
        return {}

    texto = re.sub(r"^```(?:json)?\s*", "", texto, flags=re.IGNORECASE)
    texto = re.sub(r"\s*```$", "", texto)

    try:
        return json.loads(texto)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", texto, flags=re.DOTALL)
        if not match:
            return {}
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}


def _buscar_valor(resultado, *keys):
    if not isinstance(resultado, dict):
        return None

    lower_keys = {str(key).lower(): value for key, value in resultado.items()}
    for key in keys:
        value = lower_keys.get(key.lower())
        if value is not None:
            return value

    for value in resultado.values():
        if isinstance(value, dict):
            nested = _buscar_valor(value, *keys)
            if nested is not None:
                return nested
    return None


def _as_int(value, default=1):
    try:
        return max(int(float(value)), 1)
    except (TypeError, ValueError):
        return default


def _inferir_clase_por_texto(*textos):
    texto = " ".join(str(item or "") for item in textos).lower()
    reglas = [
        ("PLASTIC", ["plastico", "plastica", "botella", "envase", "bolsa", "tapa", "control remoto"]),
        ("PAPER", ["papel", "hoja", "cuaderno", "ticket", "recibo", "servilleta"]),
        ("CARDBOARD", ["carton", "caja", "corrugado", "empaque"]),
        ("GLASS", ["vidrio", "frasco", "vaso", "botella de vidrio"]),
        ("METAL", ["metal", "metalico", "lata", "aluminio", "herramienta"]),
        ("CLOTH", ["tela", "ropa", "trapo", "mochila"]),
        ("BIODEGRADABLE", ["organico", "cascara", "fruta", "verdura", "comida"]),
    ]
    for clase, palabras in reglas:
        if any(palabra in texto for palabra in palabras):
            return clase
    return "DESCONOCIDO"


def _jpeg_base64(imagen):
    ok, buffer = cv2.imencode(".jpg", imagen, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not ok:
        return None
    return base64.b64encode(buffer.tobytes()).decode("utf-8")


def _imagenes_para_gemini(imagen_path):
    imagen = cv2.imread(imagen_path)
    if imagen is None:
        with open(imagen_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8"), None

    alto, ancho = imagen.shape[:2]
    margen_x = int(ancho * 0.22)
    margen_y = int(alto * 0.18)
    centro = imagen[margen_y : alto - margen_y, margen_x : ancho - margen_x]
    return _jpeg_base64(imagen), _jpeg_base64(centro)


def _gemini_payload(base64_image, base64_center_image=None):
    prompt = """
Analiza la imagen e identifica el objeto principal visible en el centro.
Recibiras una imagen completa y, si esta disponible, un recorte central. Basa la
clasificacion principalmente en el recorte central.

Tu objetivo es clasificar el MATERIAL predominante del objeto principal.
NO debes decidir si es basura, residuo o desperdicio.

El objeto puede estar nuevo, limpio, usado, en una mesa, en una mano o en el piso.
Igual debes clasificarlo segun su material visible.

Prioridad visual:
- Enfocate en el tercio central de la imagen.
- Si hay muchos objetos, ignora fondo, mesa, manos, pared, piso y objetos laterales.
- Clasifica el objeto que este mas centrado, mas grande o mas cercano a la camara.
- Si hay varias botellas/envases/latas/hojas del mismo material, cuenta cuantos objetos
  principales del mismo tipo son visibles.

Clases permitidas:
BIODEGRADABLE, CARDBOARD, CLOTH, GLASS, METAL, PAPER, PLASTIC, DESCONOCIDO.

Reglas:
- Siempre intenta clasificar por material visible antes de usar DESCONOCIDO.
- Evita DESCONOCIDO si puedes inferir razonablemente el material.
- No importa si el objeto no parece basura; si parece de plastico, papel, carton,
  vidrio, metal, tela u organico, devuelve esa categoria.
- Si ves una botella plastica, envase plastico, bolsa plastica o tapa plastica: PLASTIC.
- Si ves una hoja simple, hoja blanca, cuaderno, papel impreso, ticket o servilleta seca: PAPER.
- Si ves una caja, carton corrugado o empaque de carton: CARDBOARD.
- Si ves una botella, vaso o frasco de vidrio: GLASS.
- Si ves una lata, herramienta, pieza o envase metalico: METAL.
- Si ves ropa, tela, trapo o mochila de tela: CLOTH.
- Si ves cascara, fruta, verdura, comida natural o restos organicos: BIODEGRADABLE.
- Usa DESCONOCIDO solo si la imagen esta vacia, totalmente borrosa o no hay ningun
  indicio razonable del material.

Devuelve solo JSON valido, sin markdown.

Puntos:
BIODEGRADABLE=5
CARDBOARD=10
CLOTH=15
GLASS=20
METAL=25
PAPER=10
PLASTIC=15
DESCONOCIDO=0

Formato exacto:
{
  "clasificacion": "PLASTIC",
  "confianza": 0.95,
  "descripcion": "Objeto de plastico transparente",
  "objeto_detectado": "botella plastica",
  "cantidad_detectada": 2,
  "texto_vision": "Veo un objeto que parece de plastico. Lo clasifico por su material predominante.",
  "puntos": 15
}
""".strip()

    parts = [
        {"text": prompt},
        {
            "inline_data": {
                "mime_type": "image/jpeg",
                "data": base64_image,
            }
        },
    ]
    if base64_center_image:
        parts.extend(
            [
                {"text": "Recorte central: usa esta imagen como prioridad para clasificar."},
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": base64_center_image,
                    }
                },
            ]
        )

    return {
        "contents": [
            {
                "role": "user",
                "parts": parts,
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json",
        },
    }


def detectar_reciclable(imagen_path, nombre_archivo):
    clase_final = "DESCONOCIDO"
    confianza_final = 0.0
    descripcion = "No se pudo identificar claramente el objeto."
    objeto_detectado = "No identificado"
    cantidad_detectada = 1
    texto_vision = "No se pudo obtener una descripcion visual de la imagen."
    puntos_sugeridos = 0
    error = None
    img_anotada = cv2.imread(imagen_path)

    if not GEMINI_API_KEY:
        print("Error Gemini: falta GEMINI_API_KEY en arduino/.env")
        return _guardar_resultado(
            img_anotada,
            clase_final,
            confianza_final,
            descripcion,
            objeto_detectado,
            cantidad_detectada,
            texto_vision,
            puntos_sugeridos,
            nombre_archivo,
            "Falta GEMINI_API_KEY en arduino/.env",
        )

    try:
        base64_image, base64_center_image = _imagenes_para_gemini(imagen_path)
        models = [GEMINI_MODEL, *[model for model in GEMINI_FALLBACK_MODELS if model != GEMINI_MODEL]]
        response = None
        last_error_text = None

        for model in models:
            api_url = f"{GEMINI_API_BASE_URL}/{model}:generateContent"
            response = requests.post(
                f"{api_url}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json=_gemini_payload(base64_image, base64_center_image),
                timeout=30,
            )
            if response.status_code == 200:
                print(f"[Gemini model] {model}")
                break
            last_error_text = response.text[:500]
            print(f"Error Gemini HTTP {response.status_code} con {model}: {last_error_text}")
            if response.status_code not in {429, 404}:
                break

        if response is None or response.status_code != 200:
            error = (
                "Gemini no pudo clasificar la imagen. "
                "Si el codigo es 429, se agoto la cuota temporal de la API; espera unos minutos o usa otra API key."
            )
            return _guardar_resultado(
                img_anotada,
                clase_final,
                confianza_final,
                descripcion,
                objeto_detectado,
                cantidad_detectada,
                texto_vision,
                puntos_sugeridos,
                nombre_archivo,
                f"{error} Detalle: {last_error_text or 'sin respuesta'}",
            )

        data = response.json()
        texto = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        resultado = _extraer_json(texto)
        print(f"[Gemini raw text] {texto[:1000]}")
        print(f"[Gemini parsed json] {resultado}")

        clase_final = _normalizar_clase(
            _buscar_valor(resultado, "clasificacion", "categoria", "category", "clase", "class", "material")
        )
        confianza_final = float(_buscar_valor(resultado, "confianza", "confidence", "score") or 0)
        confianza_final = max(0.0, min(confianza_final, 1.0))
        descripcion = str(
            _buscar_valor(resultado, "descripcion", "description", "explicacion") or descripcion
        ).strip()[:220]
        objeto_detectado = str(
            _buscar_valor(resultado, "objeto_detectado", "objeto", "object", "object_detected")
            or descripcion
            or objeto_detectado
        ).strip()[:120]
        cantidad_detectada = _as_int(
            _buscar_valor(
                resultado,
                "cantidad_detectada",
                "cantidad",
                "count",
                "numero_objetos",
                "objetos_detectados",
            )
        )
        texto_vision = str(
            _buscar_valor(resultado, "texto_vision", "vision_text", "analisis", "analysis")
            or descripcion
            or texto
            or texto_vision
        ).strip()[:420]

        if clase_final == "DESCONOCIDO":
            clase_final = _inferir_clase_por_texto(descripcion, objeto_detectado, texto_vision, texto)
            if clase_final != "DESCONOCIDO" and confianza_final == 0:
                confianza_final = 0.65

        puntos_sugeridos = int(
            _buscar_valor(resultado, "puntos", "points", "score_points") or PUNTOS_CLASIFICACION[clase_final]
        )
        puntos_sugeridos = PUNTOS_CLASIFICACION.get(clase_final, puntos_sugeridos) * cantidad_detectada

        print(
            f"[Gemini] clase={clase_final} conf={confianza_final:.2f} "
            f"cantidad={cantidad_detectada} puntos={puntos_sugeridos} objeto={objeto_detectado} desc={descripcion}"
        )

    except Exception as exc:
        error = f"Error en la consulta a Gemini: {exc}"
        print(error)

    return _guardar_resultado(
        img_anotada,
        clase_final,
        confianza_final,
        descripcion,
        objeto_detectado,
        cantidad_detectada,
        texto_vision,
        puntos_sugeridos,
        nombre_archivo,
        error,
    )


def _guardar_resultado(
    img_anotada,
    clase_final,
    confianza_final,
    descripcion,
    objeto_detectado,
    cantidad_detectada,
    texto_vision,
    puntos_sugeridos,
    nombre_archivo,
    error=None,
):
    ruta_guardado = os.path.join("static", "uploads", clase_final, nombre_archivo)
    os.makedirs(os.path.dirname(ruta_guardado), exist_ok=True)

    if img_anotada is not None:
        texto = f"{clase_final} {confianza_final:.2f}"
        cv2.rectangle(img_anotada, (0, 0), (img_anotada.shape[1], 48), (0, 0, 0), -1)
        cv2.putText(
            img_anotada,
            texto,
            (12, 32),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
        )
        cv2.imwrite(ruta_guardado, img_anotada)

    return {
        "clase": clase_final,
        "confianza": round(confianza_final, 2),
        "descripcion": descripcion,
        "objeto_detectado": objeto_detectado,
        "cantidad_detectada": cantidad_detectada,
        "texto_vision": texto_vision,
        "puntos_sugeridos": puntos_sugeridos,
        "error": error,
    }
