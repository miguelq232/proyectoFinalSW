import serial
import time

class PantallaLCD:
    def __init__(self, port="COM7", baudrate=9600, timeout=8):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.serial_conn = None

    def conectar(self):
        """Abre la conexión serial y espera el reinicio del Arduino."""
        try:
            # Solo conectar si no está conectado ya
            if self.serial_conn is None or not self.serial_conn.is_open:
                self.serial_conn = serial.Serial(self.port, self.baudrate, timeout=self.timeout)
                print(f"[LCD] 🔌 Conectado a {self.port}. Iniciando...")
                time.sleep(2)  # Pausa obligatoria para que el Arduino se reinicie
        except serial.SerialException as e:
            print(f"[LCD] ❌ Error de conexión: {e}")
            self.serial_conn = None

    def enviar(self, linea1: str, linea2: str):
        """Envía dos líneas al Arduino separadas por pipe."""
        # Si por alguna razón se desconectó, intentar reconectar
        if self.serial_conn is None or not self.serial_conn.is_open:
            self.conectar()

        # Si la conexión es exitosa, enviar el mensaje
        if self.serial_conn and self.serial_conn.is_open:
            try:
                # Limpiar y limitar caracteres
                l1 = linea1[:64].replace("|", "-").replace("\n", " ")
                l2 = linea2[:64].replace("|", "-").replace("\n", " ")
                mensaje = f"{l1}|{l2}\n"
                
                self.serial_conn.write(mensaje.encode("utf-8"))
                print(f"[LCD] 📤 Enviado → {mensaje.strip()}")
            except serial.SerialException as e:
                print(f"[LCD] ❌ Error al escribir en el puerto: {e}")

    def cerrar(self):
        """Cierra la conexión de forma segura."""
        if self.serial_conn and self.serial_conn.is_open:
            self.serial_conn.close()
            print("[LCD] 🔌 Conexión cerrada.")