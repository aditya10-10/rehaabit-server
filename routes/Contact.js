const express = require("express");
const router = express.Router();
const { auth, isPartner, isUser, isAdmin } = require("../middlewares/auth");

const {
  contactUsController,
  getAllContactsController,
  adminResponseController,
  getContactByIdController,
  updateContactStatusAndAssignmentController,
  deleteContactController,
} = require("../controllers/ContactUs");

// Route to submit a contact form (open to all)
router.post("/contact", contactUsController);

// Admin route to get all contacts (only admin access)
router.get("/getAllContacts", auth, isAdmin, getAllContactsController);

// User route to fetch a specific contact by caseId
router.post("/getContactById", auth, isAdmin, getContactByIdController);

// Admin route to update contact status, priority, and assignment (caseId replaced with contactId)
router.patch(
  "/updateContactStatusAndAssignment",
  auth,
  isAdmin,
  updateContactStatusAndAssignmentController
);

// Admin route for responding to contacts (caseId replaced with contactId)
router.patch("/adminResponse", auth, isAdmin, adminResponseController);

// Admin route to delete a contact by contactId
router.delete("/deleteContact", auth, isAdmin, deleteContactController);

module.exports = router;
