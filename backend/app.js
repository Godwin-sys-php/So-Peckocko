// Les modules
const express = require('express');// Express
const bodyParser = require('body-parser');// BodyParser, pour récupérer le corps de la requête
const mongoose = require('mongoose');// Mongoose
const cors = require('cors');// Cors pour accepter le cors
const path = require("path");// Path pour avoir accès au chemins du serveur
const fileUpload= require('express-fileupload')

const userRoute = require("./Routes/user");// Le routeur utilisateurs
const sauceRoute = require("./Routes/sauce");// Le routeur sauces

// Connexion à mongoDB Atlas
mongoose.connect('mongodb+srv://Godwin:jyvHF13XqPofLzaB@so-peckocko.c5zur.mongodb.net/<dbname>?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();// Express

app.use(fileUpload({ createParentPath: true }));

app.use(cors());// On accepte toute les requêtes de n'importe quelle serveur

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lorsque l'on voudra avoir accès au images
app.use("/images", express.static(path.join(__dirname, "images")));

// Les routes
app.use("/api/auth", userRoute);
app.use("/api/sauces", sauceRoute);

module.exports= app;