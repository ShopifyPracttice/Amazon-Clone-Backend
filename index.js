const express= require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require("mongoose")
const stripe = require('stripe')('sk_test_51OzdTnFshF4E0vp9jdqWMHH58hsn8pXrjpcCEgFPxFlHly1xglknanqp54vDECX5ht0MEgpxPdQuLQnjteS7H1zb00JxeWTofT');
const CustomerRoute = require("./routes/customer")
const Order = require("./models/Order")
const CustomerModel = require("./models/Customer")
const OrderRoute = require("./routes/order")
const BusinessRoute = require("./routes/business")
const ProductRoute = require("./routes/product")
const cookieParser = require('cookie-parser');
// const session = require("express-session");

const app = express();
// const endpointSecret = "whsec_93e0c76098294832cf6a37885ce49cfc9455f0f767584123910dee4b6865020a";

// let total;
// let metadata = [];
// let subTotal;
// let paymentIntentId;
// let paymentStatus;
// let customerId;
// app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
//   const sig = request.headers['stripe-signature'];
//   const body = request.body;
//   try {
//     const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//     const Id = event.data.object.metadata.buyNow;
//     // console.log(event.data);
//     const hostedInvoiceUrl = event.data.object.hosted_invoice_url;
//     const invoicePdf = event.data.object.invoice_pdf;  
//     switch (event.type) {
//       case 'checkout.session.completed':
//         const paymentIntent = event.data.object;
//          metadata = JSON.parse(event.data.object.metadata.buyNow);
//          paymentIntentId = event.data.object.id;
//         // const customerId = metadata.userId;
//         const products = metadata;
        
//           const order = new Order({
//             customerId: product.userId,
//             paymentIntentId: paymentIntent.id,
//             products: products,
//           });
  
//           await order.save();
        

//      total = event.data.object.amount_total;
//      subTotal = event.data.object.amount_subtotal;
//      paymentStatus = event.data.object.payment_status;
         

        
//         break; 

//       case 'invoice.payment_succeeded':        
//             // const orderInvoiceInfo = await Order.findOne({paymentIntentId: paymentIntentId})

//             // orderInvoiceInfo.productInvoice.push({
//             //   total,
//             //   subTotal,
//             //   paymentStatus,
//             //   hostedInvoiceUrl,
//             //   invoicePdf
//             // });
        
//             // await orderInvoiceInfo.save();
        
//               const orderInvoiceInfo = await Order.findOne({ paymentIntentId: paymentIntentId });
//               orderInvoiceInfo.productInvoice.push({
//                   total,
//                   subTotal,
//                   paymentStatus,
//                   hostedInvoiceUrl,
//                   invoicePdf
//               });
      
//               await orderInvoiceInfo.save();
          

//         break;

      
//       default:
//           }

//         response.status(200).end();
//   } catch (err) {
//     console.error("Error processing webhook:", err);
//     response.status(400).send(`Webhook Error: ${err.message}`);
//   }
// });

// app.use(express.json({
//   verify: (req, res, buf) => {
    
//       req.rawBody = buf
//   },
// }));
// app.use(bodyParser.json());

let total;
let cartdata = [];
let buyNowData;
let subTotal;
let paymentIntentId;
let paymentStatus;
let customerId;
// let endpointSecret = "whsec_93e0c76098294832cf6a37885ce49cfc9455f0f767584123910dee4b6865020a";
const endpointSecret = "whsec_kDwd7Xbt20GXU1iu852Oy5FT3Tn6kC0n";


let event

const emptyCartLogic = async (customerId) => {
  try {
      // Find the customer by their ID
      const customer = await CustomerModel.findById(customerId);
      
      // If customer is found
      if (customer) {
          // Set the cart products to an empty array
          customer.cartProducts = [];
          
          // Save the updated customer document to the database
          await customer.save();
          
          console.log(`Cart emptied for customer with ID: ${customerId}`);
      } else {
          console.log(`Customer with ID ${customerId} not found.`);
      }
  } catch (error) {
      console.error(`Error emptying cart for customer with ID ${customerId}:`, error);
  }
};



