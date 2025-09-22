import express from 'express';
import 'dotenv/config'
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import Encryptor from '../Security.js';
const secure = new Encryptor();
import mssql from 'mssql';
import jwt from 'jsonwebtoken'; // Importa la librería JWT

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
          return res.status(401).send('Usuario no encontrado');
      }

      const user = result.recordset[0];
      
    const payload = {
          id: user.CODUSUARIO,
          usuario: user.USUARIO
      };
      
      const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '24h' });
      
      res.status(200).json({
          message: 'Autenticación exitosa',
          id: user.CODUSUARIO,
          usuario: user.USUARIO,
          token: token
         
      });

  } catch (error) {
      res.status(500).send('Error de autenticación: ' + error.message);
  }
});

export default router;