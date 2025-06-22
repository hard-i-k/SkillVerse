import Blog from '../models/Blog.js';

// ✅ Create a new blog
export const createBlog = async (req, res) => {
  try {
    console.log('👉 req.user:', req.user); // 👀 debug

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { title, tag, content } = req.body;
    const user = req.user;

    if (!title || !tag || !content) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const blog = new Blog({
      title,
      tag,
      content,
      author: user.name,
      authorId: user._id, // ⛔ this was undefined earlier
    });

    await blog.save();
    res.status(201).json({ message: 'Blog created successfully.', blog });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// ✅ Vote (Upvote or Downvote)
export const voteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    let { type } = req.query;

    console.log('Incoming vote request:', { id, type, user: req.user });

    // Convert 'upvote' / 'downvote' → 'up' / 'down'
    if (type === 'upvote') type = 'up';
    if (type === 'downvote') type = 'down';

    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

    const prevVote = blog.votes.get(userId.toString());

    console.log(`Previous vote: ${prevVote}, new vote: ${type}`);

    if (prevVote === 'up' && type === 'up') {
      return res.status(200).json({ message: 'Already upvoted.' });
    }

    if (prevVote === 'down' && type === 'down') {
      return res.status(200).json({ message: 'Already downvoted.' });
    }

    // Remove previous vote
    if (prevVote === 'up') blog.upvotes -= 1;
    if (prevVote === 'down') blog.downvotes -= 1;

    // Add new vote
    if (type === 'up') {
      blog.upvotes += 1;
      blog.votes.set(userId.toString(), 'up');
    } else {
      blog.downvotes += 1;
      blog.votes.set(userId.toString(), 'down');
    }

    await blog.save();

    res.status(200).json({
      message: 'Vote updated successfully.',
      upvotes: blog.upvotes,
      downvotes: blog.downvotes,
    });
  } catch (error) {
    console.error('[voteBlog ERROR]:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};


// ✅ Delete a blog (Only by owner)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found.' });

    if (blog.authorId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this blog.' });
    }

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
