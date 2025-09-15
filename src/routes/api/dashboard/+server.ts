// // src/routes/api/dashboard/+server.ts
// import { json, error, type RequestHandler } from '@sveltejs/kit';
// import { supabase } from '$lib/server/supabase';
// import { z } from 'zod';
// import { authClient } from '$lib/server/auth';

// // Validation schemas
// const userProfileUpdateSchema = z.object({
//   username: z.string().min(3).max(30).optional().nullable(),
//   full_name: z.string().min(1).max(100).optional().nullable(),
//   avatar_url: z.string().url().optional().nullable(),
//   phone: z.string().max(20).optional().nullable(),
//   company: z.string().max(100).optional().nullable(),
//   job_title: z.string().max(100).optional().nullable(),
//   location: z.string().max(100).optional().nullable(),
//   bio: z.string().max(500).optional().nullable(),
//   website_url: z.string().url().optional().nullable(),
// });

// const disconnectAppSchema = z.object({
//   app_id: z.uuid(),
// });

// // Helper function to get user ID from session/auth
// async function getUserId(request: Request): Promise<string> {

//   const authHeader = request.headers.get('authorization');
//   if (!authHeader) {
//     throw error(401, 'Unauthorized - No auth header');
//   }
  
//   // Example implementation - replace with your auth logic
//   const token = authHeader.replace('Bearer ', '');
//   const user = await authClient.validateToken(token);
//   console.log(user)
//   return user.user?.id;
// }

// // Utility function for error responses
// function createErrorResponse(message: string, status: number = 400) {
//   return json({ error: message, success: false }, { status });
// }

// // GET - Fetch dashboard data
// export const GET: RequestHandler = async ({ request, url }) => {
//   try {
//     const userId = await getUserId(request);
//     const dataType = url.searchParams.get('type');

//     switch (dataType) {
//       case 'profile':
//         return await getUserProfile(userId);
//       case 'apps':
//         return await getUserApps(userId);
//       case 'sessions':
//         return await getRecentSessions(userId);
//       case 'all':
//         return await getAllDashboardData(userId);
//       default:
//         return createErrorResponse('Invalid data type parameter', 400);
//     }
//   } catch (err: any) {
//     console.error('Dashboard GET error:', err);
//     return createErrorResponse(err.message || 'Failed to fetch dashboard data', 500);
//   }
// };

// // POST - Handle dashboard actions
// export const POST: RequestHandler = async ({ request }) => {
//   try {
//     const userId = await getUserId(request);
//     const body = await request.json();
//     const { action, data } = body;

//     switch (action) {
//       case 'update_profile':
//         return await updateUserProfile(userId, data);
//       case 'disconnect_app':
//         return await disconnectApp(userId, data);
//       default:
//         return createErrorResponse('Invalid action', 400);
//     }
//   } catch (err: any) {
//     console.error('Dashboard POST error:', err);
//     return createErrorResponse(err.message || 'Failed to process request', 500);
//   }
// };

// // Profile operations
// async function getUserProfile(userId: string) {
//   try {
//     const { data, error: dbError } = await supabase
//       .from('user_profile_complete')
//       .select('*')
//       .eq('id', userId)
//       .single();

//     if (dbError && dbError.code !== 'PGRST116') {
//       throw new Error(`Database error: ${dbError.message}`);
//     }

//     const profileData = data ? {
//       user: {
//         full_name: data.full_name,
//         email: data.email,
//         avatar_url: data.avatar_url,
//         email_verified: data.email_verified,
//       },
//       profile: {
//         username: data.username || '',
//         full_name: data.full_name || '',
//         avatar_url: data.avatar_url || '',
//         phone: data.phone || '',
//         company: data.company || '',
//         job_title: data.job_title || '',
//         location: data.location || '',
//         bio: data.bio || '',
//         website_url: data.website_url || '',
//       }
//     } : null;

//     return json({ 
//       data: profileData, 
//       success: true 
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to fetch user profile: ${err.message}`);
//   }
// }

// async function updateUserProfile(userId: string, profileData: any) {
//   try {
//     // Validate input data
//     const validationResult = userProfileUpdateSchema.safeParse(profileData);
//     if (!validationResult.success) {
//       return createErrorResponse(
//         `Validation error: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
//         400
//       );
//     }

