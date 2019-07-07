module.exports = (categories, knex) => {
    categories.get('/', (req, res) => {
        knex.select('*').from('category')
        .then((data) => {
            return res.json(data)
        });
    });

    categories.get('/:category_id', (req, res) => {
        const id = req.params.category_id
        knex.select('*').from('category').where('category_id', id)
        .then((data) => {
            return res.json(data[0])
        });
    });

    categories.get('/inProduct/:product_id', (req, res) => {
        const id = req.params.product_id
        knex.select('product_category.category_id', 'category.department_id', 'category.name')
        .from('product_category')
        .join('category', {'product_category.category_id' : 'category.category_id'})
        .where('product_id', id)
        .then((data) => {
            return res.json(data)
        });
    });

    categories.get('/inDepartment/:department_id', (req, res) => {
        const id = req.params.department_id
        knex.select('*').from('category').where('department_id', id)
        .then((data) => {
            return res.json(data)
        });
    });
}