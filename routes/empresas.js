import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysEmpresas } from '../queries/empresas.js';
import mssql from 'mssql'
import Encryptor from '../Security.js';
import { verifyToken } from '../VerificarToken.js';
const secure = new Encryptor();

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
        const encryptedData = result.recordset.map((row) => ({
            ...row,
            DB_GESTION: secure.encrypt(row.DB_GESTION), // Encripta el campo DB
        }));

        res.status(200).json(encryptedData);
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});
router.get('/getEmpresasContables', async (req, res) => {
    try {
        const id = req.query.id
        const database = req.query.db
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO',mssql.Int,id)
            .input('BD',mssql.NVarChar,database)
            .query(QuerysEmpresas.getEmpresaContableToId)
        ;
        // Encriptar el campo DB en cada registro
        const encryptedData = result.recordset.map((row) => ({
            ...row,
            DB_GESTION: secure.encrypt(row.DB_GESTION),
            DB_CONTABLE: secure.encrypt(row.DB_CONTABLE), // Encripta el campo DB
        }));

        res.status(200).json(encryptedData);
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});
router.get('/getTiendasCajas', async (req, res) => {
    try {
        const database = req.query.database
        const pool = await dbConex.connectToDB(database);
        const result = await pool.request()
            .query(QuerysEmpresas.getTiendas)
        ;
        // Encriptar el campo DB en cada registro
        const encryptedData = result.recordset.map((row) => ({
            ...row,
            BD: secure.encrypt(row.BD) // Encripta el campo DB
        }));

        res.status(200).json(encryptedData);
        
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

export default router;