//     const validatedData = validationResult.data;

//     // Check if profile exists
//     const { data: existingProfile, error: checkError } = await supabase
//       .from('user_profiles')
//       .select('id')
//       .eq('user_id', userId)
//       .single();

//     if (checkError && checkError.code !== 'PGRST116') {
//       throw new Error(`Database check error: ${checkError.message}`);
//     }

//     // Clean data - remove empty strings and convert to null
//     const cleanedData = Object.fromEntries(
//       Object.entries(validatedData).map(([key, value]) => [
//         key,
//         value === '' ? null : value
//       ])
//     );

//     if (existingProfile) {
//       // Update existing profile
//       const { error: updateError } = await supabase
//         .from('user_profiles')
//         .update({
//           ...cleanedData,
//           updated_at: new Date().toISOString()
//         })
//         .eq('user_id', userId);

//       if (updateError) {
//         throw new Error(`Update error: ${updateError.message}`);
//       }
//     } else {
//       // Create new profile
//       const { error: insertError } = await supabase
//         .from('user_profiles')
//         .insert([{
//           ...cleanedData,
//           user_id: userId,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         }]);

//       if (insertError) {
//         throw new Error(`Insert error: ${insertError.message}`);
//       }
//     }

//     return json({ 
//       message: 'Profile updated successfully', 
//       success: true 
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to update profile: ${err.message}`);
//   }
// }

// // App operations
// async function getUserApps(userId: string) {
//   try {
//     const { data, error: dbError } = await supabase
//       .from('user_app_access_details')
//       .select('*')
//       .eq('user_id', userId)
//       .eq('is_active', true)
//       .eq('access_valid', true)
//       .order('last_accessed_at', { ascending: false });

//     if (dbError) {
//       throw new Error(`Database error: ${dbError.message}`);
//     }

//     return json({ 
//       data: data || [], 
//       success: true 
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to fetch user apps: ${err.message}`);
//   }
// }

// async function disconnectApp(userId: string, requestData: any) {
//   try {
//     // Validate input
//     const validationResult = disconnectAppSchema.safeParse(requestData);
//     if (!validationResult.success) {
//       return createErrorResponse('Invalid app ID format', 400);
//     }

//     const { app_id } = validationResult.data;

//     // Start a transaction to disconnect app and deactivate sessions
//     const { error: accessError } = await supabase
//       .from('user_app_access')
//       .update({ 
//         is_active: false,
//         updated_at: new Date().toISOString()
//       })
//       .eq('user_id', userId)
//       .eq('app_id', app_id);

//     if (accessError) {
//       throw new Error(`Failed to disconnect app: ${accessError.message}`);
//     }

//     // Deactivate related sessions
//     const { error: sessionError } = await supabase
//       .from('user_app_sessions')
//       .update({ 
//         is_active: false,
//         ended_at: new Date().toISOString()
//       })
//       .eq('user_id', userId)
//       .eq('app_id', app_id);

//     if (sessionError) {
//       console.warn('Failed to deactivate sessions:', sessionError.message);
//       // Don't throw here as the main disconnect succeeded
//     }

//     return json({ 
//       message: 'App disconnected successfully', 
//       success: true 
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to disconnect app: ${err.message}`);
//   }
// }

// // Session operations
// async function getRecentSessions(userId: string) {
//   try {
//     const { data, error: dbError } = await supabase
//       .from('user_app_sessions')
//       .select(`
//         *,
//         sso_applications(app_name, app_key, app_icon_url)
//       `)
//       .eq('user_id', userId)
//       .order('last_accessed_at', { ascending: false })
//       .limit(10);

//     if (dbError) {
//       throw new Error(`Database error: ${dbError.message}`);
//     }

