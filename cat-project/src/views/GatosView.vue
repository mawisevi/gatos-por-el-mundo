<script setup>
import { RouterLink } from "vue-router";
import { useGetData } from '@/composables/getData';
import { useMissingImagesStore } from '@/store/missingImages';
import { useFavoritoStore } from '@/store/favoritos';
import { onMounted, watch, nextTick } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();


const favoritoStore = useFavoritoStore();
const { findCat } = favoritoStore;

const auth = useAuthStore();
auth.loadFromStorage();



const missingImages = useMissingImagesStore();

const { getData, data, error, loading } = useGetData();

const getCatImage = (cat) => {
  if (!cat) return null;
  const breedId = cat.id.toLowerCase();
  const overrideImage = missingImages.getImage(breedId);
  return overrideImage || `https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`;
};

getData("https://api.thecatapi.com/v1/breeds");


async function initTooltips() {
  const bootstrap = await import('bootstrap');
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    if (el._tooltipInstance) {
      el._tooltipInstance.dispose();
    }
    el._tooltipInstance = new bootstrap.Tooltip(el);
  });
}

onMounted(() => {
  initTooltips();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
});

watch(data, async (newVal) => {
  if (newVal && newVal.length) {
    await nextTick();
    initTooltips();
  }
});

</script>


<template>
  <div class="gatos-fullscreen">
    <h1>{{ t('gatosTitulo')}}</h1>
    <p v-if="loading"></p>
    <div class="alert alert-danger mt-2" v-if="error">{{ error }}</div>
    
    <!-- Versión con placeholders -->
    <div v-if="loading" class="gatos-masonry">
      <div v-for="n in 12" :key="`placeholder-${n}`" class="gato-item placeholder-card" aria-hidden="true">
        <div class="placeholder-glow placeholder-image"></div>
        <div class="placeholder-content">
          <span class="placeholder col-8"></span>
          <span class="placeholder col-6"></span>
        </div>
      </div>
    </div>
    
    <!-- Versión real con datos -->
    <div v-else-if="data" class="gatos-masonry">
      <router-link 
        v-for="cat in data" 
        :key="cat.id" 
        :to="`/gatos/${cat.name}`" 
        class="gato-item"
      >
        <div 
          class="favorite-indicator" 
          v-if="findCat(cat.name)"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="En Favoritos"
        >
          <i class="bi bi-heart-fill fs-3"></i>
        </div>
        <img 
          :src="getCatImage(cat)"
          :alt="cat.name" 
          class="gato-image-natural"
        />
        <div class="gato-name-overlay">{{ cat.name }}</div>
      </router-link>
    </div>
  </div>

</template>

<style scoped>
/* Mantén todos tus estilos originales */
.gatos-fullscreen {
  width: 100vw;
  min-height: 100vh;
  margin-left: calc(-50vw + 50%);
  margin-top: -35px;
  padding: 90px;
  box-sizing: border-box;
  background-color: #431b59;
}

h1 {
  text-align: center;
  margin: -22px 0 30px 0;
  color: #ffffff;
  padding-top: 20px;
}

.gatos-masonry {
  columns: 4 200px;
  column-gap: 30px;
  padding: 0 15px;
}

.gato-item {
  display: inline-block;
  width: 100%;
  margin-bottom: 30px;
  position: relative;
  break-inside: avoid;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  background: white;
}

.favorite-indicator {
  position: absolute;
  top: 6px;
  right: 12px;
  color: #ff779e; 
  font-size: 1.5rem;       
  background-color: white;  
  border-radius: 50%;       
  padding-top: 2px;
  padding-bottom: 0px; 
  padding-left: 8px;
  padding-right: 8px;         
  display: inline-block;   


}

.favorite-indicator:hover {
  transform: scale(1.15);
  
}





.gato-item:hover {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.gato-image-natural {
  width: 100%;
  display: block;
  object-fit: cover;
}

.gato-name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 10px;
  text-align: center;
  font-size: 14px;
}

/* Estilos para los placeholders */
.placeholder-card {
  background: #f8f9fa;
  height: 250px; /* Altura aproximada de tus cards */
}

.placeholder-image {
  height: 180px;
  width: 100%;
  background-color: #baa5d0;
}

.placeholder-content {
  padding: 15px;
}

.placeholder {
  background-color: #d3c1e6;
  height: 12px;
  margin-bottom: 8px;
  display: block;
  border-radius: 4px;
}


@media (max-width: 1200px) {
  .gatos-masonry {
    columns: 4 180px;
  }
}

@media (max-width: 900px) {
  .gatos-masonry {
    columns: 3 160px;
  }
}

@media (max-width: 600px) {
  .gatos-masonry {
    columns: 2 140px;
  }
  
  .gato-name-overlay {
    font-size: 12px;
    padding: 8px;
  }
}

@media (max-width: 400px) {
  .gatos-masonry {
    columns: 1 120px;
  }
}
</style>