const mongoose = require("mongoose");
const path = require("path");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Il nome del prodotto deve essere fornito"],
  },
  price: {
    type: Number,
    required: [true, "Il prezzo del prodotto deve essere fornito"],
  },
  description: {
    type: String,
    default: "",
  },
  featured: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  qta: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: [true, "Il prodotto deve appartenere ad una categoria"],
  },
  subcategory: {
    type: [String],
    required: [
      true,
      "Il prodotto deve appartenere ad una o più sottocategorie",
    ],
  },
  imgPath: {
    type: String,
    default: path.join(__dirname, "..", "img", "default.jpg"),
  },
});

module.exports = mongoose.model("Product", ProductSchema);
