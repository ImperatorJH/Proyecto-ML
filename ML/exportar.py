import os
from datetime import datetime
import mysql.connector
import pandas as pd

conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="admin",
    database="asistencia_ml"
)

query = """
    SELECT id, nombre, codigo, fecha, hora
    FROM registros
    ORDER BY fecha DESC, hora DESC, id DESC
"""

df = pd.read_sql(query, conexion)

reportes_dir = os.path.join(os.path.dirname(__file__), "reportes")
os.makedirs(reportes_dir, exist_ok=True)

nombre_archivo = f"asistencia_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.csv"
ruta_archivo = os.path.join(reportes_dir, nombre_archivo)

df.to_csv(ruta_archivo, index=False)

print(f"Archivo CSV generado: {ruta_archivo}")
