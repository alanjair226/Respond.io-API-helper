const { removeLada } = require("../utils/operations");
const { nodoMapping } = require("../constants/nodes");
const { sumDays } = require('../utils/operations');


const removeLadaController = (req, res) => {
    const { num } = req.params;

    try {
        const result = removeLada(num);
        res.status(200).json({ number: result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

const chooseNodo = (req, res) => {
    const { nodoId } = req.params;

    if (!nodoMapping[nodoId]) {
        return res.status(404).json({ error: "Nodo not found" });
    }

    const nodo = nodoMapping[nodoId];
    res.status(200).json({ nodo });
}

const sumDaysController = (req, res) => {
    const { Date } = req.body;

    if (!Date) {
        return res.status(400).json({ error: 'La Date es requerida' });
    }

    const DateFormateada = sumDays(Date);

    if (!DateFormateada) {
        return res.status(400).json({ error: 'Date no válida' });
    }

    res.status(200).json({ Date: DateFormateada });
};


const multiply = (req, res) => {
    try {
        const { x, y } = req.params;

        const total = parseFloat(x) * parseFloat(y);

        if (isNaN(total)) {
            throw new Error("Parámetros inválidos");
        }

        res.status(200).json({ total });
    } catch (error) {
        console.error("Error al multiplicar:", error.message);
        res.status(500).json({ error: "Algo salió mal al multiplicar los valores" });
    }
};


module.exports = {
    removeLadaController,
    chooseNodo,
    sumDaysController,
    multiply
};
