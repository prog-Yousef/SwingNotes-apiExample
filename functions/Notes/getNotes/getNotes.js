const { db } = require("../../../services/database/dynamodb");
const middy = require("@middy/core");
const httpErrorHandler = require("@middy/http-error-handler");
const authMiddleware = require("../../../middleware/authMiddleware");

const getNotes = async () => {
  const params = {
    TableName: process.env.NOTES_TABLE,
  };

  try {
    const result = await db.scan(params);
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not fetch notes" }),
    };
  }
};

module.exports.handler = middy(getNotes)
  .use(authMiddleware())
  .use(httpErrorHandler());