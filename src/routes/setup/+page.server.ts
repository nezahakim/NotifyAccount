import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw new Error('User not authenticated');
    }

    return {
        user: locals.user,
        access_token: locals.accessToken
    };
};
