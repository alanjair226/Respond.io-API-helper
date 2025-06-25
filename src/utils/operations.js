const { months } = require("../constants/months");
const removeLada = (num) => {
  try {
    const cleaned = num.replace(/\D/g, "");
    const telSinLada = cleaned.replace(/^52?1?/, "");
    return telSinLada
  } catch (e) {
    return {message: "error cleaning number", error: e.message};
  }
}

const sumDays = (fecha) => {
  const fechaOriginal = new Date(fecha);
  if (isNaN(fechaOriginal)) return null;

  fechaOriginal.setDate(fechaOriginal.getDate() + 5);

  const dia = fechaOriginal.getDate();
  const mes = months[fechaOriginal.getMonth()];
  const anio = fechaOriginal.getFullYear();

  return `${dia} de ${mes} del ${anio}`;
}

module.exports = {
  removeLada,
  sumDays
}