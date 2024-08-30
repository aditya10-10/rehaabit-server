const Careers = require("../models/Careers");

exports.addCandidateInformation = async (req, res) => {
  try {
    const { name, lastName, email, phoneNumber, resume } = req.body;

    

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

// exports.getCandidates = async (req, res) => {
//   try {
//     const partners = await Partner.find();

//     res.status(200).json({
//       success: true,
//       data: partners,
//     });
//   } catch (error) {
//     console.error("Error getting Partners:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
