const { buildSchema } = require('graphql');

/**
 * GraphQL схема для Resource Center API
 * Визначає типи даних, запити та мутації
 */
const schema = buildSchema(`
  # Тип користувача системи
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    isActive: Boolean!
    emailVerified: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  # Тип ресурсу системи
  type Resource {
    id: ID!
    title: String!
    description: String!
    category: String!
    tags: [String]
    url: String
    author: User
    isActive: Boolean!
    isApproved: Boolean!
    approvedBy: User
    approvedAt: String
    views: Int!
    rating: Float!
    ratingCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  # Payload для авторизаційних операцій
  type AuthPayload {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  # Payload для операцій з одним ресурсом
  type ResourcePayload {
    success: Boolean!
    message: String!
    resource: Resource
  }

  type ResourcesPayload {
    success: Boolean!
    resources: [Resource]
    total: Int
    page: Int
    pages: Int
  }

  type UsersPayload {
    success: Boolean!
    users: [User]
    total: Int
  }

  type StatsPayload {
    success: Boolean!
    totalUsers: Int
    activeUsers: Int
    totalResources: Int
    approvedResources: Int
    pendingResources: Int
  }

  type MessagePayload {
    success: Boolean!
    message: String!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ResourceInput {
    title: String!
    description: String!
    category: String!
    tags: [String]
    url: String
  }

  input ResourceUpdateInput {
    title: String
    description: String
    category: String
    tags: [String]
    url: String
  }

  input ResourceFilterInput {
    category: String
    search: String
    page: Int
    limit: Int
  }

  type Query {
    # Public queries
    resources(filter: ResourceFilterInput): ResourcesPayload!
    resource(id: ID!): ResourcePayload!
    
    # Authenticated queries
    me: User
    myResources(page: Int, limit: Int): ResourcesPayload!
    
    # Admin queries
    adminResources(status: String, page: Int, limit: Int): ResourcesPayload!
    adminUsers(status: String, page: Int, limit: Int): UsersPayload!
    adminStats: StatsPayload!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: MessagePayload!
    verifyEmail(token: String!): MessagePayload!
    
    # Resource mutations (authenticated)
    createResource(input: ResourceInput!): ResourcePayload!
    updateResource(id: ID!, input: ResourceUpdateInput!): ResourcePayload!
    deleteResource(id: ID!): MessagePayload!
    
    # Admin mutations
    approveResource(id: ID!): ResourcePayload!
    rejectResource(id: ID!): ResourcePayload!
    toggleResourceActive(id: ID!): ResourcePayload!
    toggleUserActive(id: ID!): MessagePayload!
  }
`);

module.exports = schema;
