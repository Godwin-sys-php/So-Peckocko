const mongoSanitize = require("mongo-sanitize"); // mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const protectToXss = require("xss"); // xss pour se protéger des attaques xss
const fs = require('fs');

const Sauce = require("../Models/Sauce");

exports.getAll = (req, res) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.get = (req, res) => {
  Sauce.findOne({ _id: mongoSanitize(protectToXss(req.params.id)) })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => res.status(404).json({ error: error }));
}

exports.add = (req, res) => {
  const sauceInJson = JSON.parse(req.body.sauce);
  delete sauceInJson._id;
  const sauce = new Sauce({
    ...sauceInJson,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  console.log(sauce);
  sauce.save()
    .then(() => res.status(201).json({ message: "Sauce ajoutée" }))
    .catch((error) => console.log(error));
};

exports.like = (req, res) => {
  let like = mongoSanitize(req.body.like);
  let userId = mongoSanitize(req.body.userId);
  let sauceId = mongoSanitize(req.params.id);

  switch (like) {
    case 1:
      Sauce.findOne({ _id: sauceId })
          .then((sauce)=> {
            if (!sauce) {
              res.status(404).json({ message: "Sauce inexistante" });
            } else if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {
              res.status(403).json({message: "Sauce déjà liker ou disliker"});
            } else {
              Sauce.updateOne({_id: sauceId}, {$push: {usersLiked: userId}, $inc: {likes: +1}})
                  .then(() => res.status(200).json({message: 'Like ajouté'}))
                  .catch((error) => res.status(400).json({error}));
            }
          })
          .catch((error) => res.status(500).json({error}));
      break;
    
    case 0:
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
              .then(() => res.status(200).json({ message: 'Like retiré' }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
              .then(() => res.status(200).json({ message: 'Dislike retiré' }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(404).json({ error }));
      break;
    
    case -1:
      Sauce.findOne({ _id: sauceId })
        .then((sauce)=> {
          if (!sauce) {
            res.status(404).json({ message: "Sauce inexistante" });
          } else if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {
            res.status(403).json({message: "Sauce déjà liker ou disliker"});
          } else {
            Sauce.updateOne({ _id: sauceId }, { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } })
                .then(() => {
                  res.status(200).json({ message: 'Dislike ajouté' });
                })
                .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(500).json({error}));
      break;
  }
}

exports.update = (req, res) => {
    let sauceObject;
    if (req.file) {
    Sauce.findOne({ _id: mongoSanitize(protectToXss(req.params.id)) })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlinkSync(`images/${filename}`);
      });
    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    };
  } else {
    sauceObject = { ...mongoSanitize(req.body) };
  }
  Sauce.updateOne({ _id: mongoSanitize(protectToXss(req.params.id)) }, { ...sauceObject, _id: mongoSanitize(protectToXss(req.params.id)) })
    .then(() => res.status(200).json({ message: "Sauce modifié" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.delete = (req, res) => {
  Sauce.findOne({ _id: mongoSanitize(protectToXss(req.params.id)) })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlinkSync(`images/${filename}`);
      Sauce.deleteOne({ _id: mongoSanitize(protectToXss(req.params.id)) })
        .then(() => res.status(200).json({ message: "Sauce supprimé" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};