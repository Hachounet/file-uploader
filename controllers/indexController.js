const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const { DateTime } = require("luxon");
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
  asyncHandler(async (req, res, next) => {
    try {
      // Check if a file with the same title exists for the user
      const existingFile = await prisma.files.findFirst({
        where: {
          title: req.file.originalname,
          ownerId: req.session.passport.user,
        },
      });

      if (existingFile) {
        const errors = [{ msg: "A file with this name already exists." }];

        const allFolders = await prisma.folder.findMany({
          where: { ownerId: req.session.passport.user },
        });

        return res.render("upload", {
          title: "Upload",
          errors: errors,
          folders: allFolders,
          isAuth: req.body.isAuth,
        });
      }
      console.log("HEYYYYYYYYYYYYYYYYYY");

      // Create the new file record in the database
      await prisma.files.create({
        data: {
          title: req.file.originalname,
          path: req.file.path,
          ownerId: req.session.passport.user,
          folderId: req.body.folderName,
          size: req.file.size,
          cloudinaryId: req.file.filename,
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
    isAuth: req.body.isAuth,
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
        isAuth: req.body.isAuth,
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

exports.getShareInstancePage = asyncHandler(async (req, res, next) => {
  try {
    const folder = await prisma.sharedInstance.findFirst({
      where: {
        id: req.params.id,
      },
      include: {
        origin: {
          include: {
            Files: true,
          },
        },
      },
    });

    if (!folder) {
      return res.status(404).send("Shared folder not found.");
    }

    console.log(folder);

    res.render("folder", {
      title: "Folder",
      folder: folder.origin,
      isAuth: req.body.isAuth,
      folders: req.body.allFolders,
      sharedInstance: req.params.id,
    });
  } catch (err) {
    next(err);
  }
});

exports.getShareFilePage = asyncHandler(async (req, res, next) => {
  try {
    const sharedInstance = await prisma.sharedInstance.findFirst({
      where: { id: req.params.id },
      include: {
        origin: {
          include: {
            Files: true,
          },
        },
      },
    });

    if (!sharedInstance) {
      return res.status(404).json({ error: "Shared instance not found" });
    }

    const folderOrigin = sharedInstance.origin.id;

    const file = await prisma.files.findFirst({
      where: { title: req.params.fileName, folderId: folderOrigin },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    file.createdAt.toLocaleString(DateTime.DATETIME_MED); // For date formatting

    const folderOwner = sharedInstance.origin.ownerId;
    const isOwner =
      req.user !== undefined && req.user.id === folderOwner ? true : false;

    console.log(file);
    res.render("details", {
      title: file.title,
      file: file,
      folders: req.body.allFolders,
      isAuth: req.body.isAuth,
      isOwner: isOwner,
      folder: sharedInstance.origin,
    });
  } catch (err) {
    next(err);
  }
});
