<script lang="ts">  
import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AUTH_SERVER } from '$lib/utils.js';
    
    const token =  page.url.searchParams.get('token');


    async function callback(){
        const res = await fetch(`/api/auth/callback?token=${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

            const data = await res.json();

            if (!res.ok) {
                goto(`${AUTH_SERVER}/login?error=invalid_token`);
            }

            authStore.login(data.user, data.token);
            goto('/dashboard');
    }
    

    onMount( async () => {
        await callback();
    });

    $effect(()=>{
        if($authStore.isAuthenticated){
            goto('/dashboard');
        }
    })
</script>
<p>Processing login...</p>
