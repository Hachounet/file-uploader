const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const { isAuth } = require("./authMiddleware");
const prisma = new PrismaClient();

const validateUpdateFolder = [
  body("folderName")
    .exists()
    .withMessage("Folder name should exists.")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Folder name should be min 1 and max 50 characters.")
    .escape(),
];

exports.getAllFoldersPage = (req, res, next) => {
  res.render("folders", { title: "Folders", folders: req.body.allFolders });
};

exports.getFolderPage = asyncHandler(async (req, res, next) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        title_ownerId: {
          title: req.params.folderName,
          ownerId: req.session.passport.user,
        },
      },
      include: {
        Files: true,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found.");
    }

    res.render("folder", {
      title: "Folder",
      folder,
      isAuth: req.body.isAuth,
      folders: req.body.allFolders,
    });
  } catch (err) {
    next(err);
  }
});

exports.getEditFolderPage = asyncHandler(async (req, res, next) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        title_ownerId: {
          title: req.params.folderName,
          ownerId: req.session.passport.user,
        },
      },
      include: {
        Files: true,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found.");
    }
    res.render("folder_update", {
      title: "Folder",
      isAuth: req.body.isAuth,
      folder,
      folders: req.body.allFolders,
    });
  } catch (err) {
    next(err);
  }
});

exports.postEditFolderPage = [
  validateUpdateFolder,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.locals.errors = errors.array();

      try {
        const folder = await prisma.folder.findUnique({
          where: {
            title_ownerId: {
              title: req.params.folderName,
              ownerId: req.session.passport.user,
            },
          },
          include: {
            Files: true,
          },
        });

        if (!folder) {
          return res.status(404).send("Folder not found.");
        }
        res.render("folder_update", {
          title: "Folder",
          isAuth: req.body.isAuth,
          folder,
          folders: req.body.allFolders,
        });
      } catch (err) {
        next(err);
      }
    }

    try {
      await prisma.folder.update({
        where: {
          id: req.body.folderId,
        },
        data: {
          title: req.body.folderName,
        },
      });
      return res.redirect(`/folders/${req.body.folderName}`);
    } catch (err) {
      next(err);
    }
  }),
];

exports.getDeleteFolderPage = asyncHandler(async (req, res, next) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        title_ownerId: {
          title: req.params.folderName,
          ownerId: req.session.passport.user,
        },
      },
      include: {
        Files: true,
      },
    });

    if (!folder) {
      return res.status(404).send("Folder not found.");
    }
    res.render("folder_delete", {
      title: "Folder",
      isAuth: req.body.isAuth,
      folder,
      folders: req.body.allFolders,
    });
  } catch (err) {
    next(err);
  }
});

exports.postDeleteFolderPage = asyncHandler(async (req, res, next) => {
  try {
    await prisma.folder.delete({
      where: {
        id: req.body.folderId,
      },
    });
    res.redirect("/folders");
  } catch (err) {
    next(err);
  }
});

exports.getFilePage = (req, res, next) => {
  console.log("ff");
};
