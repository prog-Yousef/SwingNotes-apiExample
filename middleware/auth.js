const jwt = require('jsonwebtoken');
const { sendError } = require('../responses/responses');
const config = require('../config/keys');

const ValidateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');
      if (!token) {
        throw new Error('Unauthorized');
      }
      const data = jwt.verify(token, 'a1b1c1');
      request.event.id = data.id;
      request.event.username = data.username;
      return request.response;
    } catch (error) {
      request.event.error = '401';
      return sendError(401, 'Invalid token');
    }
  },
  onError: async (request) => {
    request.event.error = '401';
    return sendError(401, 'Invalid token');
  }
};

module.exports = {
  ValidateToken
}