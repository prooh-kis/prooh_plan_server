import jwt from "jsonwebtoken";
import { USER_ROLE_PRIMARY } from "../constants/userConstant.js";

// to keep logged in info
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isItanimulli: user.isItanimulli,
      isMaster: user.isMaster,
      isBrand: user.isBrand,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      userRole: user.userRole,
      primaryUserId: user.primaryUserId,
      primaryUserEmail: user.primaryUserEmail,
    },
    process.env.ACCESS_TOKEN_JWT_SECRET || "mysecretkey",
    {
      expiresIn: "10h",
    }
  );
};

// to authenticate user
export const isAuth = (req, res, next) => {
  const authorization =
    req.headers.authorization || req.body.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); //Bearer XXXXXXXX... (removes Bearer_ and gives token XXXXXXXXX...)
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_JWT_SECRET || "mysecretkey",
      (err, decode) => {
        if (err) {
          console.log("isAuth : error");
          res.status(401).send({ message: "Please Signin Again to continue" });
        } else {
          req.user = decode;
          next();
          return;
        }
      }
    );
  } else {
    return res.status(401).send({ message: "Sign in issue" });
  }
};

// admin

export const isItanimulli = (req, res, next) => {
  if (req.user && req.user.isItanimulli) {
    next();
  } else {
    res.status(401).send({
      message: 'Please contact moderators for "MASTER" access',
    });
  }
};

// master

export const isMaster = (req, res, next) => {
  if (req.user && req.user.isMaster) {
    next();
  } else {
    console.log("isMaster false");
    res.status(401).send({
      message: "Not a master",
    });
  }
};

export const isPrimaryUser = (req, res, next) => {
  if (req.user && req.user.userRole === USER_ROLE_PRIMARY) {
    next();
  } else {
    res.status(401).send({
      message: "Not a primary user",
    });
  }
};

// Ally

export const isAlly = (req, res, next) => {
  if (req.user && req.user.isAlly) {
    next();
  } else {
    res.status(401).send({
      message: "Not an Campaign manager",
    });
  }
};

// Brand

export const isBrand = (req, res, next) => {
  if (req.user && req.user.isBrand) {
    next();
  } else {
    res.status(401).send({
      message: "Not a brand",
    });
  }
};
// admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({
      message: "Not a brand",
    });
  }
};

// Commissioner

export const isCommissioner = (req, res, next) => {
  if (req.user && req.user.isCommissioner) {
    next();
  } else {
    res.status(401).send({
      message: "Not a commissioner",
    });
  }
};
