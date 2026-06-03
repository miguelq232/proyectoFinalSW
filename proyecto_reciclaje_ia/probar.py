import tensorflow as tf
import numpy as np
from PIL import Image
import json
import os

model = tf.keras.models.load_model('mejor_modelo.h5')
with open('clases.json', 'r') as f:
    clases = json.load(f)

def clasificar(ruta_imagen):
    img = Image.open(ruta_imagen).resize((224, 224))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    resultado = model.predict(img_array, verbose=0)
    indice = np.argmax(resultado)
    categoria = clases[str(indice)]
    confianza = float(np.max(resultado)) * 100
    return categoria, confianza

# Probar 5 imagenes de cada categoria
print("=== PRUEBA DEL MODELO ===\n")
correctos = 0
total = 0

for categoria_real in os.listdir('data/val'):
    ruta_cat = os.path.join('data/val', categoria_real)
    fotos = os.listdir(ruta_cat)[:5]
    for foto in fotos:
        ruta = os.path.join(ruta_cat, foto)
        prediccion, confianza = clasificar(ruta)
        correcto = "✅" if prediccion == categoria_real else "❌"
        print(f"{correcto} Real: {categoria_real} → Predijo: {prediccion} ({confianza:.1f}%)")
        if prediccion == categoria_real:
            correctos += 1
        total += 1

print(f"\nResultado: {correctos}/{total} = {correctos/total*100:.1f}% accuracy en prueba")