module.exports = (departments, knex) => {
    departments.get('/', (req, res) => {
        knex.select('department_id', 'name', 'description').from('department')
        .then((data)=>{
            return res.json(data)
        })
    })

    departments.get('/:department_id', (req, res) => {
        var id = req.params.department_id;
        knex.select('department_id', 'name', 'description').from('department').where('department_id', id)
        .then((data)=>{
            return res.json(data[0])
            })
        })
    }