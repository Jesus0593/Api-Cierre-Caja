import express from 'express';
import { dbConex } from '../dbconfig.js';
import { QuerysUser } from '../queries/users.js';
import mssql from 'mssql'
import { verifyToken } from '../VerificarToken.js';


const router = express.Router();

router.post('/getUsuarios',verifyToken, async (req, res) => {
 try {
    
    const { codusuario } = req.body;
    const pool = await dbConex.connectToDefalutBD();
    const result = await pool.request()
    .input('CODUSUARIO',mssql.Int,codusuario)
    .query(QuerysUser.getUserToId);
    //res.status(200).json(result.recordset); // Devuelve los datos como JSON
    const agrupar = result.recordset.reduce((acc, curr) => {
        const { CODUSUARIO, USUARIO, CODMODULO, MODULO, CODSUBMODULO, SUBMODULO } = curr;
        if(!acc[CODUSUARIO]) {
            acc[CODUSUARIO] = {
                codusuario: CODUSUARIO,
                usuario: USUARIO,
                permisos : []
            };
        }
        let modulo = acc[CODUSUARIO].permisos.find(m => m.codmodulo === CODMODULO);
        if(!modulo) {
            modulo = {
                codmodulo: CODMODULO,
                modulo: MODULO,
                submodulos: []
            };
            acc[CODUSUARIO].permisos.push(modulo);
        }
        if(CODSUBMODULO) {
            modulo.submodulos.push({
                codsubmodulo: CODSUBMODULO,
                submodulo: SUBMODULO
            });
        } return acc;}, {});
    const resultadoFinal = Object.values(agrupar);
    res.status(200).json(resultadoFinal);
    } catch (error) {
        res.status(500).send('Error al obtener los datos: ' + error.message);
    }

});


export default router;
