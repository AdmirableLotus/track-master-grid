import { supabase } from '@/api/supabaseClient';

export async function register({ username, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, full_name: username } },
  });
  if (error) throw new Error(error.message);

  // Create profile row
  if (data.user) {
    await supabase.from('profiles').upsert({
      user_id: data.user.id,
      username,
    });
  }
  return data.user;
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid email or password.');
  return data.user;
}

export async function loginAsGuest() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'demo@pitwall.app',
    password: 'demo1234',
  });
  if (error) throw new Error('Demo account not available.');
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
}

export function getSession() {
  // Supabase handles session persistence automatically
  // This is kept for compatibility but AuthContext uses onAuthStateChange
  return null;
}
