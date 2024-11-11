const db = require("../config/firebaseSetUp");
require("../config/firebaseSetUp");
const admin = require("firebase-admin");
const blogsCollection = db.collection('blogs');

exports.createBlog = async (req, res) => {
  try {
    const { slug, title, metaDescription, author, content } = req.body;
    if (!slug || !title || !metaDescription || !author || !content) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required",
      });
    }
    // Check for existing blog
    const existingBlog = await blogsCollection.where('slug', '==', slug).get();
    if (!existingBlog.empty) {
      return res.status(400).json({
        success: false,
        message: "Blog with this slug already exists",
      });
    }

    // Create new blog
    const blogData = {
      slug,
      title,
      metaTitle: title,
      metaDescription,
      author,
      content,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'draft'
    };
    
    const docRef = await blogsCollection.add(blogData);
    const blog = { id: docRef.id, ...blogData };
    
    return res.status(200).json({
      success: true,
      message: "Blog Created Successfully",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const {id, slug, title, metaDescription, author, content } = req.body;
    const blogRef = blogsCollection.doc(id);
    const blogDoc = await blogRef.get();
    
    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }
    
    await blogRef.update({
      slug,
      title,
      metaTitle: title,
      metaDescription,
      author,
      content,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedBlog = await blogRef.get();
    
    return res.status(200).json({
      success: true,
      message: "Blog Updated Successfully",
      blog: { id: updatedBlog.id, ...updatedBlog.data() },
    });
  } catch (error) {
    console.error(error);  
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    let query = blogsCollection.orderBy('createdAt', 'desc');

    // Get total count
    const totalSnapshot = await query.get();
    const totalCount = totalSnapshot.size;
      
    // Get paginated data
    const blogsSnapshot = await query
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const blogs = [];
    blogsSnapshot.forEach(doc => {
      blogs.push({ id: doc.id, ...doc.data() });
    });

    return res.status(200).json({
      success: true,
      message: "Blogs Fetched Successfully",
      blogs,
      totalCount,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await blogsCollection.doc(id).delete();
    
    return res.status(200).json({
      success: true,
      message: "Blog Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    // console.log("slug",slug);
    const blogSnapshot = await blogsCollection.where('slug', '==', slug).get();
    // console.log("blogSnapshot",blogSnapshot);  
    if (blogSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    const blogDoc = blogSnapshot.docs[0];
    const blog = { id: blogDoc.id, ...blogDoc.data() };
    console.log("blog",blog);
    return res.status(200).json({
      success: true,
      message: "Blog Fetched Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blogDoc = await blogsCollection.doc(id).get();
    
    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    const blog = { id: blogDoc.id, ...blogDoc.data() };
    
    return res.status(200).json({
      success: true,
      message: "Blog Fetched Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.publishBlog = async (req, res) => {
  try {
    const { id } = req.body;
    const blogRef = blogsCollection.doc(id);
    const blogDoc = await blogRef.get();

    if (!blogDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Blog Not Found",
      });
    }

    // Get current status and toggle it
    const currentStatus = blogDoc.data().status;
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';

    await blogRef.update({ 
      status: newStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedBlog = await blogRef.get();
    
    return res.status(200).json({
      success: true,
      message: `Blog ${newStatus === 'published' ? 'Published' : 'UnPublished'} Successfully`,
      blog: { id: updatedBlog.id, ...updatedBlog.data() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
