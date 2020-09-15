require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const cors         = require('cors');
const session      = require('express-session');
const passport     = require('passport');

//create file passport.js
require('./configs/passport');



mongoose
  .connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`);
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('trust proxy', 1);
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// SESSION SETTINGS:
app.use(session ({
  secret: "adoptSeniorYoungster",
  resave: true,
  saveUnitialized: true,
  rolling: true,
  cookie: { expires: 600000, secure: true }
}));

// PASSPORT SETTINGS:
app.use(passport.initialize());
app.use(passport.session());


// default value for title local
app.locals.title = 'Adopt Senior Youngster';

//ALLOW CROSS-ORIGIN INTERACTION:
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://adopt-senior-youngster.s3-website-eu-west-1.amazonaws.com']
  })
);


//ROUTES MIDDLEWARE
const index = require('./routes/index');
app.use('/', index);
app.use('/api', require('./routes/auth-routes'));
app.use('/api', require('./routes/editUser-routes'));
app.use('/api', require('./routes/editVolunteer-routes'));
app.use('/api', require('./routes/reviews-routes'));
app.use('/api', require('./routes/checkIfRegistered-routes'));
app.use('/api', require('./routes/profilePicture-routes'));
app.use('/api', require('./routes/getAccountInfo'));
app.use('/api', require('./routes/getAllVolunteers'));
app.use('/api', require('./routes/reports-routes'));

module.exports = app;
