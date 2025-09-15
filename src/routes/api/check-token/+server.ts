import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
    const refreshToken = cookies.get('auth_token');

    if (!refreshToken) {
        return json({ success: false, message: 'Unauthorized - attempt detected' }, { status: 401 });
    }

    return json({ success: true, message: "Available" }, { status: 200 });
};