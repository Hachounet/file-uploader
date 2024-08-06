const { Router } = require("express");

const {
  getAllFoldersPage,
  getFolderPage,
  getEditFolderPage,
  postEditFolderPage,
  getDeleteFolderPage,
  postDeleteFolderPage,
  getFilePage,
} = require("../controllers/folderController");
const { isAuth, retrieveFolders } = require("../controllers/authMiddleware");

const folderRouter = Router();

folderRouter.get("/", isAuth, retrieveFolders, getAllFoldersPage);

folderRouter.get("/:folderName", isAuth, retrieveFolders, getFolderPage);

folderRouter.get(
  "/:folderName/edit",
  isAuth,
  retrieveFolders,
  getEditFolderPage,
);

folderRouter.post(
  "/:folderName/edit",
  isAuth,
  retrieveFolders,
  postEditFolderPage,
);

folderRouter.get(
  "/:folderName/delete",
  isAuth,
  retrieveFolders,
  getDeleteFolderPage,
);

folderRouter.post(
  "/:folderName/delete",
  isAuth,
  retrieveFolders,
  postDeleteFolderPage,
);

folderRouter.get("/:folderName/:fileName", isAuth, getFilePage);

module.exports = folderRouter;
