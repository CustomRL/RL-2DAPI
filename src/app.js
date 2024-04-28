const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

const services = require('./routes/services');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/Services', services);



// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError.NotFound());
});

// pass any unhandled errors to the error handler
app.use(errorHandler);
require('./ws/ws');

module.exports = app;
