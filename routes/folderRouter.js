const { Router } = require("express");

const {
  getAllFoldersPage,
  getFolderPage,
  getEditFolderPage,
  postEditFolderPage,
  getDeleteFolderPage,
  postDeleteFolderPage,
  getFilePage,
  getDeleteFilePage,
  postDeleteFilePage,
  getShareFolderPage,
  postShareFolderPage,
} = require("../controllers/folderController");
const {
  isAuth,
  retrieveOneFile,
  retrieveFolders,
} = require("../controllers/authMiddleware");

const folderRouter = Router();

// Ensure retrieveFolders middleware is used for all routes needing folders
folderRouter.use(isAuth);
folderRouter.use(retrieveFolders);

folderRouter.get("/", getAllFoldersPage);

folderRouter.get("/:folderName", getFolderPage);

folderRouter.get("/:folderName/edit", getEditFolderPage);
folderRouter.post("/:folderName/edit", postEditFolderPage);

folderRouter.get("/:folderName/delete", getDeleteFolderPage);
folderRouter.post("/:folderName/delete", postDeleteFolderPage);

folderRouter.get("/:folderName/share", getShareFolderPage);

folderRouter.post("/:folderName/share", postShareFolderPage);

// More specific routes for file actions
folderRouter.get(
  "/:folderName/:fileName/delete",
  retrieveOneFile,
  getDeleteFilePage,
);

folderRouter.post(
  "/:folderName/:fileName/delete",
  retrieveOneFile,
  postDeleteFilePage,
);

folderRouter.get("/:folderName/:fileName", retrieveOneFile, getFilePage);

module.exports = folderRouter;
