import type { Handle } from '@sveltejs/kit';
import { authClient } from '$lib/server/auth';

const allowedOrigins = (process.env.PUBLIC_APP_DOMAINS || '').split(',');

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');

  // Handle CORS preflight OPTIONS request
  if (event.request.method === 'OPTIONS') {
    if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
      return new Response(null, {
        status: 204, // No Content
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400' // cache preflight for 1 day
        }
      });
    }

    return new Response('Forbidden', { status: 403 });
  }

  // Try to authenticate user by token from header or cookie
  try {
    const authHeader = event.request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '') || event.cookies.get('access_token');

    if (token) {
      const user = await authClient.validateToken(token);

      if (user && user.user) {
        event.locals.user = user.user;
        event.locals.accessToken = token;
      }
    }
  } catch (err) {
    // Invalid token, clear user info
    event.locals.user = null;
    event.locals.accessToken = null;
  }

  // Proceed with the request and get response
  const response = await resolve(event);

  // Add CORS headers if origin is allowed and request is API
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    // Add other headers if needed
  }

  return response;
};