app.post('/webhook', express.raw({type: 'application/json'}),async (request, response) => {
  // console.log(request.body)
  const sig = request.headers['stripe-signature'];
  // const body = request.body;
  const body = request.body;
  
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    const Id = event.data.object.metadata.buyNow;
    // console.log(event.data);
    const hostedInvoiceUrl = event.data.object.hosted_invoice_url;
    const invoicePdf = event.data.object.invoice_pdf;  
    // paymentIntentId = event.data.object.id;
    
    cartdata = event.data.object.metadata.cart;
    // console.log("Outside",cartdata);
    buyNowData = event.data.object.metadata.buyNow;

    switch (event.type) {
      case 'checkout.session.completed':
         paymentIntentId = event.data.object.id;
        if(cartdata){
    cartdata = JSON.parse(event.data.object.metadata.cart);
    // console.log("In checkout",cartdata);
    //  console.log(paymentIntentId);
     customerId = cartdata[0]?.userId || cartdata.userId
    const formattedProducts = cartdata.map(product => ({
      productId: product.productId,
      sellerId: product.sellerId,
      productBrand: product.productBrand,
      productPrice: product.productPrice,
      productRetailPrice: product.productRetailPrice,
      productName: product.productName,
      productQuantity: product.productQuantity,
      productColor: product.productColor,
      productSize: product.productSize
    }));
    
    const order = new Order({
      customerId: customerId,
      paymentIntentId: paymentIntentId,
      products: formattedProducts
    });
      // console.log(order);
    const result = await order.save();
    // console.log(result);


    await emptyCartLogic(customerId)
  }else if(buyNowData){
    buyNowData = JSON.parse(event.data.object.metadata.buyNow);
    // console.log(buyNowData);
    customerId = buyNowData.userId;
    const buyNowProduct = {
      productId: buyNowData.productId,
      sellerId: buyNowData.sellerId,
      productBrand: buyNowData.productBrand,
      productPrice: buyNowData.productPrice,
      productRetailPrice: buyNowData.productRetailPrice,
      productName: buyNowData.productName,
      productQuantity: buyNowData.productQuantity,
      productColor: buyNowData.productColor,
      productSize: buyNowData.productSize
    }
    const order = new Order({
      customerId: customerId,
      paymentIntentId: paymentIntentId,
      products: buyNowProduct
    });
    const result = await order.save();
    // console.log(result);
  }
  total = event.data.object.amount_total;
  subTotal = event.data.object.amount_subtotal;
  paymentStatus = event.data.object.payment_status;
  break;
      case 'invoice.payment_succeeded':
        // console.log(paymentIntentId);
        const orderInvoiceInfo = await Order.findOne({ paymentIntentId: paymentIntentId });
        if (orderInvoiceInfo) {
          orderInvoiceInfo.productInvoice.push({
            total,
            subTotal,
            paymentStatus,
            hostedInvoiceUrl,
            invoicePdf
          });
          // console.log(orderInvoiceInfo);
          await orderInvoiceInfo.save();
        } else {
          console.error('Order not found for payment intent ID:', paymentIntentId);
        }
      
        break;

      default:
        break;
    }

    response.status(200).end();
  } catch (err) {
    console.error("Error processing webhook:", err);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//   const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//   } catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//     return;
//   }

//   // Handle the event
//   console.log(`Unhandled event type ${event.type}`);

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });

// app.use(express.json({verify: (req,res,buf) => { req.rawBody = buf.toString() }}))
app.use(express.json())

// app.use(cors())
app.use(cors({
  origin: 'https://amazon-clone-front-end-tawny.vercel.app',
  credentials: true
}));
// app.use(session({
//   secret: 'your_secret_here', // Set your session secret here
//   resave: true,
//   saveUninitialized: true,
//   cookie: {
//       secure: false, // Set to true for production (if served over HTTPS)
//       sameSite: 'none', // Set to 'none' for production (if handling cross-site requests)
//       // Add other cookie attributes as needed
//   }
// }));

// app.use(session({
//   secret: 'secret1234',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: false,}
// }));
app.use(cookieParser());
app.use("/user", CustomerRoute)
app.use("/user", BusinessRoute)
app.use("/product", ProductRoute)
app.use("/orders", OrderRoute)

const YOUR_DOMAIN = 'https://amazon-clone-front-end-tawny.vercel.app';

app.post('/create-checkout-session', async (req, res) => {
  try {
    const products = req.body;  
    // console.log(products);
    const lineItems = products.map(product => {
      const unitPrice = (product.productPrice / product.productQuantity) * 100;
      return {
        price_data: {
          currency: 'usd', 
          unit_amount: unitPrice,
          product_data: {
            name: product.productName,
          },
        },
        quantity: product.productQuantity ,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      metadata: {
        cart: JSON.stringify(products)
      },
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      invoice_creation: { enabled: true }
    });

    res.json({ id: session.id });
  } catch(err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


app.post('/create-buy-session', async (req, res) => {
  try {
    const product = req.body;  

    const unitPrice = (product.productPrice / product.productQuantity) * 100;
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd', 
            unit_amount: unitPrice,
            product_data: {
              name: product.productName,
            },
          },
          quantity: product.productQuantity,
        },
      ],
      metadata: {
        buyNow: JSON.stringify(product)
      },
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success`,
      cancel_url: `${YOUR_DOMAIN}/cancel`,
      invoice_creation: {enabled: true}

    });

    res.json({id: session.id});
  } catch(err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});




const dbUrl = "mongodb+srv://mongodb:mongodb@cluster0.t3jnhxf.mongodb.net/?retryWrites=true&w=majority&appName=amazonclone"
mongoose.connect(dbUrl)
.then((res) => console.log("conected"))
.catch((err) => console.log(err))

app.listen("7001", ()=>{
    console.log("Server is running on 7001");
})