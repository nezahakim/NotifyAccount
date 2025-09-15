<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data} = $props();

	import { onMount } from 'svelte';
    import { browser } from '$app/environment';


    onMount(async () => {
        if (browser) {
            await checkToken();
        }
    });



 async function checkToken(){
    const response = await fetch('/api/check-token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
    });

    const data = await response.json();
    if(!response.ok){
        console.log(data)
    }else{
        console.log(data)
    }

}
    
    
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
