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
    const blogUrls = [];
    blogsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.slug && data.status === "published") {
        // Ensure blog has a slug and is published
        blogUrls.push(`/library/${data.slug}`);
      }
    });
    return blogUrls;
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    throw error;
  }
};

// Fetch data for the sitemap
const generateSitemap = async () => {
  try {
    const firestoreBlogs = await getBlogUrls();
    const blogs = await Blog.find({ status: "published" }, { slug: 1 }).lean();
    const categories = await Category.find({}, { slugName: 1 }).lean();

    if (!blogs.length && !categories.length && !firestoreBlogs.length) {
      throw new Error("No blogs or categories found");
    }

    const urls = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      ...blogs.map(({ slug }) => ({
        url: `/library/${slug}`,
        changefreq: "monthly",
        priority: 0.8,
      })),
      ...firestoreBlogs.map((url) => ({
        url,
        changefreq: "weekly",
        priority: 0.8,
      })),
      ...categories.map(({ slugName }) => ({
        url: `/${slugName}`,
        changefreq: "weekly",
        priority: 0.8,
      })),
    ];

    const stream = new SitemapStream({ hostname: "https://www.rehaabit.com" });
    const sitemap = await streamToPromise(Readable.from(urls).pipe(stream));
    return sitemap.toString();
  } catch (error) {
    console.error("Error generating sitemap:", error.message);
    throw error;
  }
};

// Listen for changes in MongoDB collections
Blog.watch().on("change", async (change) => {
  console.log("Blog collection changed:", change);
  try {
    await generateSitemap();
  } catch (err) {
    console.error("Error regenerating sitemap:", err.message);
  }
});

Category.watch().on("change", async (change) => {
  console.log("Category collection changed:", change);
  try {
    await generateSitemap();
  } catch (err) {
    console.error("Error regenerating sitemap:", err.message);
  }
});

// Optional: Listen for changes in Firestore collection
blogsCollection.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    console.log("Firestore blog changed:", change);
    try {
      generateSitemap();
    } catch (err) {
      console.error("Error regenerating sitemap:", err.message);
    }
  });
});

module.exports = generateSitemap;
