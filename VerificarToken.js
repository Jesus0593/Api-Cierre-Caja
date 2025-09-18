// En tu archivo principal o en otro archivo de middlewares
import jwt from 'jsonwebtoken';
import 'dotenv/config'

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(403).send('Se requiere un token para la autenticación');
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).send('Token inválido');
    }
};

// Ejemplo de uso en una ruta protegida
