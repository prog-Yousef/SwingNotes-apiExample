const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../../config/keys');


const {sendResponse, sendError} = require("../../responses/responses");
const {db} = require("../../services/db");
const middy = require("@middy/core");
const { v4: uuidv4 } = require('uuid');


async function Login(event) {
  try {
    const data = JSON.parse(event.body);
    if (!data.email || !data.password) {
      return sendError(400, "Email and password are required");
    }
    const params = {
      TableName: "swingNotes-Users",
      Key: {
        email: data.email
      }
    };
    const result = await db.get(params).promise();


    if (!result.Item || !(await bcrypt.compare(data.password, result.Item.password))) {
      return sendError({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: result.Item.userId, email: result.Item.email }, config.jwtSecret, { expiresIn: '1h' });
    return sendResponse({ token });
  } catch (error) {
    return sendError({ message: 'Login failed', error });
  }
}

module.exports = middy(Login).use(middy.jsonBodyParser());
