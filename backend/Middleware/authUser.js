/* 
  Ce fichier est un middleware servant à vérifier qu'une requête est bien authentifier. 
  Il sera utilisé pour toute les routes relatives à la sauce.
*/

// Les modules
const jwt = require('jsonwebtoken');// Le jwt
const mongoSanitize = require('mongo-sanitize');// mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const User = require('../Models/User');// Le Schema des utilisateurs

module.exports = (req, res, next) => {
  /*
    On le mets dans un try catch principalement pour éviter les répétitions de: 
    res.status(401).json({
      error: new Error('Le message d'erreur')
    });
  */
  try {
    const token = req.headers.authorization.split(' ')[1];// Récupère le token 
    const userId = req.body.userId;// Récupère le userID

    const decodedToken = jwt.verify(token, 'TOKEN_SUPER_SECRET');// Décode le JWT
    const decodedUserId = mongoSanitize(decodedToken.userId);// Vérifie la valeur

    if (userId && userId !== decodedUserId) { // Si il y a un userId et il est différent de celui qui est dans le JWT
      throw 'userId invalide';// On "jette" une nouvelle erreur
    } else { // Sinon: 
      User.findOne({ _id: decodedUserId }) // On vérifie si le userId existe bien en base de donnée
        .then(user => {
          if (!user) {// Si il n'existe pas
            throw 'userId inexistant';// Une nouvelle erreur
          } else {// Sinon
            req.userId = decodedUserId;// On mets le userId dans l'objet req, pour le récupérer au prochain middleware
            next();// On passe au prochain middleware
          }
        })
        .catch(error => res.status(500).json({ error }))
    }
  } catch (error) {
    res.status(401).json({ error: new Error(error) });
  }
};