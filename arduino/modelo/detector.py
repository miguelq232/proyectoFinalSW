import os
import cv2
import requests
import base64

# ==========================================
# Configuración Global de Roboflow
# ==========================================
API_URL = f"https://detect.roboflow.com/{MODEL_ID}"

def detectar_reciclable(imagen_path, nombre_archivo):
    # Valores por defecto si no detecta nada o si la clase es "null"
    clase_final = "desconocido"
    confianza_final = 0.0

    # Cargar la imagen original con OpenCV
    img_anotada = cv2.imread(imagen_path)

    if img_anotada is not None:
        try:
            # 1. Leer y enviar la imagen a Roboflow
            with open(imagen_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')

            url = f"{API_URL}?api_key={API_KEY}"
            headers = { "Content-Type": "application/x-www-form-urlencoded" }
            response = requests.post(url, headers=headers, data=base64_image)

            if response.status_code == 200:
                data = response.json()
                predicciones = data.get("predictions", [])

                # Filtrar predicciones que sean "null" (opcional, dependiendo de si Roboflow lo manda como objeto)
                predicciones_validas = [p for p in predicciones if p["class"].lower() != "null"]

                if len(predicciones_validas) > 0:
                    # --- LÓGICA DE CLASIFICACIÓN ---
                    # Encontrar la predicción con mayor confianza
                    mejor = max(predicciones_validas, key=lambda x: x['confidence'])
                    
                    # Convertimos a minúsculas
                    clase_nombre = mejor["class"].lower().strip()
                    confianza_final = mejor["confidence"]

                    # Asignamos la clase detectada
                    clase_final = clase_nombre

                    # --- LÓGICA DE DIBUJO CON OPENCV ---
                    for pred in predicciones_validas:
                        cx, cy = pred["x"], pred["y"]
                        w, h = pred["width"], pred["height"]
                        
                        x_min = int(cx - (w / 2))
                        y_min = int(cy - (h / 2))
                        x_max = int(cx + (w / 2))
                        y_max = int(cy + (h / 2))
                        
                        # Dibujar rectángulo
                        cv2.rectangle(img_anotada, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
                        
                        # Texto con clase y confianza
                        texto = f'{pred["class"]} {pred["confidence"]:.2f}'
                        cv2.putText(img_anotada, texto, (x_min, y_min - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        except Exception as e:
            print(f"Error en la consulta a Roboflow: {e}")

    # 2. Definir la ruta final usando la clase detectada
    # Por ejemplo: static/uploads/plastic/mi_imagen.jpg
    ruta_guardado = os.path.join("static", "uploads", clase_final, nombre_archivo)
    
    # Crear la carpeta automáticamente si no existe
    os.makedirs(os.path.dirname(ruta_guardado), exist_ok=True)

    # 3. Guardar la imagen con las cajas dibujadas
    if img_anotada is not None:
        cv2.imwrite(ruta_guardado, img_anotada)

    # 4. Retornar el diccionario con la clase y confianza
    return {
        "clase": clase_final,
        "confianza": round(confianza_final, 2)
    }