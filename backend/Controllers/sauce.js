// Les modules
const mongoSanitize = require("mongo-sanitize"); // mongo-sanitize pour vérifier une valeur avant de faire une requête avec en base de donnée
const protectToXss = require("xss"); // xss pour se protéger des attaques xss
const fs = require('fs');// le module file system pour faire des actions sur des fichiers

const Sauce = require("../Models/Sauce");// On importe le model des sauces

exports.getAll = (req, res) => {// Pour récuperer toutes les sauces
  Sauce.find()// On récupère toute les sauces
    .then((sauces) => {
      res.status(200).json(sauces);// Lorsqu'on les a, on mets un statut 200 et on envoi le json
    })
    .catch((error) => {// On cas d'erreur, on considère que le problème vient du serveur et on renvoi un statut 500 avec l'erreur
      res.status(500).json({
        error: new Error(error),
      });
    });
};

exports.get = (req, res) => { // Pour récupérer une sauce précise
  // On mets le tout dans un try catch, parce que s'est possible que l'on ai pas l'id en paramètre de requête
  try {
    Sauce.findOne({ _id: mongoSanitize(req.params.id) })// On cherche UNE SAUCE qui a pour id celui dans les paramètre et bien évidemment on la néttoie
      .then((sauce) => {
        res.status(200).json(sauce);// Lorsqu'on l'a, on mets un statut 200 et on envoi la sauce au format json
      })
      .catch((error) => res.status(404).json({ error: error }));// On cas d'erreur, on considère que l'on a pas trouvé la sauce et on renvoi un statut 404 avec l'erreur
  } catch (error) {
    res.status(400).json({ error: new Error(error) });
  }
}

exports.add = (req, res) => {// Pour ajouter une nouvelle sauce
  // On mets le tout dans un try catch, parce que s'est possible que l'on ai pas tout les éléments dans le corps de la requête
  try {
    const sauceInJson = JSON.parse(req.body.sauce);// On parse le JSON
    delete sauceInJson._id;// Si il y a un _id, on le supprime
    for (let index in sauceInJson) {// On parcours le l'objet
      sauceInJson[index] = mongoSanitize(protectToXss(sauceInJson[index]));// Et on remplace chaque élément par un identique néttoyer et protéger des attaques xss
    }
    const sauce = new Sauce({// On construit l'objet en mettant certaines valeurs à zero
      ...sauceInJson,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
    });
    sauce.save()// On peut le sauvegarder
      .then(() => res.status(201).json({ message: "Sauce ajoutée" }))// Si tout s'est bien passé, on mets un statut 201 et on renvoi un message de succès
      .catch((error) => res.status(500).json({ error: new Error(error) }));// Sinon on considère que la requête est incorrect et on renvoi un statut 400
  } catch (error) {
    res.status(400).json({ error: new Error(error) });
  }
  
};

