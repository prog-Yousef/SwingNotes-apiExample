const { db } = require("../../../services/database/dynamodb");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const authMiddleware = require("../../../middleware/authMiddleware");

const deleteNote = async (event) => {
  const { id } = event.body;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Note ID is required" }),
    };
  }

  const params = {
    TableName: process.env.NOTES_TABLE,
    Key: { id },
  };

  try {
    await db.delete(params);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Note deleted" }),
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not delete note",
        details: error.message,
      }),
    };
  }
};

module.exports.handler = middy(deleteNote)
  .use(jsonBodyParser())
  .use(authMiddleware())
  .use(httpErrorHandler());