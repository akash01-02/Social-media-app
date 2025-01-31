const router = require('express').Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Creating
router.post('/', async (req, res) => {
  try {
    const newComment = new Comment({
      userId: req.body.userId,
      postId: req.body.postId,
      text: req.body.text,
    });

    const savedComment = await newComment.save();
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (comment.userId === req.body.userId) {
      await comment.deleteOne();
      res.status(200).json('Comment has been deleted');
    } else {
      res.status(403).json('You can delete only your comment');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
