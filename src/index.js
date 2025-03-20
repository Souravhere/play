// require('dotenv').config({path:"./env"})
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:"./env "
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log(`This ERROR from the Index.js : ${error}`);
    
})



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