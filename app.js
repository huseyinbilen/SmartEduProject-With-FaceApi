const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');

const app = express();

let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );

const pageRoute = require('./routes/pageRoutes');
const courseRoute = require('./routes/courseRoutes');
const categoryRoute = require('./routes/categoryRoutes');
const userRoute = require('./routes/userRoutes');
let stream = require( './ws/stream' );



// Connect DB
mongoose
  .connect('mongodb://localhost:27017/smart-edu-v2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('DB Connected Successfully.');
  });


// Template Engine
app.set('view engine', 'ejs');

// Global Variable
global.userIN = null;

// Middlewares
app.use(express.static('public'));
app.use( '/public', express.static( path.join( __dirname, 'public' ) ) );
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(
  session({
    secret: 'my_keyboard_cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017/smart-edu-v2',
    }),
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});
app.use(
  methodOverride('_method', {
    methods: ['POST', 'GET'],
  })
);

// Routes
app.use('*', (req, res, next) => {
  userIN = req.session.userID;
  next();
});
app.use('/', pageRoute);
app.use('/courses', courseRoute);
app.use('/categories', categoryRoute);
app.use('/users', userRoute);

// app.get('/test', (req, res) => {
//   res.render('photoAdd', {
//     page_name: 'Add Photo'
//   });
// });

// app.get( '/live', ( req, res ) => {
//   res.sendFile( __dirname + '/views/room.html' );
// } );


io.of( '/stream' ).on( 'connection', stream );


// const port = 5000;
// app.listen(port, () => {
//   console.log(`App Started on port ${port}`);
// });

server.listen( 3000, () => {
  console.log('App Started on port 3000');
} );
