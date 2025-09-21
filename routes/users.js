import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import mssql from 'mssql'
import { verifyToken } from '../VerificarToken.js';


const router = express.Router();

router.get('/getUsuarios', verifyToken, async (req, res) => {
    try {
        const id = req.query.id;
        const pool = await dbConex.connectToDefalutBD();
        const result = await pool.request()
            .input('CODUSUARIO', mssql.Int, id)
            .query(QuerysUser.getUserToId);

        // **Paso clave:** Agrupar los datos
        const datosAgrupados = result.recordset.reduce((acc, current) => {
            const { USUARIO, CODMODULO, CODSUBMODULO } = current;

            // Si el usuario no existe en el acumulador, lo creamos
            if (!acc[USUARIO]) {
                acc[USUARIO] = [];
            }

            // Buscamos si el CODMODULO ya existe para este usuario
            let moduloExistente = acc[USUARIO].find(m => m.codModulo === CODMODULO);

            // Si el CODMODULO no existe, lo creamos
            if (!moduloExistente) {
                moduloExistente = {
                    codModulo: CODMODULO,
                    codSubmodulos: []
                };
                acc[USUARIO].push(moduloExistente);
            }

            // Agregamos el CODSUBMODULO si no es nulo
            if (CODSUBMODULO !== null) {
                moduloExistente.codSubmodulos.push(CODSUBMODULO);
            }

            return acc;
        }, {});

        res.status(200).json(datosAgrupados); // Ahora enviamos la estructura transformada
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }
});


export default router;
