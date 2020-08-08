const express = require("express");
const router = express.Router();

const limit = require('../Middleware/limitUser');

const userCtrl = require("../Controllers/user");

router.post("/signup", limit, userCtrl.signup);
router.post("/login", limit, userCtrl.login);

module.exports = router;