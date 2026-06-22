import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as Theme) || 'light';
    });

    // Synchronize theme with HTML attribute and local storage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Load theme from Supabase when user logs in
    useEffect(() => {
        if (session) {
            const fetchUserTheme = async () => {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .select('theme')
                        .eq('id', session.userId)
                        .single();

                    if (!error && data?.theme) {
                        setTheme(data.theme as Theme);
                    }
                } catch (err) {
                    console.error('Error fetching theme from Supabase:', err);
                }
            };
            fetchUserTheme();
        }
    }, [session]);

    // Toggle theme and update in Supabase if logged in
    const toggleTheme = async () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);

        if (session) {
            try {
                await supabase
                    .from('users')
                    .update({ theme: nextTheme })
                    .eq('id', session.userId);
            } catch (err) {
                console.error('Error saving theme to Supabase:', err);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
