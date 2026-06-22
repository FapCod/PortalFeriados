async function testSignup() {
    const url = 'https://kkyuhxzbsiqcjafldhdv.supabase.co/auth/v1/signup';
    const apiKey = 'sb_publishable_K4o5uEx7CEP0hVh1KZUuWQ_kPPWIg0R';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@portalferiados.local',
                password: 'admin123',
                data: { username: 'admin' }
            })
        });
        
        const status = response.status;
        const text = await response.text();
        console.log('Status Code:', status);
        console.log('Response Body:', text);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testSignup();
