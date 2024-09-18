const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

const {
  contactUsController,
  getAllContactsController,
} = require("../controllers/ContactUs");

router.post("/contact", contactUsController);
router.get("/getAllContacts", auth, isAdmin, getAllContactsController);

module.exports = router;
