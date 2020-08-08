const express = require("express");
const router = express.Router();

const limit = require("../Middleware/limit");

const sauceCtrl = require("../Controllers/sauce");

const authUser = require("../Middleware/authUser");
const authSauce = require("../Middleware/authSauce");

const multer = require("../Middleware/multer");

router.get("/", authUser, limit, sauceCtrl.getAll);
router.get("/:id", authUser, limit, sauceCtrl.get);

router.post("/", authUser, multer, sauceCtrl.add);
router.post("/:id/like", authUser, limit, sauceCtrl.like);

router.put("/:id", authUser, authSauce, limit, multer, sauceCtrl.update);
router.delete("/:id", authUser, authSauce, limit, sauceCtrl.delete);

module.exports = router;