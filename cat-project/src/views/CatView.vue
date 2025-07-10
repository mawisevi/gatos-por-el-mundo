<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useFavoritoStore } from "@/store/favoritos";
import { useMissingImagesStore } from '@/store/missingImages';
import { useAuthStore } from '@/store/auth';
import { useFixedFacesStore } from '@/store/fixedFaces';
import { useGetTranslatedBreeds } from '@/composables/useSaveBreeds';
import { useGetData } from '@/composables/getData';
import { useI18n } from 'vue-i18n';


const fixedFaces = useFixedFacesStore();


const missingImages = useMissingImagesStore();

const route = useRoute();
const router = useRouter();
const catImage = ref(null);
const catFound = ref(false);
const selectedCat = ref(null);

const breedsES = ref([]);


const { getData, data: breedsEN, error, loading} = useGetData();

const { t, locale } = useI18n();

const auth = useAuthStore();
auth.loadFromStorage();

const isLoggedIn = computed(() => auth.isLoggedIn);


const isReady = ref(false);

const useFavorito = useFavoritoStore();
const { add, findCat, loadFromStorage } = useFavorito;

watch(
  () => auth.user,
  (newUser) => {
    if (newUser) {
      loadFromStorage();
    }
  },
  { immediate: true }
);


const getCatStyle = (cat, isOtherDimension = false, isCatView = false) => {
  const breedId = cat?.id?.substring(0, 4).toLowerCase();
  const { zoom, x = '0px', y = '0px' } = fixedFaces.getSettings(breedId, isOtherDimension, isCatView);

  return {
    objectPosition: `${x} ${y}`,
    objectFit: 'cover',
    transform: `scale(${zoom})`,
  };
};


const getCatImage = (cat) => {
  if (!cat) return null;

  const breedId = cat.id.toLowerCase(); // Normaliza a minúsculas
  const overrideImage = missingImages.getImage(breedId);


  // Si hay imagen override, úsala; si no, usa la imagen por defecto
  return overrideImage || `https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`;
};

// Características a mostrar con barras
const catFeatures = computed(() => {
  if (!selectedCat.value) return [];

  return [
    { name: t('amabilidad'), value: selectedCat.value.affection_level || 0, max: 5 },
    { name: t('energia'), value: selectedCat.value.energy_level || 0, max: 5 },
    { name: t('sociabilidad'), value: selectedCat.value.social_needs || 0, max: 5 },
    { name: t('vocalización'), value: selectedCat.value.vocalisation || 0, max: 5 },
    { name: t('inteligencia'), value: selectedCat.value.intelligence || 0, max: 5 }
  ];
});

const back = () => {
  router.push("/gatos");
};

// Carga de razas en inglés
async function loadBreedsEN() {
  await getData('/breeds'); 

  if (!Array.isArray(breedsEN.value)) {
    catFound.value = false;
  }
}

// Carga de razas en español
async function loadBreedsES() {
  const { getTranslatedBreeds } = useGetTranslatedBreeds();
  const data = await getTranslatedBreeds();
  if (Array.isArray(data)) {
    breedsES.value = data;
  } else {
    catFound.value = false;
  }
}

// Computed que elige qué razas usar según el idioma
const breedsToShow = computed(() => {
  return locale.value === 'en' ? breedsEN.value : breedsES.value;
});




onMounted(async () => {

  await loadBreedsEN();
  await loadBreedsES();

  const cat = breedsToShow.value.find(
    breed => breed.name.toLowerCase().trim() === route.params.name.toLowerCase().trim()
  );

  if (cat) {
    catImage.value = getCatImage(cat);
    catFound.value = true;
    selectedCat.value = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      temperament: cat.temperament,
      origin: cat.origin,
      life_span: cat.life_span,
      ...cat
    };
    await nextTick();
    isReady.value = true;
  } else {
    catFound.value = false;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  auth.loadFromStorage();

});

watch(locale, () => {
  const cat = breedsToShow.value.find(
    (breed) => breed.name.toLowerCase().trim() === route.params.name.toLowerCase().trim()
  );

  if (cat) {
    selectedCat.value = {
      description: cat.description,
      temperament: cat.temperament,
      origin: cat.origin,
      ...cat
    };
    catImage.value = getCatImage(cat);
    catFound.value = true;
  } else {
    catFound.value = false;
  }
});





</script>


