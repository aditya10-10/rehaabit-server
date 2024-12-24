const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const Blog = require("../models/Blog");
const Category = require("../models/Category");
const db = require("../config/firebaseSetUp");
require("../config/firebaseSetUp");
const admin = require("firebase-admin");
const blogsCollection = db.collection("blogs");

const getBlogUrls = async () => {
  try {
    // Reference the blogs collection
    const blogsSnapshot = await db.collection("blogs").get();

    // Extract URLs
    const blogUrls = [];
    blogsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug && data.status === "published") {
        // Ensure blog has a slug and is published
        blogUrls.push(`/library/${data.slug}`);
      }
    });

    // console.log("Fetched blog URLs:", blogUrls);
    return blogUrls;
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    throw error;
  }
};

// Example usage
getBlogUrls()
  //   .then((urls) => console.log("Blog URLs:", urls))
  .catch((err) => console.error(err));

/**
 * Generate a sitemap dynamically from the database.
 * Includes blog and category URLs.
 * @returns {string} - XML string of the sitemap
 */
const generateSitemap = async () => {
  try {
    // console.log("Generating sitemap...");

    // Fetch blogs from Firestore
    const firestoreBlogs = await getBlogUrls();

    // Fetch blogs and categories from MongoDB
    const blogs = await Blog.find({ status: "published" }, { slug: 1 }).lean();
    const categories = await Category.find({}, { slugName: 1 }).lean();

    if (!blogs.length && !categories.length && !firestoreBlogs.length) {
      throw new Error("No blogs, Firestore blogs, or categories found");
    }

    // console.log(
    //   "Generating sitemap with",
    //   blogs.length,
    //   "blogs,",
    //   categories.length,
    //   "categories, and",
    //   firestoreBlogs.length,
    //   "Firestore blogs"
    // );

    // Prepare URLs for the sitemap
    const urls = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      // Map MongoDB blogs to include the `/library/` prefix
      ...blogs.map(({ slug }) => ({
        url: `/library/${slug}`,
        changefreq: "monthly",
        priority: 0.8,
      })),
      // Map Firestore blogs
      ...firestoreBlogs.map((url) => ({
        url,
        changefreq: "weekly",
        priority: 0.8,
      })),
      // Map categories with their slugs
      ...categories.map(({ slugName }) => ({
        url: `/${slugName}`,
        changefreq: "weekly",
        priority: 0.8,
      })),
    ];

    // Generate sitemap
    const stream = new SitemapStream({ hostname: "https://www.rehaabit.com" });
    const sitemap = await streamToPromise(Readable.from(urls).pipe(stream));
    return sitemap.toString();
  } catch (error) {
    console.error("Error in generateSitemap:", error.message);
    throw error;
  }
};

module.exports = generateSitemap;
