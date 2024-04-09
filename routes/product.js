const express = require("express")
const ProductModel = require("../models/Product")
const CustomerModel = require("../models/Customer")

const router = express.Router();

router.get("/all-products", async (req, res)=>{
    try{
        const response = await ProductModel.find({})
        res.json(response)
    }catch(error){
        console.error("Error registering Business:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get("/product/id/:productID", async (req, res) =>{
    try{
      const response = await ProductModel.findById( req.params.productID);
       res.json(response)
    }
    catch(err){
      console.error(err)
    }
  })

  router.put("/", async (req, res) => {
    try {
        const product = {
            sellerId: req.body.sellerId,
            productId: req.body.productId,
            productName: req.body.productName,
            productRetailPrice: req.body.productRetailPrice,
            productBrand: req.body.productBrand,
            productQuantity: req.body.productQuantity,
            productColor: req.body.productColor,
            productPrice: req.body.productPrice,
            productSize: req.body.productSize,
            productImageUrl: req.body.productImage
        };

        const productData = await ProductModel.findById(product.productId);
        if (!productData) {
            return res.status(404).json({ message: "Product not found." });
        }
          
        productData.productStock -= product.productQuantity;
        await productData.save();

        const user = await CustomerModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.cartProducts.push(product);
        await user.save();

        res.json({message: "Product Added to Cart Successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "An error occurred while updating the cart.", error: err });
    }
});

router.get("/cartProducts/ids/:userId", async (req, res) =>{
    try{
        const user = await CustomerModel.findById(req.params.userId);
        const subTotal = user.cartProducts.reduce((total, product) => total + product.productPrice, 0);
        res.json({cartProducts: user?.cartProducts, subTotals: subTotal })
    }catch (err){
        res.json(err)
    }
})
router.delete("/cartProducts/:userId/:productId", async (req, res) => {
    try {
      const userID = req.params.userId;
      const productId = req.params.productId; // Corrected parameter name
      const productStock = req.query.productStock;
  
      const productData = await ProductModel.findById(productId);

      // Update the product stock
      const productStockFull = Number(productData.productStock) + Number(productStock);
      productData.productStock = productStockFull;
      await productData.save();
      
      // Remove the product from the user's cart
      const updatedUser = await CustomerModel.findByIdAndUpdate(
        userID,
        { $pull: { cartProducts: { productId: productId } } },
        { new: true } 
      );
  
      res.json({ message: 'Product removed from the cart', updatedUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    

module.exports = router
