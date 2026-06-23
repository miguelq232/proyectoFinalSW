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
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
)

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
    aliases = {
        "CARTON": "CARDBOARD",
        "CARTÓN": "CARDBOARD",
        "PAPEL": "PAPER",
        "PLASTICO": "PLASTIC",
        "PLÁSTICO": "PLASTIC",
        "VIDRIO": "GLASS",
        "METALICO": "METAL",
        "METÁLICO": "METAL",
        "TELA": "CLOTH",
        "ROPA": "CLOTH",
        "ORGANICO": "BIODEGRADABLE",
        "ORGÁNICO": "BIODEGRADABLE",
        "BIODEGRADABLE": "BIODEGRADABLE",
        "UNKNOWN": "DESCONOCIDO",
        "NULL": "DESCONOCIDO",
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


def _gemini_payload(base64_image):
    prompt = """
Analiza la foto de un residuo urbano y responde solo JSON valido, sin markdown.
Debes clasificar el objeto principal en una de estas clases exactas:
BIODEGRADABLE, CARDBOARD, CLOTH, GLASS, METAL, PAPER, PLASTIC, DESCONOCIDO.

Usa DESCONOCIDO si la imagen no muestra claramente basura reciclable, hay muchos objetos
sin un principal, o no puedes determinar el material.

Puntos por clase:
BIODEGRADABLE=5, CARDBOARD=10, CLOTH=15, GLASS=20, METAL=25, PAPER=10, PLASTIC=15, DESCONOCIDO=0.

Formato exacto:
{
  "clasificacion": "PLASTIC",
  "confianza": 0.87,
  "descripcion": "Botella plastica transparente",
  "puntos": 15
}
""".strip()

    return {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image,
                        }
                    },
                ],
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
    descripcion = "No se pudo identificar claramente el residuo."
    puntos_sugeridos = 0
    img_anotada = cv2.imread(imagen_path)

    if not GEMINI_API_KEY:
        print("Error Gemini: falta GEMINI_API_KEY en arduino/.env")
        return _guardar_resultado(
            img_anotada, clase_final, confianza_final, descripcion, puntos_sugeridos, nombre_archivo
        )

    try:
        with open(imagen_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=_gemini_payload(base64_image),
            timeout=30,
        )

        if response.status_code != 200:
            print(f"Error Gemini HTTP {response.status_code}: {response.text[:500]}")
            return _guardar_resultado(
                img_anotada, clase_final, confianza_final, descripcion, puntos_sugeridos, nombre_archivo
            )

        data = response.json()
        texto = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )
        resultado = _extraer_json(texto)

        clase_final = _normalizar_clase(resultado.get("clasificacion"))
        confianza_final = float(resultado.get("confianza", 0) or 0)
        confianza_final = max(0.0, min(confianza_final, 1.0))
        descripcion = str(resultado.get("descripcion") or descripcion).strip()[:180]
        puntos_sugeridos = int(resultado.get("puntos", PUNTOS_CLASIFICACION[clase_final]) or 0)
        puntos_sugeridos = PUNTOS_CLASIFICACION.get(clase_final, puntos_sugeridos)

        print(
            f"[Gemini] clase={clase_final} conf={confianza_final:.2f} "
            f"puntos={puntos_sugeridos} desc={descripcion}"
        )

    except Exception as exc:
        print(f"Error en la consulta a Gemini: {exc}")

    return _guardar_resultado(
        img_anotada, clase_final, confianza_final, descripcion, puntos_sugeridos, nombre_archivo
    )


def _guardar_resultado(img_anotada, clase_final, confianza_final, descripcion, puntos_sugeridos, nombre_archivo):
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
        "puntos_sugeridos": puntos_sugeridos,
    }
