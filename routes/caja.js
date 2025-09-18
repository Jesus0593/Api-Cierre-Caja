import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysCajas } from '../queries/caja.js';
import mssql from 'mssql'
import { verifyToken } from '../VerificarToken.js';


const router = express.Router();

router.get('/getResultadoCaja', verifyToken, async (req, res) => {
    try {
  
        const db = req.query.database
        const fecha = req.query.fecha
        const caja = req.query.caja
        const pool = await dbConex.connectToDB(db);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('CAJA',mssql.NVarChar,caja)
            .query(QuerysCajas.getResultadoCaja)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        const db = req.query.database
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});
router.get('/getVerAsiento', async (req, res) => {
    try {
  
        const db = req.query.database
        const fecha = req.query.fecha
        const caja = req.query.caja
        const redondeo = req.query.redondeo
        const z = req.query.z
        const pool = await dbConex.connectToDB(db);
        const result = await pool.request()
            .input('FECHA',mssql.Date,fecha)
            .input('CAJA',mssql.NVarChar,caja)
            .input('REDONDEO',mssql.Int,redondeo)
            .input('Z',mssql.Int,z)
            .query(QuerysCajas.getResultadoAsiento)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        const db = req.query.database
        res.status(500).send('Error al obtener los datos: ' + error.message);
        
    }
});



export default router;
