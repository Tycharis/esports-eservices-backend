const express = require('express');
const passport = require('passport');
const Qualification = require('../models').Qualification;
const CompletedQualification = require('../models').CompletedQualification;

const router = express.Router();

/* GET qualification list */
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

    Qualification.findAll().then(quals => {
      res.status(200).json(quals);
    });
  })(req, res, next);
});

/* POST qualification creation */
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

    Qualification.create({
      code: req.body.code,
      name: req.body.name
    }).then(() => {
      res.status(200).send('Qualification created');
    });
  })(req, res, next);
});

/* DELETE qualification */
router.delete('/', (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Qualification.destroy({
      where: {
        id: req.query.qualId
      }
    }).then(() => {
      res.status(200).send('Qualification deleted');
    });
  })(req, res, next);
});

/* PUT qualification update */
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

    Qualification.update({
      code: req.body.code,
      name: req.body.name,
      approvedTime: null
    }, {
      where: {
        id: req.body.qualId
      }
    }).then(() => {
      res.status(200).send('Qualification updated');
    });
  })(req, res, next);
});

/* GET pending approvals */
router.get('/approvals', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).end(err.message);
      console.log(err);

      return;
    }

    if (!(user && (user.grade === 5 || user.grade === 9 || user.grade === 10))) {
      res.status(403).end();
      return;
    }

    CompletedQualification.findAll().then(quals => {
      res.status(200).json(quals);
    });
  })(req, res, next);
});

/* POST qualification approval */
router.post('/approvals', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }

    if (!(user && (user.grade === 5 || user.grade === 9 || user.grade === 10))) {
      res.status(401).end();
      return;
    }

    CompletedQualification.update({
      approvedTime: req.body.approved ? new Date('now').getTime() / 1000 : -1
    }, {
      where: {
        escid: req.body.escid,
        qualificationId: req.body.qualId
      }
    }).then(() => {
      res.status(200).send(`Qualification ${req.body.approved ? 'approved' : 'denied'}`);
    }).catch(err => {
	  console.log(err);
	  res.status(500).send(err.message);
	});
  })(req, res, next);
});

/* GET completed qualification for user */
router.get('/complete', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
	if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }
	
	CompletedQualification.findOne({
	  where: {
		MemberId: req.query.escid,
		QualificationId: req.query.qualId
	  }
	}).then(qual => {
	  res.status(200).json(qual);
	}).catch(err => {
      console.log(err);
	  res.status(500).send(err.message);
	});
  })(req, res, next);
});

/* DELETE completed qualification */
router.delete('/complete', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
	if (err) {
      res.status(500).send(err.message);
      console.log(err);

      return;
    }
	
	CompletedQualification.destroy({
	  where: {
		MemberId: req.query.escid,
		QualificationId: req.query.qualId
	  }
	}).then(() => {
	  res.status(200).send('Qualification removed for user');
	}).catch(err => {
      console.log(err);
	  res.status(500).send(err.message);
	});
  })(req, res, next);
});

module.exports = router;
