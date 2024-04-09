const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customerId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true},
  paymentIntentId: {type: String},
  products:[ 
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "products",
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true},
      productBrand: {
        type: String
      },
      productPrice: {
        type: Number
      },
      productRetailPrice: {
        type: Number
      },
      productName: {
        type: String
      },
      productQuantity: {
        type: Number
      },
      productColor: {
        type: String,
      },
      productSize: {
        type: String,
      }
},],
    productInvoice:[{
        subTotal:{type: Number},
        total:{type: Number},
        paymentStatus:{type: String},
        hostedInvoiceUrl:{type: String},
        invoicePdf:{type: String},
    }]
},{timestamps: true});

module.exports = mongoose.model('Order', OrderSchema);
