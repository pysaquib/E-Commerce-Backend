module.exports = (customers, customer, knex, jwt) => {
    const config = require('../config');

    const verifyToken = (req, res, next) => {
        const bearerHeader = req.headers['authorization'];
        if(typeof(bearerHeader!=='undefined')){
            var bearer = bearerHeader.split(" ")
            req.token = bearer[1]
            next();
        }
        else{
            res.sendStatus(403)
        }
    }

// Sign up a customer and create an access token using JWT
    customers.post('/', (req, res) => {
        var user = {
            'name' : req.body.name,
            'email' : req.body.email,
            'password' : req.body.password
        }
        jwt.sign(
            {user}, config.key, {expiresIn:"24h"} , (err, token) => {
                knex('customer').insert(req.body)
                .then(()=>{
                    newData = {}
                    knex.select('*').from('customer').where('email', req.body.email)
                    .then((data) => {
                        newData['customer'] = data[data.length-1]
                        newData['accessToken'] = "Bearer "+token
                        newData['expiresIn'] = '24h'
                        return res.json(newData)
                    })
                })
            }
        )
    })

//Login a customer with email and password by verifying access token created by JWT 
    customers.post('/login', verifyToken, (req, res) => {
        var login = {
            'email' : req.body.email,
            'password' : req.body.password
        }

        // jwt.sign(
        //     {login}, config.key, {expiresIn:"24h"}, (err, token) => {
        //         res.send(token)
        //     }
        // )

        jwt.verify(req.token, config.key, (err, authData) => {
            if(err){
                return res.sendStatus(403)
            }
            else{
                newData = {}
                knex.select('*').from('customer').where('email', req.body.email).andWhere('password', req.body.password)
                .then((data) => {
                    newData['customer'] = data[data.length-1]
                    newData['accessToken'] = "Bearer "+req.token
                    newData['expiresIn'] = '24h'
                    return res.json(newData)
                })
            }
        })
    })

// Update a customer
    customer.put('/', verifyToken, (req, res) => {
        jwt.verify(req.token, config.key, (err, authData) => {
            var update = {
                'name' : req.body.name,
                'email' : req.body.email,
                'password' : req.body.password,
                'updatedEmail' : req.body.updatedEmail,
                'updatedPassword' : req.body.updatedPassword,
                'day_phone' : req.body.day_phone,
                'eve_phone' : req.body.eve_phone,
                'mob_phone' : req.body.mob_phone
            }
            knex('customer')
            .where({'email' : update['email'], 'password' : update['password']})
            .update({
                    'name' : req.body.name, 
                    'email' : req.body.updatedEmail, 
                    'password' : req.body.updatedPassword,
                    'day_phone' : req.body.day_phone,
                    'eve_phone' : req.body.eve_phone,
                    'mob_phone' : req.body.mob_phone
                })
            .then(() => {
                knex.select('*').from('customer').where({'email' : req.body.updatedEmail, 'password' : req.body.updatedPassword})
                .then((data) => {
                    return res.json(data)
                });
            });
        });
    });

// Get a customer using email, password
    customer.get('/', verifyToken, (req, res) => {
        jwt.verify(req.token, config.key, (err, authData) =>{
            var customer = {
                'email' : req.body.email,
                'password' : req.body.password
            }
            knex.select('customer_id').from('customer').where(customer)
            .then((data) => {
                var customer_id = data[0].customer_id
                knex.select('*').from('customer').where('customer_id', customer_id)
                .then((showData) => {
                    return res.json(showData)
                });
            });
        });
    });

// Pending....
    // customers.get('/facebook' (req, res) => {

    // })
// Pending.....

// Update Address
    customers.put('/address', verifyToken, (req, res) => {
        jwt.verify(req.token, config.key, (err, authData) => {
            var address = {
                'email' : req.body.email,
                'password' : req.body.password,
                'address_1' : req.body.address_1,
                'address_2' : req.body.address_2,
                'city' : req.body.city,
                'region' : req.body.region,
                'postal_code' : req.body.postal_code,
                'country' : req.body.country,
                'shipping_region_id' : req.body.shipping_region_id
            }
            knex('customer')
            .where({
                'email' : address['email'],
                'password' : address['password']}
                )
            .update({
                    'address_1' : address.address_1,
                    'address_2' : req.body.address_2,
                    'city' : address['city'],
                    'region' : req.body.region,
                    'postal_code' : address.region,
                    'country' : address['country'],
                    'shipping_region_id' : address.shipping_region_id
            })
            .then(()=>{
                knex.select('*').from('customer').where('email', req.body.email)
                .then((data) => {
                    res.json(data)
                });
            });
        });
    });

    customers.put('/creditCard', verifyToken, (req, res) => {
        jwt.verify(req.token, config.key, (err, authData) => {
            var address = {
                'email' : req.body.email,
                'password' : req.body.password,
                'credit_card' : req.body.credit_card
            }
            knex('customer')
            .where({
                'email' : address['email'],
                'password' : address['password']}
                )
            .update({'credit_card' : req.body.credit_card})
            .then(()=>{
                knex.select('*').from('customer').where('email', req.body.email)
                .then((data) => {
                    res.json(data)
                });
            });
        });
    });


}