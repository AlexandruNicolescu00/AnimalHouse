const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ha bisogno di un titolo"],
      trim: true,
      maxlength: [50, "Un titolo non può essere più lungo di 50 caratteri"],
    },
    text: {
      type: String,
      required: [
        true,
        "Per postare sulla bacheca devi avere qualcosa da scrivere",
      ],
    },
    category: {
      type: String,
      required: [true, "In quale bacheca si deve postare?"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Dare un utente"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
