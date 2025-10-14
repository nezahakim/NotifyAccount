import { AUTH_SERVER } from '$lib/utils';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, locals }) => {
try{

    const refreshToken = cookies.get('nc_rt');

    if (!refreshToken) {
        console.log('No RT')
        return json({ success: false, message: 'Unauthorized - attempt detected' }, { status: 401 });
    }

    const result = await fetch(`${AUTH_SERVER}/api/auth/refresh`, {
        headers: {
            Authorization: `Bearer ${refreshToken}`
        }
    });

    if (!result.ok) {
        console.log('No RETN DT')
        return json({ success: false, message: 'Unauthorized - attempt detected' }, { status: 401 });
    }

    const { accessToken } = await result.json();

    const validate_result = await fetch(`${AUTH_SERVER}/api/auth/validate`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!validate_result.ok) {
        return json({ success: false, message: 'Unauthorized - attempt detected' }, { status: 401 });
    }

    const { valid, user } = await validate_result.json();

    if (!valid) {
        return json({ success: false, message: 'Unauthorized - attempt detected' }, { status: 401 });
    }

    locals.user = user;
    locals.accessToken = accessToken;

    return json({ success: true, 
        message: "Available", 
        user: user, 
        access_token: accessToken 
    }, { status: 200 });


} catch (err: any ){
    console.error(err);
    return json({ success: false, message: `Internal Server Error | ${err.message}` }, { status: 500 });
}

};