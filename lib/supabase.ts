import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

export function createServerSupabase() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// import { createClient } from '@supabase/supabase-js';
// import { cookies } from 'next/headers';

// function getEnvironmentVariables(){
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//   if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error('Missing environment variables for Supabase');
//   }

//   return { supabaseUrl, supabaseAnonKey };
// }

// export async function createSupabaseClient() {
//   const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
//   const cookieStore = await cookies();
  
//   return createClient(supabaseUrl, supabaseAnonKey, {
//     cookies: {
//       getAll() {
//         return cookieStore.getAll();
//       },
//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value, options })=> 
//             cookieStore.set(name, value, options)
//           );
//           }catch(error) {
//             console.log(error);
//         }
//       }
//     }
//   })
// }