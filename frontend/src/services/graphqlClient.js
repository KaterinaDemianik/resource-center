import axios from 'axios'

const GRAPHQL_ENDPOINT = '/graphql'

/**
 * Виконує GraphQL запит
 * @param {string} query - GraphQL query або mutation
 * @param {Object} variables - Змінні для запиту
 * @param {string} token - JWT токен для авторизації
 * @returns {Promise<Object>} - Результат запиту
 */
export const graphqlRequest = async (query, variables = {}, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await axios.post(GRAPHQL_ENDPOINT, {
      query,
      variables
    }, { headers })

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message)
    }

    return response.data.data
  } catch (error) {
    console.error('GraphQL Error:', error)
    throw error
  }
}

/**
 * GraphQL запити для ресурсів
 */
export const resourceQueries = {
  // Отримати список ресурсів
  getResources: `
    query GetResources($filter: ResourceFilterInput) {
      resources(filter: $filter) {
        success
        resources {
          id
          title
          description
          category
          tags
          url
          author {
            id
            firstName
            lastName
          }
          isActive
          isApproved
          views
          createdAt
          updatedAt
        }
        total
        page
        pages
      }
    }
  `,

  // Отримати один ресурс
  getResource: `
    query GetResource($id: ID!) {
      resource(id: $id) {
        success
        resource {
          id
          title
          description
          category
          tags
          url
          author {
            id
            firstName
            lastName
          }
          isActive
          isApproved
          approvedBy {
            id
            firstName
            lastName
          }
          approvedAt
          views
          rating
          ratingCount
          createdAt
          updatedAt
        }
      }
    }
  `,

  // Отримати мої ресурси
  getMyResources: `
    query GetMyResources($page: Int, $limit: Int) {
      myResources(page: $page, limit: $limit) {
        success
        resources {
          id
          title
          description
          category
          tags
          url
          author {
            id
            firstName
            lastName
          }
          isActive
          isApproved
          views
          createdAt
          updatedAt
        }
        total
        page
        pages
      }
    }
  `,

  // Створити ресурс
  createResource: `
    mutation CreateResource($input: ResourceInput!) {
      createResource(input: $input) {
        success
        message
        resource {
          id
          title
          description
          category
          tags
          url
          isActive
          isApproved
          createdAt
        }
      }
    }
  `,

  // Оновити ресурс
  updateResource: `
    mutation UpdateResource($id: ID!, $input: ResourceUpdateInput!) {
      updateResource(id: $id, input: $input) {
        success
        message
        resource {
          id
          title
          description
          category
          tags
          url
          isActive
          isApproved
          updatedAt
        }
      }
    }
  `,

  // Видалити ресурс
  deleteResource: `
    mutation DeleteResource($id: ID!) {
      deleteResource(id: $id) {
        success
        message
      }
    }
  `
}

/**
 * GraphQL запити для авторизації
 */
export const authQueries = {
  // Реєстрація
  register: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        success
        message
        token
        user {
          id
          firstName
          lastName
          email
          role
        }
      }
    }
  `,

  // Логін
  login: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        success
        message
        token
        user {
          id
          firstName
          lastName
          email
          role
          emailVerified
          isActive
        }
      }
    }
  `,

  // Підтвердження email
  verifyEmail: `
    mutation VerifyEmail($token: String!) {
      verifyEmail(token: $token) {
        success
        message
      }
    }
  `,

  // Отримати поточного користувача
  me: `
    query Me {
      me {
        id
        firstName
        lastName
        email
        role
        emailVerified
        isActive
        createdAt
      }
    }
  `
}

/**
 * GraphQL запити для адміністратора
 */
export const adminQueries = {
  // Отримати ресурси для адміна
  getAdminResources: `
    query GetAdminResources($status: String, $search: String, $page: Int, $limit: Int) {
      adminResources(status: $status, search: $search, page: $page, limit: $limit) {
        success
        resources {
          id
          title
          description
          category
          author {
            id
            firstName
            lastName
            email
          }
          isActive
          isApproved
          approvedBy {
            id
            firstName
            lastName
          }
          approvedAt
          createdAt
        }
        total
        page
        pages
      }
    }
  `,

  // Схвалити ресурс
  approveResource: `
    mutation ApproveResource($id: ID!) {
      approveResource(id: $id) {
        success
        message
        resource {
          id
          isApproved
          isActive
          approvedAt
        }
      }
    }
  `,

  // Відхилити ресурс
  rejectResource: `
    mutation RejectResource($id: ID!) {
      rejectResource(id: $id) {
        success
        message
        resource {
          id
          isApproved
          isActive
        }
      }
    }
  `,

  // Перемкнути активність ресурсу
  toggleResourceActive: `
    mutation ToggleResourceActive($id: ID!) {
      toggleResourceActive(id: $id) {
        success
        message
        resource {
          id
          isActive
        }
      }
    }
  `,

  // Отримати користувачів
  getAdminUsers: `
    query GetAdminUsers($status: String, $page: Int, $limit: Int) {
      adminUsers(status: $status, page: $page, limit: $limit) {
        success
        users {
          id
          firstName
          lastName
          email
          role
          isActive
          emailVerified
          createdAt
        }
        total
      }
    }
  `,

  // Перемкнути активність користувача
  toggleUserActive: `
    mutation ToggleUserActive($id: ID!) {
      toggleUserActive(id: $id) {
        success
        message
      }
    }
  `,

  // Статистика
  getAdminStats: `
    query GetAdminStats {
      adminStats {
        success
        totalUsers
        activeUsers
        totalResources
        approvedResources
        pendingResources
      }
    }
  `
}
