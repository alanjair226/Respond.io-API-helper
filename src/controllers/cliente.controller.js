const { createContactAndAddId, addTag, addId, getContact, createContact } = require("../services/respond.service");
const { getCustomers } = require("../services/toku.service");
const { getClientDetails } = require("../services/mikrowisp.service");
const { verifyTokuWebhookSignature } = require('../utils/tokuWebhookVerifier'); 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const axios = require("axios");


// Controller to add ID and tag to the contact
const addIdAndTag = async (req, res) => {
    const { idcliente, tag } = req.params; // idcliente is used for both ID and phone number
    let contactPhone; // Declare the contactPhone variable outside of the try block

    try {
        // Step 1: Get client details by idcliente to retrieve the phone number
        const clientDetails = await getClientDetails("idcliente", idcliente); // Filter by idcliente
        contactPhone = clientDetails.datos[0].movil; // Get the phone number from the response
        console.log(`Contact phone number retrieved: ${contactPhone}`);

        // Step 2: Try to add the ID to the contact using the phone number
        await addId(contactPhone, idcliente, process.env.RESPOND_IO_TOKEN);
        await sleep(3000);
        // Step 3: If the ID is added successfully, add the tag
        await addTag(contactPhone, tag, process.env.RESPOND_IO_TOKEN);

        // Respond with success
        res
            .status(200)
            .json({
                message: `ID and tag successfully added to contact: ${contactPhone}`,
            });
    } catch (error) {
        // If the error is because the contact doesn't exist, try to create the contact
        if (error.response && error.response.status === 404) {
            // If contact doesn't exist, create it
            await createContactAndAddId(
                contactPhone,
                idcliente,
                process.env.RESPOND_IO_TOKEN
            );
            await sleep(10000);
            // After creating the contact, try to add the tag
            await addTag(contactPhone, tag, process.env.RESPOND_IO_TOKEN);

            // Respond with success
            res
                .status(200)
                .json({
                    message: `Contact created and tag added to contact: ${contactPhone}`,
                });
        } else {
            console.error(`Error processing the contact`, error);
            res
                .status(500)
                .json({ error: `Error adding ID and tag to contact: ${contactPhone}` });
        }
    }
};

const paymentIntentToku = async (req, res) => {

    try {
        verifyTokuWebhookSignature(req); // Llamamos a la función verificadora
        console.log('Webhook de Toku verificado correctamente.');
    } catch (error) {
        // Capturamos cualquier error lanzado por la función de verificación
        console.warn(`Webhook de Toku rechazado: ${error.message}`);
        // Respondemos con el código de estado apropiado (401, 403)
        return res.status(error.message.includes('faltante') || error.message.includes('inválida') || error.message.includes('formato') ? 403 : 500)
            .send(`No autorizado: ${error.message}`);
    }

    const { event_type, payment_intent } = req.body;
    console.log("Evento recibido:", event_type);
    if (!event_type) {
        return res.status(400).send("Falta el event_type en la solicitud");
    }

    if (
        event_type === "payment_intent.succeeded" ||
        event_type === "payment_intent.payment_failed"
    ) {
        try {
            const response = await getCustomers(payment_intent.customer);
            console.log(response.external_id)
            const { external_id, phone_number } = response;

            console.log(`${event_type === "payment_intent.succeeded" ? "Pago exitoso" : "Pago fallido"}:`, payment_intent);
            await handleContactAndNotify(phone_number, external_id, payment_intent.amount, event_type);

        } catch (error) {
            console.error('Error obteniendo cliente de Trytoku:', error.response ? error.response.data : error.message);
        }
        res.status(200).send("Evento recibido: " + event_type);
    } else {
        res.status(400).send("Evento no manejado: " + event_type);
    }
};

// Función para obtener o crear el contacto y notificar
async function handleContactAndNotify(phone_number, external_id, amount, eventType) {
    try {
        await getContact(phone_number);
        await sendNotification(eventType, { external_id, amount, phone_number });
        console.log(`Notificación enviada para el evento '${eventType}' con phone_number: ${phone_number}`);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            await createContact(phone_number, external_id);
            await new Promise(resolve => setTimeout(resolve, 30000));
            await sendNotification(eventType, { external_id, amount, phone_number });
            console.log(`Contacto creado y notificación enviada para el evento '${eventType}' con phone_number: ${phone_number}`);
        } else {
            console.error('Error manejando el contacto y la notificación:', error.response ? error.response.data : error.message);
            throw error;
        }
    }
}

// Función para enviar la notificación POST
async function sendNotification(eventType, data) {

    console.log("enviando notificación")
    const url = eventType === "payment_intent.succeeded" || eventType === "payment_intent.payment_failed" ?
        "https://hooks.chatapi.net/workflows/dLkLUhOAumAG/dzAnrMiaQZCl" :
        "https://hooks.chatapi.net/workflows/XldPhhmnhmbi/hiwssUkTviBA";

    const payload = eventType === "payment_intent.succeeded" || eventType === "payment_intent.payment_failed" ?
        { event_type: eventType, amount: data.amount, external_id: data.external_id, phone_number: data.phone_number } :
        { phone_number: data.phone_number, idcliente: data.external_id, amount: data.amount, payment_link: data.payment_link, clabe: data.clabe };

    try {
        const response = await axios.post(url, payload);
        console.log(response.data)
    } catch (error) {
        console.error('Error enviando notificación:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    addIdAndTag,
    paymentIntentToku
};
