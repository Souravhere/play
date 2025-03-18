import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username:{
            type: String,
            required:true,
            unique: true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type: String,
            required:true,
            unique: true,
            lowercase:true,
            trim:true
        },
        fullname:{
            type: String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type: String, // cloudinary url
            required:true
        },
        coverImage:{
            type: String // cloudinary url
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required:[true,"Password is required"]
        },
        refreshToken:{
            type: String
        }
    },
    {timestamps:ture});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next(); //this is a condition if pass is not update that it will be not run this function 

    this.password = bcrypt.hash(this.password, 10) //encrypt this password 
    next() //flag to make the pocess next step
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
    //this will be return true | false only
}

export const User = mongoose.model("User", userSchema);