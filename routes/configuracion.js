import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysConfiguracion } from '../queries/configuracion.js';
import Encryptor from '../Security.js';
const secure = new Encryptor();


const router = express.Router();

router.get('/ejecutarScriptGeneral', async (req, res) => {
  try {
    const pool = await dbConex.connectToDefalutBD();
    
    // Iterar sobre el array de consultas y ejecutarlas una por una
    for (const query of QuerysConfiguracion.getConfiguracion) {
      await pool.request().query(query);
    }
    
    // Si querés devolver un mensaje de éxito
    res.status(200).json({ message: 'Script ejecutado exitosamente.' });
    
  } catch (error) {
    // Si ocurre un error, muestra el mensaje
    res.status(500).send('Error al obtener los datos: ' + error.message);
  }
});

router.get('/ejecutarScriptEmpresas', async (req, res) => {
  try {
    const db = req.query.db
    const pool = await dbConex.connectToDB(db);
    
    // Iterar sobre el array de consultas y ejecutarlas una por una
    for (const query of QuerysConfiguracion.getConfiguracionEmpresas) {
      await pool.request().query(query);
    }
    
    // Si querés devolver un mensaje de éxito
    res.status(200).json({ message: 'Script ejecutado exitosamente en la base de datos: ' + secure.decrypt(db) });
    
  } catch (error) {
    // Si ocurre un error, muestra el mensaje
    res.status(500).send('Error al obtener los datos: ' + error.message);
  }
});


export default router;