//     return json({ 
//       data: data || [], 
//       success: true 
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to fetch recent sessions: ${err.message}`);
//   }
// }

// // Get all dashboard data in one request
// async function getAllDashboardData(userId: string) {
//   try {
//     const [profileResult, appsResult, sessionsResult] = await Promise.allSettled([
//       getUserProfile(userId),
//       getUserApps(userId),
//       getRecentSessions(userId)
//     ]);

//     // Extract data from successful responses
//     const profile = profileResult.status === 'fulfilled' 
//       ? (await profileResult.value.json()).data 
//       : null;
    
//     const apps = appsResult.status === 'fulfilled' 
//       ? (await appsResult.value.json()).data 
//       : [];
    
//     const sessions = sessionsResult.status === 'fulfilled' 
//       ? (await sessionsResult.value.json()).data 
//       : [];

//     // Log any errors but don't fail the entire request
//     if (profileResult.status === 'rejected') {
//       console.error('Profile fetch failed:', profileResult.reason);
//     }
//     if (appsResult.status === 'rejected') {
//       console.error('Apps fetch failed:', appsResult.reason);
//     }
//     if (sessionsResult.status === 'rejected') {
//       console.error('Sessions fetch failed:', sessionsResult.reason);
//     }

//     return json({
//       data: {
//         profile,
//         apps,
//         sessions
//       },
//       success: true,
//       warnings: [
//         ...(profileResult.status === 'rejected' ? ['Failed to load profile'] : []),
//         ...(appsResult.status === 'rejected' ? ['Failed to load apps'] : []),
//         ...(sessionsResult.status === 'rejected' ? ['Failed to load sessions'] : [])
//       ]
//     });
//   } catch (err: any) {
//     throw new Error(`Failed to fetch dashboard data: ${err.message}`);
//   }
// }


// src/routes/api/dashboard/+server.ts
import { json, error, type RequestHandler } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import { z } from 'zod';
import { authClient } from '$lib/server/auth';

// Validation schemas
const userProfileUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional().nullable(),
  full_name: z.string().min(1).max(100).optional().nullable(),
  avatar_url: z.url().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  website_url: z.url().optional().nullable(),
});

const disconnectAppSchema = z.object({
  app_id: z.uuid(),
});

// Helper function to get user ID from session/auth
async function getUserId(request: Request): Promise<string> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw error(401, 'Unauthorized - No auth header');
  }

  const token = authHeader.replace('Bearer ', '');  
  const user = await authClient.validateToken(token);
  console.log(user)

  if (!user?.user?.id) {
    throw error(401, 'Unauthorized - Invalid token');
  }


  return user.user.id;
}

// Utility function for error responses
function createErrorResponse(message: string, status: number = 400) {
  return json({ error: message, success: false }, { status });
}

// GET - Fetch dashboard data
export const GET: RequestHandler = async ({ request, url }) => {
  try {
    const userId = await getUserId(request);
    const dataType = url.searchParams.get('type');

    switch (dataType) {
      case 'profile':
        return json(await getUserProfile(userId));
      case 'apps':
        return json(await getUserApps(userId));
      case 'sessions':
        return json(await getRecentSessions(userId));
      case 'all':
        return json(await getAllDashboardData(userId));
      default:
        return createErrorResponse('Invalid data type parameter', 400);
    }
  } catch (err: any) {
    console.error('Dashboard GET error:', err);
    return createErrorResponse(err.message || 'Failed to fetch dashboard data', 500);
  }
};

// POST - Handle dashboard actions
export const POST: RequestHandler = async ({ request }) => {
  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update_profile':
        return json(await updateUserProfile(userId, data));
      case 'disconnect_app':
        return json(await disconnectApp(userId, data));
      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (err: any) {
    console.error('Dashboard POST error:', err);
    return createErrorResponse(err.message || 'Failed to process request', 500);
  }
};

// Profile operations
async function getUserProfile(userId: string) {
  try {
    const { data, error: dbError } = await supabase
      .from('user_profile_complete')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      throw new Error(`Database error: ${dbError.message}`);
    }

    const profileData = data
      ? {
          user: {
            full_name: data.full_name,
            email: data.email,
            avatar_url: data.avatar_url,
            email_verified: data.email_verified,
          },
          profile: {
            username: data.username || '',
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            phone: data.phone || '',
            company: data.company || '',
            job_title: data.job_title || '',
            location: data.location || '',
            bio: data.bio || '',
            website_url: data.website_url || '',
          },
        }
      : null;

    return { data: profileData, success: true };
  } catch (err: any) {
    throw new Error(`Failed to fetch user profile: ${err.message}`);
  }
}

async function updateUserProfile(userId: string, profileData: any) {
  try {
    // Validate input data
    const validationResult = userProfileUpdateSchema.safeParse(profileData);
    if (!validationResult.success) {
      return {
        error: `Validation error: ${validationResult.error.issues
          .map(i => i.message)
          .join(', ')}`,
        success: false,
      };
    }

    const validatedData = validationResult.data;

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Database check error: ${checkError.message}`);
    }

    // Clean data - remove empty strings and convert to null
    const cleanedData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => [key, value === '' ? null : value])
    );

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ...cleanedData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            ...cleanedData,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`);
      }
    }

    return { message: 'Profile updated successfully', success: true };
  } catch (err: any) {
    throw new Error(`Failed to update profile: ${err.message}`);
  }
}

// App operations
async function getUserApps(userId: string) {
  try {
    const { data, error: dbError } = await supabase
      .from('user_app_access_details')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('access_valid', true)
      .order('last_accessed_at', { ascending: false });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return { data: data || [], success: true };
  } catch (err: any) {
    throw new Error(`Failed to fetch user apps: ${err.message}`);
  }
}

async function disconnectApp(userId: string, requestData: any) {
  try {
    // Validate input
    const validationResult = disconnectAppSchema.safeParse(requestData);
    if (!validationResult.success) {
      return { error: 'Invalid app ID format', success: false };
    }

    const { app_id } = validationResult.data;

    // Disconnect app
    const { error: accessError } = await supabase
      .from('user_app_access')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('app_id', app_id);

    if (accessError) {
      throw new Error(`Failed to disconnect app: ${accessError.message}`);
    }

    // Deactivate related sessions
    const { error: sessionError } = await supabase
      .from('user_app_sessions')
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('app_id', app_id);

    if (sessionError) {
      console.warn('Failed to deactivate sessions:', sessionError.message);
      // Not throwing here since main disconnect succeeded
    }

    return { message: 'App disconnected successfully', success: true };
  } catch (err: any) {
    throw new Error(`Failed to disconnect app: ${err.message}`);
  }
}

// Session operations
async function getRecentSessions(userId: string) {
  try {
    const { data, error: dbError } = await supabase
      .from('auth_sessions') // ✅ correct table name
      .select(`
        id,
        created_at,
        expires_at,
        ip_address,
        user_agent,
        is_active
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return json({ 
      data: data || [], 
      success: true 
    });
  } catch (err: any) {
    throw new Error(`Failed to fetch recent sessions: ${err.message}`);
  }
}

