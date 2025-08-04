const mongoose = require('mongoose');

async function DBConnection() {
  await mongoose.connect(`mongodb+srv://${process.env.USER_NAME}:${process.env.DB_PASSWORD}@cluster0.twlmnti.mongodb.net/${process.env.DB_NAME}`);

}

module.exports = {
    DBConnection
}