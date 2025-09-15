// src/lib/stores/auth.ts
import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { AUTH_SERVER } from '$lib/utils';

interface User {
    id: string;
    email: string;
    role: string;
    sessionId: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>({
        user: null,
        accessToken: null,
        isAuthenticated: false
    });

    let refreshInterval: NodeJS.Timeout;

    return {
        subscribe,
        
        login(user: User, accessToken: string) {
            set({
                user,
                accessToken,
                isAuthenticated: true
            });
            
            if (browser) {
                // Store token in memory only (not localStorage for security)
                this.startTokenRefresh();
            }
        },
        
        logout() {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false
            });
            
            if (browser) {
                this.stopTokenRefresh();
                fetch('/api/auth/logout', { method: 'POST' });
            }
        },
        
        setAccessToken(token: string) {
            update(state => ({
                ...state,
                accessToken: token
            }));
        },
        
        startTokenRefresh() {
            // Refresh token every 10 minutes (before 15-minute expiry)
            refreshInterval = setInterval(async () => {
                try {
                    const response = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const { accessToken } = await response.json();
                        this.setAccessToken(accessToken);
                    } else {
                        this.logout();
                    }
                } catch (err) {
                    console.error('Token refresh failed:', err);
                }
            }, 10 * 60 * 1000);
        },
        
        stopTokenRefresh() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        }
    };
}


export async function refreshTokenOnLoad() {
    try {
        const response = await fetch(`${AUTH_SERVER}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json(); // ✅ Read only once

        if (response.ok) {
            const { accessToken } = data;

            // Decode token to get user info
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            authStore.login({
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId
            }, accessToken);
        } else {
            console.error('Token refresh failed:', data);
        }

    } catch (err) {
        console.error('Token refresh failed (network or server error):', err);
    }
}


export const authStore = createAuthStore();
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated);