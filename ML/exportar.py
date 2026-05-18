import mysql.connector
import pandas as pd

conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="admin",
    database="asistencia_ml"
)

query = "SELECT * FROM registros"

df = pd.read_sql(query, conexion)

df.to_csv("asistencia.csv", index=False)

print("Archivo CSV generado ✅")