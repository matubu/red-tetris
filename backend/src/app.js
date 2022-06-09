import express from 'express'
import { connect } from './mongodb'

let app = express()
let db = await connect()

app.get('/', (req, res) => {
	res.send('Hello world')
})

app.listen(4000)