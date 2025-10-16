import { json, type RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ cookies, request }) => {
  try {
    // Get the user's session from cookies
    const refreshToken = cookies.get('nc_rt');
    const access_token = cookies.get('nc_at');
    
    if (!refreshToken && !access_token) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile error:', profileError);
      return json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Get addresses
    const { data: addresses, error: addressError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (addressError) {
      console.error('Address error:', addressError);
      // Don't fail if addresses can't be fetched
    }

    return json({
      success: true,
      profile: profile || {
        user_id: userId,
        username: '',
        full_name: '',
        phone: null,
        date_of_birth: null,
        bio: null,
        company: null,
        job_title: null,
        website_url: null,
        timezone: 'UTC'
      },
      addresses: addresses || []
    }, { status: 200 });

  } catch (error) {
    console.error('Get profile error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};