const express = require('express');
const passport = require('passport');
const Event = require('../models').Event;

const router = express.Router();

/* GET event list */
router.get('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).end('Failed to authenticate');

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Event.findAll().then(events => {
      res.status(200).json(events);
    });
  })(req, res, next);
});

/* POST event creation */
router.post('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).end('Failed to authenticate');

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Event.create({
      name: req.body.name,
      location: req.body.location,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    }).then(() => {
      res.status(200).send('Event created');
    });
  })(req, res, next);
});

/* DELETE event */
router.delete('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      console.log(err);
      res.status(500).end('Failed to authenticate');

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Event.destroy({
      where: {
        id: req.query.id
      }
    }).then(() => {
      res.status(200).send('Event deleted');
    });
  })(req, res, next);
});

/* POST event update */
router.put('/', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user) => {
    if (err) {
      res.status(500).end('Could not access database');
      console.log(err.message);

      return;
    }

    if (!user) {
      res.status(401).end();
      return;
    }

    Event.update({
      name: req.body.name,
      location: req.body.location,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    }, {
      where: {
        id: req.body.eventId
      }
    }).then(() => {
      res.status(200).send('Event updated');
    });
  })(req, res, next);
});

module.exports = router;
