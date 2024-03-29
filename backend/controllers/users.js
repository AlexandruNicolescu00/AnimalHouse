const User = require("../models/users");
const { createCustomError } = require("../errors/custom-error");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const path = require("path");

const getAllUsers = async (req, res) => {
  const { name, surname, email, fields, scoreGames } = req.query;
  let queryObject = {};
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (surname) {
    queryObject.surname = { $regex: surname, $options: "i" };
  }
  if (email) {
    queryObject.email = { $regex: email, $options: "i" };
  }
  if (scoreGames) {
    // Ritorno solo gli utenti che hanno registrato almeno un punteggio
    queryObject["punteggiDeiGiochi.0"] = { $exists: true };
  }

  let result = User.find(queryObject);

  if (fields) {
    const fieldList = fields.split(",").join(" ");
    result = result.select(fieldList);
  }
  const users = await result;
  res.status(StatusCodes.OK).json(users);
};

const getUser = async (req, res) => {
  const { id: userID } = req.params;
  const user = await User.findOne({ _id: userID });
  if (!user) {
    throw createCustomError(`Non esiste nessun utente con id : ${userID}`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(user);
};

const deleteImages = async (userID, { clearPets = false, clearUser = false }) => {
  const user = await User.findOne({ _id: userID });
  if (!user) {
    throw createCustomError(`Non esiste nessun utente con id : ${user}`, StatusCodes.NOT_FOUND);
  }
  if (user.animaliPreferiti && clearPets)
    for (const animal of user.animaliPreferiti) {
      try {
        if (animal.imgName !== "default_pet_image.jpg")
          fs.unlink(path.join(global.baseDir, "public", "media", animal.imgName), (err) => {
            if (err) {
              console.log(err);
            }
          });
      } catch (e) {
        console.log(e);
      }
    }
  if (user.imgName != "favicon.png" && clearUser)
    fs.unlink(path.join(global.baseDir, "public", "media", user.imgName), (err) => {
      if (err) {
        console.log(err);
      }
    });
};

const prepareUpdate = async (body, userID) => {
  const updateObj = {};
  const {
    name,
    surname,
    email,
    password,
    city,
    via,
    postal_code,
    birth,
    tipi,
    petName,
    petParticularSigns,
    petBirthYear,
    petAnimalType,
    punteggiDeiGiochi,
    game,
    score,
    isVip,
    clearPets,
  } = body;
  if (name) {
    updateObj.name = name;
  }
  if (surname) {
    updateObj.surname = surname;
  }
  if (email) {
    updateObj.email = email;
  }
  if (password) {
    updateObj.password = password;
  }
  if (city || via || postal_code) {
    updateObj.address = {
      city: city || "",
      via: via || "",
      postal_code: postal_code || "",
    };
  }
  if (birth) {
    updateObj.birth = new Date(birth);
  }
  if (tipi) {
    if (Array.isArray(tipi)) {
      const animaliPreferiti = [];
      for (let i = 0; i < tipi.length; i += 1) {
        const animale = { animalType: tipi[i] };
        animaliPreferiti.push(animale);
      }
      updateObj.animaliPreferiti = animaliPreferiti;
    } else {
      const animaliPreferiti = { animalType: tipi };
      updateObj.animaliPreferiti = animaliPreferiti;
    }
  }
  if (game && score) {
    if (Array.isArray(game)) {
      const punteggiDeiGiochi = [];
      for (let i = 0; i < game.length; i += 1) {
        const gioco = { game: game[i], score: Number(score[i]) || 0 };
        punteggiDeiGiochi.push(gioco);
      }
      updateObj.punteggiDeiGiochi = punteggiDeiGiochi;
    } else {
      const punteggiDeiGiochi = { game: game, score: Number(score) };
      updateObj.punteggiDeiGiochi = punteggiDeiGiochi;
    }
  } else if (punteggiDeiGiochi) {
    if (punteggiDeiGiochi.length > 0) updateObj.punteggiDeiGiochi = punteggiDeiGiochi;
  }
  if (petName || petParticularSigns || petBirthYear || petAnimalType) {
    // Inserimento dati animale
    updateObj.animaliPreferiti = [
      {
        name: petName,
        birthYear: petBirthYear,
        particularSigns: petParticularSigns,
        animalType: petAnimalType,
      },
    ];
  }
  if (isVip) {
    updateObj.isVip = Boolean(isVip == "true");
  }

  if (clearPets) {
    deleteImages(userID, { clearPets: true });
    updateObj.animaliPreferiti = [];
  }
  return updateObj;
};

const updateUser = async (req, res) => {
  const { id: userID } = req.params;
  const updateObj = await prepareUpdate(req.body, userID);
  // Inserimento di un nuovo pet
  if (req.body.petImage) {
    if (req.file?.filename) updateObj.animaliPreferiti[0].imgName = req.file.filename;
    else updateObj.animaliPreferiti[0].imgName = "default_pet_image.jpg";
    const user = await User.findOne({ _id: userID });
    updateObj.animaliPreferiti = [updateObj.animaliPreferiti[0], ...user.animaliPreferiti];
  } else if (req.file?.filename) {
    updateObj.imgName = req.file.filename;
    /* Cancello l'immagine precente */
    deleteImages(userID, { clearUser: true });
  }
  const user = await User.findOneAndUpdate(
    { _id: userID },
    { $set: updateObj },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    throw createCustomError(`Non esiste nessun utente con id : ${userID}`, StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(user);
};

const deleteUser = async (req, res) => {
  if (req.userInfo?._id == req.params.id || req.isAdmin) {
    const { id: userID } = req.params;
    if (userID) {
      deleteImages(userID, { clearPets: true, clearUser: true });
    }
    const user = await User.findOneAndDelete({ _id: userID });
    if (!user) {
      throw createCustomError(`Non esiste nessun utente con id : ${userID}`, StatusCodes.NOT_FOUND);
    }
    res.status(StatusCodes.OK).json({ msg: `L'utente con id ${userID} è stato rimosso con successo` });
  } else {
    throw createCustomError("Puoi eliminare solo il tuo account", StatusCodes.FORBIDDEN);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
