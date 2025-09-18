import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysMonedas } from '../queries/monedas.js';
import mssql from 'mssql'
import Encryptor from '../Security.js';
import { verifyToken } from '../VerificarToken.js';
const secure = new Encryptor();

const router = express.Router();

router.get('/getConvertir',verifyToken, async (req, res) => {
    try {
  
        const db = req.query.database
        const fecha = req.query.fecha
        const importe = req.query.importe
        const pool = await dbConex.connectToDB(db);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('IMPORTE',mssql.Float,importe)
            .query(QuerysMonedas.getToConvert)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        const db = req.query.database
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});



export default router;
