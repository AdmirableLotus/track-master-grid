const USERS_KEY = 'pitwall_users';
const SESSION_KEY = 'pitwall_session';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register({ username, email, password }) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('This username is already taken.');
  }
  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    password, // plain text — fine for a local demo app
    full_name: username,
    role: users.length === 0 ? 'admin' : 'user', // first user is admin
    created_date: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  setSession(user);
  return user;
}

export function login({ email, password }) {
  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) throw new Error('Invalid email or password.');
  setSession(user);
  return user;
}

export function loginAsGuest() {
  const users = getUsers();
  const guest = users.find(u => u.email === 'demo@pitwall.app');
  if (!guest) throw new Error('Demo account not found. Please refresh the page.');
  setSession(guest);
  return guest;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  // Also clear the old single-user key
  localStorage.removeItem('pitwall_user');
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(user) {
  const { password: _, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  localStorage.setItem('pitwall_user', JSON.stringify(safe));
}
