import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
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
const ruta = `/ApiCierreCaja/usuarios`


const router = express.Router();

router.post('/getUsuarios',verifyToken, async (req, res) => {
 try {
    
    const { codusuario } = req.body;
    const pool = await dbConex.connectToDefalutBD();
    const result = await pool.request()
    .input('CODUSUARIO',mssql.Int,codusuario)
    .query(QuerysUser.getUserToId);
    //res.status(200).json(result.recordset); // Devuelve los datos como JSON
      const rutaexitoMessage = `Exito en ${ruta}/getUsuarios' | Usuario ${codusuario} obtuvo sus datos correctamente.`;
      await writeLog(rutaexitoMessage);
    const agrupar = result.recordset.reduce((acc, curr) => {
        const { CODUSUARIO, USUARIO, CODMODULO, MODULO, CODSUBMODULO, SUBMODULO } = curr;
        if(!acc[CODUSUARIO]) {
            acc[CODUSUARIO] = {
                codusuario: CODUSUARIO,
                usuario: USUARIO,
                permisos : []
            };
        }
        let modulo = acc[CODUSUARIO].permisos.find(m => m.codmodulo === CODMODULO);
        if(!modulo) {
            modulo = {
                codmodulo: CODMODULO,
                modulo: MODULO,
                submodulos: []
            };
            acc[CODUSUARIO].permisos.push(modulo);
        }
        if(CODSUBMODULO) {
            modulo.submodulos.push({
                codsubmodulo: CODSUBMODULO,
                submodulo: SUBMODULO
            });
        } return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    const objetoUsuario = resultadoFinal[0];

        // 2. Manejar el caso si no se encontró el usuario
        if (!objetoUsuario) {
             const rutaNotFoundMessage = `Aviso en ${ruta}/getUsuario' | Usuario ${codusuario} no tiene permisos.`;
             await writeLog(rutaNotFoundMessage);
             // Devuelve un 404 si el usuario no tiene datos
             return res.status(404).json({ message: 'Usuario no encontrado o sin empresas asignadas.' });
        }
    res.status(200).json(objetoUsuario);
    } catch (error) {
        const rutaerrorMessage = `Error en ${ruta}/getUsuarios' | ${error.message}`;
        await writeLog(rutaerrorMessage);
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }

});


export default router;
