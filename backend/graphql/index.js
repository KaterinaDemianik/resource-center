const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');
const schema = require('./schema');
const resolvers = require('./resolvers');

// Middleware to extract user from JWT token
const getUser = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    return null;
  }
};

// GraphQL middleware configuration
const graphqlMiddleware = graphqlHTTP((req) => ({
  schema,
  rootValue: resolvers,
  graphiql: process.env.NODE_ENV !== 'production',
  context: {
    user: getUser(req),
    req
  },
  customFormatErrorFn: (error) => ({
    message: error.message,
    locations: error.locations,
    path: error.path
  })
}));

module.exports = graphqlMiddleware;
