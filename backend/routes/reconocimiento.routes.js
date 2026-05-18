const express = require('express');
const router = express.Router();
const { exec } = require("child_process");
const path = require('path');

let procesoPython = null;

// iniciar reconocimiento
router.get("/iniciar-reconocimiento", (req, res) => {
    if (procesoPython) {
        return res.json({ mensaje: "Ya está en ejecución" });
    }


    const mlPath = 'C:\\Users\\jhona\\OneDrive\\Documentos\\RecFacial\\ML';
    
    console.log(`Buscando main.py en: ${mlPath}`);
    
    // Verificar si existe el archivo main.py
    const fs = require('fs');
    const mainPyPath = path.join(mlPath, 'main.py');
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