var express = require("express"),
  http = require("http"),
  app = express(),
  bodyParser = require('body-parser'),
  mongoose = require("mongoose");

// parse application/json
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
var mongoUri = process.env.MONGOLAB_URI || "mongodb://localhost:27017/User";

/* Connect mongoose */
mongoose.connect(mongoUri);
var db = mongoose.connection

// get notified if we connect successfully or if a connection error occurs:
db.on("error", console.error.bind(console, "Connection error:"));

// we"re connected!
console.log("Connection successfull!");

//reminder schema declaration
var reminderchema = mongoose.Schema({
  title: String,
  description: String,
  created: String
});

//user schema declaration
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  reminder: [reminderchema]
});

//Model user based on user schema
var User = mongoose.model("User", userSchema);


app.get("/users/:userId", function(req, res) {
  User.findById(req.params.userId, "name email", function(err, user) {
    if (err) {
      res.status(404).send({
        "status": 404,
        "error": err.message
      });
      console.error(err);
    } else if (user) {
      res.send({
        "name": user.name,
        "email": user.email
      });
    } else {
      res.status(404).send({
        "status": 404,
      });
    }
  })
});

app.get("/users/:userId/reminders/", function(req, res) {

  console.log(req.query.title);
  var query = {
    "_id": req.params.userId
  };

  User.findById(req.params.userId,
    "reminder.title reminder.description reminder.created",
    function(err, user) {
      if (err) {
        res.status(404).send({
          "status": 404,
          "error": err.message
        });
        console.error(err);
      } else if (user) {
        reminder = user.reminder;
        if (req.query.title) {
          var reminder = user.reminder.filter(function(reminder) {
            return reminder.title === req.query.title;
          }).pop();
        }
        res.send(reminder);
      } else {
        res.status(404).send({
          "status": 404,
        });
      }
    })
});

app.get("/users/:userId/reminders/:reminderId", function(req, res) {
  User.findById(req.params.userId,
    function(err, user) {
      if (err) {
        res.status(404).send({
          "status": 404,
          "error": err.message
        });
        console.error(err);
      } else {
        var reminder = user.reminder.id(req.params.reminderId);
        if (reminder) {
          res.send({
            "title": reminder.title,
            "description": reminder.description,
            "created": reminder.created
          });
        } else {
          res.status(404).send({
            "status": 404,
          });
        }
      }
    })
});

app.post("/users", function(req, res) {

  if (!req.body.user.name || !req.body.user.email) {
    res.send({
      "message": "Name and Email should not be empty."
    });
    return 0;
  }

  var newUser = new User({
    name: req.body.user.name,
    email: req.body.user.email
  });
  newUser.save(function(err, user) {
    if (err) {
      res.status(404).send({
        "status": 404,
        "error": err.message
      });
      console.error(err);
    } else {
      res.send({
        "id": user._id
      });
    }
  });
});

app.post("/users/:userId/reminders", function(req, res) {

  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

  if (!req.body.reminder.title || !req.body.reminder.description) {
    res.send({
      "message": "Title and Description should not be empty."
    });
    return 0;
  }

  var newReminder = {
    title: req.body.reminder.title,
    description: req.body.reminder.description,
    created: localISOTime
  };

  User.findById(req.params.userId, function(err, user) {
    if (err) {
      res.status(404).send({
        "status": 404,
        "error": err.message
      });
      console.error(err);
    } else {
      var reminder = user.reminder.create(newReminder);
      user.reminder.push(reminder);
      user.save(function(err, user) {
        if (err) {
          res.status(404).send({
            "status": 404,
            "error": err.message
          });
          console.error(err);
        } else {
          res.send({
            "id": reminder._id
          });
        }
      });
    }
  });
});

app.delete("/users/:userId/", function(req, res) {
  User.remove({
    _id: req.params.userId
  }, function(err, user) {
    if (err) {
      res.status(404).send({
        "status": 404,
        "error": err.message
      });
      console.error(err);
    } else {
      res.status(204).send({
        "status": 204,
      });
    }
  })
});

app.delete("/users/:userId/reminders/:reminderId", function(req, res) {
  User.findById(req.params.userId, function(err, user) {
    if (err) {
      res.status(404).send({
        "status": 404,
        "error": err.message
      });
      console.error(err);
    } else {
      user.reminder.pull(req.params.reminderId);
      user.save(function(err, user) {
        if (err) {
          res.status(404).send({
            "status": 404,
            "error": err.message
          });
          console.error(err);
        } else if (user) {
          res.status(204).send({
            "status": 204,
          });
        } else {
          res.status(404).send({
            "status": 404,
          });
        }
      });
    }
  })
});


/* Connect to local server */
app.listen(port, function() {
  console.log(`Started and running on port: ${port}`);
});
