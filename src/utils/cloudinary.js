// cloudinary per file - file system ke through aayegi ( matlab hmare server se )

// server -> cloudinary 

import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if( !localFilePath ){
            return null ;
        }

        // uploading file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            // koi bhi format aye khud detect kr lega
        })
        // file has been uploaded successfully
        // console.log('File uploaded successfully on cloudinary !', response);


        // now file has been uploaded on cloudinary so we unlink the file from our server
        fs.unlinkSync(localFilePath)

        return response;
    } catch (error){
        // remove locally stored temp. file from server  
        fs.unlinkSync(localFilePath);
        console.error('Error in uploading file on cloudinary !', error);
        return null;
    }
}

export { uploadOnCloudinary };