// utils/tokuWebhookVerifier.js
const crypto = require('crypto');

/**
 * Verifica la firma de un webhook de Toku.
 * @param {object} req - El objeto de request de Express.
 * @returns {boolean} - True si la firma es válida.
 * @throws {Error} - Lanza un error si la verificación falla.
 */
const verifyTokuWebhookSignature = (req) => {
    const secret = process.env.TOKU_WEBHOOK_SECRET;

    if (!secret) {
        throw new Error('TOKU_WEBHOOK_SECRET no configurado en .env. El webhook no puede ser verificado.');
    }

    // El nombre de la cabecera es 'Toku-Signature'
    const signatureHeader = req.headers['toku-signature'];

    if (!signatureHeader) {
        throw new Error('Cabecera Toku-Signature faltante en la petición del webhook.');
    }

    // req.rawBody debe estar disponible gracias a la configuración de bodyParser en app.js
    if (!req.rawBody) {
        throw new Error('Cuerpo crudo de la petición (req.rawBody) no disponible para verificación. ¿bodyParser configurado correctamente?');
    }

    // Parsificamos la cabecera de la firma: "t=timestamp,s=hash"
    const signatureParts = signatureHeader.split(',');
    let timestamp = '';
    let receivedSignatureHash = '';

    for (const part of signatureParts) {
        if (part.startsWith('t=')) {
            timestamp = part.substring(2);
        } else if (part.startsWith('s=')) {
            receivedSignatureHash = part.substring(2);
        }
    }

    if (!timestamp || !receivedSignatureHash) {
        throw new Error('Formato de cabecera Toku-Signature incorrecto (esperado "t=...,s=...").');
    }

    // La cadena que se firma es "timestamp.rawBody"
    const stringToSign = `${timestamp}.${req.rawBody.toString('utf8')}`;

    // Calculamos la firma usando HMAC-SHA256 y el secreto de Toku
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const calculatedSignature = hmac.digest('hex');

    // Comparamos las firmas
    if (calculatedSignature !== receivedSignatureHash) {
        throw new Error(`Firma de webhook de Toku inválida. Recibida: ${receivedSignatureHash}, Calculada: ${calculatedSignature}`);
    }

    // Protección contra ataques de repetición (timestamp tolerance)
    const tolerance = 5 * 60; // 5 minutos de tolerancia
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - parseInt(timestamp, 10)) > tolerance) {
        throw new Error('Timestamp de firma fuera de tolerancia (posible ataque de repetición).');
    }

    return true; // La firma es válida
};

module.exports = {
    verifyTokuWebhookSignature
};