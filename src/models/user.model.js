import mongoose, {model, Schema} from "mongoose";

const userSchema = new Schema(
    {

    },
    {timestamps:ture});

export const User = mongoose.model("User", userSchema);