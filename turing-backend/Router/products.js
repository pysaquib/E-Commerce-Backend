module.exports = (products, knex) => {
    products.get('/', (req, res) => {
        knex.select('product_id' ,'name' ,'description', 'price', 'discounted_price', 'thumbnail')
        .from('product')
        .then(function(data){
            return res.json(data)
        });
    });

    // pending......
    products.get('/search/:search', (req, res) => {
        const search = (req.params.search)
        knex.select('product_id', 'name', 'description', 'price', 'discounted_price', 'thumbnail')
        .from('product')
        .where('name', 'like', search)
        .orWhere('name', 'like', search+' %')
        .orWhere('name', 'like', '% '+search)
        .orWhere('description', 'like', '%'+search+'%')
        .then((data) => {
            return res.json(data)
        });
    });
    // pending......

    products.get('/:product_id', (req, res) => {
        const id = req.params.product_id
        knex.select('*').from('product').where('product_id', id)
        .then((data) => {
            return res.json(data)
        });
    });

    products.get('/inCategory/:category_id', (req, res) => {
        const id = req.params.category_id
        knex.select('product.product_id', 'product.name', 'product.description', 'price', 'discounted_price', 'thumbnail')
        .from('product')
        .join('product_category', 'product.product_id', 'product_category.product_id')
        .where('product_category.category_id', id)
        .then((data) => {
            return res.json(data)
        });
    });


    products.get('/inDepartment/:department_id', (req, res) => {
        const id = req.params.department_id
        knex.select('product.product_id', 'product.name', 'product.description', 'product.price', 'product.discounted_price', 'product.thumbnail', 'display')
        .from('product')
        .join('product_category', {'product.product_id':'product_category.product_id'})
        .join('category', {'product_category.category_id' : 'category.category_id'})
        .where('category.department_id', id)
        .then((data) => {
            return res.json(data)
        });
    });

    products.get('/:product_id/details', (req, res) => {
        const id = req.params.product_id
        knex.select('product.product_id', 'product.name', 'product.description', 'product.price', 'product.discounted_price', 'product.image', 'product.image_2')
        .from('product')
        .where('product_id', id)
        .then((data) => {
            return res.json(data)
        });
    });

    products.get('/:product_id/locations', (req, res) => {
        const id = req.params.product_id
        knex.select('category.category_id', 'category.name as category_name', 'category.department_id', 'department.name as department_name')
        .from('product_category')
        .join('category', 'product_category.category_id', 'category.category_id')
        .join('department', {'category.department_id' : 'department.department_id'})
        .where('product_category.product_id', id)
        .then((data) => {
            return res.json(data)
        });
    });
}