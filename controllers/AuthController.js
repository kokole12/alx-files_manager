const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const authheader = req.header('Authorization');
    let token = authheader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const email = decoded.split(':')[0];
    console.log(email);

    const users = await dbClient.db.collection('users');

    const user = await users.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const authheader = req.header('X-Token');
    const key = `auth_${authheader}`;
    const id = await redisClient.get(key);
    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const users = dbClient.db.collection('users');

    const user = await users.find({ id });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await redisClient.del(`auth_${key}`);
    res.status(204).end();
  }
}

module.exports = AuthController;