<template>
  <div class="cat-detail-container">
    <!-- Placeholder durante la carga -->
    <div v-if="loading" class="cat-card-view placeholder-loading" aria-hidden="true">
      <div class="cat-header placeholder-glow">
        <h1 class="placeholder col-6"></h1>
        <button class="btn-favorite placeholder col-3"></button>
      </div>

      <div class="cat-content">
        <div class="cat-image-container placeholder-glow">
          <div class="placeholder cat-image-placeholder"></div>
        </div>

        <div class="cat-info">
          <div class="description-section placeholder-glow">
            <h2 class="placeholder col-4"></h2>
            <p>
              <span class="placeholder col-12"></span>
              <span class="placeholder col-11"></span>
              <span class="placeholder col-10"></span>
              <span class="placeholder col-9"></span>
            </p>
          </div>

          <div class="details-section placeholder-glow">
            <div class="detail-item">
              <span class="detail-label placeholder col-3"></span>
              <span class="detail-value placeholder col-8"></span>
            </div>

            <div class="detail-item">
              <span class="detail-label placeholder col-3"></span>
              <span class="detail-value placeholder col-7"></span>
            </div>

            <div class="detail-item">
              <span class="detail-label placeholder col-3"></span>
              <span class="detail-value placeholder col-5"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-section placeholder-glow">
        <h2 class="placeholder col-4"></h2>
        <div class="features-grid">
          <div v-for="n in 5" :key="n" class="feature-item">
            <span class="feature-name placeholder col-3"></span>
            <div class="feature-bar-container">
              <div class="feature-bar placeholder"></div>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-back placeholder col-2"></button>
    </div>



    <div v-else-if="error" class="error-message">
      <h1>Gato no encontrado...</h1>
      <button @click="back()" class="btn btn-outline-secondary">Volver</button>
    </div>

    <div v-else-if="isReady && selectedCat" class="cat-card-view">
      <div class="cat-header">
        <h1>{{ selectedCat.name }}</h1>
        <button :disabled="!isLoggedIn || findCat(selectedCat.name)" @click="add(selectedCat)" class="btn-favorite"
          v-tooltip.bottom="!isLoggedIn ? t('tooltipFavorito') : null">
          {{ !isLoggedIn ? t('agregarfavoritos') : (findCat(selectedCat.name) ? t('enfavoritos') : t('agregarfavoritos')) }}
        </button>
      </div>

      <div class="cat-content">
        <div class="cat-image-container">
          <img :src="catImage" :alt="selectedCat.name" class="cat-image"
            :style="getCatStyle(selectedCat, false, true)" />
        </div>

        <div class="cat-info">
          <div class="description-section">
            <h2>{{ $t('descripcion') }}</h2>
            <p>{{ selectedCat.description }}</p>
          </div>

          <div class="details-section">
            <div class="detail-item">
              <span class="detail-label temperament">{{ $t('temperamento') }}</span>
              <span class="detail-value">{{ selectedCat.temperament || 'Desconocido' }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label origin">{{ $t('origen') }}</span>
              <span class="detail-value">{{ selectedCat.origin || 'Desconocido' }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label lifespan">{{ $t('esperanzavida') }}</span>
              <span class="detail-value">{{ selectedCat.life_span || 'Desconocido' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>{{ $t('caracteristicas') }}</h2>
        <div class="features-grid">
          <div v-for="feature in catFeatures" :key="feature.name" class="feature-item">
            <span class="feature-name">{{ feature.name }}</span>
            <div class="feature-bar-container">
              <div class="feature-bar" :style="{ '--value': feature.value, '--max': feature.max }"
                :data-value="feature.value"></div>
            </div>
          </div>
        </div>
      </div>

      <button @click="back()" class="btn-back">{{ t('volverlista') }}</button>
    </div>


  </div>

</template>
<style scoped>
@keyframes growWidth {
  from {
    width: 0;
    opacity: 0;
    padding-left: 0;
    padding-right: 0;
  }

  to {
    width: calc((var(--value) / var(--max)) * 100%);
    opacity: 1;
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Estilos para los placeholders */
.placeholder-loading {
  pointer-events: none;
  user-select: none;
}

.cat-image-placeholder {
  width: 100%;
  height: 300px;
  background-color: #e2d4f0;
  border-radius: 8px;
}

.placeholder {
  background-color: #d3c1e6;
  border-radius: 4px;
}

/* Ajustes específicos para placeholders */
.detail-label.placeholder,
.feature-name.placeholder {
  height: 24px;
}

.detail-value.placeholder {
  height: 20px;
}

.feature-bar.placeholder {
  width: 100%;
  height: 20px;
  border-radius: 10px;
}

.btn-back.placeholder {
  height: 40px;
  border-radius: 5px;
}

/* Efecto de animación para los placeholders */
.placeholder-glow {
  animation: placeholder-glow 2s ease-in-out infinite;
}

@keyframes placeholder-glow {
  50% {
    opacity: 0.6;
  }
}


.cat-detail-container {
  margin: 0 auto;
  padding: 2rem;
  overflow-y: hidden;
  /* Deshabilitamos scroll por defecto */
  position: relative;
  /* Asegura el contexto de posicionamiento */
  box-sizing: border-box;
  /* Incluye padding en el cálculo de altura */
}


.cat-card-view {
  position: relative;
  background-color: #bda6ea;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;


}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #4f2f63;
  padding-bottom: 1rem;
}

.cat-header h1 {
  margin: 0;
  color: #4f2f63;
  font-weight: bold;
  font-size: 2.2rem;
}

.btn-favorite {
  background-color: #ca5cd4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-favorite:disabled {
  background-color: #a971ae;
  cursor: auto;
}

.btn-favorite:hover:not(:disabled) {
  background-color: #943d9c;
  transform: scale(1.05);
}

.cat-content {
  display: flex;
  gap: 2rem;
}

.cat-image-container {
  flex: 1;
  margin-bottom: 12px;
}

.cat-image {
  width: 370px;
  height: 270px;

  object-fit: cover;
  border-radius: 8px;
  border: 8px solid #5c3b70;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.cat-info {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.description-section h2,
.features-section h2 {
  color: #5c3b70;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  border-bottom: 2px solid #774d91;
  padding-bottom: 0.5rem;
}

.description-section p {
  line-height: 1.6;
  color: #555;
}



.details-section {
  display: flex;
  position: relative;
  flex-wrap: wrap;

  gap: 0.5rem;
  margin-bottom: 0rem;
  background: linear-gradient(rgba(157, 103, 184, 0.35));
  padding: 7px;
  border-radius: 15px;
}



.detail-item {
  flex: 1 1 100px;
  text-align: center;
}

.detail-label {
  position: relative;
  font-size: 1rem;
  color: white;
  height: 30px;
  top: -1px;
  padding-top: 2px;
  width: 100%;
  display: block;
  margin-bottom: 0.3rem;
}

.temperament {
  background-color: #9d67b8;
  border-radius: 12px 0 0 0;
}

.origin {
  background-color: #bf64c7;

}

.lifespan {
  background-color: #b3804d;
  border-radius: 0 12px 0 0;



}

.detail-value {
  color: #333;
}


.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 2 columnas */
  row-gap: 0.5rem;
  /* Espacio entre filas (mantiene tu valor actual) */
  column-gap: 4rem;
  /* Espacio entre elementos */
}

.feature-item {
  margin-bottom: 1rem;
  break-inside: avoid;
  /* Evita que se dividan entre columnas */
}


.feature-name {
  display: inline-block;
  width: 120px;
  font-weight: bold;
  color: #555;
  margin-bottom: 2px;
}


.feature-bar-container {
  position: relative;
  width: 100%;
  height: 40px;
  background: linear-gradient(rgba(157, 103, 184, 0.35));
  border-radius: 50px;
  overflow: hidden;
}

.feature-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: calc((var(--value) / var(--max)) * 100%);
  background-color: #9d67b8;
  border-radius: 50px;
  box-shadow: 2px 0 5px rgba(157, 103, 184, 0.3);
  opacity: 0;
  animation: growWidth 0.6s ease-out forwards;
  animation-delay: 0.3s;
}

.feature-bar::after {
  content: attr(data-value);
  position: absolute;
  right: 22px;
  top: 8px;
  height: 100%;
  width: 5px;
  color: white;

}


.btn-back {
  position: absolute;
  right: 2rem;
  /* Distancia desde el borde derecho */
  bottom: 2rem;
  padding: 0.7rem 1rem;
  background-color: #b3804d;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background-color: #7c552e;
  transform: translateY(-2px);
}



/* Responsive */
@media (max-width: 1200px) {
  .cat-image-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cat-card-view {
    height: 100%;
  }

  .cat-content {
    flex-direction: column;
  }

  .details-section {
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 20px;

  }

  .temperament {
    border-radius: 12px 12px 0 0;
  }

  .lifespan {
    border-radius: 0 0 0 0;
  }

  .feature-name {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 1000px) {}
</style>