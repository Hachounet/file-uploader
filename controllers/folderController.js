const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const { isAuth } = require("./authMiddleware");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");
const cloudinary = require("cloudinary").v2;

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

exports.getFilePage = asyncHandler(async (req, res, next) => {
  req.body.file.createdAt = req.body.file.createdAt.toLocaleString(
    DateTime.DATETIME_MED,
  ); // For date formatting

  const folder = await prisma.folder.findUnique({
    where: {
      title_ownerId: {
        title: req.params.folderName,
        ownerId: req.session.passport.user,
      },
    },
  });

  try {
    res.render("details", {
      title: req.body.file.title,
      file: req.body.file,
      folders: req.body.allFolders,
      folder: folder,
      isAuth: req.body.isAuth,
    });
    console.log(req.body.file);
  } catch (err) {
    next(err);
  }
});

exports.getDeleteFilePage = asyncHandler(async (req, res, next) => {
  try {
    if (req.body.file === undefined) {
      return res.status(404).send("Folder not found.");
    }

    res.render("file_delete", {
      title: "File",
      isAuth: req.body.isAuth,
      file: req.body.file,
      folders: req.body.allFolders,
      folder: req.params.folderName,
    });
  } catch (err) {
    next(err);
  }
});

exports.postDeleteFilePage = asyncHandler(async (req, res, next) => {
  try {
    const fileName = req.params.fileName;
    const ownerId = req.session.passport.user;

    const file = await prisma.files.findUnique({
      where: {
        title_ownerId: {
          ownerId: ownerId,
          title: fileName,
        },
      },
    });

    if (!file) {
      return res.status(404).send("File not found.");
    }
    console.log(file);
    await cloudinary.uploader.destroy(file.cloudinaryId);

    await prisma.files.delete({
      where: {
        title_ownerId: {
          ownerId: req.session.passport.user,
          title: req.body.file.title,
        },
      },
    });

    res.redirect("/home");
  } catch (err) {
    next(err);
  }
});

exports.getShareFolderPage = asyncHandler(async (req, res, next) => {
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
    res.render("folder_share", {
      title: "Folder",
      isAuth: req.body.isAuth,
      folder,
      folders: req.body.allFolders,
    });
  } catch (err) {
    next(err);
  }
});

exports.postShareFolderPage = asyncHandler(async (req, res, next) => {
  function addDays(date, days) {
    return date.plus({ days: days });
  }
  try {
    const todayDate = DateTime.now();
    const shareTime = req.body.shareTime;
    const expiracyDate = addDays(todayDate, shareTime);

    console.log(`Actual date: ${todayDate.toISO()}`);
    console.log(`Future date ${expiracyDate.toISO()}`);

    await prisma.sharedInstance.create({
      data: {
        createdAt: todayDate,
        expiracyDate: expiracyDate,
        folderId: req.body.folderId,
      },
    });

    const sharedInstance = await prisma.sharedInstance.findFirst({
      where: {
        createdAt: todayDate,
        expiracyDate: expiracyDate,
        folderId: req.body.folderId,
      },
    });

    res.redirect(`/share/${sharedInstance.id}`);
  } catch (err) {
    next(err);
  }
});
