import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import mssql from 'mssql'
import Encryptor from '../Security.js';
const secure = new Encryptor();

const router = express.Router();

router.get('/getUsuarios', async (req, res) => {
    try {
        const pass = req.query.pass
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('PASS',mssql.NVarChar,pass)
            .query(QuerysUser.getUserToPass)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

router.get('/getEmpresas', async (req, res) => {
    try {
        const id = req.query.id
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO',mssql.Int,id)
            .query(QuerysUser.getEmpresaToId)
        ;
        // Encriptar el campo DB en cada registro
        const encryptedData = result.recordset.map((row) => ({
            ...row,
            DB_GESTION: secure.encrypt(row.DB_GESTION),
            DB_CONTABLE:secure.encrypt(row.DB_CONTABLE), // Encripta el campo DB
        }));

        res.status(200).json(encryptedData);
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

export default router;
