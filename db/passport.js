const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const LocalStragey = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const customFields = {
  usernameField: "email",
  passwordField: "pw",
};

const verifyCallback = async (username, password, done) => {
  try {
    console.log(username);
    const result = await prisma.user.findUnique({
      where: {
        email: username, // Email assure uniqueness
      },
    });
    console.log("THIS IS RESULT USER", result);
    if (result === undefined) {
      return done(null, false, { message: "Incorrect username" });
    }
    console.log("2ND FUNC", password, result.hash);
    const match = await bcrypt.compare(password, result.hash);

    if (match) {
      return done(null, result);
    } else {
      return done(null, false, { message: "Incorrect password" });
    }
  } catch (error) {
    return done(error);
  }
};

const strategy = new LocalStragey(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});
