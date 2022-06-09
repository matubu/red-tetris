import express from 'express'
import { connect } from './connect.js'

let app = express()
let db = connect()

app.get('/', (req, res) => {
	res.send('Hello world')
})

app.listen(4000)