const express = require("express");
const router = express.Router();
const operationsController = require("../controllers/operations.controller");


router.get("/removeLada/:num", operationsController.removeLadaController);
router.get("/chooseNodo/:nodoId", operationsController.chooseNodo);
router.post("/sumDays", operationsController.sumDaysController);
router.get("/multiply/:x/:y", operationsController.multiply);

module.exports = router;