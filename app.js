const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const flash = require("connect-flash");
const path = require("path");

const indexRouter = require("./routes/indexRouter");
const folderRouter = require("./routes/folderRouter");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  expressSession({
    cookie: { maxAge: 1 * 24 * 60 * 60 * 1000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

require("./db/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
  // Middleware to declare locals
  res.locals.title = "undefined";
  res.locals.errors = [];
  res.locals.isAuth = false;
  res.locals.flashMess = req.flash("error");
  res.locals.folders = [];

  next();
});

app.use((req, res, next) => {
  // Middleware for debugging
  // console.log(req.session);
  // console.log(req.user);
  next();
});

app.use("/", indexRouter);
app.use("/folders", folderRouter);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Error details", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      body: req.body,
      query: req.query,
    });

    res.status(err.status || 500).json({
      error: { message: err.message },
    });
  } else {
    res.status(err.status || 500).send({
      error: {
        message: "An error occured. Please try again later.",
      },
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server launched on port ${PORT}`);
});
