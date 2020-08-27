const bcrypt = require("bcrypt");// bcrypt pour hasher des mots de passe
const jwt = require("jsonwebtoken");// jsonwebtoken, pour renvoyer au front un token sécurisé
const mongoSanitize = require('mongo-sanitize');// mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const sha256 = require('sha256');// mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée

const User = require("../Models/User");// Le model des utilisateurs

exports.signup = (req, res) => { // Pour ajouter un utilisateur
  bcrypt.hash(mongoSanitize(req.body.password), 10)// On hash son mot de passe et on le sale 10 fois
    .then((hash) => {// Lorsqu'on a le hash
      const user = new User({// Oncrée l'objet
        email: sha256.x2(mongoSanitize(req.body.email)),// On crypte 2 fois l'adresse email
        password: hash,
      });
      user.save()// Et on le sauvegarde
        .then(res.status(201).json({ message: "Utilisateur crée" }))
        .catch((error) => res.status(400).json({ error: error }));
    })
    .catch((error) => res.status(500).json({ error: error }));
};

exports.login = (req, res) => { // Pour connecter un utilisateur
  User.findOne({ email: sha256.x2(mongoSanitize(req.body.email)) })// On le cherche via le crypte de son email
    .then((user) => {// Lorsqu'on l'a
      if (!user) {// Si on ne le trouve pas
        res.status(401).json({ error: "Utilisateur non trouvée" });
      } else {// Sinon
        bcrypt.compare(req.body.password, user.password)// On compare le mot de passe et le hash
          .then((valid) => {
            if (!valid) {// Si il n'est pas valide
              res.status(401).json({ error: "Mot de passe incorrect" });
            } else { // Sinon
              res.status(200).json({
                userId: user._id,// On retourne l'id
                token: jwt.sign({ userId: user._id }, "TOKEN_SUPER_SECRET", {
                  expiresIn: "24h",
                }),// Et le token
              });
            }
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
