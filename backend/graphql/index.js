const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');
const schema = require('./schema');
const resolvers = require('./resolvers');

/**
 * Витягує дані користувача з JWT токену
 * @param {Object} req - Express request об'єкт
 * @returns {Object|null} - Дані користувача або null
 */
const extractUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
};

/**
 * Конфігурація GraphQL middleware з динамічним контекстом
 * @param {Object} req - Express request об'єкт
 * @returns {Object} - GraphQL конфігурація
 */
const createGraphQLConfig = (req) => ({
  schema,
  rootValue: resolvers,
  graphiql: process.env.NODE_ENV !== 'production', // GraphiQL тільки в development
  context: {
    user: extractUserFromToken(req),
    req,
    // Додаємо час запиту для логування
    timestamp: new Date().toISOString()
  },
  customFormatErrorFn: (error) => ({
    message: error.message,
    locations: error.locations,
    path: error.path,
    extensions: {
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    }
  })
});

// Експорт готового middleware
module.exports = graphqlHTTP(createGraphQLConfig);
