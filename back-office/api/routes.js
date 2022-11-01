const router = require("express").Router();

const users_api = require("./users");
const posts_api = require("./posts");
const products_api = require("./products");
const login_api = require("./login");

router.use("/users", users_api);
router.use("/posts", posts_api);
router.use("/products", products_api);
//route.use("/login", login_api);

module.exports = router;
