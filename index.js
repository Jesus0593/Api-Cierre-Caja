import express from 'express'
import bodyParser from 'body-parser';
import usuariosRoutes from './routes/users.js'
import cuentasRoutes from './routes/cuentas.js'
import monedasRoutes from './routes/monedas.js'
import empresasRoutes from './routes/empresas.js'
import cajaRoutes from './routes/caja.js'

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Ruta: Obtener todos los registros

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/empresas',empresasRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/monedas',monedasRoutes);
app.use('/api/caja', cajaRoutes);




// Servidor en escucha
app.listen(PORT, () => {
    console.log(`Servidor corriendo en mi maquina http://localhost:${PORT}`);
});
