const crypto = require('crypto');

const verifyTokuWebhookSignature = (req) => {
    const secret = process.env.TOKU_WEBHOOK_SECRET;
    const signatureHeader = req.headers['toku-signature'];

    if (!secret) {
        throw new Error('TOKU_WEBHOOK_SECRET no configurado.');
    }
    if (!signatureHeader) {
        throw new Error('Cabecera Toku-Signature faltante.');
    }
    if (!req.rawBody) {
        throw new Error('Cuerpo crudo de la petición no disponible para verificación.');
    }

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
        throw new Error('Formato de cabecera Toku-Signature incorrecto');
    }

    const webhookRequestId = req.body && req.body.id;

    if (!webhookRequestId) {
        
        throw new Error('ID de la petición (id del webhook) faltante en el cuerpo. Toku requiere este ID para la firma.');
    }

    const stringToSign = `${timestamp}.${webhookRequestId}`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== receivedSignatureHash) {
        throw new Error(`Firma de webhook de Toku inválida.`);
    }

    const tolerance = 5 * 60; // 5 minutos de tolerancia
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - parseInt(timestamp, 10)) > tolerance) {
        throw new Error('Timestamp de firma fuera de tolerancia (posible ataque de repetición).');
    }

    return true;
};

module.exports = {
    verifyTokuWebhookSignature
};