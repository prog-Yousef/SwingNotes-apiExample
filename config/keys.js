module.exports = {
    jwtSecret: process.env.JWT_SECRET || '12345',  // Secret for JWT auth
    dynamoDBTableName: process.env.DYNAMODB_TABLE || 'NotesTable',  // DynamoDB table name
  };
  