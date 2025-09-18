import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import mssql from 'mssql'
import { verifyToken } from '../VerificarToken.js';


const router = express.Router();

router.get('/getUsuarios',verifyToken, async (req, res) => {
    try {
        const id = req.query.id
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO',mssql.Int,id)
            .query(QuerysUser.getUserToId)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});



export default router;
