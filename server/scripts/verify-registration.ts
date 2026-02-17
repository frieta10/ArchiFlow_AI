
import fetch from 'node-fetch';

async function testRegistration() {
    const email = `test-${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    console.log(`Attempting to register ${email}...`);

    try {
        const port = process.env.PORT || 3002;
        const res = await fetch(`http://localhost:${port}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        if (res.status === 404) {
            console.error('Error: /api/register endpoint not found. Server might need restart.');
            return;
        }

        const data: any = await res.json();

        if (res.ok) {
            console.log('Registration success:', data);
            console.log('User ID:', data.user.id);
            console.log('Role:', data.user.role);
        } else {
            console.error('Registration failed:', data);
        }

    } catch (err) {
        console.error('Request failed:', err);
    }
}

testRegistration();
