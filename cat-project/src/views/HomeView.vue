<template>

    <div id="home-container" class="container py-4">

        <div class="grid-layout">

            <div id="map-column">

                <WorldMap ref="worldMapRef" id="map-container" :podium-cats="podiumCats"
                    @continent-selected="handleContinentSelected" @reset="handleMapReset" />
            </div>

            <div id="buttons-column" class="d-flex flex-column gap-2">
                <button v-for="continent in continents" :key="continent.id" :data-continent="continent.id"
                    @click="toggleContinent(continent.id)" @mouseover="hoveredContinent = continent.id"
                    @mouseleave="hoveredContinent = null" :class="{ 'active': activeContinent === continent.id }"
                    class="continent-btn">
                    {{ continent.name }}
                    <span v-show="hoveredContinent === continent.id || activeContinent === continent.id"
                        class="count-badge float-end">
                        {{ continentCounts[continent.id] ?? t('cargando') }} {{ (continentCounts[continent.id] === 1) ?
                            t('gato') : t('gatos') }}
                    </span>
                </button>
            </div>

            <div id="cats-list">
                <h2 class="text-center my-3 texto">{{ activeContinent ?
                    $t('rankingDeContinente', { continente: getContinentName(activeContinent) }) :
                    $t('rankingDelMundo') }}</h2>

                <div class="ranking-container">
                    <!-- Wrapper que se mueve -->
                    <div class="ranking-wrapper" :style="wrapperStyle">
                        <div class="ranking-slide">

                            <div v-if="currentContinentCount > 0" class="ranking-button">
                                <div class="ranking-buttons">
                                    <button v-for="rank in rankings" :key="rank.type" @click="selectRanking(rank)"
                                        class='ranking-button w-100' :data-continent="activeContinent || 'world'">
                                        {{ rank.label }}
                                    </button>
                                </div>

                            </div>
                            <div v-else class="no-cats-message text-center p-3">
                                {{ t('razasContinente') }}
                            </div>
                        </div>
                    </div>

                    <!-- Aparece con zoom -->
                    <transition name="zoom" mode="out-in">
                        <div v-if="selectedRanking && !isReturning" class="ranking-content">

                            <RankingList :title="selectedRanking.label" :cats="topCatsByRanking"
                                :prop="selectedRanking.type" :isLifeSpan="isLifeSpan" :isWeight="isWeight"
                                :hasContinentSelected="!!activeContinent" @update-podium="podiumCats = $event"
                                @highlight-location="handleLocationHighlight" @clear-highlight="clearMapHighlight"
                                @show-tooltip="handleShowTooltip" @hide-tooltip="handleHideTooltip" />

                            <button :style="{ display: showNoCatsMessage ? 'none' : 'inline-block' }"
                                @click="startReturn" class="volver-boton">
                                {{ t('volver') }}
                            </button>
                        </div>
                    </transition>


                </div>

            </div>

        </div>
    </div>
    <CatCarrusel class="mb-5" />



</template>

<script setup>
import WorldMap from "@/components/WorldMap.vue";
import CatCarrusel from "@/components/CatCarrusel.vue";
import { ref, onMounted, computed, watch } from 'vue';
import { useGetData } from '@/composables/getData';
import continentCountries from '@/store/continentCountries';
import RankingList from '@/components/RankingList.vue';
import { useMissingImagesStore } from '@/store/missingImages';
import { useI18n } from 'vue-i18n';
import { useGetTranslatedBreeds } from '@/composables/useSaveBreeds';
import countryCoordinates from "@/store/countryCoordinates";



// Ref para controlar el mapa desde el padre
const worldMapRef = ref(null);

const missingImages = useMissingImagesStore();

const { t, locale } = useI18n();
const { getTranslatedBreeds } = useGetTranslatedBreeds();
const translatedBreeds = ref([]);

