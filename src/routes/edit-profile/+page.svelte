<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
	import { AUTH_SERVER } from '$lib/utils.js';
  
    let { data } = $props()
    
    let currentTab = $state('profile');
    let loading = $state(false);
    let saveLoading = $state(false);
    let error = $state('');
    let success = $state('');
    let user = $state<any>(null);
    let profile = $state<any>(null);
  
    // Profile Info
    let profile_data = $state({
      username: '',
      fullName: '',
      phone: '',
      dateOfBirth: ''
    })
  
    // Addresses
    let addresses = $state([{ 
      id: null,
      label: 'Home', 
      street: '', 
      city: '', 
      state: '', 
      zip: '', 
      country: '',
      deliveryNotes: ''
    }]);
  
    // About You
    let about_data = $state({
      bio: '',
      company: '',
      jobTitle: '',
      websiteUrl: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  
    onMount(async () => {
      if (!data || !data?.user) {
        window.location.href = AUTH_SERVER+'/login?redirect=https://account.notifycode.org/edit-profile';
        return;
      }
      
      user = data.user;
      await loadProfile();
    });
  
    async function loadProfile() {
      loading = true;
      error = '';
  
      try {
        const response = await fetch('/api/profile',
            {
                method:"POST",
                credentials:"include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, userId: user.id})

            },
        );
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Failed to load profile');
        }
  
        profile = result.profile;
  
        // Populate form fields
        profile_data.username = profile.username || '';
        profile_data.fullName = profile.full_name || '';
        profile_data.phone = profile.phone || '';
        profile_data.dateOfBirth = profile.date_of_birth || '';
  
        about_data.bio = profile.bio || '';
        about_data.company = profile.company || '';
        about_data.jobTitle = profile.job_title || '';
        about_data.websiteUrl = profile.website_url || '';
        about_data.timezone = profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
        // Load addresses
        if (result.addresses && result.addresses.length > 0) {
          addresses = result.addresses.map((addr: any) => ({
            id: addr.id,
            label: addr.label || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            zip: addr.zip || '',
            country: addr.country || '',
            deliveryNotes: addr.delivery_notes || ''
          }));
        }
      } catch (err: any) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    function addAddress() {
      addresses = [...addresses, { 
        id: null,
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
  
    async function handleSave() {
      saveLoading = true;
      error = '';
      success = '';
  
      try {
        // Validate based on current tab
        if (currentTab === 'profile') {
          if (!profile_data.username.trim()) {
            error = 'Username is required';
            return;
          }
          if (!profile_data.fullName.trim()) {
            error = 'Full name is required';
            return;
          }
        }
  
        const profileData = {
          user: user,
          username: profile_data.username,
          fullName: profile_data.fullName,
          phone: profile_data.phone,
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
  
        const response = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update profile');
        }
  
        success = 'Profile updated successfully!';
        
        // Reload profile data
        await loadProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          success = '';
        }, 3000);
      } catch (err: any) {
        error = err.message;
      } finally {
        saveLoading = false;
      }
    }
  
    function switchTab(tab: string) {
      currentTab = tab;
      error = '';
      success = '';
    }
  </script>
  
  <main class="min-h-screen bg-white">
    
    <!-- Header -->
    <header class="border-b border-gray-200">
      <div class="max-w-5xl mx-auto px-6 py-6 md:py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl md:text-3xl font-light text-black tracking-tight">
              Edit Profile
            </h1>
            <p class="text-sm md:text-base text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>
          <a 
            href="/dashboard"
            class="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  
    {#if loading}
      <div class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    {:else}
      <div class="max-w-5xl mx-auto px-6 py-8 md:py-12">
        
        <!-- Tabs -->
        <div class="mb-12">
          <div class="flex gap-8 border-b border-gray-200">
            <button
              onclick={() => switchTab('profile')}
              class="pb-4 text-lg font-medium transition-colors border-b-2 {currentTab === 'profile' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            >
              Profile Info
            </button>
            <button
              onclick={() => switchTab('locations')}
              class="pb-4 text-lg font-medium transition-colors border-b-2 {currentTab === 'locations' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            >
              Locations
            </button>
            <button
              onclick={() => switchTab('about')}
              class="pb-4 text-lg font-medium transition-colors border-b-2 {currentTab === 'about' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700'}"
            >
              About
            </button>
          </div>
        </div>
  
        <!-- Messages -->
        {#if error}
          <div class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm md:text-base">{error}</p>
          </div>
        {/if}
  
        {#if success}
          <div class="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-green-600 text-sm md:text-base">{success}</p>
          </div>
        {/if}
  
        <!-- Profile Info Tab -->
        {#if currentTab === 'profile'}
          <div class="max-w-2xl">
            <div class="space-y-8 md:space-y-10">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Username <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Username"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={profile_data.username}
                  required
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={profile_data.fullName}
                  required
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={profile_data.phone}
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors"
                  bind:value={profile_data.dateOfBirth}
                />
              </div>
            </div>
          </div>
        {/if}
  
        <!-- Locations Tab -->
        {#if currentTab === 'locations'}
          <div class="max-w-3xl">
            <div class="space-y-12">
              {#each addresses as address, index}
                <div class="space-y-6 pb-12 border-b border-gray-100 last:border-b-0">
                  <div class="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Label (e.g., Home, Work)"
                      class="flex-1 text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
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
                    class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                    bind:value={address.street}
                  />
  
                  <div class="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                      bind:value={address.city}
                    />
                    <input
                      type="text"
                      placeholder="State/Province"
                      class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                      bind:value={address.state}
                    />
                  </div>
  
                  <div class="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="ZIP/Postal Code"
                      class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                      bind:value={address.zip}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                      bind:value={address.country}
                    />
                  </div>
  
                  <input
                    type="text"
                    placeholder="Delivery Notes (Optional)"
                    class="w-full text-lg py-3 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                    bind:value={address.deliveryNotes}
                  />
                </div>
              {/each}
  
              <button
                type="button"
                onclick={addAddress}
                class="text-gray-600 hover:text-gray-800 text-base md:text-lg transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Another Address
              </button>
            </div>
          </div>
        {/if}
  
        <!-- About Tab -->
        {#if currentTab === 'about'}
          <div class="max-w-2xl">
            <div class="space-y-8 md:space-y-10">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us about yourself"
                  rows="4"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400 resize-none"
                  bind:value={about_data.bio}
                ></textarea>
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={about_data.company}
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="Job Title"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={about_data.jobTitle}
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors placeholder-gray-400"
                  bind:value={about_data.websiteUrl}
                />
              </div>
  
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  class="w-full text-lg py-4 px-0 border-0 border-b border-gray-200 bg-transparent focus:outline-none focus:ring-0 focus:border-gray-800 transition-colors text-gray-600"
                  bind:value={about_data.timezone}
                  readonly
                />
              </div>
            </div>
          </div>
        {/if}
  
        <!-- Save Button -->
        <div class="mt-12 max-w-2xl">
          <button
            type="button"
            onclick={handleSave}
            class="w-full bg-gray-800 text-white text-lg py-4 rounded-full font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
  
      </div>
    {/if}
  
  </main>