
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { api } from '@/axios';
import { useFavoritoStore } from './favoritos';
import defaultCat from '../assets/avatars/defaultCat.png';


export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(localStorage.getItem('auth_token'));
    const isLoggedIn = ref(false);
    const customAvatar = ref(localStorage.getItem('customAvatar'));


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

    function setCustomAvatar(url) {
        if (user.value?.id) {
            const key = `customAvatar_${user.value.id}`;
            localStorage.setItem(key, url);
            customAvatar.value = url;
        }
    }

    function clearCustomAvatar() {
        customAvatar.value = null;
        localStorage.removeItem('customAvatar');
    }

    function loadCustomAvatar() {
        if (user.value?.id) {
            const key = `customAvatar_${user.value.id}`;
            const stored = localStorage.getItem(key);
            customAvatar.value = stored || defaultCat;
        }
    }

    // WATCHER para actualizar customAvatar cuando cambia el usuario
    watch(user, (newUser) => {
        if (newUser?.id) {
            customAvatar.value = getCustomAvatar(newUser.id);
        } else {
            customAvatar.value = null;
        }
    }, { immediate: true });

    function saveCustomAvatar(userId, avatar) {
        localStorage.setItem(`customAvatar_${userId}`, avatar);
    }

    function getCustomAvatar(userId) {
        return localStorage.getItem(`customAvatar_${userId}`) || defaultCat;
    }


    async function login(email, password) {

        await api.get('/sanctum/csrf-cookie');

        const loginResponse = await api.post('/api/login', { email, password });

        // 3. Guardar el token si viene en la respuesta
        if (loginResponse.data.token) {
            localStorage.setItem('auth_token', loginResponse.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
        }

        const userResponse = await api.get('/api/user');
        setUser(userResponse.data);
        customAvatar.value = localStorage.getItem(`customAvatar_${userResponse.data.id}`) || defaultCat;

        const favoritoStore = useFavoritoStore();
        favoritoStore.loadFromStorage();

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
        const favoritoStore = useFavoritoStore();
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
            favoritoStore.clear();
            user.value = null;
            isLoggedIn.value = false;
            localStorage.removeItem('customAvatar');
            customAvatar.value = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');



        }
    }

    return {
        user,
        token,
        isLoggedIn,
        customAvatar,
        setUser,
        setToken,
        fetchUser,
        handleGoogleAuth,
        login,
        logout,
        loadFromStorage,
        setCustomAvatar,
        clearCustomAvatar,
        loadCustomAvatar,
        saveCustomAvatar,
        getCustomAvatar
    };
});
