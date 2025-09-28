import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysCuentas } from '../queries/cuentas.js';
import mssql from 'mssql'
import { verifyToken } from '../VerificarToken.js';
import fs from 'fs/promises'; // Importa el módulo de promesas de fs
import path from 'path'; // Importa el módulo 'path' para construir rutas de archivo
import { fileURLToPath } from 'url';
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
const ruta = `/ApiCierreCaja/cuentas`
const router = express.Router();

router.post('/getConfiguracion', verifyToken, async (req, res) => {
    try {
        const { codusuario } = req.body;
        
        if (codusuario === null || codusuario === undefined) {
            const rutaerrorMessage = `Error en ${ruta}/getConfiguracion' | Faltan datos requeridos (codusuario)`;
            await writeLog(rutaerrorMessage);
            return res.status(400).json({ error: 'Faltan datos requeridos (codusuario)' });
        }
        
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .query(QuerysCuentas.getAllCuentasConfig);

        // 1. Obtener el objeto de configuración (asumiendo que es el primero y único)
        const configuracionOriginal = result.recordset[0]; 

        // 2. Transformar las claves a minúsculas
        const configuracionFormateada = {};
        if (configuracionOriginal) {
            for (const key in configuracionOriginal) {
                // key.toLowerCase() convierte la clave a minúsculas
                configuracionFormateada[key.toLowerCase()] = configuracionOriginal[key];
            }
        }
        
        const rutaexitoMessage = `Exito en ${ruta}/getConfiguracion' | Usuario ${codusuario} obtuvo su configuración correctamente.`;
        await writeLog(rutaexitoMessage);
        
        // 3. Devolver directamente el objeto formateado (no dentro de un array)
        res.status(200).json(configuracionFormateada); 
    } catch (error) {
        // Mejorar el manejo de errores para el caso en que no se encuentren datos
        if (error.message.includes("Cannot read properties of undefined")) { 
             return res.status(404).json({ error: 'Configuración no encontrada.' });
        }
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

router.post('/getAllCuentas', verifyToken, async (req, res) => {
    try {
        const { codusuario, codempresa } = req.body; 

        if (codusuario === null || codusuario === undefined || codempresa === null || codempresa === undefined) {
            const rutaerrorMessage = `Error en ${ruta}/getAllCuentas' | Faltan datos requeridos (codusuario, codempresa)`;
            await writeLog(rutaerrorMessage);
            return res.status(400).json({ error: 'Faltan datos requeridos (codusuario, codempresa)' });
        }
        
        const pool = await dbConex.connectToDefalutBD(); 
        
        const result = await pool.request()
            .input('CODUSUARIO', mssql.Int, codusuario)
            .input('CODIGOEMPRESA', mssql.Int, codempresa)
            .query(QuerysCuentas.getAllCuentas);
        
        // --- LÓGICA DE AGRUPACIÓN CORREGIDA ---
        const agrupar = result.recordset.reduce((acc, curr) => {
            const { CODCONTABLE, PATHBD, CUENTA, TITULO } = curr;

            // Usamos CODCONTABLE para agrupar las bases de datos contables
            if(!acc[CODCONTABLE]) {
                // Creamos el objeto principal de la base de datos contable
                acc[CODCONTABLE] = {
                    codcontable: CODCONTABLE, // Clave en minúscula
                    pathbd: PATHBD,           // Clave en minúscula
                    cuentas: []               // Clave en minúscula
                };
            }
            
            // Agregamos la cuenta actual al array 'cuentas' del grupo
            acc[CODCONTABLE].cuentas.push({
                cuenta: CUENTA,     // Clave en minúscula
                titulo: TITULO      // Clave en minúscula
            });
            
            return acc;
        }, {});
        // ------------------------------------
        
        // Convertimos el objeto agrupado a un array de grupos
        const resultadoFinal = Object.values(agrupar);

        if (resultadoFinal.length === 0) {
             const rutaNotFoundMessage = `Aviso en ${ruta}/getAllCuentas' | No se encontraron cuentas contables.`;
             await writeLog(rutaNotFoundMessage);
             return res.status(404).json({ message: 'No se encontraron cuentas contables asignadas.' });
        }
        
        const rutaexitoMessage = `Exito en ${ruta}/getAllCuentas' | Obtención de todas las cuentas realizada correctamente.`;
        await writeLog(rutaexitoMessage);
        
        // Devolver el ARRAY de bases de datos contables, cada una conteniendo sus cuentas
        res.status(200).json(resultadoFinal); 
        
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getAllCuentas' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});
router.post('/updateConfiguracion',verifyToken, async (req, res) => {
    const { faltanteventa,sobranteventa,faltanteredondeo,sobranteredondeo } = req.body; // Obtener datos del JSON recibido

    // Validar datos
    if ( !faltanteventa || !sobranteventa || !faltanteredondeo || !sobranteredondeo  ) {
        const rutaerrorMessage = `Error en ${ruta}/updateConfiguracion' | Faltan datos requeridos (faltanteventa,sobranteventa,faltanteredondeo,sobranteredondeo)`;
        await writeLog(rutaerrorMessage);
        return res.status(400).json({ error: 'Faltan datos requeridos (faltanteventa,sobranteventa,faltanteredondeo,sobranteredondeo)' });
    }

    try {
        // Conexión a la base de datos
        const pool = await dbConex.connectToDefalutBD();

        // Consulta SQL para insertar los datos
        const result = await pool.request()
            
            .input('FALTANTEVENTA', mssql.VarChar, faltanteventa)
            .input('SOBRANTEVENTA', mssql.VarChar, sobranteventa)
            .input('FALTANTEREDONDEO', mssql.VarChar, faltanteredondeo)
            .input('SOBRANTEREDONDEO', mssql.VarChar, sobranteredondeo)
        
            .query(QuerysCuentas.postAllCuentas);

        res.status(201).json({
            message: 'Cuentas Modificadas Correctamente',
            rowsAffected: result.rowsAffected,
        });
        const rutaexitoMessage = `Exito en ${ruta}/updateConfiguracion' | Configuración de cuentas actualizada correctamente.`;
        await writeLog(rutaexitoMessage);
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error.message);
        const rutaerrorMessage = `Error en ${ruta}/updateConfiguracion' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
});

export default router;
