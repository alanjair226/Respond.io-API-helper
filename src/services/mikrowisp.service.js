const axios = require("axios");

const getClientDetails = async (param, value) => {
    try {
        const response = await axios.post(
            `${process.env.MIKROWISP_URL}GetClientsDetails`, {
                "token": process.env.MIKROWISP_TOKEN,
                [param]: value
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching client details:", error);
        throw error;
    }
};

module.exports = {
    getClientDetails
}
