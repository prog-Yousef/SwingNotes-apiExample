const { db } = require("../../../services/database/dynamodb");
const { v4: uuidv4 } = require("uuid");
const middy = require("@middy/core");
const jsonBodyParser = require("@middy/http-json-body-parser");
const httpErrorHandler = require("@middy/http-error-handler");
const authMiddleware = require("../../../middleware/authMiddleware");

const addNote = async (event) => {
  const { title, text } = event.body;

  if (!title || !text || title.length > 50 || text.length > 300) {
    console.error("Invalid note data:", { title, text });
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid note data" }),
    };
  }

  const now = Date.now();
  const note = {
    id: uuidv4(),
    title,
    text,
    createdAt: now,
    modifiedAt: null,
  };

  const params = {
    TableName: process.env.NOTES_TABLE,
    Item: note,
  };

  try {
    await db.put(params);
    return {
      statusCode: 201,
      body: JSON.stringify({
        ...note,
        createdAt: new Date(note.createdAt).toLocaleDateString(),
        modifiedAt: new Date(note.modifiedAt).toLocaleDateString(),
      }),
    };
  } catch (error) {
    console.error("Error saving note:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not save note" }),
    };
  }
};

module.exports.handler = middy(addNote)
  .use(jsonBodyParser())
  .use(authMiddleware())
  .use(httpErrorHandler());