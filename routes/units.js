const express = require('express');
const passport = require('passport');

const Unit = require('../models').Unit;
const Member = require('../models').Member;

const router = express.Router();

/* GET unit listing */
router.get('/', (req, res, next) => {
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
	
	if (req.query.id) {
	  Unit.findOne({
		where: {
		  id: req.query.id
		}
	  }).then(unit => {
		res.status(200).json(unit);
	  }).catch(err => {
		console.log(err);
		res.status(500).send(err.message);
	  });
	  
	  return;
	}

    Unit.findAll().then(units => {
      res.status(200).json(units);
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message)
    });
  })(req, res, next);
});

/* POST unit creation */
router.post('/', (req, res, next) => {
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

    Unit.create({
      charter: req.body.charter,
      name: req.body.name,
      parent: req.body.parent
    }).then(() => {
      res.status(200).send('Unit created');
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* PUT unit update */
router.put('/', (req, res, next) => {
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

    Unit.update({
      charter: req.body.charter,
      name: req.body.name,
      parent: req.body.parent
    }, {
      where: {
        id: req.body.unitId
      }
    }).then(() => {
      res.status(200).send('Unit updated');
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* DELETE unit */
router.delete('/', (req, res, next) => {
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

    Unit.destroy({
      where: {
        id: req.body.unitId
      }
    }).then(() => {
      res.status(200).send('Unit deleted');
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET unit leader */
router.get('/leader', (req, res, next) => {
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

    Member.findOne({
      where: {
        UnitId: req.query.id,
        leadership: 1
      },
      attributes: ['firstName', 'lastName', 'grade']
    }).then(user => {
      res.status(200).json(user);
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST unit leader assignment */
router.post('/leader', (req, res, next) => {
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

    if (req.body.promotion) {
      Member.findOne({
        where: {
          UnitId: req.body.unitId,
          leadership: 1
        }
      }).then(user => {
        if (user) {
          res.status(400).send('There is already a leader assigned to this unit');
          return;
        }

        Member.findOne({
          where: {
            id: req.body.escid
          }
        }).then(member => {
          if (member.UnitId !== req.body.unitId) {
            res.status(400).send('Listed member not a member of listed unit');
            return;
          }

          member.update({
            leadership: 1,
            grade: member.grade < 1 ? 1 : member.grade
          }, {
            where: {
              id: req.body.escid
            }
          }).then(() => {
            res.status(200).send('Unit leader changed');
          }).catch(err => {
            console.log(err);
            res.status(500).send(err.message);
          });
        }).catch(err => {
          console.log(err);
          res.status(500).send(err.message);
        });
      }).catch(err => {
        console.log(err);
        res.status(500).send(err.message);
      });

      return;
    }

    Member.update({
      leadership: 0
    }, {
      where: {
        id: req.body.escid,
        UnitId: req.body.unitId
      }
    }).then(() => {
      res.status(200).send('Leader removed');
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST unit member assignment */
router.post('/member', (req, res, next) => {
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

    Member.update({
      UnitId: req.body.unitId
    }, {
      where: {
        id: req.body.escid
      }
    }).then(() => {
      res.status(200).send('Member assigned to unit');
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET unit member count */
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

    Member.count({
      where: {
        UnitId: req.query.id
      }
    }).then(count => {
      res.status(200).send({count: count});
    }).catch(err => {
      console.log(err);
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

module.exports = router;