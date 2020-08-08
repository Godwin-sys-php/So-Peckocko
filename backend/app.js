const express= require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");

const userRoute = require("./Routes/user");
const sauceRoute = require("./Routes/sauce");

mongoose.connect('mongodb+srv://Godwin:jyvHF13XqPofLzaB@so-peckocko.c5zur.mongodb.net/<dbname>?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app= express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", userRoute);
app.use("/api/sauces", sauceRoute);

module.exports= app;