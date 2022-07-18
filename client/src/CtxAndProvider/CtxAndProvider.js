import React, { createContext, useReducer, useContext } from "react";
import axios from "axios";

const AppContext = createContext();

const initialState = {
  msg: "",
  user: null,
  profile: null,
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  loading: null,
  postsByUser: null,
  allPosts: [],
  selectedPosts: [],
};

const UserReducer = (state, action) => {
  if (action.type === "setMsg") {
    return {
      ...state,
      msg: action.payload,
    };
  } else if (action.type === "loadingTrue") {
    return {
      ...state,
      loading: true,
    };
  } else if (action.type === "loginUser") {
    return {
      ...state,
      token: action.payload.token,
      msg: action.payload.message,
      isAuthenticated: true,
      loading: false,
    };
  } else if (action.type === "loadCurrentUser") {
    return {
      ...state,
      user: action.payload,
      isAuthenticated: true,
      loading: false,
    };
  } else if (action.type === "getProfileById") {
    return {
      ...state,
      profile: action.payload,
      isAuthenticated: true,
      loading: false,
    };
  } else if (action.type === "logoutUser") {
    localStorage.removeItem("token");
    return {
      ...state,
      user: null,
      profile: null,
      isAuthenticated: null,
      token: null,
      loading: null,
      msg: "",
      postsByUser: [],
      selectedPosts: [],
    };
  } else if (action.type === "clearMsg") {
    return {
      ...state,
      msg: action.payload,
    };
  } else if (action.type === "getPostByUserId") {
    return {
      ...state,
      postsByUser: action.payload,
      loading: false,
    };
  } else if (action.type === "getAllPosts") {
    // console.log(action.payload);
    return {
      ...state,
      postsByUser: null,
      profile: null,
      allPosts: action.payload,
      loading: false,
      selectedPosts: [],
    };
  } else if (action.type === "getPostsFromIFollowing") {
    return {
      ...state,
      allPosts: [],
      selectedPosts: action.payload,
      loading: false,
    };
  } else if (action.type === "authErrorResetAll") {
    localStorage.removeItem("token");
    return {
      ...state,
      msg: action.payload,
      user: null,
      profile: null,
      token: null,
      isAuthenticated: null,
      loading: null,
      postsByUser: [],
      selectedPosts: [],
    };
  }

  return state;
};

