const {sendResponse, sendError} = require("../../responses/responses");
const {db} = require("../../services/db");
const middy = require("@middy/core");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
import { validateEmail, validatePassword } from '../../helper/accountValidate';
const { validateToken } = require('../../middleware/auth');

async function getAccount(username) {
  try {
    const params = {
      TableName: "swingNotes-Users",
      Key: {
        email: username
      }
    };
    const result = await db.get(params).promise();
    return result.Item;
  } catch (error) {
    throw error;
  }
}

async function SignUp(event) {
  try {
    const data = JSON.parse(event.body);

    if (!data.email || !data.password) {
      return sendError(400, "Email and password are required");
    }

    if (!validateEmail(data.email)) {
      return sendError(400, "Invalid email address");
    }

    if (!validatePassword(data.password)) {
      return sendError(400, "Password does not meet requirements");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const params = {
      TableName: "swingNotes-Users",
      Item: {
        userId: uuidv4(),
        email: data.email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      }
    };

    await db.put(params).promise();
    return sendResponse({ message: 'User created successfully', userId: params.Item.userId });
  } catch (error) {
    return sendError(500, { message: 'Could not create user', error });
  }
}

const handler = middy()
  .handler(async (event) => {
    try {
      if (!event?.id || (event?.error && event?.error === '401')) return sendError(401, { success: false, message: 'Invalid token' });

      const account = await getAccount(event.username);

      if (!account) return sendError(401, { success: false, message: 'No account found' });

      return sendResponse({ success: true, account: account });
    } catch (error) {
      return sendError(400, { success: false, message: 'Could not get account' });
    }
  })
  .use(validateToken);

module.exports = middy(SignUp).use(middy.jsonBodyParser());