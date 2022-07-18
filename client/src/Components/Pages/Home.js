import React, { useEffect } from "react";
import Layout from "../Layout/Layout";
import { Link, Navigate } from "react-router-dom";
import { AiTwotoneHeart, AiOutlineHeart } from "react-icons/ai";
import { FiDelete } from "react-icons/fi";

import { useGlobalCtx } from "../../CtxAndProvider/CtxAndProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const {
    user,
    isAuthenticated,
    allPosts,
    getAllPosts,
    loading,
    unLikedPost,
    likesPost,
    addComment,
    deletePost,
  } = useGlobalCtx();

  const navigate = useNavigate();

  useEffect(() => {
    getAllPosts();
  }, [allPosts.length]);

  if (isAuthenticated === null) {
    return <Navigate to="/login" replace />;
  }

  if (loading === true || allPosts.length === 0) {
    return <Layout>Loading</Layout>;
  }

  return (
    <Layout>
      <div className="row">
        {allPosts.map((post) => (
          <div key={post._id} className="col-md-4 col-lg-3 mx-auto my-2">
            <div className="card p-3 space-y-5">
              <div>
                <Link to={`/profile/${post.postedBy._id}`} className="text-3xl">
                  {post.postedBy.name}
                </Link>
                {post.postedBy._id === null ? (
                  <>Loading</>
                ) : (
                  <>
                    {user._id === post.postedBy._id ? (
                      <>
                        <div
                          onClick={() => deletePost(post._id)}
                          className="text-3xl cursor-pointer text-red-800 flex justify-end inline-block group hover:bg-red-800 hover:text-white p-2 rounded-full my-1 hover:justify-center transition-all duration-1000"
                        >
                          <FiDelete className="group-hover:rotate-90" />
                        </div>
                      </>
                    ) : null}
                  </>
                )}
                {/* {post.postedBy.id !== null ? (<>
                 
                </>) : (<>loading</>)}  */}
                {/* <Link to='/profile' className="text-2xl">
                  {post.postedBy.name}
                </Link> */}
              </div>
              <div className="w-full">
                <img
                  className="img-fluid w-full h-full object-cover rounded-md"
                  src={post.photo}
                  alt="post_image"
                />
              </div>
              <div className="space-y-3">
                <div className="">{post.likes.length} Likes</div>
                <div
                  onClick={() => likesPost(post._id)}
                  className="text-green-800 cursor-pointer flex"
                >
                  <span className=" text-3xl">
                    <AiOutlineHeart />
                  </span>
                  <span>Like This Post</span>
                </div>
                <div
                  onClick={() => unLikedPost(post._id)}
                  className="text-red-800 cursor-pointer flex"
                >
                  <span className=" text-3xl">
                    <AiTwotoneHeart />
                  </span>
                  <span>Unlike this post</span>
                </div>
              </div>
              <div>post title</div>
              <div>post body</div>
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addComment(post._id, e.target[0].value);
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="enter your comment"
                    name="comment"
                  />
                  <button className="btn btn-primary mt-3">Add Comment</button>
                </form>
              </div>
              <div>
                <div className="text-2xl">comments for this post</div>
                <div>
                  {post.comment.length !== 0 ? (
                    <>
                      {post.comment.map((cmt) => (
                        <div
                          key={cmt._id}
                          className="my-2 bg-slate-300 p-2 rounded-xl"
                        >
                          <div className="my-2 flex space-x-2">
                            <div className="h-7 w-7">
                              <img
                                src={cmt.userImage}
                                className="h-full w-full object-cover"
                                alt=""
                              />
                            </div>
                            <div>{cmt.userName}</div>
                            <div className="text-red-800">
                              <FiDelete />
                            </div>
                          </div>
                          <div>{cmt.text}</div>
                        </div>
                      ))}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* </> */}
      </div>
    </Layout>
  );
};

export default Home;
