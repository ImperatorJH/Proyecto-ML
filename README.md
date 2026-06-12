# RecFacial

Sistema web para registrar asistencia academica mediante reconocimiento facial. El proyecto integra un dashboard en Vue, una API en Node.js/Express, base de datos MySQL, almacenamiento de fotos en Cloudinary y un modulo Python con OpenCV + DeepFace para procesar la camara.

## Vista General

RecFacial permite:

- Registrar estudiantes con nombre, codigo y fotos capturadas desde el navegador.
- Guardar las fotos en Cloudinary y tambien en `ML/dataset` para el reconocimiento local.
- Ejecutar el reconocimiento facial desde el dashboard.
- Mostrar la camara dentro del navegador mediante un modal con stream MJPEG.
- Registrar asistencias automaticamente cuando se identifica un usuario.
- Consultar usuarios y asistencias en paginas separadas.
- Eliminar usuarios junto con sus imagenes en Cloudinary, dataset local y cache de DeepFace.
- Generar reportes CSV de asistencia.
- Consultar la documentacion Swagger desde `/api/docs`.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Frontend | Vue 3, Vite, CSS modular por componentes |
| Backend | Node.js, Express, MySQL2, Multer |
| Base de datos | MySQL |
| Reconocimiento | Python, OpenCV, DeepFace |
| Almacenamiento | Cloudinary + dataset local |
| Documentacion API | Swagger UI |

## Arquitectura

```text
RecFacial/
|-- backend/
|   |-- config/          # MySQL y Cloudinary
|   |-- controllers/     # Logica HTTP
|   |-- docs/            # Swagger
|   |-- models/          # Consultas a MySQL
|   |-- routes/          # Endpoints REST
|   `-- server.js        # Servidor Express
|-- frontend/
|   |-- src/
|   |   |-- assets/      # Logo
|   |   |-- components/  # Componentes Vue
|   |   |-- pages/       # Dashboard, usuarios, registro, asistencias
|   |   |-- services/    # Cliente API
|   |   `-- utils/       # Helpers
|   `-- vite.config.js
|-- ML/
|   |-- dataset/         # Imagenes locales para DeepFace
|   |-- main.py          # Reconocimiento en tiempo real
|   |-- exportar.py      # Exportacion CSV
|   `-- requirements.txt
|-- database/
|   `-- schema.sql       # Estructura MySQL
`-- docs/
    `-- Requisitos.md
```

## Requisitos

- Node.js 18 o superior.
- Python 3.11 recomendado.
- MySQL instalado y ejecutandose.
- Cuenta de Cloudinary.
- Camara disponible en el equipo donde corre Python.

## Base de Datos

Crear e importar el esquema:

```bash
mysql -u root -p < database/schema.sql
```

El esquema crea la base `asistencia_ml` y las tablas:

- `usuarios`
- `usuario_fotos`
- `registros`

> Nota: actualmente el backend y Python usan MySQL local con usuario `root`, password `admin` y base `asistencia_ml`. Si cambias esos datos, actualiza `backend/config/db.config.js` y `ML/main.py`.

## Variables de Entorno

Crear `backend/.env`:

```env
PORT=3000
CLOUD_NAME=tu_cloud_name
CLOUD_API_KEY=tu_api_key
CLOUD_API_SECRET=tu_api_secret
```

Cloudinary se usa para respaldar las fotos de usuarios. El dataset local se mantiene en `ML/dataset` para que DeepFace pueda reconocer sin depender de internet durante el proceso.

## Instalacion

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### Python

Se recomienda usar entorno virtual:

```bash
cd ML
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Dependencias principales del modulo ML:

- `opencv-python`
- `deepface`
- `tensorflow`
- `mysql-connector-python`
- `numpy`
- `pandas`

## Ejecucion

### Opcion 1: backend sirviendo el build del frontend

Compilar frontend:

```bash
cd frontend
npm run build
```

Ejecutar backend:

```bash
cd backend
npm start
```

Abrir:

```text
http://localhost:3000
```

### Opcion 2: desarrollo con Vite

Terminal 1:

```bash
cd backend
npm start
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Abrir:

```text
http://localhost:5173
```

Vite envia las llamadas `/api` al backend en `http://localhost:3000`.

## Uso Principal

1. Abrir el dashboard.
2. Ir a la pagina `Registro`.
3. Ingresar nombre y codigo del estudiante.
4. Activar la camara y capturar varias fotos.
5. Crear el usuario.
6. Ir al dashboard y ejecutar `Reconocimiento`.
7. El sistema abre un modal en el navegador con el stream de la camara.
8. Cuando DeepFace reconoce un rostro, se registra la asistencia en MySQL.
9. Consultar los registros desde la pagina `Asistencias`.
10. Generar el reporte CSV desde `Reporte CSV`.

