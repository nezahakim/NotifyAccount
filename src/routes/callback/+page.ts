// src/routes/callback/+page.ts
import { authStore } from '$lib/stores/auth.js';
import { AUTH_SERVER } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url, fetch}) => {
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

    // Optional: fetch user info
    const user = await fetch(`${AUTH_SERVER}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(async data => {
         const d = await data.json();
            return d.user;

    }).catch(error=>{
        console.error('Failed to fetch user info:', error);
    });

    return {
        user,
        token,
    };
    

    } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Optionally return a fallback or redirect
        return {
            status: 500,
            error: new Error('Failed to load user info'),
        };
    }
};
