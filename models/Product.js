const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
      type: String,
      required: true,
    },
    productImage:{
      type: String,
      required: true
    },
    productBrand: {
      type: String,
      required: true,
    },
    productPurchasePrice: {
      type: Number,
      required: true,
    },
    productRetailPrice: {
      type: Number,
      required: true,
    },
    productStock: {
      type: Number,
      required: true,
    },
    productCategory: {
      type: String,
      required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Business",
    },
    colors: [{
      color: {
        type: String,
        required: true,
      },
      size: {
        type: String,
        // enum: ['small', 'medium', 'large'],
        // required: true,
      },
      image: {
        type: String, // You can store image paths or URLs here
        // required: true,
      },
    }],
  });
  module.exports = mongoose.model('Product', productSchema);