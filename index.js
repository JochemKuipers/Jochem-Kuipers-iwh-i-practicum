const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.HUBSPOT_PRIVATE_APP_ACCESS;

app.get("/", async (req, res) => {
  const contacts = "https://api.hubapi.com/crm/v3/objects/contacts";
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };
  try {
    const resp = await axios.get(contacts, { headers });
    const data = resp.data.results;
    res.render("homepage", {
      title: "Homepage | Integrating With HubSpot I Practicum.",
      data,
    });
  } catch (error) {
    console.error(error);
  }
});

app.get("/update-cobj", async (req, res) => {
  res.render("updates", {
    title: "Update Custom Object Form | Integrating With HubSpot I Practicum.",
  });
});

app.post("/update-cobj", async (req, res) => {
  const email = req.body.email?.trim();
  if (!email) {
    return res.status(400).send("Email is required to upsert by email.");
  }
  const update = {
    inputs: [
      {
        id: email,
        idProperty: "email",
        properties: {
          email,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          phone: req.body.phone,
        },
      },
    ],
  };
  const updateContact =
    "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert";
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };
  try {
    await axios.post(updateContact, update, { headers });
    res.redirect("/");
  } catch (error) {
    console.error(error.response?.data ?? error.message);
    res.status(500).send("HubSpot upsert failed; check server logs.");
  }
});

// * Localhost
app.listen(3000, () => console.log("Listening on http://localhost:3000"));
