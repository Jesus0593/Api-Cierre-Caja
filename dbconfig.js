import sql from 'mssql'
import 'dotenv/config'
import Encryptor from './Security.js';
const secure = new Encryptor();
// Configuración de la conexión
const config = {
    server: process.env.DB_HOST, // Usuario de SQL Server
    user: process.env.DB_USER,
    password: secure.decrypt(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    
    options: {
        encrypt: false, // Cambia a true si usas Azure
        trustServerCertificate: true, // Solo para desarrollo local
    }
};
   

export class dbConex{
    static async connectToDefalutBD(){
        try {
            await sql.close(); // Cierra cualquier conexión previa
            const pool = await sql.connect(config);
            console.log('Conexión a SQL Server exitosa');
            return pool;
        } catch (error) {
            console.error('Error al conectar a SQL Server:', error.message);
            throw error;
        }
    }
    static async connectToDB(databaseName) {
        const configAux = { ...config, database: secure.decrypt(databaseName) }; // Configuración con la base de datos específica
        try {
            await sql.close(); // Cierra cualquier conexión previa
            const pool = await sql.connect(configAux);
            console.log(`Conexión exitosa a la base de datos: ${databaseName}`);
            return pool;
        } catch (error) {
            console.error(`Error al conectar a la base de datos ${databaseName}:`, error.message);
            throw error;
        }
    }
    
    
}
