<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data} = $props();

	import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { browser } from '$app/environment';
	import { refreshTokenOnLoad } from '$lib/stores/auth';
    
    onMount(() => {
        if (browser) {
            // refreshTokenOnLoad();
        }
    });
    
    
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
