// Dare questo argomento prima di ogni risorsa protetta
isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "Non sei autorizzato a vedere questa risorsa" });
  }
};

isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "Non sei autorizzato a vedere questa risorsa" });
  }
};

module.exports = { isAuth, isAdmin };
