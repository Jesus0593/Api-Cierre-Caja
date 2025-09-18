import express from 'express'
import bodyParser from 'body-parser';
import usuariosRoutes from './routes/users.js'
import cuentasRoutes from './routes/cuentas.js'
import monedasRoutes from './routes/monedas.js'
import empresasRoutes from './routes/empresas.js'
import cajaRoutes from './routes/caja.js'
import loginRoutes from './routes/login.js'
import configuracionRoutes from './routes/configuracion.js'
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Ruta: Obtener todos los registros


app.use('/ApiCierreCaja',loginRoutes);
app.use('/ApiCierreCaja/usuarios', usuariosRoutes);
app.use('/ApiCierreCaja/empresas',empresasRoutes);
app.use('/ApiCierreCaja/cuentas', cuentasRoutes);
app.use('/ApiCierreCaja/monedas',monedasRoutes);
app.use('/ApiCierreCaja/caja', cajaRoutes);
app.use('/ApiCierreCaja/configuracion', configuracionRoutes);




// Servidor en escucha
app.listen(PORT, () => {
    console.log(`Servidor corriendo en mi maquina http://localhost:${PORT}`);
});
