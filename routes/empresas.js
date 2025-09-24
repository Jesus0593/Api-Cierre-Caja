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
        const { user } = req.body;
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO',mssql.Int,user)
            .query(QuerysEmpresas.getEmpresaToId)
        ;
        // Encriptar el campo DB en cada registro
        /*const encryptedData = result.recordset.map((row) => ({
            ...row,
            BDGESTION: secure.encrypt(row.BDGESTION), // Encripta el campo DB
        }));*/
        const agrupar = result.recordset.reduce((acc, curr) => {
        const { CODUSUARIO, USUARIO, CODEMPRESAGESTION, GESTION, BDGESTION } = curr;
        if(!acc[CODUSUARIO]) {
            acc[CODUSUARIO] = {
                codusuario: CODUSUARIO,
                usuario: USUARIO,
                empresas : []
            };
        }
        let modulo = acc[CODUSUARIO].empresas.find(m => m.codempresa === CODEMPRESAGESTION);
        if(!modulo) {
            modulo = {
                codempresa: CODEMPRESAGESTION,
                gestion: GESTION,
                bdgestion: secure.encrypt(BDGESTION), // Encripta el campo BDGESTION
                
            };
            acc[CODUSUARIO].empresas.push(modulo);
        }
         return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    res.status(200).json(resultadoFinal);
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});

router.post('/getTiendasCajas', async (req, res) => {
    try {
        
        const { database } = req.body;
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
