import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async() =>{
    try {
        await mongoose.connection(`${process.env.MONGODB_URI}/${DB_NAME }`)
    } catch (error) {
        console.log("MONGODB connection error : ", error);
        process.exit(1);
        
    }
}