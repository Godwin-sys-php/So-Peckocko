/* 
  Ce fichier est un middleware servant à upload un utilisateur. Contrairement au cous sur Node JS, je n'utilise pas Multer mais express-fileupload

  Il sera utilisé pour les routes POST et PUT des sauces
*/

module.exports = (req, res, next) => {
  if (typeof req.files.image !== 'undefined') {// Comparable à un isset(req.files.image) en php
    // Lesw types de fichier autoriser
    const MIME_TYPES = {
      "image/jpg": "jpg",
      "image/jpeg": "jpg",
      "image/png": "png",
    };
    const MIME_TYPES_ARRAY = [
      "image/jpg",
      "image/jpeg",
      "image/png"
    ];
    const imageUpload = req.files.image;// La constante
    /*
      Grâce à express-fileupload, je peux éxecuter des fonctions sur les fichiers envoyer par le front, des fonctions comme mv pour déplacer un fichier
    */
    if (MIME_TYPES_ARRAY.includes(imageUpload.mimetype)) {// Si le type du fichier fait parti des type autorisé
      const extension = MIME_TYPES[imageUpload.mimetype];// On récupère l'extension
      let timestamp = Date.now();// On stock le timestamp actuel dans une variable 
      imageUpload.mv(`./images/${imageUpload.name}_${timestamp}.${extension}`);// On peut maintenant uploader l'image
      req.file = { filename: `${imageUpload.name}_${timestamp}.${extension}` };// On défini le req.file.filename pour le prochain middleware
      next();// On passe au prochain middleware
    } else {// Sinon
      res.status(400).json({ message: 'Format de fichier invalide' });// On renvoi un statut 400 et un message disant que le format du fichier est invalide
    }
  } else {
    next();
  }
};