// Get all dashboard data in one request
async function getAllDashboardData(userId: string) {
  try {
    const [profileResult, appsResult, sessionsResult] = await Promise.allSettled([
      getUserProfile(userId),
      getUserApps(userId),
      getRecentSessions(userId),
    ]);

    // Extract data from results directly
    const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null;
    const apps = appsResult.status === 'fulfilled' ? appsResult.value.data : [];
    const sessions = sessionsResult.status === 'fulfilled' ? sessionsResult.value.data : [];

    // Log any errors but don't fail entire request
    if (profileResult.status === 'rejected') {
      console.error('Profile fetch failed:', profileResult.reason);
    }
    if (appsResult.status === 'rejected') {
      console.error('Apps fetch failed:', appsResult.reason);
    }
    if (sessionsResult.status === 'rejected') {
      console.error('Sessions fetch failed:', sessionsResult.reason);
    }

    return {
      data: {
        profile,
        apps,
        sessions,
      },
      success: true,
      warnings: [
        ...(profileResult.status === 'rejected' ? ['Failed to load profile'] : []),
        ...(appsResult.status === 'rejected' ? ['Failed to load apps'] : []),
        ...(sessionsResult.status === 'rejected' ? ['Failed to load sessions'] : []),
      ],
    };
  } catch (err: any) {
    throw new Error(`Failed to fetch all dashboard data: ${err.message}`);
  }
}