## Reconocimiento Facial

El reconocimiento se ejecuta en `ML/main.py`.

Flujo:

1. El backend llama `python main.py` desde `GET /api/reconocimiento/iniciar-reconocimiento`.
2. Python abre la camara con OpenCV.
3. Cada frame se procesa visualmente con un ovalo guia y blur fuera del area principal.
4. Para DeepFace se prepara el frame reduciendo ruido fuera del ovalo.
5. DeepFace compara contra las imagenes en `ML/dataset`.
6. Si la distancia cumple el umbral configurado, se registra la asistencia.
7. Python actualiza `ML/stream_frame.jpg`.
8. El backend publica ese archivo como stream MJPEG en `/api/reconocimiento/stream`.
9. Vue muestra el stream dentro de `RecognitionModal.vue`.

DeepFace puede generar archivos cache `.pkl` dentro del dataset. Al eliminar usuarios desde la API, el sistema tambien limpia esos caches para evitar detecciones con informacion vieja.

## API y Swagger

Swagger UI:

```text
http://localhost:3000/api/docs
```

JSON OpenAPI:

```text
http://localhost:3000/api/docs.json
```

Desde el dashboard tambien hay un boton `Documentacion` que abre Swagger.

Endpoints principales:

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/api/usuarios` | Lista usuarios registrados |
| POST | `/api/usuarios/crear-usuario` | Crea usuario con fotos |
| DELETE | `/api/usuarios/:id` | Elimina usuario, fotos Cloudinary, dataset y cache |
| GET | `/api/registro/registro` | Lista asistencias |
| GET | `/api/registro/reporte` | Genera reporte CSV |
| GET | `/api/reconocimiento/iniciar-reconocimiento` | Inicia `ML/main.py` |
| GET | `/api/reconocimiento/detener-reconocimiento` | Detiene el proceso Python |
| GET | `/api/reconocimiento/stream` | Stream MJPEG para el modal |
| GET | `/api/reconocimiento/python-info` | Estado tecnico del modulo Python |

## Frontend

El frontend esta organizado por paginas:

- `DashboardPage.vue`: resumen, metricas y acciones principales.
- `AttendancePage.vue`: tabla de asistencias.
- `UsersPage.vue`: tabla de usuarios y eliminacion.
- `RegisterPage.vue`: registro de usuarios con camara.

Componentes clave:

- `CameraCapture.vue`: captura fotos con guia ovalada.
- `RecognitionModal.vue`: muestra el stream MJPEG dentro del navegador.
- `ControlPanel.vue`: acciones del dashboard.
- `UsersTable.vue`: listado y acciones sobre usuarios.

## Backend

El backend centraliza:

- Conexion MySQL.
- Subida y eliminacion de imagenes en Cloudinary.
- Registro de usuarios y fotos.
- Consulta de asistencias.
- Generacion de reportes.
- Control del proceso Python.
- Publicacion del stream MJPEG.
- Documentacion Swagger.

## Reportes

Desde el dashboard se puede generar un CSV de asistencias. Tambien existe el script:

```bash
cd ML
python exportar.py
```

## Solucion de Problemas

### La camara no abre

- Verifica que otra app no este usando la camara.
- Confirma que Python puede acceder al dispositivo con OpenCV.
- Revisa permisos de camara en Windows.

### Reconoce usuarios eliminados

- Borra caches `.pkl` en `ML/dataset` si quedaron archivos antiguos.
- Usa el endpoint de eliminar usuario para que se limpie Cloudinary, dataset local y cache.
- Reinicia el reconocimiento despues de eliminar usuarios.

### No aparece el stream en el modal

- Primero inicia reconocimiento desde el dashboard.
- Revisa que `ML/stream_frame.jpg` se este actualizando.
- Verifica que el backend este corriendo en el puerto `3000`.

### Cloudinary falla al subir o borrar

- Revisa `backend/.env`.
- Confirma `CLOUD_NAME`, `CLOUD_API_KEY` y `CLOUD_API_SECRET`.

### Swagger no carga

- Ejecuta el backend.
- Abre `http://localhost:3000/api/docs`.
- Si usas Vite, el boton del dashboard abre Swagger por medio del proxy `/api`.

## Comandos de Verificacion

```bash
python -m py_compile ML\main.py
node --check backend\server.js
node --check backend\routes\reconocimiento.routes.js
node --check backend\docs\swagger.js
cd frontend
npm run build
```

## Estado del Proyecto

RecFacial funciona como prototipo local de asistencia con reconocimiento facial. Esta pensado para correr en una maquina con backend, frontend, MySQL y Python en el mismo entorno, usando Cloudinary como respaldo de imagenes y el dataset local como fuente principal para DeepFace.
