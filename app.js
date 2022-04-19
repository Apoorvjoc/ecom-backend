const express = require("express");
require('dotenv').config();
const cookieParse = require("cookie-parser");
const fileUpload = require("express-fileupload")

const app = express();

//regular middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//cookie and file middleware
app.use(cookieParse());
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp/"
    })
);

//importing routes
const home = require("./routes/home")
const user = require("./routes/user");

//router middleware
app.use("/api/v1" , home);
app.use("/api/v1" , user);

module.exports  = app;