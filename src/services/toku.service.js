const axios = require("axios");

const getCustomers = async (customer) => {
    console.log(customer)
    try {
        const response = await axios.get(
            `${process.env.TOKU_API_URL}customers/${customer}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": `${process.env.TOKU_API_KEY}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching client details:", error);
        throw error;
    }
};

module.exports = {
    getCustomers
}