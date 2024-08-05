const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Custom errors //

const length50Err = "must be between 3 and 50 characters max.";

const validateSignUp = [
  body("email").isEmail().withMessage("Incorrect mail format."),
  body("pseudo")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage(`Pseudo ${length50Err}`)
    .escape(),
  body("pw")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters min.")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.confpassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

exports.getLandingPage = (req, res, next) => {
  res.render("landing");
};

exports.getSignupPage = (req, res, next) => {
  res.render("signup", { title: "Signup" });
};

exports.postSignupPage = [
  validateSignUp,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      res.locals.errors = errors.array();

      res.render("signup", { title: "Signup", errors: res.locals.errors });
    }
    bcrypt.hash(req.body.pw, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      try {
        await prisma.user.create({
          data: {
            email: req.body.email,
            pseudo: req.body.pseudo,
            hash: hashedPassword,
          },
        });
        res.redirect("/login");
      } catch (error) {
        next(error);
      }
    });
  }),
];

exports.getLoginPage = (req, res, next) => {
  res.render("login", { title: "Login" });
};

exports.postLoginPage = (req, res, next) => {};

exports.getHomePage = (req, res, next) => {
  res.render("home", { title: "Home" });
};

exports.getUploadPage = (req, res, next) => {
  res.render("upload", { title: "Upload" });
};

exports.postUploadPage = (req, res, next) => {};
