<script>

	let { data } = $props();

const user = data.user;
const token = data.token;

    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
	import { goto } from '$app/navigation';

    onMount(() => {
        if (user) {
            authStore.login(
                user,
                token
            );
        }
    });

    $effect(()=>{
        if($authStore.isAuthenticated){
            goto('/dashboard');
        }
    })
</script>
<p>Processing login...</p>
