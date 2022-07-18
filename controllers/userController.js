const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const Users = require("../models/userSchema");
const { sendEmail } = require("../helpers/sendMail");

const loadCurrentUser = asyncHandler(async (req, res) => {
  res.send(req.user);
});

const getUser = asyncHandler(async (req, res) => {
  res.send("user auth");
});

const getMe = asyncHandler(async (req, res) => {
  // console.log(req.user);
  res.send("from me");
});

const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Users.findById(req.params.userId);

  if (!profile) {
    res.status(400);
    throw new Error("No Profile With This Id");
  } else {
    return res.status(200).json({
      profile: profile,
    });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Please fill up Name field");
  }
  if (!email) {
    res.status(400);
    throw new Error("Please fill up Email field");
  } else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = re.test(email);
    if (validEmail === false) {
      res.status(400);
      throw new Error("Please Enter A Valid Email");
    }
  }
  if (!password) {
    res.status(400);
    throw new Error("Please Enter A Password");
  } else {
    if (password.length <= 5) {
      res.status(400);
      throw new Error("Please Enter A Password More Then 5 Characture!");
    }
  }

  const userExists = await Users.findOne({ email: email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  } else {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users({
      name: name,
      email: email,
      pic: "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000",
      password: hashedPassword,
    });

    await user.save();

    const userToken = {
      name,
      email,
      password: hashedPassword,
    };

    const activationToken = createActivationToken(userToken);

    const activation_url = `http://localhost:3000/user/activate/${activationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mail_account,
        pass: process.env.mail_app_pass,
      },
    });

    let mailOptions = {
      from: "alphamhdy@gmail.com",
      to: email,
      subject: `The subject goes here `,
      html: `Please Click ${activation_url} to activate your account`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.status(400);
        throw new Error("something happend wrong");
      } else {
        return res.status(200).json({
          msg: "Please Check Your Email",
        });
      }
    });

    return res.status(200).json({
      message: "user registration successfull",
      user: user,
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Please fill up Email field");
  } else {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = re.test(email);
    if (validEmail === false) {
      res.status(400);
      throw new Error("Please Enter A Valid Email");
    }
  }
  if (!password) {
    res.status(400);
    throw new Error("Please Enter A Password");
  } else {
    if (password.length <= 5) {
      res.status(400);
      throw new Error("Please Enter A Password More Then 5 Characture!");
    }
  }

  const user = await Users.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("No User With This Email");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (isPasswordMatched === false) {
      res.status(401);
      throw new Error("Invalid credentials");
    } else {
      return res.status(200).json({
        message: "user logged in successfully",
        token: generateToken(user._id),
      });
    }
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email: email });
  if (!user) {
    res.status(404);
    throw new Error("No User Found With This Email");
  } else {
    const resetLink = `https://glacial-castle-58694.herokuapp.com/reset/${user.id}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mail_account,
        pass: process.env.mail_app_pass,
      },
    });

    let mailOptions = {
      from: "alphamhdy@gmail.com",
      to: email,
      subject: `The subject goes here `,
      html: `Please Click ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.status(400);
        throw new Error("something happend wrong");
      } else {
        return res.status(200).json({
          msg: "Please Check Your Email",
        });
      }
    });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // console.log(req.body);
  // console.log(req.params.urlParameter);
  const { password } = req.body;

  const user = await Users.findById(req.params.urlParameter);

  if (user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    return res.status(200).json({
      msg: "password reset successfully!",
    });
  } else {
    res.status(404);
    throw new Error("No User With This Id");
  }
});

const activationEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  // console.log(token);

  const user = jwt.decode(token, process.env.ACTIVATION_TOKEN_SECREAT);

  if (!user) {
    res.status(404);
    throw new Error("User Has Been Deleted");
  }

  const { email } = user;

  const updateUser = await Users.findOne({ email: email });

  updateUser.isActivate = true;

  await updateUser.save();

  return res.status(200).json({
    msg: "Your Account Is Activated!",
  });
});

const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const incFollowingUser = await Users.findByIdAndUpdate(
    userId,
    {
      $push: {
        followers: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!incFollowingUser) {
    res.status(400);
    throw new Error("Something Went Wrong!");
  }

  const followerUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      $push: {
        following: userId,
      },
    },
    {
      new: true,
    }
  );

  const profile = await Users.findById(userId);

  return res.status(200).json({
    profile: profile,
  });
});

const unFollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  // console.log('unfollow' +userId );
  const decFollowingUser = await Users.findByIdAndUpdate(
    userId,
    {
      $pull: {
        followers: req.user.id,
      },
    },
    {
      new: true,
    }
  );

  if (!decFollowingUser) {
    res.status(400);
    throw new Error("Something Went Wrong!");
  }

  const followerUser = await Users.findByIdAndUpdate(
    req.user.id,
    {
      $pull: {
        following: userId,
      },
    },
    {
      new: true,
    }
  );

  const profile = await Users.findById(userId);

  return res.status(200).json({
    profile: profile,
  });
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const createActivationToken = (userToken) => {
  return jwt.sign(userToken, process.env.ACTIVATION_TOKEN_SECREAT, {
    expiresIn: "10m",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getMe,
  getProfileById,
  loadCurrentUser,
  forgetPassword,
  resetPassword,
  activationEmail,
  followUser,
  unFollowUser,
};
