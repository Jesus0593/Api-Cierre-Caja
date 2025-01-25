import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysCuentas } from '../queries/cuenta.js';
import mssql from 'mssql'

const router = express.Router();

router.get('/getConfiguracion', async (req, res) => {
    try {
        
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .query(QuerysCuentas.getAllCuentas)
        ;
        res.status(200).json(result.recordset); // Devuelve los datos como JSON
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});
router.post('/updateConfiguracion', async (req, res) => {
    const { COMISIONBANCARIA,RAIZPAGARE,IVA,FALTANTEVENTA,SOBRANTEVENTA,FALTANTEREDONDEO,SOBRANTEREDONDEO, RAIZUTILIDAD, APERTURA } = req.body; // Obtener datos del JSON recibido

    // Validar datos
    if (!COMISIONBANCARIA || !RAIZPAGARE || !IVA || !FALTANTEVENTA || !SOBRANTEVENTA || !FALTANTEREDONDEO || !SOBRANTEREDONDEO || !RAIZUTILIDAD || !APERTURA ) {
        return res.status(400).json({ error: 'Faltan datos requeridos (COMISIONBANCARIA,RAIZPAGARE,IVA,FALTANTEVENTA,SOBRANTEVENTA,FALTANTEREDONDEO,SOBRANTEREDONDEO, RAIZUTILIDAD, APERTURA)' });
    }

    try {
        // Conexión a la base de datos
        const pool = await dbConex.connectToDefalutBD();

        // Consulta SQL para insertar los datos
        const result = await pool.request()
            .input('COMISIONBANCARIA', mssql.VarChar, COMISIONBANCARIA)
            .input('RAIZPAGARE', mssql.VarChar, RAIZPAGARE)
            .input('IVA', mssql.VarChar, IVA)
            .input('FALTANTEVENTA', mssql.VarChar, FALTANTEVENTA)
            .input('SOBRANTEVENTA', mssql.VarChar, SOBRANTEVENTA)
            .input('FALTANTEREDONDEO', mssql.VarChar, FALTANTEREDONDEO)
            .input('SOBRANTEREDONDEO', mssql.VarChar, SOBRANTEREDONDEO)
            .input('RAIZUTILIDAD', mssql.VarChar, RAIZUTILIDAD)
            .input('APERTURA', mssql.VarChar, APERTURA)
            .query(QuerysCuentas.postAllCuentas);

        res.status(201).json({
            message: 'Cuentas Modificadas Correctamente',
            rowsAffected: result.rowsAffected,
        });
    } catch (error) {
        console.error('Error al insertar en la base de datos:', error.message);
        res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
});

export default router;
