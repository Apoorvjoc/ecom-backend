const mongoose = require('mongoose');

const connectWithDb = ()=>{
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true 
    })
    .then(console.log("Db connected"))
    .catch((err)=>{
        console.log("ERROR IN DB CONNECTION: "+err);
        process.exit(1);
    })
}

module.exports = connectWithDb;