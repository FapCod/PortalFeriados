import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkyuhxzbsiqcjafldhdv.supabase.co';
const supabaseAnonKey = 'sb_publishable_K4o5uEx7CEP0hVh1KZUuWQ_kPPWIg0R';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    console.log('--- Probando Conexión a Supabase ---');
    console.log('URL:', supabaseUrl);
    
    // 1. Probar lectura pública (holiday_types)
    try {
        console.log('\n1. Probando consulta a tabla holiday_types...');
        const { data, error } = await supabase.from('holiday_types').select('*').limit(5);
        if (error) {
            console.error('Error al consultar holiday_types:', error);
        } else {
            console.log('Conexión exitosa a la base de datos! Filas obtenidas:', data);
        }
    } catch (err) {
        console.error('Excepción al consultar holiday_types:', err);
    }

    // 2. Probar autenticación con admin
    try {
        console.log('\n2. Probando inicio de sesión con admin...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@portalferiados.com',
            password: 'admin123'
        });
        
        if (error) {
            console.error('Error de autenticación:', error);
        } else {
            console.log('Inicio de sesión exitoso! ID de usuario:', data.user.id);
            console.log('Detalles de la sesión:', data.session ? 'Token recibido' : 'Sin sesión');
        }
    } catch (err) {
        console.error('Excepción de autenticación:', err);
    }
}

checkConnection();
