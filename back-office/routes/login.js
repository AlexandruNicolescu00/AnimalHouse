const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const sendEmail = require("../scripts/sendEmail");
const { isAuth, isAdmin } = require("../middleware/authMiddleware");

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/login-success");
  } else {
    res.redirect("/login");
  }
});

router.get("/login", async (req, res) => {
  res.render("login", { title: "Login" });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  })
);

router.get("/register", async (req, res) => {
  res.render("register");
});

router.post("/register", (req, res) => {
  let errors = [];
  const validPass = new RegExp(
    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  );
  if (req.body.password.length < 8) {
    errors.push("La password deve avere almeno 8 caratteri");
  }
  if (!validPass.test(req.body.password)) {
    errors.push(
      "La password deve contenere almeno una lettera maiuscola, una minuscola, una cifra e un carattere speciale"
    );
  }
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    User.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        errors.push("Email già registrata");
      }
      if (errors.length > 0) {
        res.render("register", req.body);
      } else {
        req.body.password = hash;
        req.body.admin = true;
        const newuser = new User(req.body);
        console.log(newuser);
        newuser.save();
        res.redirect("/login");
      }
    });
  });
});

router.get("/reset", (req, res) => {
  res.render("reset");
});

router.get("/login-success", (req, res) => {
  if (req.isAuthenticated() && req.user.admin) {
    res.redirect("/admin");
  } else {
    res.redirect("/user-route");
  }
});

router.get("/login-failure", (req, res) => {
  res.render("login", { error_msg: "Login fallito" });
});

router.get(
  "/google-auth",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google-callback",
  passport.authenticate("google", {
    successRedirect: "/user-route",
    failureRedirect: "/login-failure",
  })
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

router.get("/user-route", isAuth, async (req, res) => {
  res.render("home", { name: req.user.name });
});

router.post("/psw-reset", (req, res) => {
  User.findOne({ email: req.body.email }).then(async (user) => {
    if (!user) {
      res.render("reset", { error_msg: "Email non registrata" });
    } else {
      sendEmail({
        dest: user.email,
        subject: "Cambia password",
        msg: '<p>Per scegliere una nuova password cliccare <a href="http://127.0.0.1:8000/psw-reset">QUI</a></p>',
      });
      res.redirect("/login");
    }
  });
});

module.exports = router;
