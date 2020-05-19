const bcrypt = require('bcrypt');

const jwtSecret = require('./jwt-secret');

const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Registrant = require('../models').Registrant;
const Member = require('../models').Member;

const register = new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, function (username, password, done) {
  try {
    Registrant.findOne({
      where: {
        email: username
      }
    }).then(user => {
      console.log(user);

      if (user !== null) {
        return done(null, false, {message: "User already in queue"})
      }

      bcrypt.hash(password, 10).then(hash => {
        Registrant.create({
          lastName: "",
          email: username,
          passwordHash: hash
        }).then(user => {
          return done(null, user);
        });
      });
    });
  } catch (err) {
    done(err);
  }
});

const login = new LocalStrategy({
  usernameField: 'escid',
  passwordField: 'password',
  session: false
}, function (username, password, done) {
  try {
    Member.findOne({
      where: {
        id: username
      }
    }).then(user => {
      if (user === null) {
        done(null, false, {message: 'Username or password incorrect'});
      }

      bcrypt.compare(password, user.passwordHash).then(response => {
        if (!response) {
          done(null, false, {message: 'Username or password incorrect'});
        }

        done(null, user);
      });
    });
  } catch (err) {
    done(err);
  }
});

const jwt = new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret.secret
}, function (jwt_payload, done) {
  try {
    Member.findOne({
      where: {
        id: jwt_payload.id
      }
    }).then(user => {
      if (user) {
        done(null, user);
        return;
      }

      done(null, false);
    });
  } catch (err) {
    done(err);
  }
});

module.exports = {
  register: register,
  login: login,
  jwt: jwt
};
