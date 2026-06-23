from dotenv import load_dotenv
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from modelo.detector import detectar_reciclable
import os
import time
import uuid # Asegúrate de importar uuid arriba en tu archivo
import requests
import threading
from arduino_sender import PantallaLCD
app = Flask(__name__)
CORS(app)
load_dotenv()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


UPLOAD_FOLDER = os.path.join("static", "uploads")
TEMP_FOLDER = os.path.join(UPLOAD_FOLDER, "temp")
CLASES = ["BIODEGRADABLE", "CARDBOARD", "CLOTH", "GLASS", "METAL", "PAPER", "PLASTIC", "DESCONOCIDO", "NULL"]

# Diccionario de puntos por clasificación
PUNTOS_CLASIFICACION = {
    "BIODEGRADABLE": 5,
    "CARDBOARD": 10,    # Cartón
    "CLOTH": 15,        # Ropa/Tela
    "GLASS": 20,        # Vidrio
    "METAL": 25,        # Metal
    "PAPER": 10,        # Papel
    "PLASTIC": 15,      # Plástico
    "DESCONOCIDO": 0,
    "NULL": 0
}


lcd = PantallaLCD(port="COM7", baudrate=9600)
lcd.conectar()
lcd_lock = threading.Lock()


def enviar_lcd(linea_1, linea_2):
    with lcd_lock:
        lcd.enviar(linea_1, linea_2)


def texto_lcd_objeto(objeto_detectado, clase):
    texto = str(objeto_detectado or "").strip()
    if not texto or texto.lower() in {"no identificado", "desconocido", "unknown", "null"}:
        texto = str(clase or "Objeto").title()

    texto = (
        texto.replace("plástico", "plastico")
        .replace("Plástico", "Plastico")
        .replace("cartón", "carton")
        .replace("Cartón", "Carton")
    )
    return " ".join(texto.split())[:32]

def texto_lcd_residuo(tipo_residuo):
    texto = str(tipo_residuo or "Residuo").strip().upper()
    nombres = {
        "BIODEGRADABLE": "Biodegradable",
        "CARDBOARD": "Carton",
        "CLOTH": "Tela",
        "GLASS": "Vidrio",
        "METAL": "Metal",
        "PAPER": "Papel",
        "PLASTIC": "Plastico",
        "DESCONOCIDO": "Desconocido",
        "NULL": "Sin residuo",
        "NADA": "Sin residuo",
    }
    return nombres.get(texto, texto.title())[:32]


def iniciar_polling_eventos_lcd():
    enabled = os.getenv("LCD_EVENT_POLLING_ENABLED", "false").strip().lower() in {"1", "true", "yes", "si"}
    if not enabled:
        print("[LCD-EVENTOS] Polling desactivado. Usa LCD_EVENT_POLLING_ENABLED=true para activarlo.")
        return

    backend_api_url = os.getenv("BACKEND_API_URL", "http://localhost:8080/api").rstrip("/")
    eventos_url = os.getenv("LCD_EVENT_API_URL", f"{backend_api_url}/recoleccion/eventos-lcd").strip()
    camion_id = os.getenv("LCD_EVENT_CAMION_ID", "").strip()
    intervalo = float(os.getenv("LCD_EVENT_POLL_SECONDS", "3") or 3)

    def poll():
        ultimo_id = int(os.getenv("LCD_EVENT_AFTER_ID", "0") or 0)
        print(f"[LCD-EVENTOS] Escuchando eventos desde {eventos_url}")

        while True:
            try:
                params = {"afterId": ultimo_id}
                if camion_id:
                    params["camionId"] = camion_id

                response = requests.get(eventos_url, params=params, timeout=8)
                response.raise_for_status()
                eventos = response.json()

                for evento in eventos:
                    evento_id = int(evento.get("id") or 0)
                    tipo = texto_lcd_residuo(evento.get("tipoResiduo"))
                    puntos = int(evento.get("puntos") or 0)
                    enviar_lcd(tipo, f"{puntos} puntos")
                    print(f"[LCD-EVENTOS] Evento {evento_id}: {tipo} - {puntos} puntos")
                    ultimo_id = max(ultimo_id, evento_id)
            except Exception as e:
                print(f"[LCD-EVENTOS] No se pudo leer eventos: {e}")

            time.sleep(intervalo)

    thread = threading.Thread(target=poll, daemon=True)
    thread.start()


# Crear estructura de carpetas automáticamente si no existen
os.makedirs(TEMP_FOLDER, exist_ok=True)
for clase in CLASES:
    os.makedirs(os.path.join(UPLOAD_FOLDER, clase), exist_ok=True)



@app.route("/")
def dashboard():
    estadisticas = {}
    total_detecciones = 0

    for clase in CLASES:
        ruta_clase = os.path.join(UPLOAD_FOLDER, clase)
        cantidad = len(os.listdir(ruta_clase))
        estadisticas[clase] = cantidad
        total_detecciones += cantidad

    return render_template("dashboard.html", stats=estadisticas, total=total_detecciones)

@app.route("/clasificar")
def clasificar_page():
    return render_template("clasificar.html")



@app.route("/galeria")
def galeria():
    # Ya no procesamos imágenes aquí, solo enviamos el "esqueleto" HTML
    return render_template("galeria.html")

