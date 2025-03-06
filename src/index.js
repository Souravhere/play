// require('dotenv').config({path:"./env"})
import dotenv from 'dotenv';
import connectDB from "./db";

dotenv.config({
    path:"./env "
})

connectDB();




// simple appoch not much used in the production
/*
import express from 'express'
const app = express()

( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME} `);
        app.on("error", (error) => {
            console.log(error);
            throw error;
        });
        app.listen(process.env.PORT, () => {
            console.log(`your app is run on the ${process.env.PORT} PORT`);
            
        })
    } catch (error) {
        console.error("ERROR: ", error) 
        throw error;
    }
})()
*/