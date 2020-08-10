const express = require("express");
const router = express.Router();

const limit = require("../Middleware/limit");

const sauceCtrl = require("../Controllers/sauce");

const authUser = require("../Middleware/authUser");
const authSauce = require("../Middleware/authSauce");

const uploadFile = require('../Middleware/upload');

router.get("/", limit, authUser, sauceCtrl.getAll);
router.get("/:id", limit, authUser, sauceCtrl.get);

router.post("/", limit, authUser, uploadFile, sauceCtrl.add);
router.post("/:id/like", limit, authUser, sauceCtrl.like);

router.put("/:id",limit, authUser, authSauce, uploadFile, sauceCtrl.update);
router.delete("/:id", limit, authUser, authSauce, sauceCtrl.delete);

module.exports = router;