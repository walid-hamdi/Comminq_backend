import { v2 as cloudinary } from "cloudinary";

const uploadPicture = async (file, path) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `comminq/${path}`,
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const removePicture = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    return null;
  }
};
const deleteUserPictures = async (user_id) => {
  try {
    await cloudinary.api.delete_folder(`comminq/${user_id}`);
  } catch (error) {
    return null;
  }
};

export default {
  uploadPicture,
  removePicture,
  deleteUserPictures,
};
