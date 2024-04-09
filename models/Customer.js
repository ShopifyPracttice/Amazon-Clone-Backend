const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerName: {type: String, required: true} ,
  customerEmail: {type: String, required: true, unique: true},
  customerPassword: {type: String},
  cartProducts: [
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        },
        productBrand:{
            type: String
        },
        productColor:{
            type: String
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId, 
            required: true
        },
        productName: {
            type: String
        },
        productQuantity: {
            type: Number
        },
        productPrice:{
           type: Number
        },
        productRetailPrice:{
            type: Number,
            required: true
         },
        productSize: {
            type: String
        },
        productImageUrl: {
            type: String
        }
    }
],
purchasedProducts: [
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        },
        productBrand: {
            type: String
        },
        productName: {
            type: String
        },
        productQuantity: {
            type: Number
        },
        productPrice:{
           type: Number
        },
        productSize: {
            type: String
        },
        productColor: {
            type: String
        }
        ,
        productImageUrl: {
            type: String
        }
    }
] 
});

module.exports = mongoose.model('Customer', customerSchema);
