const Post = require("../models/posts");
const { createCustomError } = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");


const getAllPosts = async (req, res) => {
  const { title, text, sort, fields, getCategories, category, createdBy } = req.query;
  const queryObject = {};

  if (title) {
    queryObject.title = { $regex: title, $options: "i" };
  }
  if (createdBy) {
    queryObject.createdBy = createdBy
  }
  if (category) {
    queryObject.category = { $regex: category, $options: "i" };
  }
  if (getCategories) {
    const categories = await Post.distinct("category");
    return res.status(StatusCodes.OK).json(categories);
  }
  if (text) {
    queryObject.text = { $regex: text, $options: "i" };
  }
  if (category) {
    queryObject.category = { $regex: category, $options: "i" };
  }

  let result = Post.find(queryObject);
  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort({ createdAt: "desc" });
  }

  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }
  const posts = await result.populate("createdBy");
  res.status(StatusCodes.OK).json(posts);
};

const createPost = async (req, res) => {
  const result = await Post.create(req.body);
  const post = await Post.findById(result._id).populate("createdBy")
  res.status(StatusCodes.CREATED).json(post);
};

const getPost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOne({ _id: postID });
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(post);
};

const updatePost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOneAndUpdate(
    { _id: postID },
    { $set: req.body },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(post);
};

const deletePost = async (req, res) => {
  const { id: postID } = req.params;
  const post = await Post.findOneAndDelete({ _id: postID });
  if (!post) {
    throw createCustomError(`Non esiste nessun post con id : ${postID}`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json({ msg: `Il post con id ${postID} è stato rimosso con successo` });
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
};
