const User = require("../models/users");
const { createCustomError } = require("../errors/custom-error");

const getAllUsers = async (req, res) => {
  const { name, surname, email, sort, fields } = req.query;
  const queryObject = {};
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (surname) {
    queryObject.surname = { $regex: surname, $options: "i" };
  }
  if (email) {
    queryObject.email = { $regex: email, $options: "i" };
  }

  let result = User.find(queryObject);
  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("name");
  }

  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  // calcolo i risultati da saltare in base alla pagina che mi trovo
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  const users = await result;
  res.status(200).json(users);
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
  const { id: userID } = req.params;
  console.log(userID);
  const user = await User.findOneAndUpdate({ _id: userID }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw createCustomError(`Non esiste nessun utente con id : ${userID}`, 404);
  }
  res.status(200).json({ id: userID, data: req.body });
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
