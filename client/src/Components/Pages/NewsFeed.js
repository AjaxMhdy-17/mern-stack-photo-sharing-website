import React, { useEffect } from "react";
import { useGlobalCtx } from "../../CtxAndProvider/CtxAndProvider";
import { FiDelete } from "react-icons/fi";
import { Link } from "react-router-dom";
import Layout from "../Layout/Layout";

const NewsFeed = () => {
  const { getPostsFromIFollowing, selectedPosts } = useGlobalCtx();

  useEffect(() => {
    getPostsFromIFollowing();
  }, []);

  if (selectedPosts.length === 0) {
    return (
      <Layout center>
        <div className="text-3xl">No Posts To Show!</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row text-center">
        <div className="text-4xl">My Selected News Feed</div>

        {selectedPosts.map((post) => (
          <div key={post._id} className="col-md-4 col-lg-3 mx-auto my-2">
            <div className="card p-3 space-y-5">
              <div>
                <Link to={`/profile/${post.postedBy._id}`} className="text-3xl">
                  {post.postedBy.name}
                </Link>
              </div>
              <div className="w-full">
                <img
                  className="img-fluid w-full h-full object-cover rounded-md"
                  src={post.photo}
                  alt="post_image"
                />
              </div>
              <div>post title</div>
              <div>post body</div>
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
      </div>
    </Layout>
  );
};

export default NewsFeed;
