// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // Revisa si el token viene en la cabecera 'Authorization' y empieza con 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Obtenemos el token (quitando "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verificamos el token con nuestra clave secreta
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // 3. Añadimos la información del usuario del token a la petición (req)
      // Así, las rutas protegidas sabrán qué usuario está haciendo la petición
      req.user = decoded; 

      // 4. Continuamos a la siguiente función (el controlador)
      next();
      return;
    } catch (error) {
      // Manejo limpio de errores JWT conocidos
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Sesión expirada' });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Token inválido' });
        return;
      }
      
      // Solo loguear errores inesperados
      console.error('Auth Error:', error.message);
      res.status(401).json({ message: 'No autorizado' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};