const CtxAndProvider = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, initialState);

  const clearMsg = async () => {
    dispatch({
      type: "clearMsg",
      payload: "",
    });
  };

  const registerUser = async (data) => {
    console.log(data);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post("/api/auth/register", data, { config });
      if (response.data) {
        console.log(response.data);
        dispatch({
          type: "setMsg",
          payload: response.data.message,
        });
      }
    } catch (error) {
      //   console.log(error.response.data.message);
      //   toast(error.response.data.message);
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const loginUser = async (data) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post("/api/auth/login", data, { config });
      if (response.data) {
        // console.log(response.data);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        dispatch({
          type: "loginUser",
          payload: response.data,
        });
      }
    } catch (error) {
      //   console.log(error.response.data.message);
      //   toast(error.response.data.message);
      localStorage.removeItem("token");
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const loadCurrentUser = async () => {
    // if(localStorage)

    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      dispatch({
        type: "loadingTrue",
      });

      const res = await axios.get("/api/auth/currentUser", config);

      if (res) {
        // console.log(res.data);
        dispatch({
          type: "loadCurrentUser",
          payload: res.data,
        });
      }
    } catch (error) {
      localStorage.removeItem("token");
      dispatch({
        type: "authErrorResetAll",
        payload: error.response.data.message,
      });
    }
  };

  const getProfileByUserId = async (userId) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      dispatch({
        type: "loadingTrue",
      });

      const response = await axios.get(`/api/auth/${userId}`, { config });

      if (response) {
        dispatch({
          type: "getProfileById",
          payload: response.data.profile,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem("token");
    dispatch({
      type: "logoutUser",
    });
  };

  const sendForgetPasswordEmail = async (data) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const res = await axios.post("/api/auth/forget_password", data, {
        config,
      });

      if (res) {
        // console.log(res.data.msg);
        dispatch({
          type: "setMsg",
          payload: res.data.msg,
        });
      }
    } catch (error) {
      console.log(error.response.data.message);
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const submitResetPassword = async (data, urlParameter) => {
    console.log(data);
    console.log(urlParameter);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const res = await axios.post(
        `/api/auth/reset_pass/${urlParameter}`,
        data,
        { config }
      );

      if (res) {
        dispatch({
          type: "setMsg",
          payload: res.data.msg,
        });
      }
    } catch (error) {
      dispatch({
        type: "authErrorResetAll",
        payload: error.response.data.message,
      });
    }
  };

  const activateEmail = async (token) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // console.log(data);

    try {
      const res = await axios.post(
        "/api/auth/activate_email",
        { token },
        {
          config,
        }
      );

      if (res) {
        console.log(res.data);
        dispatch({
          type: "setMsg",
          payload: res.data.msg,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const addPost = async (postData) => {
    // console.log(postData);

    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await axios.post("/api/post/add", postData, config);
      if (response.data) {
        dispatch({
          type: "setMsg",
          payload: response.data.msg,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const getPostByUserId = async (userId) => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    try {
      dispatch({
        type: "loadingTrue",
      });
      const response = await axios.get(`/api/post/postById/${userId}`, config);
      // console.log(response.data.posts);
      if (response) {
        dispatch({
          type: "getPostByUserId",
          payload: response.data.posts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const getAllPosts = async () => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      dispatch({
        type: "loadingTrue",
      });
      const response = await axios.get(`/api/post/getAll`, config);
      if (response) {
        dispatch({
          type: "getAllPosts",
          payload: response.data.posts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const likesPost = async (postId) => {
    // console.log(postId);
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      dispatch({
        // type: "loadingTrue",
      });
      const response = await axios.put(`/api/post/likes`, { postId }, config);
      // console.log(response.data);
      if (response) {
        dispatch({
          type: "getAllPosts",
          payload: response.data.allPosts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const unLikedPost = async (postId) => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.put(`/api/post/unlikes`, { postId }, config);
      if (response) {
        console.log(response);
        if (response) {
          dispatch({
            type: "getAllPosts",
            payload: response.data.allPosts,
          });
        }
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const addComment = async (postId, comment) => {
    const obj = {
      postId: postId,
      comment: comment,
    };

    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.put(
        `/api/post/add_comment`,
        { obj },
        config
      );

      if (response) {
        dispatch({
          type: "getAllPosts",
          payload: response.data.allPosts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const deletePost = async (postId) => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.delete(`/api/post/delete/${postId}`, config);
      dispatch({
        type: "loadingTrue",
      });
      if (response) {
        dispatch({
          type: "getAllPosts",
          payload: response.data.allPosts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const followUser = async (userId) => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.put(`/api/auth/follow`, { userId }, config);

      if (response) {
        // console.log(response.data);
        dispatch({
          type: "getProfileById",
          payload: response.data.profile,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const unfollowUser = async (userId) => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.put(
        `/api/auth/unfollow`,
        { userId },
        config
      );

      if (response) {
        dispatch({
          type: "getProfileById",
          payload: response.data.profile,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  const getPostsFromIFollowing = async () => {
    let token;
    if (localStorage.getItem("token")) {
      token = localStorage.getItem("token");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(
        `/api/post/postsOfFollwingPersons`,
        config
      );

      if (response) {
        dispatch({
          type: "getPostsFromIFollowing",
          payload: response.data.selectedPosts,
        });
      }
    } catch (error) {
      dispatch({
        type: "setMsg",
        payload: error.response.data.message,
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        clearMsg,
        registerUser,
        loginUser,
        loadCurrentUser,
        getProfileByUserId,
        logoutUser,
        sendForgetPasswordEmail,
        submitResetPassword,
        activateEmail,
        addPost,
        getPostByUserId,
        getAllPosts,
        likesPost,
        unLikedPost,
        addComment,
        deletePost,
        followUser,
        unfollowUser,
        getPostsFromIFollowing,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useGlobalCtx = () => {
  return useContext(AppContext);
};

export default CtxAndProvider;
