from deepface import DeepFace
import cv2
import os
import mysql.connector
from datetime import datetime
import time

# ---------------- BD ----------------
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="asistencia_ml"
)

cursor = conexion.cursor()

def guardar_asistencia(nombre):
    ahora = datetime.now()
    fecha = ahora.date()
    hora = ahora.strftime("%H:%M:%S")

    cursor.execute("""
        SELECT * FROM registros 
        WHERE nombre=%s AND fecha=%s 
        AND TIMESTAMP(fecha, hora) > NOW() - INTERVAL 1 MINUTE
    """, (nombre, fecha))

    resultado = cursor.fetchall()

    if len(resultado) == 0:
        sql = "INSERT INTO registros (nombre, fecha, hora) VALUES (%s, %s, %s)"
        cursor.execute(sql, (nombre, fecha, hora))
        conexion.commit()
        print(f"Asistencia registrada: {nombre}")

# ---------------- CONFIG ----------------
dataset_path = "dataset"
cap = cv2.VideoCapture(0)

print("Sistema iniciado 🚀")

ultimo_proceso = 0  # controlar tiempo

while True:
    ret, frame = cap.read()

    # Solo procesar cada 2 segundos (optimización 🔥)
    if time.time() - ultimo_proceso > 2:
        try:
            cv2.imwrite("temp.jpg", frame)

            result = DeepFace.find(
                img_path="temp.jpg",
                db_path=dataset_path,
                enforce_detection=False,
                detector_backend="opencv",   # 🔥 evita errores
                model_name="Facenet",
                distance_metric="cosine"
            )

            name = "Desconocido"

            if len(result) > 0 and len(result[0]) > 0:
                best_match = result[0].iloc[0]

                # 🔥 FILTRO IMPORTANTE
                if best_match['distance'] < 0.4:
                    path = best_match['identity']
                    name = path.split("\\")[-2]

                    guardar_asistencia(name)

            ultimo_proceso = time.time()

        except Exception as e:
            print("Error:", e)

    # Mostrar nombre en pantalla
    cv2.putText(frame, name, (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1,
                (0, 255, 0), 2)

    cv2.imshow("Reconocimiento Facial", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()