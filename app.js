const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const tasksRouter = require('./routes/tasks');
const eventsRouter = require('./routes/events');
const qualificationsRouter = require('./routes/qualifications');
const unitsRouter = require('./routes/units');

const Member = require('./models').Member;

const {register, login, jwt} = require('./auth/passport');

passport.use('register', register);
passport.use('login', login);
passport.use('jwt', jwt);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Member.findOne({
    where: {
      id: id
    }
  }).then(user => {
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);
app.use('/events', eventsRouter);
app.use('/qualifications', qualificationsRouter);
app.use('/units', unitsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send the error response
  res.status(err.status || 500);
  res.end(err.message);
});

module.exports = app;
