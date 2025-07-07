
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/axios';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(localStorage.getItem('auth_token'));
    const isLoggedIn = ref(false);


    function setUser(userData) {
        user.value = userData;
        isLoggedIn.value = true;
        localStorage.setItem('user', JSON.stringify(userData));
    }

    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem('auth_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }

    // function loadFromStorage() {
    //     const stored = localStorage.getItem('user');
    //     if (stored) {
    //         user.value = JSON.parse(stored);
    //         isLoggedIn.value = true;
    //     }
    // }

    function loadFromStorage() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Verifica si el token sigue siendo válido
            api.get('/api/user').then(response => {
                setUser(response.data);
            }).catch(error => {
                logout();
            });
        }

        const stored = localStorage.getItem('user');
        if (stored) {
            user.value = JSON.parse(stored);
            isLoggedIn.value = true;
        }
    }


    async function login(email, password) {

        await api.get('/sanctum/csrf-cookie');
        await api.post('/api/login', { email, password });

        const loginResponse = await api.post('/api/login', { email, password });

        // 3. Guardar el token si viene en la respuesta
        if (loginResponse.data.token) {
            localStorage.setItem('auth_token', loginResponse.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
        }

        const userResponse = await api.get('/api/user');
        setUser(userResponse.data);

        window.location.href = '/';


    }

    async function handleGoogleAuth() {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token) {
            setToken(token);           
            await fetchUser();        
        }
    }

    async function fetchUser() {
        try {
            const response = await api.get('/api/user');
            setUser(response.data);
        } catch (error) {
            logout();
        }
    }





    async function logout() {
        try {
            const token = localStorage.getItem('auth_token');

            if (token) {
                await api.post(
                    '/api/logout',
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (e) {
            if (e.response?.status !== 401) {
                console.error('Logout error:', e);
            }
        } finally {
            user.value = null;
            isLoggedIn.value = false;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');



        }
    }

    return {
        user,
        token,
        isLoggedIn,
        setUser,
        setToken,
        fetchUser,
        handleGoogleAuth,
        login,
        logout,
        loadFromStorage,
    };
});
