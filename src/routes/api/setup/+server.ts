import { json, type RequestHandler } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '$lib/server/supabase';


export const POST: RequestHandler = async ({ request, cookies, locals }) => {
  try {
    // Get the user's session from cookies or headers
    const refreshToken = cookies.get('nc_rt');
    
    if (!refreshToken) {
      console.log('Unauthorized ACC_ERROR_RT')
      return json({ error: 'Unauthorized ACC_ERROR_RT' }, { status: 401 });
    }

    const user = locals.user;
    const access_token = locals.accessToken
   
    if (!user && !access_token) {
      console.log('Unauthorized ACC_ERROR_UA')
      return json({ error: 'Unauthorized ACC_ERROR_UA' }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      fullName,
      phone,
      dateOfBirth,
      bio,
      company,
      jobTitle,
      websiteUrl,
      timezone,
      addresses
    } = body;

    // Validate required fields
    if (!username || !fullName) {
      return json({ error: 'Username and full name are required' }, { status: 400 });
    }

    // Check if username is already taken
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .neq('user_id', user?.id)
      .single();

    if (existingProfile) {
      return json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Start a transaction-like operation
    // First, upsert the user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user?.id,
        username: username.toLowerCase().trim(),
        full_name: fullName.trim(),
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        bio: bio || null,
        company: company || null,
        job_title: jobTitle || null,
        website_url: websiteUrl || null,
        timezone: timezone || 'UTC',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return json({ error: 'Failed to save profile' }, { status: 500 });
    }

    // Handle addresses
    if (addresses && addresses.length > 0) {
      // Delete existing addresses
      await supabase
        .from('addresses')
        .delete()
        .eq('user_id', user?.id);

      // Insert new addresses
      const validAddresses = addresses
        .filter((addr: any) => addr.street || addr.city || addr.state)
        .map((addr: any) => ({
          user_id: user?.id,
          label: addr.label || 'Address',
          street: addr.street || null,
          city: addr.city || null,
          state: addr.state || null,
          zip: addr.zip || null,
          country: addr.country || null,
          delivery_notes: addr.deliveryNotes || null,
          created_at: new Date().toISOString()
        }));

      if (validAddresses.length > 0) {
        const { error: addressError } = await supabase
          .from('addresses')
          .insert(validAddresses);

        if (addressError) {
          console.error('Address error:', addressError);
          // Don't fail the entire request if addresses fail
        }
      }
    }

    // Update auth_users metadata to mark profile as complete
    const { error: metadataError } = await supabase
      .from('auth_users')
      .update({
        metadata: { profile_completed: true },
        updated_at: new Date().toISOString()
      })
      .eq('id', user?.id);

    if (metadataError) {
      console.error('Metadata error:', metadataError);
    }

    return json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name
      },
      refreshToken: refreshToken,
    }, { status: 200 });

  } catch (error) {
    console.error('Setup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ cookies, locals }) => {
  try {
    const refreshToken = cookies.get('nc_rt');
    
    if (!refreshToken) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

   const user = locals.user;
   const access_token = locals.accessToken

    if (!access_token && !user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing profile if any
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    // Get existing addresses
    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    return json({
      profile,
      addresses: addresses || []
    }, { status: 200 });

  } catch (error) {
    console.error('Get setup error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};