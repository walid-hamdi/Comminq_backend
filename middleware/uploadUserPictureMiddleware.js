import multer from "multer";

const uploadPicture = (path) => {
  const storage = multer.diskStorage({
    // destination: process.env.NODE_ENV === "production" ? null : path,
    destination: path,
    filename: (req, file, callback) => {
      const filename = Date.now() + "." + file.mimetype.split("/")[1];
      req.body.picture = filename;
      callback(null, filename);
    },
  });

  const upload = multer({ storage });
  return [
    upload.any("picture"),
    (req, res, next) => {
      if (req.files && req.files.length) req.body.picture = req.files[0].path;
      next();
    },
  ];
};

export { uploadPicture };
