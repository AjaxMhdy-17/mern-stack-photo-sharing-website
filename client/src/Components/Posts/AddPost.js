import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useGlobalCtx } from "../../CtxAndProvider/CtxAndProvider";
import Layout from "../Layout/Layout";

const AddPost = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [photo, setPhoto] = useState("");
  const [mg, setMg] = useState("");
  const imgRef = useRef();
  const { addPost, msg } = useGlobalCtx();
  const navigate = useNavigate();

  console.log(msg);

  useEffect(() => {
    if (msg !== "") {
      if (msg === "post created successfully!") {
        navigate("/", {
          replace: true,
        });
      }
    }
    console.log('runn');
  }, [msg]);

  const handleSubmitForm = (data) => {
    console.log(photo.name);
    console.log(data);

    if (photo !== "" && photo !== undefined) {
      const format = photo.name.split(".");
      if (format[1] === "png" || format[1] === "jpg" || format[1] === "jpeg") {
        const imgData = new FormData();
        imgData.append("file", photo);
        imgData.append("upload_preset", "heroku-upload-practice");
        imgData.append("cloud_name", "doctog5my");
        fetch(`https://api.cloudinary.com/v1_1/doctog5my/image/upload`, {
          method: "post",
          body: imgData,
        })
          .then((res) => res.json())
          .then((imgData) => {
            reset();
            // console.log(imgData);
            const postObj = {
              title: data.title,
              photo: imgData.url,
              body: data.body,
            };
            addPost(postObj);
          });
        setPhoto("");
        setMg("");
      } else {
        setMg("Please Enter A Valid Image with png or jpg or jpeg format");
      }
    } else {
      const postObj = {
        title: data.title,
        photo:
          "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000",
        body: data.body,
      };
      // dispatch(createPost(postObj));
      addPost(postObj);
      setMg("");
    }
  };

  return (
    <Layout form_layout>
      <div className="text-4xl">Add Your Post</div>

      <div>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <div className="form-group">
            <h4>{errors.title && <span>please enter your post title</span>}</h4>
            <input
              type="text"
              className="form-control"
              placeholder="enter title"
              {...register("title", {
                required: true,
              })}
            />
          </div>
          <div className="form-group">
            <h4>{mg !== "" ? mg : ""}</h4>
            <input
              type="file"
              placeholder="select a photo"
              onChange={(e) => setPhoto(e.target.files[0])}
              ref={imgRef}
            />
          </div>
          <div className="form-group">
            <h4>{errors.body && <span>please enter your post body</span>}</h4>
            <textarea
              type="textarea"
              className="form-control"
              placeholder="enter post body"
              {...register("body", {
                required: true,
              })}
            ></textarea>
          </div>
          <div className="my-5">
            <button className="btn btn-primary w-full">Add Post</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddPost;
