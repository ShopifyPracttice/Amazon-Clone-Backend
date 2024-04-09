const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  ownerEmail: {type: String, required: true, unique: true},
  ownerName: {type: String, required: true},
  ownerPassword: {type: String, required: true},
  businessInfo:{    
  businessName: {type: String, required: true, unique: true},
  businessType:{type: String, required: true},
  streetAdress: {type: String, required: true},
  adressFloor: {type: String},
  zipCode:{type: String, required: true},
  city: {type: String, required: true},
  state:{type: String, required: true},
  },
  myProducts:[ 
    {
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
          type: String, 
          // required: true,
        },
    }]
}]

});

module.exports = mongoose.model('Business', businessSchema);
