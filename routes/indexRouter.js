const { Router } = require("express");

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
} = require("../controllers/indexController");
const {
  isAuth,
  retrieveFolders,
  retrieveFiles,
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

indexRouter.post("/upload", isAuth, retrieveFolders, postUploadPage);

indexRouter.get("/addfolder", isAuth, retrieveFolders, getAddFolderPage);

indexRouter.post("/addfolder", isAuth, retrieveFolders, postAddFolderPage);

module.exports = indexRouter;
