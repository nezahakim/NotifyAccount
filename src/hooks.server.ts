import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const refreshToken = event.cookies.get('nc_rt');

	if (!refreshToken) {
		throw redirect(302, 'https://auth.notifycode.org/login');
	}

	const response = await event.fetch('/api/auth/check-token', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${refreshToken}`
		}
	});

	const { success, user, access_token, message } = await response.json();

	if (!success) {
		console.error('Auth check failed:', message);
		// event.cookies.delete('nc_rt');
		throw redirect(302, 'https://auth.notifycode.org/login');
	}

	// Attach user and token to locals for use in load functions or endpoints
	event.locals.user = user;
	event.locals.accessToken = access_token;

	return await resolve(event);
};
