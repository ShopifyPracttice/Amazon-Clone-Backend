const express= require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
const mongoose = require("mongoose")
const stripe = require('stripe')('sk_test_51OzdTnFshF4E0vp9jdqWMHH58hsn8pXrjpcCEgFPxFlHly1xglknanqp54vDECX5ht0MEgpxPdQuLQnjteS7H1zb00JxeWTofT');
const CustomerRoute = require("./routes/customer")
const Order = require("./models/Order")
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


app.use(bodyParser.json({
  verify: function (req, res, buf) {
      var url = req.originalUrl;
      if (url.startsWith('/webhook')) {
          req.rawBody = buf.toString()
      }
  }
}));

let total;
let metadata = [];
let subTotal;
let paymentIntentId;
let paymentStatus;
let customerId;
let endpointSecret = "whsec_93e0c76098294832cf6a37885ce49cfc9455f0f767584123910dee4b6865020a";


app.post('/webhook', express.raw({ type: '*/*' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const body = request.body;
  
  try {
    const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    const Id = event.data.object.metadata.buyNow;
    const hostedInvoiceUrl = event.data.object.hosted_invoice_url;
    const invoicePdf = event.data.object.invoice_pdf;  
    
  

    switch (event.type) {
      case 'checkout.session.completed':
        const paymentIntent = event.data.object;
        metadata = JSON.parse(event.data.object.metadata.buyNow);
        console.log(metadata);
        paymentIntentId = event.data.object.id;
        const products = Array.isArray(metadata) ? metadata : [metadata];
        // customerId = metadata[0].userId; // Assuming userId is present in the metadata of the first product
        customerId = products[0]?.userId || metadata.userId
        const formattedProducts = products.map(product => ({
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
          paymentIntentId: paymentIntent.id,
          products: formattedProducts
        });

        await order.save();

        total = event.data.object.amount_total;
        subTotal = event.data.object.amount_subtotal;
        paymentStatus = event.data.object.payment_status;
        
        break; 

      case 'invoice.payment_succeeded':
        const orderInvoiceInfo = await Order.findOne({ paymentIntentId: paymentIntentId });
         console.log(orderInvoiceInfo);
        orderInvoiceInfo.productInvoice.push({
          total,
          subTotal,
          paymentStatus,
          hostedInvoiceUrl,
          invoicePdf
        });
      
        await orderInvoiceInfo.save();

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
// app.use(express.json())

app.use("/user", CustomerRoute)
app.use("/user", BusinessRoute)
app.use("/product", ProductRoute)
app.use("/orders", OrderRoute)

const YOUR_DOMAIN = 'https://amazon-clone-front-end-tawny.vercel.app/';

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
        buyNow: JSON.stringify(products)
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