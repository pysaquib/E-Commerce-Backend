module.exports = (shipping, knex) => {
    shipping.get('/region', (req, res) => {
        knex.select('*').from('shipping_region')
        .then((data) => {
            res.json(data)
        })
    })

    shipping.get('/region/:region_id', (req, res) => {
        var id = req.params.region_id
        knex.select('*').from('shipping').where('shipping_region_id', id)
        .then((data) => {
            res.json(data)
        })
    })
}