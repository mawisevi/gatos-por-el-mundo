<script setup>
import { ref, onMounted } from "vue";
import { useGetData } from "@/composables/getData";
import { Carousel, Slide, Navigation } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import { useMissingImagesStore } from "@/store/missingImages";
import { useFixedFacesStore } from '@/store/fixedFaces';

const fixedFaces = useFixedFacesStore();

const cats = ref([]);
const loading = ref(true);
const error = ref(null);
const missingImages = useMissingImagesStore();

const { getData, data, error: err, loading: load } = useGetData();



const itemsToShow = ref(1)

const updateItemsToShow = () => {
  const width = window.innerWidth;
  if (width >= 1024) {
    itemsToShow.value = 3;
  } else if (width >= 768) {
    itemsToShow.value = 2;
  } else {
    itemsToShow.value = 1;
  }
};

const getCatStyle = (cat, isOtherDimension = false, isCatView = false,) => {
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




onMounted(async () => {
  await getData("https://api.thecatapi.com/v1/breeds");
  if (!err.value) {
    cats.value = data.value; // Asigna directamente todas las razas
    
  } else {
    error.value = err.value;
  }
  loading.value = load.value;
  updateItemsToShow();
  window.addEventListener('resize', updateItemsToShow);


});
</script>

<template>
  <div class="carousel-container">
    <header class="title-header">
      <h1 class="full-width-title">Razas de gatos</h1>
    </header>
    <Carousel :items-to-show="itemsToShow" :autoplay="5000"  :wrap-around="true"  :pause-autoplay-on-hover="true"
      :mouse-drag="false" :touch-drag="false" :transition="1000">

      <Slide v-for="cat in cats" :key="cat.id" class="p-2">
        <div class="cat-card">
          <router-link :to="{ name: 'cat', params: { name: cat.name.toLowerCase() } }">
            <img :src="getCatImage(cat)" :alt="cat.name" :style="getCatStyle(cat, false, true)"/>
            
          </router-link>
          <h5 class="text-center mt-2">{{ cat.name }}</h5>
        </div>
      </Slide>
      <template #addons>
        <Navigation />
      </template>
    </Carousel>
  </div>
</template>


<style>
.title-header {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background-color: #9E78D2;
  padding: 20px 0;

  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  margin-bottom: 20px;
}

.full-width-title {
  color: white;
  text-align: center;
  margin: 0;
  padding: 0;
  font-size: 2.2rem;

  letter-spacing: 1px;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
}

.carousel__slide {
  padding: 0 10px;
  /* Espacio entre tarjetas */
  box-sizing: border-box;
}

.cat-card {
  position: relative;
  height: 100%;
  max-height: 350px;
  width: 340px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #b796dc;
  border-radius: 12px;
  padding: 10px;
  margin: 15px 5px;
  overflow: hidden;
  transition: transform 0.3s ease;
}



.cat-details {
  margin-top: 10px;
  font-size: 0.9rem;
}

.cat-details p {
  margin: 5px 0;
}



.cat-card img {
  width: 100%;
  max-width: 320px;
  height: auto;
  aspect-ratio: 4 / 3;
  /* Garantiza proporción visual similar */
  object-fit: cover;
  object-position: center;
  border-radius: 8px;

}

/* Estilo específico para imágenes verticales */
.cat-card img.vertical-image {
  object-fit: cover;
  object-position: top center;

}


.cat-card:hover {
  transform: scale(1.03);
}


.carousel__prev {
  left: -30px;
  color: white;

}

.carousel__next {
  right: -30px;
  color: white;
}

.carousel__prev:hover,
.carousel__next:hover {
  background: transparent !important;
  box-shadow: none !important;
  outline: none !important;
  color: #b796dc;
}

@media (max-width: 768px) {
  .cat-card {
    height: 300px;
  }
}
</style>