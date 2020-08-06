/* 
  Ce fichier est un middleware servant à vérifier qu'une requête vers la sauce vient du bon utilisateur. 
  Il sera utilisé pour les routes PUT et DELETE de la sauce.
*/

// Les modules
const jwt = require('jsonwebtoken');// Le jwt
const mongoSanitize = require('mongo-sanitize');// mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const protectToXss = require('xss');// xss pour se protéger des attaques xss
const Sauce = require('../Models/Sauce');// Le Schema des sauces

module.exports = (req, res, next) => {
  /*
    On le mets dans un try catch principalement pour éviter les répétitions de: 
    res.status(401).json({
      error: new Error('Le message d'erreur')
    });
  */
  try {
    const sauceId = protectToXss(req.params.id);
    Sauce.findOne({ _id: mongoSanitize(sauceId) }) // On vérifie si la sauce existe bien en base de donnée
      .then(sauce => {
        if (!sauce) {// Si elle n'existe pas
          throw 'sauce inexistante';// Une nouvelle erreur
        } else {// Sinon
          if (sauce.userId == req.userId) { // Si le userId de la sauce correspond à celui de la session (req.userId est crée par le middleware authUser)
            next();// On passe au prochain middleware
          } else { // Sinon
            throw 'action non authorisee';// Une nouvelle erreur
          }
        }
      })
      .catch(error => res.status(500).json({ error }))
  } catch(error) {
    res.status(401).json({
      error: new Error(error)
    });
  }
};