module.exports = (stripe, _stripe) => {
    stripe.get('/token', (req, res, next) => {
        var stripe_ = _stripe(process.env.STRIPE_SECRET_KEY);
        stripe_.tokens.create({
            card : {
                number : '4242424242424242',
                exp_month : 12,
                exp_year : 2020,
                cvc : 123
            }
        }, (err,token) => {
            if(!err){
                res.json(token['id'])    
            }
        });
    });

    stripe.post('/charge', (req, res, next) => {
        const stripeToken = req.body.token;
        var stripe_ = _stripe(process.env.STRIPE_SECRET_KEY);
        /*{
            "order_id" : 5,
            "description" : "T-Shirt, Color : Coral, Size : M",
            "amount" : 65,
            "currency" : "gbp",
            "token" : "tok_1Edews1zercH8fk3xmqWc9"
        }*/
        stripe_.charges.create({
            amount : req.body.amount,
            currency : req.body.currency,
            description : req.body.description,
            source : stripeToken
        }, (err, charge) => {
            if(err){
                // return res.json(err)
                return res.json(
                    {
                        Success : false,
                        Message : "Payment Failed"
                    }
                )
            }
            else{
                return res.json(
                    {
                        Success : true,
                        Message : "Payment Successful"
                    }
                )
            }
        });
    });

    stripe.post('/webhook', (req, res) => {
        var stripe_ = stripe(process.env.STRIPE_SECRET_KEY);
        stripe_.webhookEndpoints.create({
//          url: `Your ngrok secured tunnel goes in here`
            url: "http://0542xxxx.ngrok.io/stripe/webhooks",
            enabled_events: ["charge.failed", "charge.succeeded"]
        }, (err, webhookEndpoint) => {
            if(err){
                // return res.json(err)
                return res.json({received:false});
            }
            else{
                console.log(webhookEndpoint)
                return res.json({received:true})
            }
        })
    });
}
