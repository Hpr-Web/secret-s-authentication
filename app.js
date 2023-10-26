require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
// const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

console.log(process.env.SECRET);

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

  userSchema.plugin(passportLocalMongoose);

  const User = mongoose.model("User", userSchema);

  passport.use(User.createStrategy());
  //   passport.use(new LocalStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.get("/secrets", (req, res) => {
    console.log("Checking authentication status:", req.isAuthenticated());
    if (req.isAuthenticated()) {
      console.log("User is authenticated. Rendering secrets page.");
      res.render("secrets");
    } else {
      console.log("User is not authenticated. Redirecting to /login");
      res.redirect("/login");
    }
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.post("/register", async (req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          console.log("User registered successfully.");
          passport.authenticate("local")(req, res, () => {
            res.redirect("/secrets");
          });
        }
      }
    );
  });

  app.post("/login", (req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("user is authenticated");
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });

  app.listen(3000, () => {
    console.log("server is listening on port:3000");
  });
}
