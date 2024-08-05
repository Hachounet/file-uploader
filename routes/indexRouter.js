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
} = require("../controllers/indexController");

const indexRouter = Router();

indexRouter.get("/", getLandingPage);

indexRouter.get("/signup", getSignupPage);

indexRouter.post("/signup", postSignupPage);

indexRouter.get("/login", getLoginPage);

indexRouter.post("/login", postLoginPage);

indexRouter.get("/home", getHomePage);

indexRouter.get("/upload", getUploadPage);

indexRouter.post("/upload", postUploadPage);

module.exports = indexRouter;
