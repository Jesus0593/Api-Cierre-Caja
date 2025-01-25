import express from 'express'
import bodyParser from 'body-parser';
import usuariosRoutes from './routes/users.js'
import cuentasRoutes from './routes/cuenta.js'
import monedasRoutes from './routes/monedas.js'

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Ruta: Obtener todos los registros

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/monedas',monedasRoutes);




// Servidor en escucha
app.listen(PORT, () => {
    console.log(`Servidor corriendo en mi maquina http://localhost:${PORT}`);
});
