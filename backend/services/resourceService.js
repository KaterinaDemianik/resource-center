/**
 * Shared resource query helpers (REST + GraphQL)
 */

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Public catalogue: only active + approved resources
 */
const buildPublicResourceQuery = (queryParams) => {
  let query = { isActive: true, isApproved: true };

  if (queryParams.category) {
    query.category = queryParams.category;
  }

  if (queryParams.search) {
    const searchRegex = new RegExp(escapeRegex(queryParams.search), 'i');
    query.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  return query;
};

/**
 * Admin list filter by moderation/status (matches REST /api/admin/resources)
 */
const buildAdminResourceStatusQuery = (status) => {
  const statusQueries = {
    pending: { isApproved: false },
    approved: { isApproved: true },
    inactive: { isActive: false },
    rejected: { rejectedAt: { $ne: null } }
  };

  return statusQueries[status] || {};
};

/**
 * Merge admin status filter with optional text search on title/description
 */
const mergeAdminQueryWithSearch = (baseQuery, searchTerm) => {
  if (!searchTerm || !String(searchTerm).trim()) {
    return baseQuery;
  }
  const escaped = escapeRegex(String(searchTerm).trim());
  const searchRegex = new RegExp(escaped, 'i');
  const searchPart = { $or: [{ title: searchRegex }, { description: searchRegex }] };

  const baseKeys = Object.keys(baseQuery);
  if (baseKeys.length === 0) {
    return searchPart;
  }
  return { $and: [baseQuery, searchPart] };
};

const formatPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit) || 0;
  return {
    current: page,
    pages: totalPages,
    totalPages,
    total,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

module.exports = {
  escapeRegex,
  buildPublicResourceQuery,
  buildAdminResourceStatusQuery,
  mergeAdminQueryWithSearch,
  formatPagination
};
