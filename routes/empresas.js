import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysEmpresas } from '../queries/empresas.js';
import mssql from 'mssql'
import Encryptor from '../Security.js';
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
const secure = new Encryptor();
const ruta = `/ApiCierreCaja/empresas`
const router = express.Router();


router.post('/getEmpresas',verifyToken, async (req, res) => {
    try {
        const { codusuario } = req.body;
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO',mssql.Int,codusuario)
            .query(QuerysEmpresas.getEmpresaToId)
        ;
        // Encriptar el campo DB en cada registro
        /*const encryptedData = result.recordset.map((row) => ({
            ...row,
            BDGESTION: secure.encrypt(row.BDGESTION), // Encripta el campo DB
        }));*/
        const agrupar = result.recordset.reduce((acc, curr) => {
        const { CODUSUARIO, USUARIO, CODEMPRESAGESTION, GESTION, BDGESTION } = curr;
        if(!acc[CODUSUARIO]) {
            acc[CODUSUARIO] = {
                codusuario: CODUSUARIO,
                usuario: USUARIO,
                empresas : []
            };
        }
        let modulo = acc[CODUSUARIO].empresas.find(m => m.codempresa === CODEMPRESAGESTION);
        if(!modulo) {
            modulo = {
                codempresa: CODEMPRESAGESTION,
                gestion: GESTION,
                bdgestion: secure.encrypt(BDGESTION), // Encripta el campo BDGESTION
                
            };
            acc[CODUSUARIO].empresas.push(modulo);
        }
         return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    const objetoUsuario = resultadoFinal[0];

     
        if (!objetoUsuario) {
             const rutaNotFoundMessage = `Aviso en ${ruta}/getEmpresas' | Usuario ${codusuario} no tiene empresas asignadas.`;
             await writeLog(rutaNotFoundMessage);
             // Devuelve un 404 si el usuario no tiene datos
             return res.status(404).json({ message: 'Usuario no encontrado o sin empresas asignadas.' });
        }
    const rutaexitoMessage = `Exito en ${ruta}/getEmpresas' | Usuario ${codusuario} obtuvo sus empresas correctamente.`;
    await writeLog(rutaexitoMessage);
    res.status(200).json(objetoUsuario);
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getEmpresas' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

router.post('/getTiendasCajas', async (req, res) => {
    const { codusuario,database } = req.body; 
     if (database === null || database === undefined || codusuario === null || codusuario === undefined) {
        const rutaerrorMessage = `Error en ${ruta}/ejecutarScriptEmpresas' | Faltan datos requeridos (codusuario, database)`;
        await writeLog(rutaerrorMessage);
        return res.status(400).json({ error: 'Faltan datos requeridos (codusuario, database)' });
    }
    try {
        
        const pool = await dbConex.connectToDB(database);
        const result = await pool.request()
            .query(QuerysEmpresas.getTiendas)
        ;
        // Encriptar el campo DB en cada registro
       /* const encryptedData = result.recordset.map((row) => ({
            ...row,
            BD: secure.encrypt(row.BD) // Encripta el campo DB
        }));

        res.status(200).json(encryptedData);*/
        const agrupar = result.recordset.reduce((acc, curr) => {
        const { CODCLIENTE, IDFRONT, SERIE, DESCRIPCION, BDCONTABLE } = curr;
        if(!acc[CODCLIENTE]) {
            acc[CODCLIENTE] = {
                codcliente: CODCLIENTE,
                idfront: IDFRONT,
                bdcontable: secure.encrypt(BDCONTABLE), // Encripta el campo BDGESTION
                cajas : []
            };
        }
        let modulo = acc[CODCLIENTE].cajas.find(m => m.SERIE === SERIE);
        if(!modulo) {
            modulo = {
                serie: SERIE,
                descripcion: DESCRIPCION,
                
                
            };
            acc[CODCLIENTE].cajas.push(modulo);
        }
         return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    res.status(200).json(resultadoFinal);
    const rutaexitoMessage = `Exito en ${ruta}/getTiendasCajas' | Usuario ${codusuario} obtuvo sus tiendas y cajas correctamente.`;
    await writeLog(rutaexitoMessage);
        
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getTiendasCajas' | ${error.message}`;
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

export default router;
