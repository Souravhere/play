import {v2 as cloudinary} from 'cloudinary'
import fs from fs;

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        // upload the file on the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // file is uploaded
        console.log("File is sucessfully uploaded on Cloudinary : ", response.url);
        return response;  
    } catch(error){
        fs.unlinkSync(localFilePath) //this will be removed the localy saved files
        return null;
    }
}

export {uploadOnCloudinary}