import { authStore } from '$lib/stores/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
    const result = await fetch('/api/auth/check-token', {
        method: 'POST',
        credentials: 'include'
    });

    const { success, message, user, access_token} = await result.json();

    if (!success) {
        console.log(message);

        return {
            user: null,
            access_token: null
        };
    }

    locals.user = user;
    locals.accessToken = access_token;

    return {
        user: user,
        access_token: access_token,
        success, 
        message
    };
};