exports.like = (req, res) => {// Pour liker, disliker, annuler un like ou un dislike
  //On try catch cette partie pour être sûr que les éléments existe
  try {
  // On nettoi les éléments venant du front
    var like = mongoSanitize(req.body.like);
    var userId = mongoSanitize(req.body.userId);
    var sauceId = mongoSanitize(req.params.id);
  } catch (error) {
    res.status(400).json({ error: new Error(error) });
  }

  switch (like) { // On fonction de la valeur de like
    case 1:// Si like vaut 1
      Sauce.findOne({ _id: sauceId })// On récupère avant tout la sauce
          .then((sauce)=> {
            if (!sauce) { // Si on ne la trouve pas
              res.status(404).json({ message: "Sauce inexistante" });// Statut 404 et message disant que la sauce est inexistante
            } else if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {// Sinon si l'utilisateur est déjà dans le tableau des likes ou des dislike
              res.status(403).json({message: "Sauce déjà liker ou disliker"});// On renvoi un statut 403 et un message disant que la sauce a déjà était liker ou disliker
            } else {// Sinon tout est bon, on peut la liker
              Sauce.updateOne({_id: sauceId}, {$push: {usersLiked: userId}, $inc: {likes: +1}})
                .then(() => res.status(200).json({message: 'Like ajouté'}))
                .catch((error) => res.status(400).json({ error: new Error(error) }));
            }
          })
          .catch((error) => res.status(500).json({ error: new Error(error) }));// On cas d'erreur, on considère que c'est le serveur le problème
      break;
    
    case 0:// Si like vaut 0
      Sauce.findOne({ _id: sauceId })// On récupère la sauce
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {// Si 'utilisateur est dans le tableau des likes
            Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })// On annule le like de la sauce
              .then(() => res.status(200).json({ message: 'Like retiré' }))
              .catch((error) => res.status(400).json({ error }));
          }
          if (sauce.usersDisliked.includes(userId)) {// Sinon si il est dans le tableau des dislikes
            Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })// On annule le dislike de la sauce
              .then(() => res.status(200).json({ message: 'Dislike retiré' }))
              .catch((error) => res.status(400).json({ error: new Error(error) }));
          }
        })
        .catch((error) => res.status(404).json({ error: new Error(error) }));
      break;
    
    case -1:// Si like vaut -1
      Sauce.findOne({ _id: sauceId })// On récupère avant tout la sauce
        .then((sauce)=> {
          if (!sauce) { // Si on ne la trouve pas
            res.status(404).json({ message: "Sauce inexistante" });// Statut 404 et message disant que la sauce est inexistante
          } else if (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId)) {// Sinon si l'utilisateur est déjà dans le tableau des likes ou des dislike
            res.status(403).json({message: "Sauce déjà liker ou disliker"});// On renvoi un statut 403 et un message disant que la sauce a déjà était liker ou disliker
          }else {// Sinon tout est bon, on peut la liker
            Sauce.updateOne({_id: sauceId}, {$push: {usersDisliked: userId}, $inc: {dislikes: +1}})
              .then(() => res.status(200).json({message: 'Dislike ajouté'}))
              .catch((error) => res.status(400).json({ error: new Error(error) }));
          }
        })
          .catch((error) => res.status(500).json({ error: new Error(error) }));// On cas d'erreur, on considère que c'est le serveur le problème
      break;
  }
}

exports.update = (req, res) => {// Pour modifier la sauce
  try {
    let sauceObject;// Une variable que aura la nouvelle sauce
    if (req.file.filename) {// Si il y a un fichier
      Sauce.findOne({ _id: mongoSanitize(req.params.id) })// On récupère la sauce
        .then((sauce) => {// Et on supprime l'ancienne image
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlinkSync(`images/${filename}`);
        });
      let sauceInJson = JSON.parse(req.body.sauce);// On parse le JSON de la sauce 
      delete sauceInJson._id;// On supprime l'id
      for (let index in sauceInJson) {// On parcours l'objet 
        sauceInJson[index] = mongoSanitize(protectToXss(sauceInJson[index]));// On nettoie les éléments
      }
      sauceObject = {// On construit l'objet
        ...sauceInJson,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      };
    } else {// Sinon (donc il n'y a pas de fichier)-
      sauceObject = req.body;// On récupère la sauce 
      for (let index in sauceObject) {// On parcours le JSON
        sauceObject[index] = mongoSanitize(protectToXss(sauceObject[index]));// On nettoie les éléments
      }
    }
    // À la fin, on peut modifier la sauce
    console.log(sauceObject);
    Sauce.updateOne({ _id: mongoSanitize(req.params.id) }, { ...sauceObject/* <- il correspond à la nouvelle sauce créer plus haut en fonction de la présence du fichier fichier */, _id: mongoSanitize(req.params.id) /* <- pour la presistence de l'id, on le rajoute */  })
      .then(() => res.status(200).json({ message: "Sauce modifié" }))
      .catch((error) => res.status(500).json({ error: new Error(error) }));
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: new Error(error) });
  }
};

exports.delete = (req, res) => {// Pour supprimer une sauce
  Sauce.findOne({ _id: mongoSanitize(req.params.id) })// On la récupère
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];// On mets dans une variable le nom du fichier
      fs.unlinkSync(`images/${filename}`);// On supprimer l'image
      Sauce.deleteOne({ _id: mongoSanitize(req.params.id) }) // On supprime la sauce
        .then(() => res.status(200).json({ message: "Sauce supprimé" }))
        .catch((error) => res.status(400).json({ error: new Error(error) }));
    })
    .catch((error) => res.status(400).json({ error: new Error(error) }));
};