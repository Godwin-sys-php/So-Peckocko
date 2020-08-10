/* 
  Ce fichier est un middleware servant à vérifier qu'un utilisateur veut avoir une adresse email qui n'est pas existante en bdd, que cette dernière soit correct en syntaxe, que le mot de passe soit pertinent et que l'on ne veut pas créer un utilisateur déjà existant

  Il sera utilisé pour la route signup/ des utilisateurs.
*/

// Les modules
const validator = require("validator");// Le validateur
const passwordValidator = require("password-validator");// Le validateur de mot de passe
const mongoSanitize = require("mongo-sanitize");// Le nettoyeur mongoDB

const User = require('../Models/User');// Le modèle des utilisateurs

module.exports = (req, res, next) => {
  try {
    const schema = new passwordValidator();// On crée une nouvelle instance de l'objet
    schema// On crée un nouveau schéma
      .is().min(8)                                    // Minimum length 8
      .has().uppercase()                              // Must have uppercase letters
      .has().lowercase()                              // Must have lowercase letters
      .has().digits(2)                                // Must have at least 2 digits
    if (validator.isEmail(req.body.email) && schema.validate(req.body.password)) {// Si l'email est un email correct et que le mot de passe et valide
      User.findOne({ email: mongoSanitize(req.body.email) })// Il nous reste plus qu'à vérifier si un utilisateur ayant la même adresse email existe déjà
        .then(user => {
          if (!user) { // Si il n'existe pas
            next();// On passe au prochain middleware
          } else {// Sinon
            res.status(400).json({ message: "Utilisateur déjà existant" });
          }
        })
    } else {
      res.status(403).json({ message: "Email non valide ou mot de passe non valide" });
    }
  } catch (error) {
    res.status(400).json({ error: new Error(error) });
  }
};