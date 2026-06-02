import io
import json
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "modelo.h5"
CLASES_PATH = BASE_DIR / "clases.json"
UMBRAL_CONFIANZA = 0.55
IMG_SIZE = (224, 224)

CONTENEDORES = {
    "glass": "Gris claro - Envases de vidrio",
    "metal": "Gris oscuro - Envases metálicos",
    "paper": "Azul - Cartón y papel",
    "pet": "Naranja - Botellas PET",
    "plastic": "Amarillo - Envases plásticos",
}

MENSAJES = {
    "glass": "Depositar en contenedor gris claro",
    "metal": "Depositar en contenedor gris oscuro",
    "paper": "Depositar en contenedor azul",
    "pet": "Depositar en contenedor naranja",
    "plastic": "Depositar en contenedor amarillo",
}

model = None
clases: dict[int, str] = {}


def cargar_clases() -> dict[int, str]:
    if not CLASES_PATH.exists():
        raise FileNotFoundError(f"No se encontró el archivo de clases: {CLASES_PATH}")

    with CLASES_PATH.open(encoding="utf-8") as archivo:
        datos = json.load(archivo)

    return {int(indice): nombre for indice, nombre in datos.items()}


def preprocesar_imagen(contenido: bytes) -> np.ndarray:
    try:
        imagen = Image.open(io.BytesIO(contenido))
        imagen = imagen.convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("No se pudo procesar la imagen. Formato inválido o archivo corrupto.") from exc

    imagen = imagen.resize(IMG_SIZE)
    arreglo = np.array(imagen, dtype=np.float32)
    arreglo = np.expand_dims(arreglo, axis=0)
    return preprocess_input(arreglo)


@asynccontextmanager
async def lifespan(_: FastAPI):
    global model, clases

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"No se encontró el modelo: {MODEL_PATH}")

    model = load_model(MODEL_PATH)
    clases = cargar_clases()
    yield


app = FastAPI(
    title="Clasificación de Residuos Reciclables",
    description="Microservicio para clasificar residuos reciclables con EfficientNetB0",
    lifespan=lifespan,
)


@app.get("/")
def healthcheck():
    return {
        "status": "ok",
        "servicio": "clasificacion-residuos",
        "modelo_cargado": model is not None,
    }


@app.post("/predecir")
async def predecir(imagen: UploadFile = File(...)):
    if imagen.content_type and not imagen.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Archivo inválido: se requiere una imagen (JPEG, PNG, WebP, etc.).",
        )

    contenido = await imagen.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="La imagen está vacía.")

    try:
        entrada = preprocesar_imagen(contenido)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    predicciones = model.predict(entrada, verbose=0)
    indice = int(np.argmax(predicciones[0]))
    confianza = float(predicciones[0][indice])

    if confianza < UMBRAL_CONFIANZA:
        return {
            "categoria": None,
            "confianza": round(confianza, 2),
            "contenedor": None,
            "reciclable": False,
            "mensaje": "No es reciclable aquí",
        }

    categoria = clases[indice]
    return {
        "categoria": categoria,
        "confianza": round(confianza, 2),
        "contenedor": CONTENEDORES[categoria],
        "reciclable": True,
        "mensaje": MENSAJES[categoria],
    }