// Datos reactivos
const cats = ref([]);
const continents = computed(() => [
    { id: 'europe', name: t('europa') },
    { id: 'asia', name: t('asia') },
    { id: 'africa', name: t('africa') },
    { id: 'northAmerica', name: t('americanorte') },
    { id: 'southAmerica', name: t('americasur') },
    { id: 'oceania', name: t('oceania') }
]);

const activeContinent = ref(null);


const hoveredContinent = ref(null);
const selectedRanking = ref(null);

const selectionFromButton = ref(false);
const continentCounts = ref({});
const isReturning = ref(false);
const isFadingOut = ref(false);
const hasMoved = ref(false);

const podiumCats = ref([]);

const wrapperStyle = computed(() => {
    return {
        transform: hasMoved.value ? 'translateX(-50%)' : 'translateX(0)',
        transition: isReturning.value ? 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out' : 'opacity 0.4s ease-in-out',
        opacity: isFadingOut.value ? 0 : 1
    };
});


const { getData, data, error: err, loading: load } = useGetData();


const rankings = computed(() => [
    { type: 'affection_level', label: t('cariñosos') },
    { type: 'life_span', label: t('longevos') },
    { type: 'intelligence', label: t('inteligentes') },
    { type: 'social_needs', label: t('sociables') },
    { type: 'energy_level', label: t('energéticos') },
    { type: 'weight_kg', label: t('pesados') },
    { type: 'vocalisation', label: t('habladores') },
    { type: 'child_friendly', label: t('amigablesniños') },
    { type: 'dog_friendly', label: t('amigablesperros') },
]);




// Mapeo invertido para búsqueda rápida
const countryCodeToContinent = {};
Object.entries(continentCountries).forEach(([continent, codes]) => {
    codes.forEach(code => {
        countryCodeToContinent[code] = continent;
    });
});

// Obtener continente desde country_code
const getContinentFromCat = (cat) => {
    if (!cat?.country_code) return null;

    // Corrección específica
    const code = cat.country_code === 'SP' ? 'SG' : cat.country_code;

    return countryCodeToContinent[code] || null;
};

onMounted(async () => {
    try {
        // Si el idioma es español, carga traducciones primero
        if (locale.value === 'es') {
            const result = await getTranslatedBreeds();
            if (Array.isArray(result)) {
                translatedBreeds.value = result;
            }
        }

        await getData('https://api.thecatapi.com/v1/breeds');


        if (data.value) {
            cats.value = data.value;

            // Calculamos los conteos después de cargar los gatos
            calculateContinentCounts(data.value);

            const homeButton = window._mapAPI?.zoomControl?.homeButton?._element;
            if (homeButton) {
                homeButton.addEventListener('click', () => {
                    activeContinent.value = null;
                });
            }

        }
    } catch (error) {
        console.error("Error cargando gatos:", error);
    }

});

const handleMapReset = () => {
    activeContinent.value = null; // Limpiar selección visual
};


// Función unificada para selección/deselección
const toggleContinent = (continentId) => {
    if (activeContinent.value === continentId) {
        // Deseleccionar y resetear
        activeContinent.value = null;
        resetMapView();
    } else {
        selectionFromButton.value = true;
        // Seleccionar continente primero
        activeContinent.value = continentId;
        // Luego mostrar el continente en el mapa
        window._mapAPI?.showContinentData?.(continentId);
    }
};

const handleContinentSelected = (continentId) => {
    if (selectionFromButton.value) {
        selectionFromButton.value = false; // Consumimos la marca
        return; // Ignoramos este evento duplicado
    }
    if (activeContinent.value === continentId) {
        activeContinent.value = null;
        resetMapView();
    } else {
        activeContinent.value = continentId;
    }
};

const resetMapView = () => {
    if (window._mapAPI?.goHome) {
        window._mapAPI.goHome();
        return true;
    }
    console.error('No se encontró método para resetear el mapa');
    return false;
};

