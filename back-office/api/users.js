const router = require("express").Router();

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

router.route("/").get(getAllUsers)

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;

/* GET http://site212222.tw.cs.unibo.it/api/users */
router.get("/", (req, res) => {
  const result = User.find();
  result.exec((err, data) => {
    try {
      if (err) {
        throw err;
      } else {
        if (data) {
          res.send(data);
        } else {
          throw "Nessun risultato";
        }
      }
    } catch (error) {
      res.status(401).send(error);
    }
  });
});

/* POST http://site212222.tw.cs.unibo.it/api/users/register */
router.post("/", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      throw "Parametri mancanti";
    }
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
    const hashPassword = await genPassword(req.body.password);
    if (!hashPassword) {
      throw "Errore nella generazione della password";
    }
    const result = User.findOne({ email: req.body.email });
    result.exec((err, data) => {
      try {
        if (data) {
          errors.push("Email già registrata");
        }
        if (errors.length > 0) {
          throw errors;
        } else {
          req.body.password = hashPassword;
          req.body.admin = false;
          req.body.animaliPreferiti = [];
          req.body.punteggiDeiGiochi = [];
          const newuser = new User(req.body);
          newuser.save();
          res.send(newuser);
        }
      } catch (error) {
        res.status(401).send(error);
      }
    });
  } catch (error) {
    res.status(401).send(error);
  }
});

/* GET http://site212222.tw.cs.unibo.it/api/users/{emailUtente} */
router.get("/:email", (req, res) => {
  const email = req.params.email;
  const result = User.findOne({ email: email });
  result.exec((err, data) => {
    try {
      if (err) {
        throw err;
      } else {
        if (data) {
          res.send(data);
        } else {
          throw "Nessun risultato";
        }
      }
    } catch (error) {
      res.status(401).send(error);
    }
  });
});

/* PATCH http://site212222.tw.cs.unibo.it/api/users/{ email }
  i dati da modificare nel body, del tipo campo: nuovoVal */
router.patch("/:email", (req, res) => {
  const email = req.params.email;
  const updateList = req.body;
  const findResult = User.findOne({ email: email });
  findResult.exec((err, data) => {
    try {
      if (err) {
        throw err;
      } else {
        if (data) {
          const updateResult = User.updateOne(
            { email: email },
            { $set: updateList }
          );
          updateResult.exec((err, data) => {
            if (err) {
              throw err;
            }
            res.send(data);
          });
        } else {
          throw "Nessun risultato trovato";
        }
      }
    } catch (error) {
      res.status(401).send(error);
    }
  });
});

/* DELETE http://site212222.tw.cs.unibo.it/api/users/{ email } */
router.delete("/:email", (req, res) => {
  const email = req.params.email;
  const findResult = User.findOne({ email: email });
  findResult.exec((err, data) => {
    try {
      if (err) {
        throw err;
      } else {
        if (data) {
          const deleteResult = User.deleteOne({ email: email });
          deleteResult.exec((err) => {
            try {
              if (err) {
                throw err;
              }
              res.send(`${email} eliminato con successo!`);
            } catch (error) {
              res.status(401).send(error);
            }
          });
        } else {
          throw "Nessun risultato trovato";
        }
      }
    } catch (error) {
      res.status(401).send(error);
    }
  });
});

module.exports = router;
