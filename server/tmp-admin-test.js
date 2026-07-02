const url = 'http://localhost:5000';
const admin = {
  identifier: 'admin@tracknest.com',
  password: 'password123',
};

const run = async () => {
  try {
    const login = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin),
    });
    const loginRes = await login.json();
    console.log('login status', login.status);
    if (!login.ok) {
      console.error('login failed', loginRes);
      process.exit(1);
    }

    const token = loginRes.token;
    console.log('token', token ? `${token.slice(0, 20)}...` : 'none');

    const stats = await fetch(`${url}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsJson = await stats.json();
    console.log('stats status', stats.status, JSON.stringify(statsJson, null, 2));

    const users = await fetch(`${url}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usersJson = await users.json();
    console.log('users status', users.status, JSON.stringify(usersJson, null, 2));
  } catch (error) {
    console.error('test error', error);
    process.exit(1);
  }
};

run();
