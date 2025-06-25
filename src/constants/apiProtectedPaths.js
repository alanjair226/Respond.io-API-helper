// constants/apiPaths.js

// Rutas protegidas que deben ser consumidas por Respond.io
// y que esperarán la cabecera 'X-Respond-Io-Api-Key'.
const RESPOND_IO_PROTECTED_PATHS = [
    '/clients/add-id-tag-respond',
    '/operations/sumDays',
    '/operations/chooseNodo',
    '/operations/removeLada',
    '/operations/multiply',
];

module.exports = {
    RESPOND_IO_PROTECTED_PATHS,
};