require('dotenv').config();

const express = require('express')
const cors = require('cors');
const createError = require('http-errors')
const mongoose = require('mongoose');
const logger = require('morgan');
const jwt = require('jsonwebtoken')

require('./config/db.config');


const app = express();

/* Middlewares */

app.use(cors())
app.use(express.json())
app.use(logger('dev'))

/* Routes */

const routes = require('./config/routes')
app.use('/api', routes)

/* Handle errors */

app.use((req, res, next) => {
    next(createError(404, 'Page not found'))
})

app.use((error, req, res, next) => {
    if (error instanceof mongoose.Error.ValidationError) {
        error = createError(400, error);
        console.log(error)
    } else if (error instanceof mongoose.Error.CastError) {
        error = createError(404, "Resource not found");
    } else if (error.message && error.message.includes("E11000")) {
        error = createError(400, "Already exists");
    } else if (error instanceof jwt.JsonWebTokenError) {
        error = createError(401, error);
    } else if (!error.status) {
        error = createError(500, error);
    }
    if (error.status >= 500) {
        console.error(error);
    }

    const data = {};
    data.message = error.message;
    data.errors = error.errors
        ? Object.keys(error.errors).reduce(
            (errors, key) => ({
                ...errors,
                [key]: error.errors[key].message || error.errors[key],
            }),
            {}
        )
        : undefined;

    res.status(error.status).json(data);
})

/**
 * Port we are going to use
 */

const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
    console.log(`Ey! Your port ${port} is now available!`);
});
