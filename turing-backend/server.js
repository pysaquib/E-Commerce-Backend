var jwt = require('jsonwebtoken')
var _Stripe = require('stripe')
var dotenv = require('dotenv')
dotenv.config();

// Mysql connection
var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME
    }
  });

// creating server for routing
const express = require('express');
const app = express();

// request body parser
app.use(express.json()); 


// route for departments
const department = express.Router();
app.use('/departments', department);
// route for category
const category = express.Router();
app.use('/categories', category);
// route for attribute
const attribute = express.Router();
app.use('/attributes', attribute);
// route for product
const product = express.Router();
app.use('/products', product);

const customer = express.Router();
app.use('/customers', customer);
const cust = express.Router();
app.use('/customer', cust);

const shoppingCart = express.Router();
app.use('/shoppingcart', shoppingCart);

const order = express.Router();
app.use('/orders', order);

const tax = express.Router();
app.use('/tax', tax);

const shipping = express.Router();
app.use('/shipping', shipping)

const stripe = express.Router();
app.use('/stripe', stripe)

require('./Router/departments')(department,knex);
require('./Router/categories')(category, knex);
require('./Router/attributes')(attribute, knex);
require('./Router/products')(product, knex);
require('./Router/customers')(customer, cust, knex, jwt);
require('./Router/shoppingcart')(shoppingCart, knex);
require('./Router/orders')(order, knex);
require('./Router/tax')(tax, knex);
require('./Router/shipping')(shipping, knex);
require('./Router/stripe')(stripe, _Stripe);

const port = process.env.PORT;
app.listen(port, ()=>{
  console.log(`Listening at ${port}`);
});