<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let user_email = $state()

    let { data } = $props();
   
    onMount(() => {

      if(data){
        user_email =  data.user.email
      }

      const timeout = setTimeout(() => {
        goto('/dashboard');
      }, 1800); // Wait 1.8 seconds before redirecting
  
      return () => clearTimeout(timeout);
    });
</script>
  
<main class="flex flex-col justify-between items-center w-full h-screen bg-white text-gray-900">
    <!-- Intro Section -->
    <section class="flex flex-col items-center justify-end h-[60vh]">
        
      <div class="mb-4">
        <div class="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white ring-offset-2 ring-offset-gray-100 overflow-hidden">
          <img src="/logo-mini.jpg" alt="NotifyTune+ Logo" class="object-cover w-full h-full rounded-full" />
        </div>
      </div>
  
      <!-- Title -->
      <h1 class="text-3xl font-bold text-gray-800 drop-shadow-sm">NotifyAccount</h1>
      <p class="text-sm text-gray-500 mt-2">Native secure auth made personal</p>
      <p class="text-xm text-green-500 mt-2">Welcome back {#if user_email}
        {user_email}
      {/if}</p>
    </section>
  
    <!-- Footer Section -->
    <footer class="text-center mb-6">
      <p class="text-xs text-gray-400">Backed by</p>
      <h2 class="text-md font-semibold text-gray-700">Notifycode Inc.</h2>
    </footer>
  </main>
  