import express from 'express';
import bodyParser from 'body-parser';
import connect from '../config/connectDB.js';
import cors from 'cors';
import dotenv from 'dotenv';
import route from './route/index.js';
dotenv.config();
connect();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const corsOption = {};
app.use(cors(corsOption));

route(app);
app.listen(3000, ()=> {
    console.log("server is listening on port 3000")
})