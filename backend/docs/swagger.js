const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RecFacial API",
      version: "1.0.0",
      description:
        "API para gestion de usuarios, fotos, asistencia y reconocimiento facial.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    tags: [
      { name: "Usuarios", description: "Registro y administracion de usuarios" },
      { name: "Asistencia", description: "Consulta y reportes de asistencia" },
      {
        name: "Reconocimiento",
        description:
          "Control del proceso Python de reconocimiento facial, stream MJPEG y estado tecnico del modulo ML.",
      },
    ],
    components: {
      schemas: {
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error del servidor" },
          },
        },
        Usuario: {
          type: "object",
          properties: {
            id_usuario: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Maria Gomez" },
            codigo: { type: "string", example: "2026001" },
            creado: { type: "string", format: "date-time" },
            total_fotos: { type: "integer", example: 5 },
            foto: {
              type: "string",
              nullable: true,
              example: "https://res.cloudinary.com/demo/image/upload/foto.jpg",
            },
          },
        },
        Registro: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            nombre: { type: "string", example: "Maria Gomez" },
            codigo: { type: "string", nullable: true, example: "2026001" },
            fecha: { type: "string", format: "date", example: "2026-06-12" },
            hora: { type: "string", example: "08:30:00" },
          },
        },
        Reporte: {
          type: "object",
          properties: {
            nombreArchivo: { type: "string", example: "asistencia_2026-06-12T13-30-00.csv" },
            rutaArchivo: {
              type: "string",
              example: "C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\backend\\reportes\\asistencia.csv",
            },
            total: { type: "integer", example: 10 },
          },
        },
        PythonInfo: {
          type: "object",
          properties: {
            procesoActivo: { type: "boolean", example: true },
            modulo: { type: "string", example: "ML/main.py" },
            rutaModulo: {
              type: "string",
              example: "C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML",
            },
            archivoPrincipalExiste: { type: "boolean", example: true },
            dataset: {
              type: "object",
              properties: {
                ruta: {
                  type: "string",
                  example: "C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML\\dataset",
                },
                existe: { type: "boolean", example: true },
                descripcion: {
                  type: "string",
                  example: "Carpetas locales con las fotos de entrenamiento por usuario.",
                },
              },
            },
            stream: {
              type: "object",
              properties: {
                archivo: {
                  type: "string",
                  example: "C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML\\stream_frame.jpg",
                },
                existe: { type: "boolean", example: true },
                formato: { type: "string", example: "MJPEG desde frames JPG generados por Python" },
                intervaloBackendMs: { type: "integer", example: 120 },
              },
            },
            reconocimiento: {
              type: "object",
              properties: {
                motor: { type: "string", example: "DeepFace.find" },
                detector: { type: "string", example: "OpenCV" },
                distanciaMaxima: { type: "number", example: 0.5 },
                cache: {
                  type: "string",
                  example: "DeepFace genera archivos .pkl en ML/dataset; se borran al eliminar usuarios.",
                },
                enfoque: {
                  type: "string",
                  example:
                    "El frame enviado a DeepFace conserva el ovalo facial y limpia el exterior para reducir ruido.",
                },
              },
            },
            dependencias: {
              type: "array",
              items: { type: "string" },
              example: ["opencv-python", "deepface", "mysql-connector-python"],
            },
          },
        },
      },
    },
    paths: {
      "/api/usuarios": {
        get: {
          tags: ["Usuarios"],
          summary: "Listar usuarios registrados",
          responses: {
            200: {
              description: "Usuarios obtenidos correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Usuario" },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Error del servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/usuarios/crear-usuario": {
        post: {
          tags: ["Usuarios"],
          summary: "Crear usuario con fotos",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["nombre", "codigo", "fotos"],
                  properties: {
                    nombre: { type: "string", example: "Maria Gomez" },
                    codigo: { type: "string", example: "2026001" },
                    fotos: {
                      type: "array",
                      items: { type: "string", format: "binary" },
                      description: "Una o mas fotos del rostro. Maximo 10 usadas por el frontend.",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Usuario creado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Usuario creado correctamente" },
                      data: {
                        type: "object",
                        properties: {
                          usuario: { $ref: "#/components/schemas/Usuario" },
                          fotos: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                url: { type: "string" },
                                publicId: { type: "string" },
                                localPath: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Datos invalidos",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
            500: {
              description: "Error del servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/usuarios/{id}": {
        delete: {
          tags: ["Usuarios"],
          summary: "Eliminar usuario y sus fotos",
          description:
            "Elimina el usuario de la base de datos, sus fotos en Cloudinary, archivos locales del dataset y caches de DeepFace.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "integer" },
              example: 1,
            },
          ],
          responses: {
            200: {
              description: "Usuario eliminado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Usuario eliminado correctamente" },
                    },
                  },
                },
              },
            },
            400: {
              description: "ID invalido",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
            404: {
              description: "Usuario no encontrado",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
            500: {
              description: "Error del servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/registro/registro": {
        get: {
          tags: ["Asistencia"],
          summary: "Listar registros de asistencia",
          responses: {
            200: {
              description: "Registros obtenidos correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Registro" },
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: "Error del servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/registro/reporte": {
        get: {
          tags: ["Asistencia"],
          summary: "Generar reporte CSV",
          responses: {
            200: {
              description: "Reporte generado correctamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Reporte generado correctamente" },
                      data: { $ref: "#/components/schemas/Reporte" },
                    },
                  },
                },
              },
            },
            500: {
              description: "Error del servidor",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/reconocimiento/iniciar-reconocimiento": {
        get: {
          tags: ["Reconocimiento"],
          summary: "Iniciar reconocimiento facial",
          description:
            "Ejecuta el proceso Python `ML/main.py` en modo headless. Python abre la camara con OpenCV, procesa cada frame, aplica el enfoque ovalado para reducir ruido visual, consulta DeepFace contra `ML/dataset`, registra asistencias en MySQL y actualiza `ML/stream_frame.jpg` para que el frontend lo muestre dentro del modal.",
          responses: {
            200: {
              description: "Proceso iniciado o ya en ejecucion",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Reconocimiento iniciado" },
                      ruta: { type: "string", example: "C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML" },
                    },
                  },
                },
              },
            },
            500: {
              description: "No se encontro main.py",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiError" },
                },
              },
            },
          },
        },
      },
      "/api/reconocimiento/detener-reconocimiento": {
        get: {
          tags: ["Reconocimiento"],
          summary: "Detener reconocimiento facial",
          description:
            "Finaliza el proceso Python activo. En Windows usa `taskkill` para detener tambien los procesos hijos creados por DeepFace/OpenCV.",
          responses: {
            200: {
              description: "Proceso detenido o sin ejecucion",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      mensaje: { type: "string", example: "Reconocimiento detenido" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/reconocimiento/stream": {
        get: {
          tags: ["Reconocimiento"],
          summary: "Stream MJPEG del reconocimiento",
          description:
            "Devuelve un stream `multipart/x-mixed-replace` con frames JPEG procesados por Python. El backend lee `ML/stream_frame.jpg` cada 120 ms y lo envia al modal del navegador. Este endpoint no inicia la camara por si solo; primero debe ejecutarse `/api/reconocimiento/iniciar-reconocimiento`.",
          responses: {
            200: {
              description: "Stream MJPEG",
              content: {
                "multipart/x-mixed-replace": {
                  schema: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      "/api/reconocimiento/python-info": {
        get: {
          tags: ["Reconocimiento"],
          summary: "Consultar informacion tecnica del modulo Python",
          description:
            "Entrega el estado del proceso Python, rutas usadas por `ML/main.py`, estado del dataset, archivo de stream, dependencias leidas desde `ML/requirements.txt` y parametros principales de reconocimiento. Sirve para diagnostico y para documentar como se conecta Node.js con Python, OpenCV y DeepFace.",
          responses: {
            200: {
              description: "Informacion tecnica del modulo Python",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: { $ref: "#/components/schemas/PythonInfo" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
