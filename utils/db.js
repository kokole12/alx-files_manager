const { MongoClient } = require('mongodb');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

const uri = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(uri, { useUnifiedTopology: true, useNewUrlParser: true });
    this.client.connect().then(() => {
      this.db = this.client.db(`${database}`);
    })
      .catch((error) => {
        console.log(error);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = this.db.collection('users');
    const usersNumber = await users.countDocuments();
    return usersNumber;
  }

  async nbFiles() {
    const files = this.db.collection('files');
    const filesNumber = await files.countDocuments();
    return filesNumber;
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
