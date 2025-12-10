import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysCajas } from '../queries/caja.js';
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
const ruta = `/ApiCierreCaja/cajas`


const router = express.Router();

router.post('/getResultadoCaja', verifyToken, async (req, res) => {
    try {
        const{database,fecha,caja}=req.body
        if (database === null || database === undefined || fecha === null || fecha === undefined || caja === null || caja === undefined) {
            const rutaerrorMessage = `Error en ${ruta}/getResultadoCaja' | Faltan datos requeridos (database, fecha, caja)`;
            await writeLog(rutaerrorMessage);
            return res.status(400).json({ error: 'Faltan datos requeridos (database, fecha, caja)' });
        }   
    
        const pool = await dbConex.connectToDB(database);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('CAJA',mssql.NVarChar,caja)
            .query(QuerysCajas.getResultadoCaja)
        ;

        //res.status(200).json(result.recordset); // Devuelve los datos como JSON
        const agrupar = result.recordset.reduce((acc, curr) => {
        const { FECHA, CAJA, Z, CODFORMAPAGO, DESCRIPCION, IMPORTE,DECLARADO,SERIECAJA,FO,CERRADO,DIFERENCIA,COTIPAGO,IMPORTE_LOCA,DECLARADO_LOCAL,TASA_VES } = curr;
        if(!acc[FECHA]) {
            acc[FECHA] = {
                fecha: FECHA,
                cajas : []
            };
        }
        let modulo = acc[FECHA].cajas.find(m => m.caja === CAJA);
        if(!modulo) {
            modulo = {
                caja: CAJA,
                z: Z,
                formasdepago : []
            };
            acc[FECHA].cajas.push(modulo);
        }
        let submodulo = modulo.formasdepago.find(sm => sm.codformapago === CODFORMAPAGO);
        if(!submodulo) {    
            submodulo = {
                codformapago: CODFORMAPAGO,
                descripcion: DESCRIPCION,
                importe: IMPORTE,
                declarado: DECLARADO,
                seriecaja: SERIECAJA, 
                fo: FO,
                cerrado: CERRADO,
                diferencia: DIFERENCIA,
                cotipago: COTIPAGO,
                importe_local: IMPORTE_LOCA,
                declarado_local: DECLARADO_LOCAL,
                tasa_ves: TASA_VES      
            };
            modulo.formasdepago.push(submodulo);

        }
         return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    const objetoUsuario = resultadoFinal[0];
         // 2. Manejar el caso si no se encontró el usuario
        if (!objetoUsuario) {
             const rutaNotFoundMessage = `Aviso en ${ruta}/getResultadoCaja' | Usuario ${codusuario} no tiene permisos.`;
             await writeLog(rutaNotFoundMessage);
             // Devuelve un 404 si el usuario no tiene datos
             return res.status(404).json({ message: 'Usuario no encontrado o sin empresas asignadas.' });
        }
    res.status(200).json(objetoUsuario)


        const rutaexitoMessage = `Exito en ${ruta}/getResultadoCaja' | Consulta de resultado de caja realizada correctamente.`;
        await writeLog(rutaexitoMessage);
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getResultadoCaja' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});
router.post('/getVerAsiento', async (req, res) => {
    try {
        const{database,fecha,caja,redondeo,z}=req.body
        if (database === null || database === undefined || fecha === null || fecha === undefined || caja === null || caja === undefined || redondeo === null || redondeo === undefined || z === null || z === undefined) {
            const rutaerrorMessage = `Error en ${ruta}/getVerAsiento' | Faltan datos requeridos (database, fecha, caja, redondeo, z)`;
            await writeLog(rutaerrorMessage);   
            return res.status(400).json({ error: 'Faltan datos requeridos (database, fecha, caja, redondeo, z)' });
            
        }    
        const pool = await dbConex.connectToDB(database);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('CAJA',mssql.NVarChar,caja)
            .input('REDONDEO',mssql.Int,redondeo)
            .input('Z',mssql.Int,z)
            .query(QuerysCajas.getResultadoAsiento)
        ;
            const rutaexitoMessage = `Exito en ${ruta}/getVerAsiento' | Consulta de ver asiento realizada correctamente.`;
            await writeLog(rutaexitoMessage);
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getVerAsiento' | ${error.message}`;
        await writeLog(rutaerrorMessage); 
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});



export default router;
