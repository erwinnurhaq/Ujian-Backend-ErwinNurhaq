const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const util = require('util')

const PORT = process.env.PORT || 2000
const app = express()

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'enurhaq',
    password: 'lollipop.',
    database: 'tokokasih',
    port: 3306,
    multipleStatements: true
})

//promisify conn.query to use promise for async await
const connquery = util.promisify(conn.query).bind(conn)

app.use(cors())
app.use(bodyParser.json())

//test
app.get('/', (req, res) => {
    res.status(202).send('API WORKS!')
})


//CATEGORIES----------------------------------------------------------------------------

//get all categories
app.get('/categories', async (req, res) => {
    try {
        const query = `SELECT * FROM category_complete`
        let result = await connquery(query)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//get sub categories that have no child
app.get('/categories/verychild', async (req, res) => {
    try {
        const query = `select c.* from categories c
                    left join categories b on c.id = b.parentId
                    where b.parentId is null`
        let result = await connquery(query)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//get category by name
app.get('/categories/:name', async (req, res) => {
    try {
        const query = `SELECT * FROM category_complete
                        WHERE category = ${conn.escape(req.params.name)}`
        let result = await connquery(query)
        if (result.length === 0) {
            return res.status(404).send({ message: 'category not found' })
        }
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//add new category
app.post('/categories', async (req, res) => {
    try {
        const query = `INSERT INTO categories SET ?`
        let result = await connquery(query, {
            category: req.body.category,
            parentId: req.body.parentId
        })
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//edit category by id
app.put('/categories/:id', async (req, res) => {
    try {
        const query = `UPDATE categories SET ? WHERE id = ${conn.escape(req.params.id)}`
        let result = await connquery(query, {
            category: req.body.category,
            parentId: req.body.parentId
        })
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'category id not found' })
        }
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete category and it's children
app.delete('/categories/:id', async (req, res) => {
    try {
        //auto with foreignkey constraint
        let result = await connquery(`DELETE FROM categories WHERE id = ${conn.escape(req.params.id)}`)
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'product id not found' })
        }
        // Manual
        // let deleteId = [parseInt(req.params.id)];
        // while (deleteId) {
        //     await connquery(`DELETE FROM categories WHERE id IN (${conn.escape(deleteId)})`)
        //     let find = await connquery(`SELECT * FROM categories WHERE parentId IN (${conn.escape(deleteId)})`)
        //     if (find.length !== 0) {
        //         deleteId = find.map(i => i = i.id)
        //         console.log(deleteId)
        //     } else {
        //         deleteId = null
        //     }
        // }
        res.status(200).send({ message: "deleted successfully" })
    } catch (error) {
        res.status(500).send(error)
    }
})

//PRODUCTS----------------------------------------------------------------------------

//get all products
app.get('/products', async (req, res) => {
    try {
        const result = await connquery(`SELECT * FROM products`)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//get product by id and it's categories
app.get('/products/:id', async (req, res) => {
    try {
        let result = await connquery(`SELECT * FROM products WHERE id = ${conn.escape(req.params.id)}`)
        // if want to add categories
        // let catQuery = `SELECT c.category FROM productcat pc
        //                 join categories c on pc.categoryId = c.id
        //                 where pc.productId = ${conn.escape(result[0].id)}`
        // let categories = await connquery(catQuery)
        // result[0].categories = categories.map(i => i = i.category).reverse()
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//get product by category
app.get('/products/categories/:category', async (req, res) => {
    try {
        const query = `select p.* from products p
                        join productcat pc on pc.productId = p.id
                        join categories c on pc.categoryId = c.id
                        where category = ${conn.escape(req.params.category)}`
        let result = await connquery(query)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//add new product
app.post('/products', async (req, res) => {
    try {
        const query = `INSERT INTO products SET ?`
        let result = await connquery(query, {
            nama: req.body.nama,
            description: req.body.description,
            harga: req.body.harga
        })
        // console.log(result)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//edit product
app.put('/products/:id', async (req, res) => {
    try {
        // for (const key in req.body) {
        //     if (req.body[key] === '' || req.body[key] === null) {
        //         delete req.body[key]
        //     }
        // }
        const query = `UPDATE products SET ? WHERE id = ${conn.escape(req.params.id)}`
        let result = await connquery(query, {
            nama: req.body.nama,
            description: req.body.description,
            harga: req.body.harga
        })
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete product by id
app.delete('/products/:id', async (req, res) => {
    try {
        let result = await connquery(`DELETE FROM products WHERE id = ${conn.escape(req.params.id)}`)
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'product id not found' })
        }
        // await connquery(`DELETE FROM productcat WHERE productId = ${conn.escape(req.params.id)}`)
        res.status(200).send({ message: 'deleted successfully' })
    } catch (error) {
        res.status(500).send(error)
    }
})


//PRODUCT CATEGORIES----------------------------------------------------------------------------

//get sub categories that have no child
//on CATEGORIES SECTION ABOVE!

//get product category
app.get('/productcat', async (req, res) => {
    try {
        const query = `SELECT pc.id, p.nama, c.category FROM productcat pc
        join products p on p.id = pc.productId
        join categories c on c.id = pc.categoryId`
        let result = await connquery(query)
        res.status(200).send(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

//assign product category
app.post('/productcat', async (req, res) => {
    try {
        let catId = req.body.categoryId
        while (catId) {
            await connquery(`INSERT INTO productcat SET ?`, {
                categoryId: catId,
                productId: req.body.productId
            })
            let find = await connquery(`SELECT * FROM categories WHERE id = ?`, [catId])
            if (find.length !== 0) {
                catId = find[0].parentId
                console.log(catId)
            } else {
                catId = null
            }
        }
        res.status(200).send({ message: 'categories is assigned successfully' })
    } catch (error) {
        res.status(500).send(error)
    }
})

//delete assigned product category
app.delete('/productcat/:productId', async (req, res) => {
    try {
        let result = await connquery(`DELETE FROM productcat WHERE productId = ${conn.escape(req.params.productId)}`)
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'product id not found' })
        }
        res.status(200).send({ message: 'deleted successfully' })
    } catch (error) {
        res.status(500).send(error)
    }
})

//----------------------------------------------------------------------------


app.listen(PORT, console.log('server listen on port:', PORT))