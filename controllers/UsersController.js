const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UserController {
  static postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400).send({ error: 'Missing password' });
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
        }).catch((error) => console.log(error));
      }
    });
  }
}

module.exports = UserController;
