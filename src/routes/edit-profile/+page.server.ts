import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../setup/$types';

export const load: PageServerLoad = async ({ fetch, locals, cookies }) => {

    const refreshToken = cookies.get('nc_rt');

    if(!refreshToken){
        redirect(401, 'https://auth.notifycode.org/login')
    }

    const result = await fetch('/api/auth/check-token', {
        method: 'POST',
        headers:{
            Authorization: 'Bearer '+refreshToken
        }
    });

    const { success, message, user, access_token } = await result.json();

    if (!success) {
        console.log(message);

        return {
            user: null,
            access_token: null,
            success,
            message
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