const calculateContinentCounts = (catsArray = cats.value) => {
    continentCounts.value = {};

    const noContinent = [];

    continents.value.forEach(continent => {
        const catsInContinent = catsArray.filter(cat =>
            getContinentFromCat(cat) === continent.id
        );
        continentCounts.value[continent.id] = catsInContinent.length;
    });

    // Identificar gatos sin continente
    catsArray.forEach(cat => {
        const result = getContinentFromCat(cat);
        if (!continents.value.some(c => c.id === result)) {
            noContinent.push(cat);
        }
    });


};



// filtrar y ordenar top 3 según ranking seleccionado
const topCatsByRanking = computed(() => {

    if (!selectedRanking.value || !data.value) return [];


    let filtered = [...data.value].filter(cat => {
        return !activeContinent.value ||
            getContinentFromCat(cat) === activeContinent.value;
    });

    const isSingleBreed = filtered.length === 1;

    // 2. Verifica que la propiedad de ordenamiento exista
    const type = selectedRanking.value.type;

    const getScore = (cat) => {
        if (type === 'life_span') {
            return parseLifeSpan(cat.life_span);
        }
        if (type === 'weight_kg') {
            return parseWeightKg(cat.weight?.metric);
        }
        return cat[type] || 0;
    };


    const sorted = [...filtered].sort((a, b) => getScore(b) - getScore(a));


    const resultCount = isSingleBreed ? 1 : Math.min(3, sorted.length);


    return sorted.slice(0, resultCount).map(cat => {

        const imageUrl = missingImages.getImage(cat.id.substring(0, 4)) ||
            (cat.reference_image_id
                ? `https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`
                : '/images/default-cat.png');

        const score = type === 'life_span'
            ? cat.life_span
            : type === 'weight_kg'
                ? cat.weight?.metric
                : cat[type];

        const translated = translatedBreeds.value.find(b => b.id === cat.id);

        const countryName = translated?.origin || cat.origin;
        const coords = countryCoordinates[cat.country_code] || { latitude: null, longitude: null };

        return {
            id: cat.id,
            name: cat.name,
            score: score,
            image: imageUrl,
            origin: countryName,
            country_code: cat.country_code,
            latitude: coords.latitude,
            longitude: coords.longitude,

        };
    });
});

const parseLifeSpan = (lifeSpanStr) => {
    if (!lifeSpanStr) return 0;

    const [min, max] = lifeSpanStr.split('-').map(s => parseFloat(s.trim()));
    if (!isNaN(min) && !isNaN(max)) {
        return (min + max) / 2;
    }
    return parseFloat(lifeSpanStr) || 0;
};

const parseWeightKg = (weightStr) => {
    if (!weightStr) return 0;

    const [min, max] = weightStr.split('-').map(s => parseFloat(s.trim()));
    if (!isNaN(min) && !isNaN(max)) {
        return (min + max) / 2;
    }
    return parseFloat(weightStr) || 0;
};

const isLifeSpan = computed(() => selectedRanking.value?.type === 'life_span');
const isWeight = computed(() => selectedRanking.value?.type === 'weight_kg');

const currentContinentCount = computed(() => {
    if (!activeContinent.value) {
        // Si no hay continente seleccionado, contamos todas las razas en el mundo
        return Object.values(continentCounts.value).reduce((sum, count) => sum + count, 0);
    }
    return continentCounts.value[activeContinent.value] || 0;
});

const selectRanking = (rank) => {
    isFadingOut.value = true;

    // Espera a que termine el fadeOut
    setTimeout(() => {
        hasMoved.value = true;
        isFadingOut.value = false;
        selectedRanking.value = rank;
    }, 100); // duración del fade
};


const startReturn = () => {
    isReturning.value = true;
    hasMoved.value = false;
    podiumCats.value = [];

    // Esperamos que la animación dure 400ms antes de resetear
    setTimeout(() => {
        selectedRanking.value = null;
        isReturning.value = false;
    }, 400);
};


