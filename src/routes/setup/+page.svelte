<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
    
    let currentStep = $state(1);
    const totalSteps = 3;
    let loading = $state(false);
    let error = $state('');
    let user = $state<any>(null);
  
    // Step 1: Profile Info
    let profile_data = $state({
        username: '',
        fullName:'',
        phone:'',
        dateOfBirth:''
    })
  
    // Step 2: Location
    let addresses = $state([{ 
      label: 'Home', 
      street: '', 
      city: '', 
      state: '', 
      zip: '', 
      country: '',
      deliveryNotes: ''
    }]);
  
    // Step 3: About You
    let about_data = $state({
        bio:'',
        company: '',
        jobTitle :'',
         websiteUrl:'',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  
    onMount(async () => {
      // Check if user is authenticated
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        goto('/login?redirect=/setup');
        return;
      }
      user = await response.json();
    });
  
    function addAddress() {
      addresses = [...addresses, { 
        label: '', 
        street: '', 
        city: '', 
        state: '', 
        zip: '', 
        country: '',
        deliveryNotes: ''
      }];
    }
  
    function removeAddress(index: number) {
      if (addresses.length > 1) {
        addresses = addresses.filter((_, i) => i !== index);
      }
    }
  
    async function handleNext() {
      error = '';
      
      if (currentStep === 1) {
        // Validate profile info
        if (!profile_data.username.trim()) {
          error = 'Username is required';
          return;
        }
        if (!profile_data.fullName.trim()) {
          error = 'Full name is required';
          return;
        }
      }
  
      if (currentStep < totalSteps) {
        currentStep++;
      } else {
        await handleSubmit();
      }
    }
  
    function handleBack() {
      if (currentStep > 1) {
        currentStep--;
        error = '';
      }
    }
  
    async function handleSubmit() {
      loading = true;
      error = '';
  
      try {
        const profileData = {
            username:profile_data.username,
            fullName:profile_data.fullName,
            phone:profile_data.phone,
          dateOfBirth: profile_data.dateOfBirth || null,
          bio: about_data.bio,
          company: about_data.company,
          jobTitle: about_data.jobTitle,
          websiteUrl: about_data.websiteUrl,
          timezone: about_data.timezone,
          addresses: addresses.filter(addr => 
            addr.street || addr.city || addr.state
          )
        };
  
        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Failed to save profile');
        }

        const params = new URLSearchParams(window.location.search);
        let redirect = params.get('redirect') as string;


        if(redirect && redirect.length > 0){
            window.location.href = `${redirect}?token=${result.refreshToken}`;
        }

        goto('/dashboard');
      } catch (err: any) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    function getProgress() {
      return (currentStep / totalSteps) * 100;
    }
  </script>
  
  <main class="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 md:px-8 lg:px-12">
    
    <div class="w-full max-w-2xl">
  
      <!-- Top Brand -->
      <div class="absolute top-6 md:top-8">
        <div class="border border-gray-300 rounded-full px-3 py-1">
          <span class="text-xs md:text-sm font-medium text-gray-700 tracking-wide">NotifyAUTH+</span>
        </div>
      </div>
  
      <!-- Progress Bar -->
      <div class="mb-12 md:mb-16">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          <span class="text-sm text-gray-500">{Math.round(getProgress())}%</span>
        </div>
        <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gray-800 transition-all duration-500 ease-out"
            style="width: {getProgress()}%"
          ></div>
        </div>
      </div>
  
      <!-- Step 1: Profile Info -->
      {#if currentStep === 1}
        <div class="mb-16 md:mb-20">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-8 md:mb-12 leading-none tracking-tight">
            Profile Info
          </h1>
          
          <p class="text-lg md:text-xl text-gray-600 leading-relaxed font-normal mb-16 md:mb-20">
            Let's start with the basics. Tell us about yourself.
          </p>
  
          <div class="space-y-8 md:space-y-12">
            <div>
              <input
                type="text"
                placeholder="Username"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={profile_data.username}
                required
              />
            </div>
  
            <div>
              <input
                type="text"
                placeholder="Full Name"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={profile_data.fullName}
                required
              />
            </div>
  
            <div>
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={profile_data.phone}
              />
            </div>
  
            <div>
              <label class="block text-sm text-gray-500 mb-2">Date of Birth (Optional)</label>
              <input
                type="date"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300"
                bind:value={profile_data.dateOfBirth}
              />
            </div>
          </div>
        </div>
      {/if}
  
      <!-- Step 2: Locations -->
      {#if currentStep === 2}
        <div class="mb-16 md:mb-20">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-8 md:mb-12 leading-none tracking-tight">
            Locations
          </h1>
          
          <p class="text-lg md:text-xl text-gray-600 leading-relaxed font-normal mb-16 md:mb-20">
            Add your addresses for delivery and contact purposes.
          </p>
  
          <div class="space-y-12">
            {#each addresses as address, index}
              <div class="space-y-6 pb-12 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Label (e.g., Home, Work)"
                    class="flex-1 focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                    bind:value={address.label}
                  />
                  {#if addresses.length > 1}
                    <button
                      type="button"
                      onclick={() => removeAddress(index)}
                      class="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  {/if}
                </div>
  
                <input
                  type="text"
                  placeholder="Street Address"
                  class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                  bind:value={address.street}
                />
  
                <div class="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                    bind:value={address.city}
                  />
                  <input
                    type="text"
                    placeholder="State/Province"
                    class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                    bind:value={address.state}
                  />
                </div>
  
                <div class="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="ZIP/Postal Code"
                    class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                    bind:value={address.zip}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                    bind:value={address.country}
                  />
                </div>
  
                <input
                  type="text"
                  placeholder="Delivery Notes (Optional)"
                  class="w-full focus:ring-0 text-base md:text-lg py-3 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                  bind:value={address.deliveryNotes}
                />
              </div>
            {/each}
  
            <button
              type="button"
              onclick={addAddress}
              class="text-gray-600 hover:text-gray-800 text-base md:text-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Another Address
            </button>
          </div>
        </div>
      {/if}
  
      <!-- Step 3: About You -->
      {#if currentStep === 3}
        <div class="mb-16 md:mb-20">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light text-black mb-8 md:mb-12 leading-none tracking-tight">
            About You
          </h1>
          
          <p class="text-lg md:text-xl text-gray-600 leading-relaxed font-normal mb-16 md:mb-20">
            Share more about yourself. All fields are optional.
          </p>
  
          <div class="space-y-8 md:space-y-12">
            <div>
              <textarea
                placeholder="Bio"
                rows="4"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400 resize-none"
                bind:value={about_data.bio}
              ></textarea>
            </div>
  
            <div>
              <input
                type="text"
                placeholder="Company"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={about_data.company}
              />
            </div>
  
            <div>
              <input
                type="text"
                placeholder="Job Title"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={about_data.jobTitle}
              />
            </div>
  
            <div>
              <input
                type="url"
                placeholder="Website URL"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300 placeholder-gray-400"
                bind:value={about_data.websiteUrl}
              />
            </div>
  
            <div>
              <label class="block text-sm text-gray-500 mb-2">Timezone</label>
              <input
                type="text"
                class="w-full focus:ring-0 text-lg md:text-xl py-4 md:py-6 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:border-gray-800 transition-colors duration-300"
                bind:value={about_data.timezone}
                readonly
              />
            </div>
          </div>
        </div>
      {/if}
  
      <!-- Error Message -->
      {#if error}
        <div class="mb-8 md:mb-12">
          <p class="text-red-500 text-base md:text-lg">{error}</p>
        </div>
      {/if}
  
      <!-- Navigation Buttons -->
      <div class="flex gap-4">
        {#if currentStep > 1}
          <button
            type="button"
            onclick={handleBack}
            class="flex-1 bg-gray-100 text-gray-800 text-lg md:text-xl py-4 md:py-6 rounded-full font-medium hover:bg-gray-200 transition-colors duration-200"
            disabled={loading}
          >
            Back
          </button>
        {/if}
        
        <button
          type="button"
          onclick={handleNext}
          class="flex-1 bg-gray-800 text-white text-lg md:text-xl py-4 md:py-6 rounded-full font-medium hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {#if currentStep === totalSteps}
            {loading ? 'Saving...' : 'Complete Setup'}
          {:else}
            Continue
          {/if}
        </button>
      </div>
  
      <!-- Skip Link -->
      {#if currentStep < totalSteps}
        <div class="mt-8 md:mt-12 text-center">
          <button
            type="button"
            onclick={() => currentStep++}
            class="text-gray-500 hover:text-gray-700 text-base md:text-lg transition-colors duration-200"
          >
            Skip this step
          </button>
        </div>
      {/if}
  
    </div>
  
  </main>