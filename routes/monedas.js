import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysMonedas } from '../queries/monedas.js';
import mssql from 'mssql'
import Encryptor from '../Security.js';
import { verifyToken } from '../VerificarToken.js';
import fs from 'fs/promises'; // Importa el módulo de promesas de fs
import path from 'path'; // Importa el módulo 'path' para construir rutas de archivo
import { fileURLToPath } from 'url';
const secure = new Encryptor();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
const ruta = `/ApiCierreCaja/monedas`

const router = express.Router();

router.post('/getConvertir',verifyToken, async (req, res) => {
    try {
        
        const {database,fecha,importe} = req.body
        if (database === null || database === undefined || fecha === null || fecha === undefined || importe === null || importe === undefined) {
            const rutaerrorMessage = `Error en ${ruta}/getConvertir' | Faltan datos requeridos (database, fecha, importe)`;
            await writeLog(rutaerrorMessage);
            return res.status(400).json({ error: 'Faltan datos requeridos (database, fecha, importe)' });
        }
        const pool = await dbConex.connectToDB(database);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('IMPORTE',mssql.Float,importe)
            .query(QuerysMonedas.getToConvert)
        ;
        const rutaexitoMessage = `Exito en ${ruta}/getConvertir' | Conversion de moneda realizada correctamente.`;
        await writeLog(rutaexitoMessage);
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getConvertir' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});



export default router;
