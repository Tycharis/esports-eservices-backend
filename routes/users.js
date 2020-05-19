const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const Member = require('../models').Member;
const Registrant = require('../models').Registrant;

const router = express.Router();

const saltRounds = 10;

/* GET users listing. */
router.get('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }
	
	if (req.query.id) {
	  Member.findOne({
		where: {
		  id: req.query.id
		}
	  }).then(member => {
		res.status(200).json(member);
	  }).catch(err => {
		console.log(err);
		res.status(500).send(err.message);
	  });
	  
	  return;
	}
	
	if (req.query.grade) {
	  Member.findOne({
		where: {
		  grade: req.query.grade
		}
	  }).then(member => {
		res.status(200).json(member);
	  }).catch(err => {
		console.log(err);
		res.status(500).send(err.message);
	  });
	  
	  return;
	}

    Member.findAll({
      attributes: {
        exclude: ['passwordHash']
      }
    }).then(users => {
      res.status(200).json(users);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET self */
router.get('/me', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Member.findOne({
      attributes: {
        exclude: ['passwordHash']
      },
      where: {
        id: user.id
      }
    }).then(member => {
      res.status(200).json(member);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET member count */
router.get('/count', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Member.count().then(count => {
      res.status(200).send({count: count});
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* DELETE user */
router.delete('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Member.destroy({
      where: {
        id: req.body.escid
      }
    }).then(() => {
      res.status(200).send('Member deleted');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST update user */
router.put('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).send(err.message);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Member.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone
    }, {
      where: {
        id: req.body.escid
      }
    }).then(() => {
      res.status(200).send('User updated');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST password update */
router.post('/password', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, payload) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);

      return;
    }

    Member.findOne({
      where: {
        id: payload.id
      }
    }).then((user) => {
      bcrypt.compare(req.body.password, user.passwordHash, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send(err.message);

          return;
        }

        if (result) {
          bcrypt.hash(req.body.newPassword, saltRounds, (err, hash) => {
            if (err) {
              res.status(500).end(err.message);
              console.log(err.message);

              return;
            }

            Member.update({
              passwordHash: hash
            }, {
              where: {
                id: payload.id
              }
            }).then(() => {
              res.status(200).send('Password updated');
            }).catch(err => {
              res.status(500).send(err.message);
            });
          });

          return;
        }

        res.status(401).send();
      });
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST membership action */
router.post('/action', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }

    console.log(user);

    if (!user) {
      res.status(401).end();
      return;
    }

    Member.update({
      grade: req.body.grade,
      status: req.body.status
    }, {
      where: {
        id: req.body.escid
      }
    }).then(() => {
      res.status(200).send('Member updated');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET registration approvals */
router.get('/register', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Registrant.findAll({
      attributes: {
        exclude: ['passwordHash', 'phone']
      }
    }).then(approvals => {
      res.status(200).json(approvals);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST registration approval */
router.post('/register', (req, res, next) => {
  // passport.authenticate('jwt', {session: false}, (err, user) => {
  //   if (err) {
  //     res.status(500).send(err.message);
  //     console.log(err);
  //
  //     return;
  //   }

    // if (!user) {
    //   res.status(401).end();
    //   return;
    // }

    if (req.body.approved) {
      Registrant.findOne({
        where: {
          email: req.body.email
        }
      }).then(registrant => {
        if (!registrant) {
          res.status(400).send('No such registrant in queue');
          return;
        }

        Member.create({
          firstName: registrant.firstName,
          lastName: registrant.lastName,
          email: registrant.email,
          phone: registrant.phone,
          passwordHash: registrant.passwordHash
        }).then(() => {
          res.status(200).send('Membership approved');
        }).catch(err => {
          res.status(500).send(err.message);
        });

        registrant.destroy().then(() => {
          console.log('Registration removed');
        });
      });
    } else {
      Registrant.destroy({
        where: {
          email: req.body.email
        }
      }).then(() => {
        res.status(200).send('Membership denied');
      }).catch(err => {
        res.status(500).send(err.message);
      });
    }
  // })(req, res, next);
});

module.exports = router;
