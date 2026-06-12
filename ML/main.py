from deepface import DeepFace
import cv2
import os
import json
import mysql.connector
from datetime import datetime
import time
import signal
import sys
import numpy as np
import threading

# ---------------- BD ----------------
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="admin",
    database="asistencia_ml"
)

cursor = conexion.cursor()

def leer_usuario_desde_imagen(ruta_imagen):
    carpeta = os.path.dirname(ruta_imagen)
    metadata_path = os.path.join(carpeta, "usuario.json")

    if os.path.exists(metadata_path):
        with open(metadata_path, "r", encoding="utf-8") as archivo:
            datos = json.load(archivo)
            return datos.get("nombre", "Desconocido"), datos.get("codigo", "")

    nombre_carpeta = os.path.basename(carpeta)
    if "__" in nombre_carpeta:
        codigo, nombre = nombre_carpeta.split("__", 1)
        return nombre.replace("_", " ").title(), codigo

    return nombre_carpeta, ""

def guardar_asistencia(nombre, codigo):
    ahora = datetime.now()
    fecha = ahora.date()
    hora = ahora.strftime("%H:%M:%S")

    cursor.execute("""
        SELECT * FROM registros
        WHERE nombre=%s
        AND COALESCE(codigo, '')=%s
        AND fecha=%s
        AND TIMESTAMP(fecha, hora) > NOW() - INTERVAL 1 MINUTE
    """, (nombre, codigo or "", fecha))

    resultado = cursor.fetchall()

    if len(resultado) == 0:
        sql = "INSERT INTO registros (nombre, codigo, fecha, hora) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nombre, codigo, fecha, hora))
        conexion.commit()
        print(f"Asistencia registrada: {nombre} ({codigo})")

# ---------------- CONFIG ----------------
dataset_path = "dataset"
stream_frame_path = "stream_frame.jpg"
cap = cv2.VideoCapture(0)

print("Sistema iniciado")

ultimo_proceso = time.time()
name = "Desconocido"
ejecutando = True
procesando = False
name_lock = threading.Lock()

def detener_sistema(signum, frame):
    global ejecutando
    ejecutando = False

signal.signal(signal.SIGTERM, detener_sistema)
signal.signal(signal.SIGINT, detener_sistema)

def calcular_ovalo(frame):
    alto, ancho = frame.shape[:2]
    centro = (ancho // 2, int(alto * 0.54))

    alto_ovalo = int(alto * 0.60)
    ancho_ovalo = int(alto_ovalo * 0.58)
    ancho_ovalo = min(ancho_ovalo, int(ancho * 0.40))

    ejes = (max(92, ancho_ovalo // 2), max(136, alto_ovalo // 2))
    return centro, ejes

def dibujar_vista_con_blur(frame, nombre):
    alto, ancho = frame.shape[:2]
    centro, ejes = calcular_ovalo(frame)

    mascara = cv2.ellipse(
        img=np.zeros((alto, ancho), dtype="uint8"),
        center=centro,
        axes=ejes,
        angle=0,
        startAngle=0,
        endAngle=360,
        color=255,
        thickness=-1
    )

    frame_blur = cv2.GaussianBlur(frame, (41, 41), 0)
    salida = frame_blur.copy()
    salida[mascara == 255] = frame[mascara == 255]

    cv2.ellipse(salida, centro, ejes, 0, 0, 360, (255, 255, 255), 3)
    texto_guia = "Centra el rostro dentro del ovalo"
    escala_guia = 0.72
    grosor_guia = 2
    (texto_ancho, texto_alto), _ = cv2.getTextSize(
        texto_guia,
        cv2.FONT_HERSHEY_SIMPLEX,
        escala_guia,
        grosor_guia
    )
    texto_x = max(18, min(ancho - texto_ancho - 18, ancho // 2 - texto_ancho // 2))
    texto_y = min(alto - 28, centro[1] + ejes[1] + 44)

    cv2.rectangle(
        salida,
        (texto_x - 14, texto_y - texto_alto - 12),
        (texto_x + texto_ancho + 14, texto_y + 12),
        (17, 24, 39),
        -1
    )
    cv2.putText(
        salida,
        texto_guia,
        (texto_x, texto_y),
        cv2.FONT_HERSHEY_SIMPLEX,
        escala_guia,
        (255, 255, 255),
        grosor_guia
    )
    cv2.putText(
        salida,
        nombre,
        (50, 76),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        3
    )

    return salida

def preparar_frame_para_reconocimiento(frame):
    alto, ancho = frame.shape[:2]
    centro, ejes = calcular_ovalo(frame)

    mascara = cv2.ellipse(
        img=np.zeros((alto, ancho), dtype="uint8"),
        center=centro,
        axes=ejes,
        angle=0,
        startAngle=0,
        endAngle=360,
        color=255,
        thickness=-1
    )

    frame_ovalado = np.full_like(frame, 255)
    frame_ovalado[mascara == 255] = frame[mascara == 255]

    return frame_ovalado

def procesar_reconocimiento(frame_reconocimiento):
    global name, procesando

    try:
        cv2.imwrite("temp.jpg", frame_reconocimiento)

        result = DeepFace.find(
            img_path="temp.jpg",
            db_path=dataset_path,
            enforce_detection=False,
            detector_backend="opencv",
            model_name="Facenet",
            distance_metric="cosine",
            refresh_database=True
        )

        nombre_detectado = "Desconocido"
        codigo = ""

        if len(result) > 0 and len(result[0]) > 0:
            best_match = result[0].iloc[0]

            if best_match["distance"] < 0.5:
                identity_path = best_match["identity"]
                nombre_detectado, codigo = leer_usuario_desde_imagen(identity_path)
                guardar_asistencia(nombre_detectado, codigo)

        with name_lock:
            name = nombre_detectado

    except Exception as e:
        print("Error:", e)
    finally:
        procesando = False

while ejecutando:
    ret, frame = cap.read()

    if not ret:
        print("No se pudo leer la camara")
        break

    with name_lock:
        nombre_actual = name

    frame_salida = dibujar_vista_con_blur(frame, nombre_actual)
    cv2.imwrite(stream_frame_path, frame_salida)

    if time.time() - ultimo_proceso > 2 and not procesando:
        procesando = True
        ultimo_proceso = time.time()
        frame_reconocimiento = preparar_frame_para_reconocimiento(frame.copy())
        threading.Thread(
            target=procesar_reconocimiento,
            args=(frame_reconocimiento,),
            daemon=True
        ).start()

    time.sleep(0.03)

cap.release()
cursor.close()
conexion.close()
sys.exit(0)
