const { Router } = require("express");

const uploadMiddleware = require("../controllers/uploadMiddleware");
const {
  getLandingPage,
  getSignupPage,
  postSignupPage,
  getLoginPage,
  postLoginPage,
  getHomePage,
  getUploadPage,
  postUploadPage,
  getLogoutPage,
  getAddFolderPage,
  postAddFolderPage,
  getShareInstancePage,
  getShareFilePage,
} = require("../controllers/indexController");
const {
  isAuth,
  retrieveFolders,
  retrieveFiles,
  isAuthSharedInstance,
  checkShareTime,
} = require("../controllers/authMiddleware");

const indexRouter = Router();

indexRouter.get("/", getLandingPage);

indexRouter.get("/signup", getSignupPage);

indexRouter.post("/signup", postSignupPage);

indexRouter.get("/login", getLoginPage);

indexRouter.post("/login", postLoginPage);

indexRouter.get("/logout", getLogoutPage);

indexRouter.get("/home", isAuth, retrieveFolders, retrieveFiles, getHomePage);

indexRouter.get("/upload", isAuth, retrieveFolders, getUploadPage);

indexRouter.post(
  "/upload",
  isAuth,
  retrieveFolders,
  uploadMiddleware("uploads").single("file"),
  postUploadPage,
);

indexRouter.get("/addfolder", isAuth, retrieveFolders, getAddFolderPage);

indexRouter.post("/addfolder", isAuth, retrieveFolders, postAddFolderPage);

indexRouter.get(
  "/share/:id",
  checkShareTime,
  isAuthSharedInstance,
  retrieveFolders,
  getShareInstancePage,
);

indexRouter.get(
  "/share/:id/:fileName",
  checkShareTime,
  isAuthSharedInstance,
  retrieveFolders,
  retrieveFiles,
  getShareFilePage,
);
module.exports = indexRouter;
