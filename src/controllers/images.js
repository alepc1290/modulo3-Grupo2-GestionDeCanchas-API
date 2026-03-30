import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_APIKEY, CLOUDINARY_CLOUDNAME, CLOUDINARY_SECRET } from "../config/env.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUDNAME,
  api_key: CLOUDINARY_APIKEY,
  api_secret: CLOUDINARY_SECRET,
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió archivo",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "my-app",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: "Imagen subida correctamente",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error al subir imagen",
    });
  }
};

export { uploadImage };