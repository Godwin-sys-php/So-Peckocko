const express = require("express");
const router = express.Router();

const limit = require('../Middleware/limitUser');
const validator = require('../Middleware/validator');

const userCtrl = require("../Controllers/user");

router.post("/signup", limit, validator, userCtrl.signup);
router.post("/login", limit, userCtrl.login);

module.exports = router;