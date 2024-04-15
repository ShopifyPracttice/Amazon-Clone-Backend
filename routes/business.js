const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const BusinessModel = require("../models/Business")
const CustomerModel = require("../models/Customer")
const ProductSchema = require("../models/Product")
const OrderModel = require("../models/Order")

const router = express.Router();

router.post("/register/business/details", async (req, res) => {
    try {
        const { ownerEmail, ownerName, ownerPassword,businessName, businessType, streetAdress, adressFloor, zipCode, city, state } = req.body;
        const existingBusinessEmail = await BusinessModel.findOne({ownerEmail});
        const existingCustomerEmail = await CustomerModel.findOne({ownerEmail});
        if (existingCustomerEmail) {
            return res.json({ status: "bad", message: "This email is already register with customer account!" });
        }
        if (existingBusinessEmail) {
            return res.json({ status: "bad", message: "Business with this email already exists" });
        }
        const existingBusinessName = await BusinessModel.findOne({businessName})
        if (existingBusinessName) {
            return res.json({ status: "bad", message: "This Business Name already exists!" });
        }
        const hashedPassword = await bcrypt.hash(ownerPassword, 10);

        const newBusiness = new BusinessModel({
            ownerEmail,
            ownerName,
            ownerPassword: hashedPassword,
            businessInfo:{
            businessName, 
            businessType, 
            streetAdress, 
            adressFloor, 
            zipCode, 
            city, 
            state
            }
        });

        await newBusiness.save();
        const expirationTime = 5000; 
        const token = jwt.sign(
            {userId: newBusiness._id},
            'secret1234',
            { expiresIn: expirationTime }
        );
        res.cookie('token', token, { httpOnly: true,sameSite: 'none',secure: true, }).json({ message: "Business Registered in Successfully!", status: "OK" });
    } catch (error) {
        console.error("Error registering Business:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/register/business/email", async (req, res) => {
    try {
        const ownerEmail = req.body.email;
        const existingBusinessEmail = await BusinessModel.findOne({ownerEmail: ownerEmail} );
        const existingCustomerEmail = await CustomerModel.findOne({ownerEmail: ownerEmail});
        console.log(existingBusinessEmail);
        console.log(existingCustomerEmail);
        if (existingCustomerEmail) {
            return res.json({ status: "bad", message: "This email is already register with customer account!" });
        }
        if (existingBusinessEmail) {
            return res.json({ status: "bad", message: "Business with this email already exists" });
        }

        return res.json({status: "OK"})

    } catch (error) {
        console.error("Error registering customer:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/add-product", async (req, res)=>{
    try{
        const { userId, productName, productImage, productBrand, productPurchasePrice, productRetailPrice, productStock, productCategory, colors } = req.body;
        const businessAccount = await BusinessModel.findById(userId);
        if(!businessAccount){
          return res.json({ message: 'User Not Found' }); 
        }
        businessAccount.myProducts.push()
        const newProducts = {
            productName,
            productImage,
            productBrand,
            productPurchasePrice,
            productRetailPrice,
            productStock,
            productCategory,
            colors
          };
        const newProduct = new ProductSchema({
            userId,
            productName,
            productImage,
            productBrand,
            productPurchasePrice,
            productRetailPrice,
            productStock,
            productCategory,
            colors
        });
        await newProduct.save()
        businessAccount.myProducts.push(newProducts);
    await businessAccount.save();
        res.status(201).json({ message: 'Product created successfully' });
    }catch(error){
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post("/login/business", async (req, res) => {
    try {
        const { ownerEmail, ownerPassword } = req.body;

        const business = await BusinessModel.findOne({ ownerEmail });
        if (!business) {
            return res.json({ status: "bad", message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(ownerPassword, business.ownerPassword);
        if (!isPasswordValid) {
            return res.json({ status: "bad", message: "Invalid Credentials" });
        }

        const expirationTime = 5000; 
        const token = jwt.sign(
            {userId: business._id},
            'secret1234',
            { expiresIn: expirationTime }
        );
        res.cookie('token', token, { httpOnly: true,sameSite: 'none',secure: true, }).json({ message: "Business Account Logged in Successfully!", status: "ok" });
    } catch (error) {
        console.error("Error logging in Business:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/purchased-products/:userId", async(req, res)=>{
    const sellerId = req.params.userId;
      try{
        const myPurchasesProducts = await OrderModel.find({ "products.sellerId": sellerId})
        console.log(myPurchasesProducts);
        res.json(myPurchasesProducts)
      }catch(err){
        console.log(err);
      }
})

module.exports = router
