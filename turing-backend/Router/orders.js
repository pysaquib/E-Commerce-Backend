module.exports = (orders, knex) => {
    // create orders
    orders.post('/', (req, res) => {
        var order = {
            'customer_id' : req.body.customer_id,
            'cart_id' : req.body.cart_id,
            'shipping_id' : req.body.shipping_id,
            'tax_id' : req.body.tax_id
        }
        knex('orders')
        .insert({
            'customer_id' : order['customer_id'],
            'shipping_id' : order['shipping_id'],
            'tax_id' : order['tax_id'],
            'created_on' : new Date()
        })
        knex.schema.hasTable('order_place')
        .then((exists) => {
            if(!exists){
                return knex.schema.createTable('order_place', (table) => {
                    table.increments('order_id').primary();
                    table.integer('customer_id');
                    table.string('cart_id', 100);
                    table.integer('shipping_id');
                    table.integer('tax_id');
                })
            }
            knex('order_place')
            .insert({
                'customer_id' : order['customer_id'],
                'cart_id' : order['cart_id'],
                'shipping_id' : order['shipping_id'],
                'tax_id' : order['tax_id']
            })
            .then(() => {
                knex('orders')
                .insert({
                    'created_on' : new Date(),
                    'customer_id' : order['customer_id'],
                    'shipping_id' : order['shipping_id'],
                    'tax_id' : order['tax']
                })
                .then(() => {
                    knex.select('*').from('order_place').where('customer_id', order['customer_id'])
                    .then((data) => {
                        res.json(data)
                    });
                })
            });
        });
    });


    orders.get('/:order_id', (req, res) => {
        var id = req.params.order_id
        knex
        .select('order_place.order_id', 'shopping_cart.product_id', 'shopping_cart.attributes', 'product.name as product_name', 'shopping_cart.quantity', 'product.price as unit_cost')
        .from('order_place')
        .join('orders', {'orders.order_id' : 'order_place.order_id'})
        .join('shopping_cart', {'shopping_cart.cart_id' : 'order_place.cart_id'})
        .join('product', {'product.product_id' : 'shopping_cart.product_id'})
        .where('order_place.order_id', id)
        .then((data) => {
            var total = 0;
            for(let i of data){
                total+=i['unit_cost']*i['quantity']
                i['sub_total'] = total
                total = 0
            }
            res.json(data)
        })
    })

    orders.get('/inCustomer/:customer_id', (req, res) => {
        var id = req.params.customer_id;
        knex
        .select('order_place.order_id', 'shopping_cart.product_id', 'shopping_cart.attributes', 'product.name as product_name', 'shopping_cart.quantity', 'product.price as unit_cost')
        .from('order_place')
        .join('orders', {'orders.customer_id' : 'order_place.customer_id'})
        .join('shopping_cart', {'shopping_cart.cart_id' : 'order_place.cart_id'})
        .join('product', {'product.product_id' : 'shopping_cart.product_id'})
        .where('order_place.customer_id', id)
        .then((data) => {
            var total = 0;
            for(let i of data){
                total+=i['unit_cost']*i['quantity']
                i['sub_total'] = total
            }
            res.json(data)
        })
    })

    orders.get('/shortDetail/:order_id', (req, res) => {
        var id = req.params.order_id;
        knex
        .select('orders.order_id', 'product.name', 'shopping_cart.quantity', 'product.price' )
        .from('orders')
        .join('order_place', {'orders.customer_id' : 'order_place.customer_id'})
        .join('shopping_cart', {'shopping_cart.cart_id' : 'order_place.cart_id'})
        .join('product', {'product.product_id' : 'shopping_cart.product_id'})
        .where('orders.order_id', id)
        .then((data) => {
            var total = 0;
            for(let i of data){
                total+=i['price']*i['quantity']
            }
            var newData = {}
            newData['order_id'] = data[0]['order_id']
            newData['total_amount'] = total
            newData['created_on'] = new Date()
            newData['status'] = "paid"
            res.json(newData)
        })
    })
}