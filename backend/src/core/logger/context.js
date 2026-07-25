import { AsyncLocalStorage } from 'async_hooks';

/**
 * Global execution context storage using AsyncLocalStorage.
 * Propagates traceIds and user information across async boundaries natively.
 */
export const contextStorage = new AsyncLocalStorage();
