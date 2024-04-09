const express = require("express");
const Order = require("../models/Order");
const ProductModel = require("../models/Product")
const router = express.Router();

router.get("/order/id/:userId", async (req, res) => {
    try {
        const customerId = req.params.userId;
        // console.log(customerId);
        const orders = await Order.find({ customerId: customerId }).populate({
            path: 'products.productId',
            model: ProductModel,
            select: 'productImage' // Select the fields you need from ProductModel
        });
         // Corrected syntax
        // const productIds = orders.map(order => order.products.map(product => product.productId));
        // const products = await ProductModel.find({_id: productIds});
        // orders.forEach(order => {
        //     order.products.forEach(product => {
        //         const matchingProduct = products.find(p => p._id.equals(product.productId));
        //         if (matchingProduct) {
        //             product.productImage = matchingProduct.productImage; // Adding productImage to the product object
        //         }
        //     });
        // });
        // console.log(orders);

        // console.log(productImages);
        // Corrected syntax
        // console.log(order);
        res.json(orders);
    } catch (err) {
        res.json(err);
    }
});

module.exports = router;
