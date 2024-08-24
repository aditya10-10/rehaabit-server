const Partner = require("../models/Partner");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.addPartnerInformation = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,
      identificationType,
      identificationNumber,
      email,
      phoneNumber,
      businessName,
      businessStructure,
      numberOfEmployees,
      yearsOfExperience,
      bankName,
      accountNumber,
      routingNumber,
      address,
      businessAddress,
      alternativeContact,
      servicesOffered,
      serviceAreas,
    } = req.body;

    const photo = req.files.photo;

    // console.log("Received servicesOffered:", servicesOffered);

    const addr = address ? JSON.parse(address) : {};
    const businessAddr = businessAddress ? JSON.parse(businessAddress) : {};
    const alternativeCont = alternativeContact
      ? JSON.parse(alternativeContact)
      : {};

      let servicesOfferedArray = [];
      let serviceAreasArray = [];
  
      if (typeof servicesOffered === 'string') {
        try {
          servicesOfferedArray = JSON.parse(servicesOffered);
        } catch (e) {
          console.error("Failed to parse servicesOffered:", e);
        }
      } else if (Array.isArray(servicesOffered)) {
        servicesOfferedArray = servicesOffered;
      }
  
      if (typeof serviceAreas === 'string') {
        try {
          serviceAreasArray = JSON.parse(serviceAreas);
        } catch (e) {
          console.error("Failed to parse serviceAreas:", e);
        }
      } else if (Array.isArray(serviceAreas)) {
        serviceAreasArray = serviceAreas;
      }
  
      // console.log("Parsed servicesOfferedArray:", servicesOfferedArray);
      // console.log("Parsed serviceAreasArray:", serviceAreasArray);

    const image = await uploadImageToCloudinary(
      photo,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);

    // Create a new partner document
    const newPartner = new Partner({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality,
      identificationType,
      identificationNumber,
      photo: image.secure_url,
      email,
      address: addr,
      phoneNumber,
      businessName,
      businessStructure,
      businessAddress: businessAddr,
      alternativeContact: alternativeCont,
      numberOfEmployees,
      yearsOfExperience,
      servicesOffered: servicesOfferedArray,
      serviceAreas: serviceAreasArray,
      bankName,
      accountNumber,
      routingNumber,
    });

    // Save to the database
    await newPartner.save();

    return res.status(200).json({
      success: true,
      message: "Partner information added successfully",
      data: newPartner,
    });
  } catch (error) {
    console.error("Error adding partner information:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
