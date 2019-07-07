module.exports = (shoppingcart, knex) => {
    // Generate a unique cart id for each user
    shoppingcart.get('/generateUniqueId', (req, res) => {
        var alphabets = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        var all = alphabets.split("");
        var unique = "";
        for(let i = 0; i<18; i++){
            unique=unique+(all[(Math.floor(Math.random()*(all.length-1)))])
        }
        const cartId = {'cart_id' : unique}
        res.json(cartId)
    })

    // Add products in cart using cart_id
    shoppingcart.post('/add', (req, res) => {
        var cart = {
            'cart_id' : req.body.cart_id,
            'product_id' : req.body.product_id,
            'attributes' : req.body.attributes,
            'quantity' : req.body.quantity
        }
        knex('shopping_cart').insert({
            'cart_id' : cart['cart_id'], 
            'product_id' : cart['product_id'],
            'attributes' : cart['attributes'],
            'quantity' : cart['quantity'],
            'added_on' : new Date()
        })
        .then(() => {
            knex
            .select('item_id', 'product.name', 'shopping_cart.attributes', 'product.product_id', 'product.price', 'shopping_cart.quantity', 'product.image')
            .from('shopping_cart')
            .join('product', {'product.product_id' : 'shopping_cart.product_id'})
            .where('cart_id', cart['cart_id'])
            .then((data) => {
                for(let i of data){
                    i['subtotal'] = Number(i.price) * Number(i.quantity)
                }
                return res.json(data)
            });
        });
    });

    // Get cart details using cart_id
    shoppingcart.get('/:cart_id', (req, res) => {
        var id = req.params.cart_id
        knex
        .select('item_id', 'product.name', 'shopping_cart.attributes', 'product.product_id', 'product.price', 'shopping_cart.quantity', 'product.image')
        .from('shopping_cart')
        .where('cart_id', id)
        .join('product', {'product.product_id' : 'shopping_cart.product_id'})
        .then((data) => {
            for(let i of data){
                i['subtotal'] = Number(i.price) * Number(i.quantity)
            }
            return res.json(data)
        });
    });
    
// Update a cart by item_id
    shoppingcart.put('/update/:item_id', (req, res) => {
        var id = req.params.item_id
        var quantity = req.body.quantity
        knex('shopping_cart')
        .where({'item_id': id})
        .update({'quantity' : req.body.quantity})
        .then(() => {
            knex
            .select('item_id', 'product.name', 'shopping_cart.attributes', 'product.product_id', 'product.price', 'shopping_cart.quantity', 'product.image')
            .from('shopping_cart')
            .where('item_id', id)
            .join('product', {'product.product_id' : 'shopping_cart.product_id'})
            .then((data) => {
                for(let i of data){
                    i['subtotal'] = Number(i.price) * Number(i.quantity)
                }
                return res.json(data)
            });
        });
    });
// Empty a cart by deleting all elements
    shoppingcart.delete('/empty/:cart_id', (req, res) => {
        var id = req.params.cart_id
        knex('shopping_cart')
        .where('cart_id', id)
        .delete()
        .then(() => {
            return res.sendStatus(200)
        });
    });

// Save items from cart
    shoppingcart.get('/saveForLater/:item_id', (req, res) => {
        var item_id = req.params.item_id
        knex.schema.hasTable('save_later')
        .then((exists) => {
            if(!exists){
                return knex.schema.createTable('save_later', (table) => {
                    table.integer('item_id', 100).primary();
                    table.integer('product_id');
                    table.string('cart_id', 30);
                    table.string('attributes', 100);
                    table.boolean('Item_Saved').default(1);
                })
            }
            knex.select('cart_id', 'product_id', 'attributes')
            .from('shopping_cart')
            .where('item_id', item_id)
            .then((data) => {
                knex('save_later')
                .insert({
                    'item_id': item_id,
                    'product_id' : data[0]['product_id'],
                    'cart_id' : data[0]['cart_id'],
                    'attributes' : data[0]['attributes']
                })
                .then(() => {
                    knex.select('*').from('save_later')
                    .then((data) => {
                        res.json(data)
                        knex('shopping_cart')
                        .where('item_id', item_id)
                        .del()
                        .then(()=>{          
                        })
                    });
                });    
            });
        });
    });
    //Get saved products details by cart_id 
    shoppingcart.get('/saveForLater/getSaved/:cart_id', (req, res) => {
        var cart_id = req.params.cart_id
        knex
        .select('save_later.item_id', 'name', 'price', 'attributes')
        .from('save_later')
        // .join('shopping_cart', {'save_later.cart_id' : 'shopping_cart.cart_id'})
        .join('product', {'product.product_id' : 'save_later.product_id'})
        .where('save_later.cart_id', cart_id)
        .then((data) => {
            return res.json(data)
        });
    });
// Move item from saved_later to shopping_cart
    shoppingcart.get('/moveToCart/:item_id', (req, res) => {
        var item_id = req.params.item_id;
        knex
        .select('*')
        .from('save_later')
        .then((data) => {
            data[0]['added_on'] = new Date();
            knex('shopping_cart')
            .insert({
                'item_id' : data[0]['item_id'],
                'cart_id' : data[0]['cart_id'],
                'product_id' : data[0]['product_id'],
                'attributes' : data[0]['attributes'],
                'quantity' : 1,
                'added_on' : data[0]['added_on']
            })
            .then(()=>{
                knex('save_later')
                .where('item_id', item_id)
                .del()
                .then(()=>{
                    knex
                    .select('*')
                    .from('shopping_cart')
                    .where('item_id', item_id)
                    .then((data) => {
                        res.json(data)
                    });
                });
            });
        });
    });

// Get total amount
    shoppingcart.get('/totalAmount/:cart_id', (req, res) => {
        var cart_id = req.params.cart_id;
        knex
        .select('cart_id', 'shopping_cart.product_id', 'price', 'quantity')
        .from('shopping_cart')
        .join('product', {'product.product_id' : 'shopping_cart.product_id'})
        .where('cart_id', cart_id)
        .then((data) => {
            var total = {'total' : 0};
            for(let i of data){
                total['total'] += i['price'] * i['quantity']
            }
            res.json(total)
        });
    });

    //Delete item by item_id 
    shoppingcart.get('/removeProduct/:item_id', (req, res) => {
        var item_id = req.params.item_id;
        knex('shopping_cart')
        .where('item_id', item_id)
        .del()
        .then(() => {
            return res.sendStatus(200)
        });
    });
}
