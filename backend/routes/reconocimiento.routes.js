const express = require('express');
const router = express.Router();
const { exec } = require("child_process");
const path = require('path');
const fs = require("fs");

let procesoPython = null;
const mlPath = 'C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML';
const streamFramePath = path.join(mlPath, "stream_frame.jpg");
const datasetPath = path.join(mlPath, "dataset");
const mainPyPath = path.join(mlPath, "main.py");
const requirementsPath = path.join(mlPath, "requirements.txt");

router.get("/python-info", (req, res) => {
    const requirements = fs.existsSync(requirementsPath)
        ? fs.readFileSync(requirementsPath, "utf8")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
        : [];

    res.json({
        success: true,
        data: {
            procesoActivo: Boolean(procesoPython),
            modulo: "ML/main.py",
            rutaModulo: mlPath,
            archivoPrincipalExiste: fs.existsSync(mainPyPath),
            dataset: {
                ruta: datasetPath,
                existe: fs.existsSync(datasetPath),
                descripcion: "Carpetas locales con las fotos de entrenamiento por usuario.",
            },
            stream: {
                archivo: streamFramePath,
                existe: fs.existsSync(streamFramePath),
                formato: "MJPEG desde frames JPG generados por Python",
                intervaloBackendMs: 120,
            },
            reconocimiento: {
                motor: "DeepFace.find",
                detector: "OpenCV",
                distanciaMaxima: 0.5,
                cache: "DeepFace genera archivos .pkl en ML/dataset; se borran al eliminar usuarios.",
                enfoque: "El frame enviado a DeepFace conserva el ovalo facial y limpia el exterior para reducir ruido.",
            },
            dependencias: requirements,
        },
    });
});

// iniciar reconocimiento
router.get("/iniciar-reconocimiento", (req, res) => {
    if (procesoPython) {
        return res.json({ mensaje: "Ya está en ejecución" });
    }

    console.log(`Buscando main.py en: ${mlPath}`);
    
    // Verificar si existe el archivo main.py
    if (!fs.existsSync(mainPyPath)) {
        console.error(`No se encuentra main.py en: ${mainPyPath}`);
        return res.status(500).json({ error: "No se encuentra main.py" });
    }

    procesoPython = exec("python main.py", {
        cwd: mlPath
    }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        if (stdout) {
            console.log(`stdout: ${stdout}`);
        }
    });

    res.json({ mensaje: "Reconocimiento iniciado", ruta: mlPath });
});

router.get("/stream", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "multipart/x-mixed-replace; boundary=frame",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Connection": "close",
    });

    const enviarFrame = () => {
        if (res.destroyed) return;

        fs.readFile(streamFramePath, (error, frame) => {
            if (!error && frame.length) {
                res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
                res.write(frame);
                res.write("\r\n");
            }
        });
    };

    const interval = setInterval(enviarFrame, 120);
    enviarFrame();

    req.on("close", () => {
        clearInterval(interval);
    });
});

// detener reconocimiento
router.get("/detener-reconocimiento", (req, res) => {
    if (!procesoPython) {
        return res.json({ mensaje: "No está en ejecución" });
    }
    
    console.log("Deteniendo proceso Python...");
    
    // En Windows
    if (process.platform === 'win32') {
        // Matar el proceso principal y todos sus hijos
        exec(`taskkill /pid ${procesoPython.pid} /f /t`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al matar proceso: ${error}`);
                // Intentar método alternativo
                procesoPython.kill('SIGTERM');
            } else {
                console.log(`Proceso terminado: ${stdout}`);
            }
            procesoPython = null;
            res.json({ mensaje: "Reconocimiento detenido" });
        });
    } else {
        // En Linux/Mac
        process.kill(-procesoPython.pid, 'SIGTERM');
        procesoPython = null;
        res.json({ mensaje: "Reconocimiento detenido" });
    }
});

module.exports = router;
