import { authStore } from '$lib/stores/auth';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const result = await fetch('/api/auth/check-token', {
			method: 'POST',
			credentials: 'include'
		});

		if (!result.ok) {
			// Use SvelteKit's redirect for both SSR and client support
			console.log('Not Okay')
			// throw redirect(307, 'https://auth.notifycode.org/login');
		}

		const data = await result.json();

		if (data.success) {
			return {
				user: data.user,
				access_token: data.access_token
			};
		} else {
			throw redirect(307, 'https://auth.notifycode.org/login');
		}
	} catch (err) {
		console.error('Token check failed:', err);
		throw redirect(307, 'https://auth.notifycode.org/login');
	}
};
