const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const authenticate = require("./middlewares/authenticate");
const clienteRoutes = require("./routes/cliente.routes");
const operationsRoutes = require("./routes/operations.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        // Guarda el buffer del cuerpo original de la petición
        // Esto es esencial para la verificación de firma del webhook
        req.rawBody = buf;
    }
}));
app.use(fileUpload());
app.use(authenticate());


// Rutas
app.use("/clients", clienteRoutes);
app.use("/operations", operationsRoutes);

module.exports = app;
