const mongoose = require('mongoose')
require('dotenv').config();

const mongourl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.hr93yw2.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0`
const mongoDB = async ()=>{
    try {
        await mongoose.connect(mongourl)
         console.log("database connected");
    } catch (error) {
        console.log("some errors",error);
    }
}

module.exports = mongoDB;