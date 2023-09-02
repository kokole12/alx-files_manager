const sha1 = require('sha1');
const Queue = require('bull');
const dbClient = require('../utils/db');

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UserController {
  static postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }

    const users = dbClient.db.collection('user');
    users.findOne({ email }, (err, user) => {
      if (user) {
        res.status(400).json({ error: 'Already exist' });
      } else {
        const hashedPasswd = sha1(password);
        users.insertOne({
          email,
          password: hashedPasswd,
        }).then((result) => {
          res.status(201).json({ id: result.insertedId, email });
          userQueue.add({ userId: result.insertedId });
        }).catch((error) => console.log(error));
      }
    });
  }
}

module.exports = UserController;