const getContinentName = (id) => {
    return continents.value.find(c => c.id === id)?.name || '';
};

const showNoCatsMessage = computed(() => {
    return activeContinent.value === 'southAmerica' || currentContinentCount.value === 0;
});

const handleLocationHighlight = (countryCode) => {
    window._mapAPI?.highlightCountry(countryCode);

};

const clearMapHighlight = () => {
    window._mapAPI?.clearCountryHighlight();
};

const handleShowTooltip = (catId, cat) => {
    console.log('CatId:', catId, 'Cat:', cat);
    window._mapAPI?.showCatTooltip(catId, cat);
};

const handleHideTooltip = (catId) => {
    window._mapAPI?.hideCatTooltip(catId);
}






watch(locale, async () => {
    if (locale.value === 'es') {
        const data = await getTranslatedBreeds();
        if (Array.isArray(data)) {
            translatedBreeds.value = data;
        }
    } else {
        await getData('https://api.thecatapi.com/v1/breeds');
        if (Array.isArray(data.value)) {
            translatedBreeds.value = data.value;
        }

    }
}, { immediate: true });




</script>

<!--Scope hace que no pueda cambiar lo que esta por defecto en vue-->
<style>
body {
    background-color: #431b59;
}

.toolbar {
    margin-bottom: 1rem;
}

button {
    padding: 0.5rem 1rem;

    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    justify-content: center;
    /* centra horizontalmente */
    align-items: center;
}

button:hover {
    background-color: #6ca6e5;
}

#map-column {
    display: flex;
    justify-content: center;
    /* Centra el mapa horizontalmente dentro de su columna */
    align-items: center;
    /* Centra verticalmente si necesitas */

}

/* Contenedor que centra los botones */
#buttons-column {
    display: flex;
    flex-direction: row !important;
    justify-content: center;
    /* centra horizontalmente */
    align-items: center;
    /* centra verticalmente */
    gap: 0.75rem;
    /* espacio entre botones */
    flex-wrap: wrap;
    /* que los botones salten a otra fila si no caben */
    padding: 1rem 0;
}

.grid-layout {
    display: grid;
    grid-template-columns: 1fr 160px 300px;
    gap: 2rem;
}


#map-container {
    min-width: 800px;
    height: 600px;
    background-color: #6ca6e5;
    padding: 20px;
    border-radius: 12px;
}




.continent-btn {
    position: relative;
    padding: 10px 20px;

    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 20px;
}

.continent-btn:hover {
    border: 3px solid #ffffff !important;
    transform: translateY(-5px);
}


.continent-btn[data-continent="europe"] {
    background: #cb9fe1;
    border: 3px solid #cb9fe1;

}

.continent-btn[data-continent="europe"]:hover {
    background: #75498c;


}

.continent-btn[data-continent="asia"] {
    background: #9e78d2;
    border: 3px solid #9e78d2;

}

.continent-btn[data-continent="asia"]:hover {
    background: #60418b;

}

.continent-btn[data-continent="africa"] {
    background: #c042a2;
    border: 3px solid #c042a2;

}

.continent-btn[data-continent="africa"]:hover {
    background: #852b70;

}

.continent-btn[data-continent="northAmerica"] {
    background: #864ec4;
    border: 3px solid #864ec4;

}

.continent-btn[data-continent="northAmerica"]:hover {
    background: #583385;

}

.continent-btn[data-continent="southAmerica"] {
    background: #d26ed7;
    border: 3px solid #d26ed7;

}

.continent-btn[data-continent="southAmerica"]:hover {
    background: #8a458e;

}

.continent-btn[data-continent="oceania"] {
    background: #c68d54;
    border: 3px solid #c68d54;

}

.continent-btn[data-continent="oceania"]:hover {
    background: #7c5834;

}


