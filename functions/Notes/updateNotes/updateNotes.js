const { db } = require("../../../services/database/dynamodb");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const authMiddleware = require("../../../middleware/authMiddleware");

const updateNote = async (event) => {
  const { id, title, text } = event.body;

  const now = Date.now();
  const params = {
    TableName: process.env.NOTES_TABLE,
    Key: { id },
    UpdateExpression:
      "set title = :title, #noteText = :text, modifiedAt = :modifiedAt",
    ExpressionAttributeNames: {
      "#noteText": "text",
    },
    ExpressionAttributeValues: {
      ":title": title,
      ":text": text,
      ":modifiedAt": now,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await db.update(params);
    const updatedNote = result.Attributes;
    return {
      statusCode: 200,
      body: JSON.stringify({
        ...updatedNote,
        createdAt: new Date(updatedNote.createdAt).toLocaleDateString(),
        modifiedAt: new Date(updatedNote.modifiedAt).toLocaleDateString(),
      }),
    };
  } catch (error) {
    console.error("Error updating note:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Could not update note",
        details: error.message,
      }),
    };
  }
};

module.exports.handler = middy(updateNote)
  .use(jsonBodyParser())
  .use(authMiddleware())
  .use(httpErrorHandler());