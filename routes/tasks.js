const express = require('express');
const passport = require('passport');
const {Op} = require('sequelize');

const Task = require('../models').Task;
const Qualification = require('../models').Qualification;
const Requirement = require('../models').Requirements;
const CompletedTask = require('../models').CompletedTask;
const CompletedQualification = require('../models').CompletedQualification;

const router = express.Router();

/* GET task list */
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

    Task.findAll().then(tasks => {
      res.status(200).json(tasks);
    });
  })(req, res, next);
});

/* POST task creation */
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

    Task.create({
      name: req.body.name,
      description: req.body.description
    }).then(() => {
      res.status(200).send('Task created');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* DELETE task */
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

    Task.destroy({
      where: {
        id: req.query.taskId
      }
    }).then(() => {
      res.status(200).send('Task deleted');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* PUT task update */
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

    Task.update({
      name: req.body.name,
      description: req.body.name
    }, {
      where: {
        id: req.body.taskId
      }
    }).then(() => {
      res.status(200).send('Task updated');
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST task completion */
router.post('/complete', (req, res, next) => {
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

    //disable check

    if (user.id === req.body.escid) {
      res.status(400).send('Cannot assign self as evaluator');
      return;
    }

    CompletedQualification.findOne({
      where: {
        memberId: req.body.evaluatorId,
        qualId: req.body.qualId
      }
    }).then(qual => {
      if (qual) {

    //enable check

        CompletedTask.create({
          MemberId: req.body.escid,
          TaskId: req.body.taskId,
          EventId: req.body.eventId,
          evaluatorId: req.body.evaluatorId
        }).then(() => {
          res.status(200).send('Task marked complete');
        }).catch(err => {
          console.log(err);
          res.status(500).send(err.message);
        });

    //disable check

      } else {
        res.status(400).send('Listed evaluator is not qualified');
      }
    });

    //enable check
  })(req, res, next);
});

/* GET pending approvals */
router.get('/approvals', (req, res, next) => {
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

    CompletedTask.findAll({
      where: {
        evaluatorId: user.id,
        approvedTime: {
          [Op.is]: null
        }
      }
    }).then(tasks => {
      res.status(200).json(tasks);
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST task approval */
router.post('/approvals', (req, res, next) => {
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

    CompletedTask.update({
      approvedTime: req.body.approved ? new Date().getTime() : -1
    }, {
      where: {
        MemberId: req.body.escid,
        TaskId: req.body.taskId
      }
    }).then(() => {
      res.status(200).send('Task approved');
    }).catch(err => {
      res.status(500).send(err.message);
    });

    Requirement.findAll({
      where: {
        taskId: req.body.taskId
      }
    }).then(quals => {
      quals.forEach(qual => {
        Requirement.findAll({
          where: {
            qualId: qual.id
          }
        }).then(tasks => {
          let completed = true;

          tasks.forEach(task => {
            CompletedTask.findOne({
              where: {
                taskId: task.id,
                escid: req.body.escid
              }
            }).then(task => {
              if (task.approvedTime === null || task.approvedTime === -1) {
                completed = false;
              }
            }).catch(err => {
              res.status(500).send(err.message);
            });
          });

          if (completed) {
            CompletedQualification.create({
              escid: req.body.escid,
              qualId: qual.id
            }).then(() => {
              console.log('If this method works, this will print and you deserve a stiff drink');
            }).catch(err => {
              res.status(500).send(err.message);
            });
          }
        }).catch(err => {
          res.status(500).send(err.message);
        });
      });
    }).catch(err => {
      res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* POST task link */
router.post('/link', (req, res, next) => {
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
	
	console.log(req.body);

    Requirement.create({
      TaskId: req.body.taskId,
      QualificationId: req.body.qualId,
      category: req.body.category
    }).then(() => {
      res.status(200).send('Task linked to qualification');
    }).catch(err => {
      res.status(500).send(err);
    });
  })(req, res, next);
});

/* DELETE task link */
router.delete('/link', (req, res, next) => {
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
  
    Requirement.destroy({
	  where: {
	    TaskId: req.query.taskId,
	    QualificationId: req.query.qualId
	  }
    }).then(() => {
	  res.status(200).send('Task unlinked');
    }).catch(err => {
	  res.status(500).send(err.message);
    });
  })(req, res, next);
});

/* GET requirements for task */
router.get('/link', (req, res, next) => {
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
	
	Qualification.findAll({
	  where: {
		id: req.query.id
	  },
	  attributes: [],
	  include: [Task]
	}).then(requirements => {
	  res.status(200).json(requirements);
	}).catch(err => {
	  res.status(500).send(err.message);
	});
  })(req, res, next);
});

module.exports = router;
