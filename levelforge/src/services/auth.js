// Демо-автентифікація на localStorage.
// Має той самий контракт, що й справжній API (асинхронні login/register/logout),
// тому пізніше цей файл можна замінити викликами до сервера.
const USERS_KEY = "lf_users";
const SESSION_KEY = "lf_session";
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 годин

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(salt + password);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) ?? [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function createUser(name, email, password) {
  const salt = crypto.randomUUID();
  return {
    id: crypto.randomUUID(),
    name,
    email: email.trim().toLowerCase(),
    salt,
    passwordHash: await hashPassword(password, salt),
  };
}

// Демо-акаунт, щоб було чим увійти на захисті
async function ensureDemoUser() {
  if (readUsers().length === 0) {
    writeUsers([await createUser("Олена Коваль", "demo@levelforge.com", "Demo1234")]);
  }
}

function startSession(user) {
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    token: crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_TTL,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { id: session.id, name: session.name, email: session.email };
}

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session || session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { id: session.id, name: session.name, email: session.email };
  } catch {
    return null;
  }
}

export async function login(email, password) {
  await delay();
  await ensureDemoUser();
  const user = readUsers().find((u) => u.email === email.trim().toLowerCase());
  const hash = user ? await hashPassword(password, user.salt) : null;
  // Одне й те саме повідомлення, щоб не розкривати, чи існує такий email
  if (!user || hash !== user.passwordHash) {
    throw new Error("Невірна пошта або пароль");
  }
  return startSession(user);
}

export async function register(name, email, password) {
  await delay();
  await ensureDemoUser();
  const users = readUsers();
  if (users.some((u) => u.email === email.trim().toLowerCase())) {
    throw new Error("Користувач з такою поштою вже існує");
  }
  const user = await createUser(name.trim(), email, password);
  writeUsers([...users, user]);
  return startSession(user);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
