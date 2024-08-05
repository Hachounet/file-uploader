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
    if (result.length === 0) {
      return done(null, false, { message: "Incorrect username" });
    }
    const user = result[0];
    console.log(user);
    const match = await bcrypt.compare(password, user.hash);

    if (match) {
      return done(null, user);
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

passport.deserializeUser(async (userId, done) => {
  try {
    console.log(userId);
    const result = await prisma.user.findUnique({
      where: {
        email: username, // Email assure uniqueness
      },
    });

    if (result.length === 0) {
      return done(null, false);
    }
    const user = result[0];
    return done(null, user);
  } catch (error) {
    return done(error);
  }
});
