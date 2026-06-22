async function testDb() {
    const url = 'https://kkyuhxzbsiqcjafldhdv.supabase.co/rest/v1/users?select=*';
    const apiKey = 'sb_publishable_K4o5uEx7CEP0hVh1KZUuWQ_kPPWIg0R';
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        const status = response.status;
        const text = await response.text();
        console.log('Status Code:', status);
        console.log('Response Body:', text);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}

testDb();
