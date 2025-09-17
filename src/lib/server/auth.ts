// client-app/src/lib/auth.ts
import { authStore } from '$lib/stores/auth';
import { AUTH_SERVER } from '$lib/utils';

export class AuthClient {
    async login() {
        const redirect = encodeURIComponent(window.location.origin + '/callback');
        window.location.href = `${AUTH_SERVER}/login?redirect=${redirect}`;
    }

    async handleCallback() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) return { success: false };

        // Validate token
        const isValid = await this.validateToken(token);

        if (!isValid) return { success: false };

        // Optionally: fetch user profile from auth server
        const user = await this.fetchUserProfile(token);
        authStore.login(user, token);
        
        return { success: true };
    }

    async validateToken(token: string): Promise<{ 
        valid: boolean, 
        user: {
            id: string,
            email: string,
            role: string,
            sessionId: string
        }
    } | any> {
        try {
            const res = await fetch(`${AUTH_SERVER}/api/auth/validate`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if(res.ok){
                return res.json();
            }

        } catch(err) {
            return { valid: false, error: err };
        }
    }

    async fetchUserProfile(token: string) {
        const res = await fetch(`${AUTH_SERVER}/api/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch user profile');

        return res.json();
    }

    async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
        let token: string | null = null;
        const unsubscribe = authStore.subscribe((state: { accessToken: string | null; }) => {
            token = state.accessToken;
        });
        unsubscribe();

        if (!token) throw new Error('Not authenticated');

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        });
    }

    logout() {
        authStore.logout();
        window.location.href = `${AUTH_SERVER}/api/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`;
    }
}

export const authClient = new AuthClient();