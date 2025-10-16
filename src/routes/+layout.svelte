<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	let { children } = $props();

	let user_email = $state<string>('')
	let is_email_set = $state<boolean>(false)

	onMount(()=>{
		if($authStore.user && $authStore.user.email){
			is_email_set = true;
			user_email = $authStore.user.email;
		}
		
	})	

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>`${is_email_set ? 'NotifyAccount | ('+user_email+')' : 'NotifyAccount'}`</title>
</svelte:head>

{@render children?.()}
