// Les modules
const express = require('express');// Express
const bodyParser = require('body-parser');// BodyParser, pour récupérer le corps de la requête
const mongoose = require('mongoose');// Mongoose
const cors = require('cors');// Cors pour accepter le cors
const path = require("path");// Path pour avoir accès au chemins du serveur
const fileUpload= require('express-fileupload')

const userRoute = require("./Routes/user");// Le routeur utilisateurs
const sauceRoute = require("./Routes/sauce");// Le routeur sauces

require('dotenv').config();

// Connexion à mongoDB
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DATABASE_STRING_CONNECTION)
  .then(() => console.log('Connexion a MongoDB réussie !'))
  .catch((error) => console.log('Connexion a MongoDB échouée !'));

const app = express();// Express

app.use(cors());// On accepte toute les requêtes de n'importe quelle serveur

app.use(fileUpload({ createParentPath: true, limits: { fileSize: 50 * 1024 } }));

// BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lorsque l'on voudra avoir accès au images
app.use("/images", express.static(path.join(__dirname, "images")));

// Les routes
app.use("/api/auth", userRoute);
app.use("/api/sauces", sauceRoute);

module.exports= app;