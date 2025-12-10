import express from 'express';
import 'dotenv/config'
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import Encryptor from '../Security.js';
const secure = new Encryptor();
import mssql from 'mssql';
import jwt from 'jsonwebtoken'; // Importa la librería JWT
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
const ruta = `/ApiCierreCaja/login`

const router = express.Router();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;


router.post('/login', async (req, res) => {
  try {
      const { pass } = req.body; // Obtiene la contraseña del cuerpo de la solicitud
      const pool = await dbConex.connectToDefalutBD();
     
      // --- Paso 2: Obtener el hash de la contraseña desde la base de datos ---
      const result = await pool.request()
          .input('PASS', mssql.NVarChar, secure.encrypt(pass))
          .query(QuerysUser.getUserToPass); // O mejor, una consulta que traiga la información de un usuario por su nombre.
      
      if (result.recordset.length === 0) {
        const rutaerrorMessage = `Error en ${ruta}' | Usuario con contraseña proporcionada no encontrado.`;
        await writeLog(rutaerrorMessage);
          return res.status(401).send('Usuario no encontrado');
      }

      const user = result.recordset[0];
      
    const payload = {
          codUsuaio: user.CODUSUARIO,
          usuario: user.USUARIO
      };
      
      const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '24h' });
      
      res.status(200).json({
          message: 'Autenticación exitosa',
          codusuaio: user.CODUSUARIO,
          usuario: user.USUARIO,
          token: token
         
      });
      const rutaexitoMessage = `Exito en ${ruta}'  ${user.CODUSUARIO} autenticado correctamente.`;
      await writeLog(rutaexitoMessage);
  } catch (error) {
    const rutaerrorMessage = `Error en ${ruta}' | ${error.message}`;
    await writeLog(rutaerrorMessage);
      res.status(500).send('Error de autenticación: ' + error.message);
  }
});

export default router;