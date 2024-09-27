const { db } = require("../../../services/database/dynamodb");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const { generateToken } = require("../../../utils/jwt/jwtUtils");
const { comparePassword } = require("../../../utils/bcrypt/passwordUtils");

const login = async (event) => {
  const { username, password } = event.body;

  const params = {
    TableName: process.env.USERS_TABLE,
    IndexName: "username-index",
    KeyConditionExpression: "username = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  };

  try {
    const result = await db.query(params);
    const user = result.Items[0];

    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    const token = generateToken(user.userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Logged in", token }),
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not log in" }),
    };
  }
};

module.exports.handler = middy(login)
  .use(jsonBodyParser())
  .use(httpErrorHandler());