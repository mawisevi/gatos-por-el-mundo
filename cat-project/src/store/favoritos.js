import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from './auth';

export const useFavoritoStore = defineStore("favoritos", () => {
    const favoritos = ref([]);
    const auth = useAuthStore();

    const getStorageKey = () => {
        return `favoritos_${auth.user?.id || 'guest'}`;
    };

    const loadFromStorage = () => {
        const saved = localStorage.getItem(getStorageKey());
        favoritos.value = saved ? JSON.parse(saved) : [];
    };

    const saveToStorage = () => {
        localStorage.setItem(getStorageKey(), JSON.stringify(favoritos.value));
    };

    const add = (cat) => {
        if (!favoritos.value.find(item => item.id === cat.id)) {
            favoritos.value.push(cat);
            saveToStorage();
        }
    };

    const remove = (id) => {
        favoritos.value = favoritos.value.filter((item) => item.id !== id);
        saveToStorage();
    };
   

    const findCat = (name) =>
        favoritos.value.find((item) => item.name === name);

    loadFromStorage();

    return {
        favoritos,
        add,
        remove,
        findCat,
        loadFromStorage,
    };
});