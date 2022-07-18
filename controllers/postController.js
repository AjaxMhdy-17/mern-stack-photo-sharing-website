const asyncHandler = require("express-async-handler");
const Post = require("../models/postSchema");

const getPost = asyncHandler(async (req, res) => {
  // console.log("comm");
  // res.send("hey");
});

const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate("postedBy", [
    "name",
    "email",
    "pic",
  ]);
  if (!posts) {
    res.status(404);
    throw new Error("No Posts Found!");
  } else {
    return res.status(200).json({
      posts: posts,
    });
  }
});

const getPostsById = asyncHandler(async (req, res) => {
  const posts = await Post.find({ postedBy: req.params.user_id }).populate(
    "postedBy",
    ["name", "email", "pic"]
  );
  if (!posts) {
    res.status(404);
    throw new Error("No Posts Found With This User Id");
  } else {
    return res.status(200).json({
      posts: posts,
    });
  }
});

const addPost = asyncHandler(async (req, res) => {
  const { title, body, photo } = req.body;

  if (!title || !body) {
    res.status(400);
    throw new Error("Please Enter All The Fields");
  } else {
    const createPost = new Post({
      title: title,
      body: body,
      photo: photo,
      postedBy: req.user._id,
    });

    await createPost.save();

    return res.status(200).json({
      msg: "post created successfully!",
    });
  }
});

const likesThePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const likedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $push: {
        likes: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!likedPost) {
    res.status(400);
    throw new Error("Something is wrong!");
  }
  const allPosts = await Post.find({});
  return res.status(200).json({
    allPosts: allPosts,
  });
});

const unLikedPost = asyncHandler(async (req, res) => {
  const { postId } = req.body;

  const unLikedPost = await Post.findByIdAndUpdate(
    postId,
    {
      $pull: {
        likes: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!unLikedPost) {
    res.status(400);
    throw new Error("Something is wrong");
  }
  const allPosts = await Post.find({});
  return res.status(200).json({
    allPosts: allPosts,
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { postId, comment } = req.body.obj;

  const commentBody = {
    userName: req.user.name,
    userImage: req.user.pic,
    text: comment,
    postedBy: req.user.id,
  };

  const commentPost = await Post.findByIdAndUpdate(
    postId,
    { $push: { comment: commentBody } },
    {
      new: true,
    }
  );
  if (!commentPost) {
    res.status(400);
    throw new Error("Something is wrong!");
  }
  const allPosts = await Post.find({});
  return res.status(200).json({
    allPosts: allPosts,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  // console.log(req.params.postId);

  const findPost = await Post.findById(req.params.postId);

  // console.log(findPost);
  // console.log(req.user.id);

  if (findPost.postedBy.toString() !== req.user.id) {
    res.status(400);
    throw new Error("Can not Delete Post By This User");
  } else {
    await findPost.remove();
    const allPosts = await Post.find({});
    return res.status(200).json({
      allPosts: allPosts,
    });
  }
});


const postsOfFollowingPersons = asyncHandler(async (req , res) => {

  const selectedPosts = await Post.find({postedBy : {$in : req.user.following}}).populate('postedBy','name')

  if(!selectedPosts){
    res.status(400)
    throw new Error('Something Went Wrong')
  }

  return res.status(200).json({
    selectedPosts : selectedPosts
  })

})


module.exports = {
  getPost,
  addPost,
  getAllPosts,
  getPostsById,
  likesThePost,
  unLikedPost,
  addComment,
  deletePost,
  postsOfFollowingPersons
};
