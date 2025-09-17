import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { AUTH_SERVER } from '$lib/utils';

export const  GET: RequestHandler = async ({ url, cookies }) => {
	try {
		const token = url.searchParams.get('token');

		if (!token) {
			throw redirect(302, '/login?error=missing_token');
		}

		const res = await fetch(`${AUTH_SERVER}/api/auth/validate`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (!res.ok) {
			throw redirect(302, '/login?error=invalid_token');
		}

		const data = await res.json();

		return json({
			user: data?.user,
			token
		});
		
	} catch (error: any) {
		return json({ error: `Authentication failed | ${error}` }, { status: 500 });
	}
}
