import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysConfiguracion } from '../queries/configuracion.js';
import { verifyToken } from '../VerificarToken.js';
import fs from 'fs/promises'; // Importa el módulo de promesas de fs
import path from 'path'; // Importa el módulo 'path' para construir rutas de archivo


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const writeLog = async (message) => {
    const logFilePath = path.join(__dirname, '../server.log'); // <-- ¡Ahora __dirname está definido!
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
        await fs.appendFile(logFilePath, logMessage, 'utf8');
    } catch (error) {
        console.error('Error al escribir en el archivo de log:', error);
    }
};

router.get('/ejecutarScriptGeneral', async (req, res) => {
    const errores = []; // Array para almacenar los errores de cada sentencia

    try {
        const pool = await dbConex.connectToDefalutBD();

        // Iterar sobre el array de consultas y ejecutarlas una por una
        for (const query of QuerysConfiguracion.getConfiguracion) {
            try {
                // Intenta ejecutar la sentencia
                await pool.request().query(query);
                // Si la sentencia es exitosa, puedes loguearlo también si lo deseas
                //await writeLog(`Sentencia ejecutada con éxito: ${query.substring(0, 50)}...`); 
            } catch (error) {
                // Si esta sentencia falla, registra el error y continúa con la siguiente
                const errorMessage = `Error al ejecutar la sentencia: ${query.substring(0, 150)}... | ${error.message}`;
                errores.push(errorMessage);
                await writeLog(errorMessage);
            }
        }

        if (errores.length > 0) {
            // Si hubo errores, devuelve un estado 500 pero con el array de errores
            res.status(500).json({ 
                message: 'El script se ejecutó con errores.', 
                errores: errores 
            });
        } else {
            // Si no hubo errores, devuelve un mensaje de éxito
            res.status(200).json({ message: 'Script ejecutado exitosamente.' });
        }
    } catch (error) {
        // Este catch externo es para errores de conexión a la BD, etc.
        res.status(500).send('Error grave en el proceso: ' + error.message);
    }
});

router.post('/ejecutarScriptEmpresas', verifyToken, async (req, res) => {
    const errores = []; // Array para almacenar los errores de cada sentencia
    const { database } = req.body; 

    try {
        const pool = await dbConex.connectToDB(database);
        
        // Iterar sobre las consultas y ejecutarlas una por una
        for (const query of QuerysConfiguracion.getConfiguracionEmpresas) {
            try {
                // Intenta ejecutar la sentencia
                await pool.request().query(query);
                //await writeLog(`Sentencia ejecutada con éxito en ${database}: ${query.substring(0, 50)}...`); 
            } catch (error) {
                // Si esta sentencia falla, registra el error y continúa
                const errorMessage = `Error en ${database} al ejecutar la sentencia: ${query.substring(0, 50)}... | ${error.message}`;
                errores.push(errorMessage);
                await writeLog(errorMessage);
            }
        }

        if (errores.length > 0) {
            // Si hubo errores, devuelve un estado 500 con el array de errores
            res.status(500).json({ 
                message: `El script para ${database} se ejecutó con errores.`, 
                errores: errores 
            });
        } else {
            // Si no hubo errores, devuelve un mensaje de éxito
            const successMessage = `Script para ${database} ejecutado exitosamente.`;
            res.status(200).json({ message: successMessage });
        }
        
    } catch (error) {
        // Este catch externo es para errores de conexión a la BD
        const errorMessage = `Error grave en el proceso para ${database}: ${error.message}`;
        await writeLog(errorMessage);
        res.status(500).send(errorMessage);
    }
});

export default router;