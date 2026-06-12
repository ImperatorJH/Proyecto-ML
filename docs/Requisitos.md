# Documentacion de requisitos

## Requisitos funcionales

| ID | Nombre | Descripcion | Prioridad |
| --- | --- | --- | --- |
| RF-01 | Registro de imagenes faciales | El sistema permite crear usuarios y capturar varias fotos del rostro desde la camara. Las fotos se guardan localmente para el reconocimiento y tambien en Cloudinary. | Alta |
| RF-02 | Asociacion de rostro | Cada usuario registrado queda asociado a un nombre y codigo de estudiante. | Alta |
| RF-03 | Captura de video | El sistema permite iniciar la camara para capturar video en tiempo real desde el modulo de reconocimiento. | Alta |
| RF-04 | Deteccion de rostros | El modulo ML usa DeepFace con OpenCV para detectar rostros en los cuadros de video. | Alta |
| RF-05 | Comparacion facial | El rostro detectado se compara contra las imagenes registradas en `ML/dataset`. | Alta |
| RF-06 | Reconocimiento de estudiantes | Si la distancia facial cumple el umbral configurado, el sistema reconoce al estudiante registrado. | Alta |
| RF-07 | Registro de asistencia | Al reconocer un estudiante, se guarda nombre, codigo, fecha y hora en la tabla `registros`. | Alta |
| RF-08 | Control de duplicados | El sistema evita registrar multiples asistencias del mismo estudiante en intervalos cortos de una misma sesion. | Alta |
| RF-09 | Reporte de asistencia | El sistema genera reportes CSV locales desde el dashboard y desde el script `ML/exportar.py`. | Media |

## Requisitos no funcionales

| ID | Nombre | Descripcion | Prioridad |
| --- | --- | --- | --- |
| RNF-01 | Estructura ordenada | El proyecto separa frontend, backend, rutas, controladores, modelos, configuracion y modulo ML. | Alta |
| RNF-02 | Codigo legible | El codigo esta organizado por responsabilidad y usa nombres descriptivos para funciones principales. | Media |
| RNF-03 | Interfaz grafica clara | El dashboard permite crear usuarios, capturar fotos, iniciar/detener reconocimiento, consultar asistencia y generar reportes. | Alta |
| RNF-04 | Funcionamiento local | El prototipo funciona en ambiente local con Node.js, Python, MySQL y camara del equipo. | Alta |
| RNF-05 | Almacenamiento organizado | Las imagenes se almacenan por usuario en `ML/dataset`, las URLs se guardan en MySQL y los reportes en carpetas de reportes. | Alta |
| RNF-06 | Documentacion basica | El README y este documento describen instalacion, uso y requisitos del sistema. | Media |
