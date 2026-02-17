
import fetch from 'node-fetch';

async function testGenerate() {
    const email = `gen-test-${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Register
    console.log('Registering user...');
    const regRes = await fetch(`http://localhost:${process.env.PORT || 3002}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const regData: any = await regRes.json();

    if (!regRes.ok) {
        console.error('Registration failed:', regData);
        return;
    }

    const userId = regData.token;
    console.log(`Registered user: ${userId}`);

    // 2. Generate
    console.log('Requesting diagram generation...');
    const genRes = await fetch(`http://localhost:${process.env.PORT || 3002}/api/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify({
            prompt: "Create a simple flowchart for a login process",
            type: "flowchart"
        })
    });

    const genData: any = await genRes.json();

    if (genRes.ok) {
        console.log('Generation Success!');
        console.log('Code:', genData.code);
    } else {
        console.error('Generation Failed:', genData);
    }
}

testGenerate();
