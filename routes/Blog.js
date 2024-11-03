const express = require("express");
const router = express.Router();

const { auth, isContentWriter, isAdmin } = require("../middlewares/auth");

const { createBlog, getBlogs, updateBlog, deleteBlog, getBlogBySlug, getBlogById, publishBlog } = require("../controllers/BlogController.js");


router.post("/createBlog", auth, isContentWriter, createBlog);
router.put("/updateBlog/:id", auth, isContentWriter, updateBlog);
router.put("/publishBlog/:id", auth, isAdmin, publishBlog);
router.delete("/deleteBlog/:id", auth, isAdmin, deleteBlog);
router.get("/blogs", getBlogs);
router.get("/blog/slug/:slug", getBlogBySlug);
router.get("/blog/id/:id", getBlogById);
module.exports = router;
