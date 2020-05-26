const mongoose = require('mongoose');
require("dotenv").config({path:"../variables.env"})

const conectarDB = async ()=>{
    try{
        // await mongoose.connect(process.env.DB_MONGO,{

        // })

        await mongoose.connect(
            'mongodb+srv://mono:mono34512744@cluster0-h6s4u.mongodb.net/CRMGraphQl',
             { useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify : false,useCreateIndex: true });
        console.log("DB Conectada")
    }catch(error){
        console.log("Error conectando con la BD")
        console.log(error)
        process.exit(1) // detener la APP
    }
}

module.exports = conectarDB