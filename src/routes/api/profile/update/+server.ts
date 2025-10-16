import { json, type RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';

export const PUT: RequestHandler = async ({ request, cookies }) => {
  try {
    // Get the user's session from cookies
    const refreshToken = cookies.get('nc_rt');
    const access_token = cookies.get('nc_at');
    
    if (!refreshToken && !access_token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
        user,
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


    const userId = user.id;

    // Validate required fields
    if (!username || !fullName) {
      return json({ error: 'Username and full name are required' }, { status: 400 });
    }

    // Check if username is already taken by another user
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, user_id')
      .eq('username', username.toLowerCase().trim())
      .single();

    if (existingProfile && existingProfile.user_id !== userId) {
      return json({ error: 'Username is already taken' }, { status: 400 });
    }

    // Update user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
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
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      return json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Handle addresses
    if (addresses && Array.isArray(addresses)) {
      // Delete existing addresses
      const { error: deleteError } = await supabase
        .from('addresses')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Address delete error:', deleteError);
      }

      // Insert new addresses
      const validAddresses = addresses
        .filter((addr: any) => addr.street || addr.city || addr.state)
        .map((addr: any) => ({
          user_id: userId,
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
          console.error('Address insert error:', addressError);
          // Don't fail the entire request if addresses fail
        }
      }
    }

    return json({
      success: true,
      profile: {
        id: profile.id,
        username: profile.username,
        fullName: profile.full_name
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};