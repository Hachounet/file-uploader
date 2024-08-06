const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");

module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.body.isAuth = true;
    next();
  } else {
    res.status(403).send("Access denied.");
  }
};

module.exports.retrieveFolders = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const allFolders = await prisma.folder.findMany({
        where: {
          ownerId: req.session.user,
        },
        include: {
          _count: {
            select: {
              Files: true,
            },
          },
        },
      });

      req.body.allFolders = allFolders;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports.retrieveFiles = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const allFiles = await prisma.files.findMany({
        where: {
          ownerId: req.session.user,
        },
      });

      req.body.allFiles = allFiles;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
