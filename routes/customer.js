const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const CustomerModel = require("../models/Customer")
const BusinessModel = require("../models/Business")
const verifyToken = require("../middleware/auth")

const router = express.Router();

router.post("/register/customer", async (req, res) => {
    try {
        const { customerName, customerEmail, customerPassword } = req.body;

        const existingCustomer = await CustomerModel.findOne({ customerEmail });
        if (existingCustomer) {
            return res.json({ status: "bad", message: "Customer with this email already exists" });
        }
        const hashedPassword = await bcrypt.hash(customerPassword, 10);
        const newCustomer = new CustomerModel({
            customerName,
            customerEmail,
            customerPassword: hashedPassword, 
        });
        await newCustomer.save();
        const expirationTime = 5000; 
        const token = jwt.sign(
            {userId: newCustomer._id},
            'secret1234',
            { expiresIn: expirationTime }
        );
        res.cookie('token', token, { httpOnly: true,sameSite: 'none',secure: true, }).json({ message: "Customer Logged in Successfully!", status: "ok" });
    } catch (error) {
        console.error("Error registering customer:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login/customer", async (req, res) => {
    try {
        const { customerEmail, customerPassword } = req.body;

        const customer = await CustomerModel.findOne({ customerEmail });
        if (!customer) {
            return res.json({ status: "bad", message: "Invalid Credentials" });
        }

        const isPasswordValid = await bcrypt.compare(customerPassword, customer.customerPassword);
        if (!isPasswordValid) {
            return res.json({ status: "bad", message: "Invalid Credentials" });
        }

        const expirationTime = 5000; 
        const token = jwt.sign(
            {userId: customer._id},
            'secret1234',
            { expiresIn: expirationTime }
        );
        res.cookie('token', token, { httpOnly: true,sameSite: 'none',secure: true, }).json({ message: "Customer Logged in Successfully!", status: "ok", token: token });
    } catch (error) {
        console.error("Error logging in customer:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/logout", (req, res)=>{
    try {
        // Clear the token cookie
        res.clearCookie('token');
        
        // Respond with a success message
        res.status(200).send("Logout successful");
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/validate-token", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
            const customer = await CustomerModel.findById(userId);
            if (customer) {
                return res.status(200).send({
                    userId: customer._id,
                    userName: customer.customerName,
                    userType: "customer",
                    cartItems: customer.cartProducts.length
                });
            }
            const business = await BusinessModel.findById(userId);
            if (business) {
                return res.status(200).send({
                    userId: business._id,
                    userName: business.ownerName,
                    userType: "business"
                });

            }

        // If neither customer nor business found
        return res.status(401).send({ message: "User is Suspicious" });
    } catch (error) {
        console.error("Error validating token:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
});

// router.get("/logout",  (req, res)=>{
//     try {
//         res.clearCookie("token", { path: '/' })
//         res.status(200).send("Logout successful");
//     } catch (error) {
//         console.error("Error logging out:", error);
//         res.status(500).send("Internal Server Error");
//     }
// });


module.exports = router
