const express = require('express');

const router = express.Router();

const {home} = require("../controller/homeControllers")

router.route("/").get(home);



module.exports = router;