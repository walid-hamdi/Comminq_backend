import { v2 as cloudinary } from "cloudinary";

const uploadPicture = async (file, path) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "comminq/" + path,
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default {
  uploadPicture,
};
