import base64
import os

import cv2
import requests
from dotenv import load_dotenv


load_dotenv()

API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = os.getenv("ROBOFLOW_MODEL_ID", "garbage-classification-3/2")
API_URL = f"https://detect.roboflow.com/{MODEL_ID}"

CLASES_PERMITIDAS = {
    "BIODEGRADABLE",
    "CARDBOARD",
    "CLOTH",
    "GLASS",
    "METAL",
    "PAPER",
    "PLASTIC",
}

# Evita falsos positivos como PAPER con caja gigante sobre toda la escena.
MIN_CONFIDENCE = 0.65
MAX_BOX_AREA_RATIO = 0.75


def _normalizar_clase(valor):
    return str(valor or "").upper().strip()


def _area_ratio(prediccion, ancho, alto):
    area_imagen = max(ancho * alto, 1)
    ancho_caja = float(prediccion.get("width", 0) or 0)
    alto_caja = float(prediccion.get("height", 0) or 0)
    return (ancho_caja * alto_caja) / area_imagen


def detectar_reciclable(imagen_path, nombre_archivo):
    clase_final = "DESCONOCIDO"
    confianza_final = 0.0
    img_anotada = cv2.imread(imagen_path)

    if not API_KEY:
        print("Error Roboflow: falta ROBOFLOW_API_KEY en arduino/.env")
        return _guardar_resultado(img_anotada, clase_final, confianza_final, nombre_archivo)

    if img_anotada is not None:
        try:
            with open(imagen_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode("utf-8")

            response = requests.post(
                f"{API_URL}?api_key={API_KEY}",
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                data=base64_image,
                timeout=20,
            )

            if response.status_code == 200:
                alto, ancho = img_anotada.shape[:2]
                predicciones = response.json().get("predictions", [])
                predicciones_validas = []

                for pred in predicciones:
                    clase = _normalizar_clase(pred.get("class"))
                    confianza = float(pred.get("confidence", 0) or 0)
                    ratio = _area_ratio(pred, ancho, alto)

                    print(f"[IA] pred={clase} conf={confianza:.2f} area={ratio:.2f}")

                    if clase in {"", "NULL"}:
                        continue
                    if clase not in CLASES_PERMITIDAS:
                        continue
                    if confianza < MIN_CONFIDENCE:
                        continue
                    if ratio > MAX_BOX_AREA_RATIO:
                        continue

                    pred["_clase_normalizada"] = clase
                    predicciones_validas.append(pred)

                if predicciones_validas:
                    mejor = max(predicciones_validas, key=lambda item: item["confidence"])
                    clase_final = mejor["_clase_normalizada"]
                    confianza_final = float(mejor["confidence"])

                    for pred in predicciones_validas:
                        cx = float(pred["x"])
                        cy = float(pred["y"])
                        w = float(pred["width"])
                        h = float(pred["height"])

                        x_min = int(cx - (w / 2))
                        y_min = int(cy - (h / 2))
                        x_max = int(cx + (w / 2))
                        y_max = int(cy + (h / 2))

                        cv2.rectangle(img_anotada, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                        texto = f'{pred["_clase_normalizada"]} {float(pred["confidence"]):.2f}'
                        cv2.putText(
                            img_anotada,
                            texto,
                            (x_min, y_min - 8),
                            cv2.FONT_HERSHEY_SIMPLEX,
                            0.6,
                            (0, 255, 0),
                            2,
                        )
                else:
                    print("[IA] Sin predicciones confiables; resultado DESCONOCIDO")
            else:
                print(f"Error Roboflow HTTP {response.status_code}: {response.text[:300]}")

        except Exception as exc:
            print(f"Error en la consulta a Roboflow: {exc}")

    return _guardar_resultado(img_anotada, clase_final, confianza_final, nombre_archivo)


def _guardar_resultado(img_anotada, clase_final, confianza_final, nombre_archivo):
    ruta_guardado = os.path.join("static", "uploads", clase_final, nombre_archivo)
    os.makedirs(os.path.dirname(ruta_guardado), exist_ok=True)

    if img_anotada is not None:
        cv2.imwrite(ruta_guardado, img_anotada)

    return {
        "clase": clase_final,
        "confianza": round(confianza_final, 2),
    }
