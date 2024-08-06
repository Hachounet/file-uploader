const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname),
    ); // Set the file name
  },
});

const upload = multer({ storage: storage });

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

const validateFolderCreation = [
  body("foldername")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Folder name must be between 1 and 50 characters.")
    .escape(),
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

exports.postLoginPage = (req, res, next) => {
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
    failureFlash: "Password or email not valid.",
    successRedirect: "/home",
  })(req, res, next);
};

exports.getHomePage = (req, res, next) => {
  console.log(req.body.allFiles);
  res.render("home", {
    title: "Home",
    isAuth: req.body.isAuth,
    folders: req.body.allFolders,
    files: req.body.allFiles,
  });
};

exports.getUploadPage = (req, res, next) => {
  res.render("upload", { title: "Upload", folders: req.body.allFolders });
};

exports.postUploadPage = [
  upload.single("file"),
  asyncHandler(async (req, res, next) => {
    try {
      await prisma.files.create({
        data: {
          title: req.file.originalname,
          path: `/uploads/${req.file.filename}`,
          ownerId: req.session.passport.user,
          folderId: req.body.folderName,
        },
      });

      res.redirect("home");
    } catch (err) {
      next(err);
    }
  }),
];

exports.getLogoutPage = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/");
};

exports.getAddFolderPage = (req, res, next) => {
  res.render("addfolder", {
    title: "Add folder",
    folders: req.body.allFolders,
  });
};

exports.postAddFolderPage = [
  validateFolderCreation,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();

      res.render("addfolder", {
        title: "Add folder",
        errors: res.locals.errors,
        folders: req.body.allFolders,
      });
    }
    try {
      await prisma.folder.create({
        data: {
          title: req.body.foldername,
          ownerId: req.session.passport.user,
        },
      });

      res.redirect("/folders");
    } catch (err) {
      next(err);
    }
  }),
];
