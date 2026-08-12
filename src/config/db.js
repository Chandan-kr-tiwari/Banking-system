const mongoose = require("mongoose")

const connectToDb = async function(){
    try {
       await mongoose.connect(process.env.MONGO_DB_URI)
       console.log("db is connected")

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectToDb

