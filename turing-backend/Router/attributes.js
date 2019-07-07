module.exports = (attributes, knex) => {
    attributes.get('/', (req, res) => {
        knex.select('*').from('attribute')
        .then((data) => {
            return res.json(data)
        });
    });

    attributes.get('/:attribute_id', (req, res) => {
        const id = req.params.attribute_id
        knex.select('*').from('attribute').where('attribute_id', id)
        .then((data) => {
            return res.json(data[0])
        });
    });

    attributes.get('/values/:attribute_id', (req, res) => {
        const id = req.params.attribute_id
        knex.select('attribute_value.attribute_value_id', 'value')
        .from('attribute')
        .join('attribute_value', {'attribute.attribute_id' : 'attribute_value.attribute_id'})
        .where('attribute.attribute_id', id)
        .then((data) => {
            return res.json(data)
        });
    });

    attributes.get('/inProduct/:product_id', (req, res) => {
        const id = req.params.product_id
        knex.select('attribute.name', 'attribute_value.attribute_value_id', 'attribute_value.value')
        .from('product_attribute')
        .join('attribute_value', {'product_attribute.attribute_value_id' : 'attribute_value.attribute_value_id'})
        .join('attribute', {'attribute_value.attribute_id' : 'attribute.attribute_id'})
        .where('product_attribute.product_id', id)
        .then((data) => {
            return res.json(data)
        })
    })
}