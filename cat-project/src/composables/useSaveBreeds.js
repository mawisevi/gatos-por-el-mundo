import { api } from '@/axios'; // Usamos axios directo para Laravel

export const useGetTranslatedBreeds = () => {
    const saveBreeds = async (breeds) => {
        try {
            console.log("📤 Enviando a Laravel:", breeds);
            const response = await api.post('/api/guardar-razas', {
                data: breeds,
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener razas traducidas:", error);
            throw error;
        }
    };

    // Función para obtener razas traducidas (GET)
    const getTranslatedBreeds = async () => {
        try {
            const response = await api.get('/api/razas-es');
            return response.data;
        } catch (error) {
            console.error("Error al obtener razas traducidas:", error);
            return null;
        }
    };


    return {
        getTranslatedBreeds,
        saveBreeds,
    };
};
