/**
 * Pagination Utilities
 * Provides pagination helpers for API responses
 */

/**
 * Parse pagination parameters from request
 * @param {object} req - Express request
 * @param {object} options - Pagination options
 * @returns {object} Pagination object
 */
export const parsePagination = (req, options = {}) => {
  const {
    defaultLimit = 10,
    maxLimit = 100,
    defaultPage = 1
  } = options;

  const page = Math.max(1, parseInt(req.query.page) || defaultPage);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(req.query.limit) || defaultLimit)
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Create pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
export const createPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return {
    total,
    page,
    limit,
    totalPages,
    hasPrev,
    hasNext,
    prevPage: hasPrev ? page - 1 : null,
    nextPage: hasNext ? page + 1 : null
  };
};

/**
 * Paginate database results
 * @param {object} query - Prisma query
 * @param {object} pagination - Pagination object
 * @returns {Promise<object>} Paginated results
 */
export const paginateQuery = async (query, pagination) => {
  const { page, limit, offset } = pagination;
  
  const [items, total] = await Promise.all([
    query.take(limit).skip(offset).exec(),
    query.count()
  ]);

  return {
    data: items,
    meta: createPaginationMeta(total, page, limit)
  };
};

/**
 * Paginate array results
 * @param {Array} items - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Paginated results
 */
export const paginateArray = (items, page, limit) => {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedItems = items.slice(start, end);

  return {
    data: paginatedItems,
    meta: createPaginationMeta(total, page, limit)
  };
};
