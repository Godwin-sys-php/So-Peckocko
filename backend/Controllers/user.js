const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoSanitize = require('mongo-sanitize');// mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const protectToXss = require('xss');// xss pour se protéger des attaques xss

const User = require("../Models/User");

exports.signup = (req, res) => {
    bcrypt
      .hash(mongoSanitize(req.body.password), 10)
      .then((hash) => {
        const user = new User({
          email: mongoSanitize(req.body.email),
          password: hash,
        });
        user.save()
          .then(res.status(201).json({ message: "Utilisateur crée !" }))
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  User.findOne({ email: mongoSanitize(protectToXss(req.body.email)) })
    .then((user) => {
      if (!user) {
        res.status(401).json({ error: "Utilisateur non trouvée" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              return res.status(401).json({ error: "Mot de passe incorrect" });
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign({ userId: user._id }, "TOKEN_SUPER_SECRET", {
                expiresIn: "24h",
              }),
            });
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
