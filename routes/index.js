const express = require('express');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jsonwebtoken = require('jsonwebtoken');

const jwtSecret = require('../auth/jwt-secret');

const Member = require('../models').Member;
const Registrant = require('../models').Registrant;

var router = express.Router();

/* GET base route */
router.get('/', function(req, res, next) {
  res.status(200).end('eServices Backend v0.1.0');
});

/* POST vacuum */
router.post('/vacuum', function(req, res, next) {
  let db = new sqlite3.Database('./esports_old.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      res.status(500).end();
      console.log(err.message);

      return;
    }

    db.run('VACUUM;', [], (err) => {
      if (err) {
        res.status(500).end();
        console.log(err.message);

        return;
      }

      res.status(200).end();
    });
  });
});

router.post('/register', (req, res, next) => {
  passport.authenticate('register', {session: false}, (err, user, info) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);

      return;
    }

    if (info !== undefined) {
      console.log(info.message);
      res.status(400).send(info.message);
    } else {
      req.logIn(user, err => {
        if (err) {
          console.log(err);
          next(createError(err));

          return;
        }

        bcrypt.hash(req.body.password, 10).then(hash => {
          Registrant.findOne({
            where: {
              email: req.body.email
            }
          }).then(user => {
            user.update({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              phone: req.body.phone,
              passwordHash: hash
            }).then(() => {
              res.status(200).send('User successfully registered');
            });
          });
        });
      });
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', {}, (err, user, info) => {
    if (err) {
      console.log(err);
      return;
    }
	
	if (info) {
	  console.log(info.message);
	  res.send(info.message);
	} else {
	  req.logIn(user, err => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);

          return;
        }

        Member.findOne({
          where: {
            id: user.id
          }
        }).then(user => {
          const token = jsonwebtoken.sign({id: user.id}, jwtSecret.secret);

          res.send({
            auth: true,
            token: token
          });
        });
      });
	}

    
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  if (req.user) {
    req.logout()
    res.send('User logged out');
  } else {
    res.send('No user to log out');
  }
});

module.exports = router;
