import axios from 'axios'
import { graphqlRequest, resourceQueries, authQueries, adminQueries } from './graphqlClient'

/**
 * Універсальний сервіс для роботи з REST та GraphQL API
 */

// ==================== РЕСУРСИ ====================

/**
 * Отримати список ресурсів
 */
export const fetchResources = async (params, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.getResources,
      {
        filter: {
          page: params.page,
          limit: params.limit,
          category: params.category || null,
          search: params.search || null
        }
      },
      token
    )
    return {
      success: data.resources.success,
      data: {
        resources: data.resources.resources,
        pagination: {
          page: data.resources.page,
          pages: data.resources.pages,
          total: data.resources.total
        }
      }
    }
  } else {
    const response = await axios.get('/api/resources', { params })
    return response.data
  }
}

/**
 * Отримати один ресурс
 */
export const fetchResource = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.getResource,
      { id },
      token
    )
    return {
      success: data.resource.success,
      data: data.resource.resource
    }
  } else {
    const response = await axios.get(`/api/resources/${id}`)
    return response.data
  }
}

/**
 * Отримати мої ресурси
 */
export const fetchMyResources = async (params, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.getMyResources,
      {
        page: params.page,
        limit: params.limit
      },
      token
    )
    return {
      success: data.myResources.success,
      data: {
        resources: data.myResources.resources,
        pagination: {
          page: data.myResources.page,
          pages: data.myResources.pages,
          total: data.myResources.total
        }
      }
    }
  } else {
    const response = await axios.get('/api/resources/user/my-resources', { params })
    return response.data
  }
}

/**
 * Створити ресурс
 */
export const createResource = async (resourceData, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.createResource,
      {
        input: {
          title: resourceData.title,
          description: resourceData.description,
          category: resourceData.category,
          tags: resourceData.tags || [],
          url: resourceData.url || null
        }
      },
      token
    )
    return {
      success: data.createResource.success,
      message: data.createResource.message,
      data: data.createResource.resource
    }
  } else {
    const response = await axios.post('/api/resources', resourceData)
    return response.data
  }
}

/**
 * Оновити ресурс
 */
export const updateResource = async (id, resourceData, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.updateResource,
      {
        id,
        input: {
          title: resourceData.title,
          description: resourceData.description,
          category: resourceData.category,
          tags: resourceData.tags,
          url: resourceData.url
        }
      },
      token
    )
    return {
      success: data.updateResource.success,
      message: data.updateResource.message,
      data: data.updateResource.resource
    }
  } else {
    const response = await axios.put(`/api/resources/${id}`, resourceData)
    return response.data
  }
}

/**
 * Видалити ресурс
 */
export const deleteResource = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      resourceQueries.deleteResource,
      { id },
      token
    )
    return {
      success: data.deleteResource.success,
      message: data.deleteResource.message
    }
  } else {
    const response = await axios.delete(`/api/resources/${id}`)
    return response.data
  }
}

// ==================== АВТОРИЗАЦІЯ ====================

/**
 * Реєстрація
 */
export const registerUser = async (userData, apiMode) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      authQueries.register,
      {
        input: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password
        }
      }
    )
    return {
      success: data.register.success,
      message: data.register.message,
      token: data.register.token,
      user: data.register.user
    }
  } else {
    const response = await axios.post('/api/auth/register', userData)
    return response.data
  }
}

/**
 * Логін
 */
export const loginUser = async (credentials, apiMode) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      authQueries.login,
      {
        input: {
          email: credentials.email,
          password: credentials.password
        }
      }
    )
    return {
      success: data.login.success,
      message: data.login.message,
      token: data.login.token,
      user: data.login.user
    }
  } else {
    const response = await axios.post('/api/auth/login', credentials)
    return response.data
  }
}

/**
 * Отримати поточного користувача
 */
export const fetchCurrentUser = async (apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(authQueries.me, {}, token)
    return {
      success: true,
      user: data.me
    }
  } else {
    const response = await axios.get('/api/auth/me')
    return response.data
  }
}

/**
 * Верифікація email
 */
export const verifyEmail = async (token, apiMode) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(authQueries.verifyEmail, { token })
    return {
      success: data.verifyEmail.success,
      message: data.verifyEmail.message
    }
  } else {
    const response = await axios.get(`/api/auth/verify-email/${token}`)
    return response.data
  }
}

// ==================== АДМІНІСТРУВАННЯ ====================

/**
 * Отримати ресурси для адміна
 */
export const fetchAdminResources = async (params, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.getAdminResources,
      {
        status: params.status || null,
        search: params.search || null,
        page: params.page,
        limit: params.limit
      },
      token
    )
    return {
      success: data.adminResources.success,
      data: {
        resources: data.adminResources.resources,
        pagination: {
          page: data.adminResources.page,
          pages: data.adminResources.pages,
          total: data.adminResources.total
        }
      }
    }
  } else {
    const response = await axios.get('/api/admin/resources', { params })
    return response.data
  }
}

/**
 * Схвалити ресурс
 */
export const approveResource = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.approveResource,
      { id },
      token
    )
    return {
      success: data.approveResource.success,
      message: data.approveResource.message,
      data: data.approveResource.resource
    }
  } else {
    const response = await axios.patch(`/api/admin/resources/${id}/approve`)
    return response.data
  }
}

/**
 * Відхилити ресурс
 */
export const rejectResource = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.rejectResource,
      { id },
      token
    )
    return {
      success: data.rejectResource.success,
      message: data.rejectResource.message,
      data: data.rejectResource.resource
    }
  } else {
    const response = await axios.patch(`/api/admin/resources/${id}/reject`)
    return response.data
  }
}

/**
 * Перемкнути активність ресурсу
 */
export const toggleResourceActive = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.toggleResourceActive,
      { id },
      token
    )
    return {
      success: data.toggleResourceActive.success,
      message: data.toggleResourceActive.message,
      data: data.toggleResourceActive.resource
    }
  } else {
    const response = await axios.patch(`/api/admin/resources/${id}/toggle-active`)
    return response.data
  }
}

/**
 * Отримати користувачів для адміна
 */
export const fetchAdminUsers = async (params, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.getAdminUsers,
      {
        status: params.status || null,
        page: params.page,
        limit: params.limit
      },
      token
    )
    return {
      success: data.adminUsers.success,
      data: {
        users: data.adminUsers.users,
        pagination: {
          total: data.adminUsers.total
        }
      }
    }
  } else {
    const response = await axios.get('/api/admin/users', { params })
    return response.data
  }
}

/**
 * Перемкнути активність користувача
 */
export const toggleUserActive = async (id, apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(
      adminQueries.toggleUserActive,
      { id },
      token
    )
    return {
      success: data.toggleUserActive.success,
      message: data.toggleUserActive.message
    }
  } else {
    const response = await axios.patch(`/api/admin/users/${id}/toggle-active`)
    return response.data
  }
}

/**
 * Отримати статистику для адміна
 */
export const fetchAdminStats = async (apiMode, token) => {
  if (apiMode === 'graphql') {
    const data = await graphqlRequest(adminQueries.getAdminStats, {}, token)
    return {
      success: data.adminStats.success,
      data: {
        users: {
          total: data.adminStats.totalUsers,
          active: data.adminStats.activeUsers
        },
        resources: {
          total: data.adminStats.totalResources,
          approved: data.adminStats.approvedResources,
          pending: data.adminStats.pendingResources
        }
      }
    }
  } else {
    const response = await axios.get('/api/admin/stats')
    return response.data
  }
}
