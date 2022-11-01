const User = require("../models/users");
const { createCustomError } = require("../errors/custom-error");

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ users });
};

const getUser = async (req, res) => {
    const { id: userID } = req.params;
    const user = await User.findOne({ _id: userID });
    if (!user) {
      throw createCustomError(`Non esiste nessun utente con id : ${userID}`, 404);
    }
    res.status(200).json({ user });
};

const updateUser = async (req, res) => {
    
};

const deleteUser = async (req, res) => {
  if (req.userInfo._id == req.params.id || req.userInfo.isAdmin) {
    const { id: userID } = req.params;
    const user = await User.findOneAndDelete({ _id: userID });
    if (!user) {
      throw createCustomError(
        `Non esiste nessun utente con id : ${userID}`,
        404
      );
    }
    res
      .status(200)
      .json({ msg: `L'utente con id ${userID} è stato rimosso con successo` });
  } else {
    throw createCustomError("Puoi eliminare solo il tuo account", 403);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
