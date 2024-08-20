const { PrismaClient } = require("@prisma/client");
const { DateTime, toISO } = require("luxon");
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

module.exports.isAuthSharedInstance = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.body.isAuth = true;
    next();
  } else {
    next();
  }
};

module.exports.retrieveFolders = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const allFolders = await prisma.folder.findMany({
        where: {
          ownerId: req.session.passport.user,
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
    req.body.allFolders = [];
    next();
  }
});

module.exports.retrieveFiles = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const allFiles = await prisma.files.findMany({
        where: {
          ownerId: req.session.passport.user,
        },
        include: {
          folder: true,
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

module.exports.retrieveOneFile = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const file = await prisma.files.findUnique({
        where: {
          title_ownerId: {
            ownerId: req.session.passport.user,
            title: req.params.fileName,
          },
        },
      });
      req.body.file = file;
      next();
    } catch (err) {
      next(err);
    }
  }
});

module.exports.checkShareTime = asyncHandler(async (req, res, next) => {
  const sharedInstance = await prisma.sharedInstance.findFirst({
    where: {
      id: req.params.id,
    },
  });

  if (!sharedInstance) {
    return res.status(404).send("Shared instance not found");
  }

  const expired = (() => {
    const expiracyDateTime = DateTime.fromJSDate(
      sharedInstance.expiracyDate,
    ).toUTC();

    const now = DateTime.now().toUTC().plus({ hours: 2 });

    console.log("Actual Expiry DateTime (UTC):", expiracyDateTime.toISO());
    console.log("Current DateTime (UTC):", now.toISO());

    return expiracyDateTime < now;
  })();

  console.log("This is shared instance:", sharedInstance);
  console.log("Expired:", expired);

  if (!expired) {
    next();
  } else {
    res.render("expired");
  }
});
