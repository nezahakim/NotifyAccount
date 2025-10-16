import { HASH_IT_KEY } from '$env/static/private';
import { AUTH_SERVER } from '$lib/utils';
import { decodeHashedToken } from '@notifycode/hash-it';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies, locals }) => {
try{
    const refreshToken = cookies.get('nc_rt');

    if (!refreshToken) {
        return json({ success: false, message: 'Unauthorized - attempt detected ERROR_RT' }, { status: 401 });
    }

    const decodedRefToken = decodeHashedToken({
        token: refreshToken,
        key: HASH_IT_KEY
    })

    const result = await fetch(`${AUTH_SERVER}/api/auth/refresh`, {
        method:"POST",
        headers: {
            Authorization: `Bearer ${decodedRefToken}`
        }
    });

    if (!result.ok) {
        console.log('No RETN DT')
        return json({ success: false, message: 'Unauthorized - attempt detected ACC_ERROR_AT' }, { status: 401 });
    }

    const { accessToken } = await result.json();

    const validate_result = await fetch(`${AUTH_SERVER}/api/auth/validate`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!validate_result.ok) {
        return json({ success: false, message: 'Unauthorized - attempt detected ACC_ERROR_VLT' }, { status: 401 });
    }

    const { valid, user } = await validate_result.json();

    if (!valid) {
        return json({ success: false, message: 'Unauthorized - attempt detected ACC_ERROR_VLT-1' }, { status: 401 });
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
    return json({ success: false, message: `Internal Server Error ACC| ${err.message}` }, { status: 500 });
}

};