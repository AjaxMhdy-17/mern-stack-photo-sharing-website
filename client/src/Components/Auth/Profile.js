import React from "react";
import Layout from "../Layout/Layout";

import { useGlobalCtx } from "../../CtxAndProvider/CtxAndProvider";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

const Profile = () => {
  const {
    isAuthenticated,
    user,
    getPostByUserId,
    postsByUser,
    loading,
    profile,
    getProfileByUserId,
    followUser,
    unfollowUser,
  } = useGlobalCtx();

  const params = useParams();

  useEffect(() => {
    getPostByUserId(params.id);
    getProfileByUserId(params.id);
  }, [params.id]);

  console.log(profile);

  if (isAuthenticated === null) {
    <Navigate to="/login" replace />;
  }

  if (
    user === null ||
    loading === true ||
    postsByUser === null ||
    profile === null
  ) {
    return (
      <Layout>
        <div className="text-4xl">Loading</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row">
        <div className="text-5xl text-center mb-5">Profile Page</div>
      </div>
      <div className="row pb-5 border-b-2 border-b-violet-900">
        <div className="col-md-5">
          <div className="w-48 h-48 m-auto">
            <img
              src={profile.pic}
              className="img-fluid object-cover h-full w-full rounded-full"
              alt="img_user"
            />
          </div>
        </div>
        <div className="col-md-7 mt-5 text-center">
          <div>
            <div className="text-3xl">{profile.name}</div>
          </div>
          <div className="flex flex-wrap space-x-5 text-2xl my-5 justify-center">
            <div>{postsByUser.length} posts</div>
            <div>{profile.followers.length} follower </div>
            <div>{profile.following.length} following</div>
          </div>
          {user._id !== profile._id ? (
            <>
              {profile.followers.find((fol) => fol === user._id) ? (
                <div>
                  <button
                    onClick={() => unfollowUser(params.id)}
                    className="btn btn-danger"
                  >
                    unfollow this user
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => followUser(params.id)}
                    className="btn btn-secondary"
                  >
                    follow this user
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="row">
            {postsByUser.map((post) => (
              <div key={post._id} className="col-md-4 col-lg-3 my-2">
                <div className="card shadow-lg">
                  <div className="h-48 mx-auto">
                    <img
                      className="h-full w-full object-cover"
                      src={post.photo}
                      alt="post_photo"
                    />
                  </div>
                  <div className="m-2">{post.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
