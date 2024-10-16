const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

exports.uploadImageToCloudinary = async (file, folder, serviceName) => {
  const tempFilePath = file.tempFilePath;
  const maxSizeKB = 80;

  // Check if the file is an image
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Check file size
  const { size } = await fs.stat(tempFilePath);
  const fileSizeInKB = size / 1024;

  if (fileSizeInKB > maxSizeKB) {
    throw new Error('File size must be less than 80KB');
  }

  const options = { 
    folder, 
    resource_type: "auto",
    alt: serviceName,
    format: "webp" // Force WebP format
  };
  const result = await cloudinary.uploader.upload(tempFilePath, options);

  return result;
};
