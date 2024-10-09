const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

exports.uploadImageToCloudinary = async (file, folder) => {
  const tempFilePath = file.tempFilePath;
  const compressedFilePath = path.join(__dirname, "compressed_" + path.basename(tempFilePath));
  const targetSizeKB = 200;
  let quality = 80; 
  let fileSizeInKB;

  do {
    await sharp(tempFilePath)
      .jpeg({ quality })
      .toFile(compressedFilePath);

    const { size } = await fs.stat(compressedFilePath);
    fileSizeInKB = size / 1024;

    if (fileSizeInKB > targetSizeKB) {
      quality -= 10; 
    }
  } while (fileSizeInKB > targetSizeKB && quality > 10); 

  const options = { folder, resource_type: "auto" };
  const result = await cloudinary.uploader.upload(compressedFilePath, options);

  await fs.unlink(compressedFilePath);

  return result;
};
