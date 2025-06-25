const axios = require("axios");

// Function to add an ID to a contact
const addId = async (contactPhone, contactId, token) => {

    console.log("aqui entramos a addId", contactPhone);
    const options = {
        method: "PUT",
        url: `https://api.respond.io/v2/contact/phone:52${contactPhone}`,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        data: {
            custom_fields: [{ name: "system_id", value: contactId }],
        },
    };

    try {
        await axios.request(options);
        console.log(`ID added to contact: ${contactPhone}`);
    } catch (error) {
        console.error(`Error adding ID to contact: ${contactPhone}`, error.data);
        throw error;
    }
};

// Function to add a tag to a contact
const addTag = async (contactPhone, tag, token) => {
    const options = {
        method: "POST",
        url: `https://api.respond.io/v2/contact/phone:52${contactPhone}/tag`,
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        data: [tag],
    };

    try {
        await axios.request(options);
        console.log(`Tag '${tag}' added to contact: ${contactPhone}`);
    } catch (error) {
        console.error(`Error adding tag to contact: ${contactPhone}`, error.data);
        throw error;
    }
};

// Function to create a contact if it doesn't exist and add the ID
const createContactAndAddId = async (contactPhone, contactId, token) => {
    console.log(contactPhone)
    const createContactOptions = {
        method: 'POST',
        url: `https://api.respond.io/v2/contact/phone:52${contactPhone}`,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        },
        data: {
            firstName: 'undefined',
            phone: contactPhone,
            custom_fields: [{ name: 'system_id', value: contactId }]
        }
    };

    try {
        const response = await axios.request(createContactOptions);
        console.log(`Contact created and ID added to: ${contactPhone}`, response.data);
    } catch (createError) {
        console.error(`Error creating contact and adding ID for: ${contactPhone}`);
        console.error('Response from API:', createError.response ? createError.response.data : createError);
        throw createError; // Throw the error to propagate it
    }
};

async function getContact(phone) {
  const options = {
    method: 'GET',
    url: `https://api.respond.io/v2/contact/phone:${phone}`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.RESPOND_IO_TOKEN}`,
    }
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error) {
    console.error('Error getting contact:', error.response ? error.response.data : error.message);
    throw error;
  }
}

async function createContact(phone, id) {
  const options = {
    method: 'POST',
    url: `https://api.respond.io/v2/contact/phone:${phone}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${process.env.RESPOND_IO_TOKEN}`
    },
    data: {
      firstName: 'user',
      phone: phone,
      custom_fields: [{name: 'system_id', value: id}]
    }
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (error) {
    console.error('Error creating contact:', error.response ? error.response.data : error.message);
    throw error;
  }
}



module.exports = {
    addTag,
    addId,
    createContactAndAddId,
    getContact,
    createContact
};
