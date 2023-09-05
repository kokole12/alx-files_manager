const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

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

  static async getMe(req, res) {
    const authHeader = req.header('X-Token');
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = await redisClient.get(`auth_${authHeader}`);
    if (!id) {
      res.status(401).json({ error: 'Unauthorizes' });
      return;
    }

    const users = dbClient.db.collection('users');
    const user = await users.find({ id });
    res.status(200).json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;
