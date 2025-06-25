const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/cliente.controller");

router.get("/add-id-tag-respond/:idcliente/:tag", clienteController.addIdAndTag);
router.post("/payment-intents-toku", clienteController.paymentIntentToku);

module.exports = router;
