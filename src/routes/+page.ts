import { authStore } from '$lib/stores/auth';
import { redirect, type Load } from '@sveltejs/kit';
import { get } from 'svelte/store';


export const load: Load = async ({ fetch }) => {
    try {
        // If the user is already authenticated, redirect them
        if (get(authStore).isAuthenticated) {
            throw redirect(302, '/dashboard');
        }

        const result = await fetch('/api/auth/check-token', {
            method: 'GET',
        });

        if (result.status === 401) {
            throw redirect(302, 'https://auth.notifycode.org/login'); // Redirect to login if unauthorized
        }

        const data = await result.json();

        if (data.success) {
            authStore.login(data.user, data.access_token); // Log in the user if success
        }

        return {}; // Return any data needed for the page
    } catch (err) {
        console.log(err);
        throw redirect(302, 'https://auth.notifycode.org/login'); // Ensure redirection on error
    }
}
