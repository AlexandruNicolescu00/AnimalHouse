const Post = require("../models/posts");
const { createCustomError } = require("../errors/custom-error");

const getAllPosts = async (req, res) => {
  const posts = await Post.find({});
  res.status(200).json({ posts });
};

const createPost = async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json({ post });
};

const getPost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOne({ _id: postID });
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, 404);
  }
  res.status(200).json({ post });
};

const updatePost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOneAndUpdate({ _id: postID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, 404);
  }
  res.status(200).json({ id: postID, data: req.body });
};

const deletePost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOneAndDelete({ _id: postID });
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, 404);
  }
  res
    .status(200)
    .json({ msg: `Il post con id ${postID} è stato rimosso con successo` });
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
