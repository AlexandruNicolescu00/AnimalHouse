const router = require("express").Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

router.route("/").get(getAllUsers);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
