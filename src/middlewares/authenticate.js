// middlewares/authenticate.js

// Importamos las constantes de rutas
const { RESPOND_IO_PROTECTED_PATHS, TOKU_WEBHOOK_PATH } = require('../constants/apiProtectedPaths');
const authenticate = () => (req, res, next) => { // Ya no necesita 'protectedPaths' como argumento
    // Usa RESPOND_IO_PROTECTED_PATHS directamente
    const isProtectedRoute = RESPOND_IO_PROTECTED_PATHS.some(path => req.path.startsWith(path));
    if (!isProtectedRoute) {
        return next();
    }

    // Usa TOKU_WEBHOOK_PATH directamente
    const isTokuWebhookPath = req.path === TOKU_WEBHOOK_PATH; // Ya no necesitas pasarla como argumento
    if (isTokuWebhookPath) {
        return next();
    }

    const apiKey = req.headers['x-respond-io-api-key'];
    const expectedApiKey = process.env.MY_API_KEY_RESPOND_IO;

    if (!expectedApiKey) {
        console.error('ERROR: MY_API_KEY_RESPOND_IO no configurada en .env. El middleware de Respond.io no puede funcionar.');
        return res.status(500).json({ message: 'Error interno del servidor: clave API de Respond.io no configurada.' });
    }

    if (apiKey && apiKey === expectedApiKey) {
        next();
    } else {
        console.warn(`Intento de acceso no autorizado a ${req.path}. Clave API de Respond.io inválida o faltante.`);
        return res.status(403).json({ message: 'Acceso no autorizado: clave API de Respond.io inválida o faltante.' });
    }
};

module.exports = authenticate;