const supabaseUrl = 'https://kkyuhxzbsiqcjafldhdv.supabase.co';
const apiKey = 'sb_publishable_K4o5uEx7CEP0hVh1KZUuWQ_kPPWIg0R';

async function testFetchConnection() {
    console.log('--- Diagnóstico de Conexión Supabase (Vía Fetch) ---');
    
    // 1. Probar lectura de la tabla holiday_types
    try {
        console.log('\n1. Consultando tabla holiday_types...');
        const response = await fetch(`${supabaseUrl}/rest/v1/holiday_types?select=*`, {
            method: 'GET',
            headers: {
                'apikey': apiKey,
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        console.log('Status Code:', response.status);
        const text = await response.text();
        console.log('Respuesta:', text);
    } catch (err) {
        console.error('Error en fetch (Lectura DB):', err);
    }

    // 2. Probar Login en Supabase Auth
    try {
        console.log('\n2. Intentando autenticación (signIn)...');
        const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@portalferiados.com',
                password: 'admin123'
            })
        });
        
        console.log('Status Code (Auth):', response.status);
        const text = await response.text();
        console.log('Respuesta (Auth):', text);
    } catch (err) {
        console.error('Error en fetch (Auth):', err);
    }
}

testFetchConnection();
