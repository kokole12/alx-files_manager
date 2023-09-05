const sha1 = require('sha1');
const dbClient = require('../utils/db');
// const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).jon({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }

    const users = dbClient.db.collection('users');

    const user = await users.findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exists' });
      return;
    }

    const hashedPassword = sha1(password);

    const newUser = await users.insertOne({ email, password: hashedPassword });

    res.status(201).json({ id: newUser.insertedId, email });
  }
}

module.exports = UsersController;