.continent-btn.active {
    background: #53a785 !important;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.continent-btn.active:hover {
    background: rgb(72, 123, 108);
    border: 2px solid rgb(72, 123, 108);
}

.count-badge {
    position: absolute;
    top: -17px;
    right: -8px;
    background: #e82b9c;
    color: white;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;

}


.count-badge.active {
    border: 2px solid #ffffff;
}

.texto {
    font-size: 1.6rem;
    font-weight: bold;
}

#cats-list {

    background: rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    padding-bottom: 20px;
    border-radius: 10px;
    color: white;
}




/* Contenedor visible */
.ranking-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;

}

/* Wrapper de los slides */
.ranking-wrapper {
    display: flex;
    width: 200%;


}

.ranking-wrapper.fading {
    opacity: 0;

}

.ranking-wrapper.slide-back {

    opacity: 1;
}



.ranking-button {
    color: #ffffff;
    padding: 10px;
    margin-bottom: 10px;

    transition: background-color 0.4s ease;
}



.ranking-button[data-continent="europe"]:hover,
.ranking-button[data-continent="asia"]:hover,
.ranking-button[data-continent="africa"]:hover,
.ranking-button[data-continent="northAmerica"]:hover,
.ranking-button[data-continent="oceania"]:hover {
    color: #ffffff;
    background-color: #53a785;
    transform: scale(1.03);
    transition: background-color 0.4s ease;
}



.ranking-button[data-continent="world"] {
    background-color: #6ca6e5;
}

.ranking-button[data-continent="world"]:hover {
    background-color: #4e83bc;
    transform: scale(1.03);
}

.ranking-button[data-continent="europe"] {
    background: #cb9fe1;
}

.ranking-button[data-continent="asia"] {
    background: #9e78d2;
}

.ranking-button[data-continent="africa"] {
    background: #c042a2;
}

.ranking-button[data-continent="northAmerica"] {
    background: #864ec4;
}

.no-cats-message {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 1.1rem;
    padding: 20px;
    text-align: center;
    margin-top: 20px;
}

.ranking-button[data-continent="oceania"] {
    background: #c68d54;
}

.ranking-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 5;
    padding-left: 20px;
    padding-right: 20px;
}


/* Cada slide ocupa mitad */
.ranking-slide {
    width: 50%;
    padding: 5px 20px;
    gap: 1px;
    box-sizing: border-box;
}

/* Animación zoom al entrar */
.zoom-enter-active {
    animation: zoomIn 0.4s ease-out;
}

.zoom-leave-active {
    opacity: 0;
    transition: opacity 0.2s ease;
}

@keyframes zoomIn {
    0% {
        transform: scale(0.8);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.volver-boton {
    background-color: #53a785;
    margin-top: 1.6rem;

}

.carrousel-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    margin: 0;
    padding: 0;
}



/* Primero el breakpoint más grande */
@media (max-width: 1400px) {
    .grid-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
    }

    #buttons-column,
    #ranking-column {
        grid-column: 1 / -1;
    }

    #buttons-column {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;

    }

    #ranking-column {
        width: 100%;
    }

    #cats-list {
        height: 608px;
        max-width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;

    }

    .volver-boton {
        background-color: #53a785;
        position: relative;
        top: 308px;

    }

}

/* Luego breakpoints más pequeños */
@media (max-width: 992px) {
    #map-container {
        min-width: unset;
        /* Elimina el mínimo */
        width: 100%;
        height: 400px;
        /* Reduce la altura */
    }

    .continent-btn {
        padding: 8px 16px;
        font-size: 1.0rem;
    }

    .volver-boton {
        background-color: #53a785;
        position: relative;
        top: 322px;

    }


}

/* Breakpoint para móviles muy pequeños */
@media (max-width: 480px) {
    #map-container {
        height: 300px;
        padding: 10px;
    }

    #buttons-column {
        flex-direction: column;
    }
}
</style>