@app.route("/api/galeria")
def api_galeria():
    # Esta API será consultada por JavaScript
    resultado = {}

    for clase in CLASES:
        ruta_clase = os.path.join(UPLOAD_FOLDER, clase)
        if os.path.exists(ruta_clase):
            archivos = os.listdir(ruta_clase)
            total_real = len(archivos) # 1. Sacamos el total real de fotos
            
            # Ordenamos para que las más nuevas salgan primero
            archivos.sort(reverse=True) 
            
            # 2. Guardamos el total y las últimas 50 en un diccionario
            resultado[clase] = {
                "total": total_real,
                "imagenes": archivos[:50]
            }
        else:
            resultado[clase] = {
                "total": 0,
                "imagenes": []
            }

    return jsonify(resultado)



@app.route("/upload", methods=["POST"])
def upload():
    codigo_cliente = request.form.get("codigo_cliente", "").strip()
    session_token = request.form.get("session_token", "").strip()
    imagen_file    = request.files.get("imagen")

    if not codigo_cliente or not imagen_file:
        return jsonify({"error": "Faltan datos: código de cliente o imagen"}), 400

    # Guardar imagen temporalmente
    
    codigo_unico = uuid.uuid4().hex[:6]
    nombre_archivo = f"captura_{int(time.time())}_{codigo_unico}.jpg"
    
    #nombre_archivo = f"captura_{int(time.time())}.jpg"
    ruta_temp = os.path.join(TEMP_FOLDER, nombre_archivo)
    imagen_file.save(ruta_temp)

    # Clasificar con IA
    resultado = detectar_reciclable(ruta_temp, nombre_archivo)
    if resultado.get("error"):
        try:
            os.remove(ruta_temp)
        except OSError:
            pass
        return jsonify({"error": resultado["error"]}), 503

    clase     = resultado["clase"].upper().strip()
    confianza = resultado["confianza"]
    descripcion = resultado.get("descripcion", "Sin descripcion disponible")
    objeto_detectado = resultado.get("objeto_detectado", "No identificado")
    cantidad_detectada = int(resultado.get("cantidad_detectada", 1) or 1)
    texto_vision = resultado.get("texto_vision", descripcion)

    # # Mover a carpeta de clase correspondiente
    # clase_key = clase if clase in CLASES else "desconocido"
    # ruta_final = os.path.join(UPLOAD_FOLDER, clase_key, nombre_archivo)
    # os.rename(ruta_temp, ruta_final)

# ✅ EN SU LUGAR, SOLO BORRA EL ARCHIVO TEMPORAL ORIGINAL
    try:
        os.remove(ruta_temp)
    except OSError:
        pass
    
    # Calcular puntos
    puntos = PUNTOS_CLASIFICACION.get(clase, resultado.get("puntos_sugeridos", 0))
    
    # 3. ¡Usas el LCD enviando la clase y los puntos!
    mensaje_linea_1 = texto_lcd_objeto(objeto_detectado, clase)
    mensaje_linea_2 = f"{puntos}pts {round(confianza * 100)}% x{cantidad_detectada}"
    enviar_lcd(mensaje_linea_1, mensaje_linea_2)

    # 4. Registrar reciclaje en el backend de Spring Boot
    backend_api_url = os.getenv("BACKEND_API_URL", "http://localhost:8080/api")
    backend_url = f"{backend_api_url.rstrip('/')}/puntos/registrar-reciclaje"
    backend_error = None
    backend_puntos_acumulados = None
    nombre_vecino = None
    
    try:
        payload = {
            "codigoCliente": codigo_cliente,
            "puntos": puntos,
            "clasificacion": clase,
            "sessionToken": session_token
        }
        # Enviar petición POST local con timeout corto (por si el backend no está corriendo)
        response = requests.post(backend_url, json=payload, timeout=5)
        if response.status_code == 200:
            res_data = response.json()
            backend_puntos_acumulados = res_data.get("puntosAcumulados")
            nombre_vecino = res_data.get("nombreVecino")
            print(f"✅ Puntos registrados en el backend con éxito para {nombre_vecino}. Puntos totales: {backend_puntos_acumulados}")
        else:
            try:
                err_msg = response.json().get("message", response.text)
            except Exception:
                err_msg = response.text
            backend_error = f"Código {response.status_code}: {err_msg}"
            print(f"❌ Error del backend al registrar reciclaje: {backend_error}")
    except Exception as e:
        backend_error = f"No se pudo conectar al backend: {str(e)}"
        print(f"⚠️ Error de conexión con el backend: {backend_error}")

    return jsonify({
        "success":         True,
        "codigo_cliente":  codigo_cliente,
        "clasificacion":   clase,
        "descripcion":     descripcion,
        "objeto_detectado": objeto_detectado,
        "cantidad_detectada": cantidad_detectada,
        "texto_vision":    texto_vision,
        "confianza":       round(confianza * 100, 1),
        "puntos":          puntos,
        "backend_success": backend_error is None,
        "backend_error":   backend_error,
        "puntos_acumulados": backend_puntos_acumulados,
        "nombre_vecino":   nombre_vecino
    })

if __name__ == "__main__":
    iniciar_polling_eventos_lcd()
    app.run(
        host="0.0.0.0",
        port=3000,
       debug=True,
       use_reloader=False,
       threaded=False
    )
