module.exports = (tax, knex) => {
    tax.get('/', (req, res) => {
        knex.select('*').from('tax')
        .then((data) => {
            res.json(data)
        })
    })
    tax.get('/:tax_id', (req, res) => {
        var id = req.params.tax_id
        knex.select('*').from('tax').where('tax_id', id)
        .then((data) => {
            res.json(data)
        })
    })
}