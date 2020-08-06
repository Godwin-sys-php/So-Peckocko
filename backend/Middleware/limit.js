/* 
  Ce fichier est un middleware servant à limiter le nombre de requête par adresse IP.
  Il sera utilisé pour toutes les routes.
*/

const limit = require("express-rate-limit");

module.exports = limit({
  windowMs: 15 * 60 * 1000,// 15 minutes
  max: 50,
  message: "Vous avez fait trop de requete"
  /* 
    Grâce au code plus haut, chaque adresse IP sera limité à 50 appels toute les 15 minutes
  */
});