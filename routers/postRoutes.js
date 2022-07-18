const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const isAuthValid = require("../middlewares/checkIsAuthValid");
const {
  getPost,
  addPost,
  getAllPosts,
  getPostsById,
  likesThePost,
  unLikedPost,
  addComment,
  deletePost,
  postsOfFollowingPersons,
} = require("../controllers/postController");

router.get("/get", getPost);

router.get("/getAll", getAllPosts);

router.get("/postById/:user_id", isAuthValid, getPostsById);

router.post("/add", isAuthValid, addPost);

router.put("/likes", isAuthValid, likesThePost);

router.put("/unlikes", isAuthValid, unLikedPost);

router.put("/add_comment", isAuthValid, addComment);

router.delete("/delete/:postId", isAuthValid, deletePost);

router.get("/postsOfFollwingPersons", isAuthValid, postsOfFollowingPersons);

module.exports = router;
