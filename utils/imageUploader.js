const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

exports.uploadImageToCloudinary = async (file, folder, serviceName) => {
  const tempFilePath = file.tempFilePath;
  const compressedFilePath = path.join(__dirname, "compressed_image.webp");
  const targetSizeKB = 100;
  let quality = 80;
  let fileSizeInKB;

  // Check if the file is an image
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp','image/jpg'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  do {
    await sharp(tempFilePath)
      .webp({ quality })
      .toFile(compressedFilePath);

    const { size } = await fs.stat(compressedFilePath);
    fileSizeInKB = size / 1024;

    if (fileSizeInKB > targetSizeKB) {
      quality -= 5;
    }
  } while (fileSizeInKB > targetSizeKB && quality > 10);

  if (fileSizeInKB > targetSizeKB) {
    throw new Error('Unable to compress image to target size.');
  }

  const options = { 
    folder, 
    resource_type: "auto",
    alt: serviceName  // Add this line to set the alt tag
  };
  const result = await cloudinary.uploader.upload(compressedFilePath, options);

  await fs.unlink(compressedFilePath);

  return result;
};
