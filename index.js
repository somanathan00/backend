const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe'); // Replace with your test or live key
const key= process.env.key; 
const stripe=new Stripe(key);
const app = express();
// const cors = require('cors');


// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true }));

app.post('/api/payment', async (req, res) => {
  const { body } = req;
  try {
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body?.amount,
      currency:body?.currency,
     
    });
    if (paymentIntent?.status!=='completed'){
      console.log('==== in')
      return res.status(200).json({
        message:"confirm payment",
        client_secret: paymentIntent?.client_secret 
      })
    }
    return res.status(200).json({ message: "payment completed" });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(5050, () => {
  console.log(`Server running at http://localhost:${5050}`);
});
