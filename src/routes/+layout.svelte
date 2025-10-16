<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authStore } from '$lib/stores/auth';

	let { children } = $props();

	let user_email = $state<string>('')
	let is_email_set = $state<boolean>(false)
	let pageTitle = $state<string>('');


	$effect(()=>{
		if($authStore.user && $authStore.user.email){
			is_email_set = true;
			user_email = $authStore.user.email;
		}

		pageTitle =  is_email_set ? `NotifyAccount | (${user_email})` : 'NotifyAccount'
	})	

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{pageTitle}</title>
</svelte:head>

{@render children?.()}
