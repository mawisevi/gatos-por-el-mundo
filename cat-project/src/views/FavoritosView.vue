<script setup>
import { useFavoritoStore } from "@/store/favoritos";
import { storeToRefs } from "pinia";
import { useAuthStore } from '@/store/auth';
import { useMissingImagesStore } from '@/store/missingImages';
import { useFixedFacesStore } from '@/store/fixedFaces';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fixedFaces = useFixedFacesStore();

const missingImages = useMissingImagesStore();

const auth = useAuthStore();
auth.loadFromStorage();
const useFavorito = useFavoritoStore();

const { favoritos } = storeToRefs(useFavorito);
const { remove } = useFavorito;


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

  const breedId = cat.id.toLowerCase(); 
  const overrideImage = missingImages.getImage(breedId);

  return overrideImage || `https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`;
};


</script>

<template>

<div class="container">

    <div class="favorites-container">
        <div class="favorites-header">
            <h1 class="favorites-title">{{ t('favoritosTitulo')}}</h1>
        </div>

            <div v-if="favoritos.length === 0" class="empty-favorites">
                <div class="empty-state">
                    <img src="../assets/triste.png" alt="Gato triste" class="empty-cat-img">
                    <h3>{{ t('nofavoritos')}}</h3>
                    <p>{{ t('textoFavoritos')}}</p>
                    <router-link to="/gatos" class="btn btn-primary explore-btn">
                        {{ t('explorarGatitos') }}
                    </router-link>
                </div>
            </div>

        <div v-else class="favorites-grid">
            <div v-for="cat in favoritos" :key="cat.id" class="cat-card-fav">
                <div class="cat-card-inner">

                    <div class="cat-info">
                        <h3 class="cat-name text-center">{{ cat.name }}</h3>
                        <img :src=getCatImage(cat) :alt="cat.name" class="cat-image-fav mb-3" :style="getCatStyle(cat, false, true)"/>
                        
                            
                                <div class="cat-actions">
                                    <router-link
                                        :to="`/gatos/${cat.name}`"
                                        class="btn btn-info btn-sm action-btn info"
                                        >
                                        <i class="fas fa-info-circle"></i>{{ t('info')}}
                                    </router-link>
                                    <button
                                        @click="remove(cat.id)"
                                        class="btn btn-danger btn-sm action-btn danger"
                                        >
                                        <i class="fas fa-trash-alt"></i>{{ t('eliminar')}}
                                    </button>
                                </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped>
.favorites-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.favorites-header {
  text-align: center;
  margin-bottom: 2rem;
}

.favorites-title {
  color: #cb9fe1;
  font-weight: 700;
  margin-bottom: 0.5rem;
}


.empty-favorites {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background: #ccafdd;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-cat-img {
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.explore-btn {
background-color: #aa7dcc !important;
border-color: #aa7dcc !important;
border-radius: 50px;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s;
}

.explore-btn:hover {
background-color: #67487e!important;
border-color: #67487e !important;
transform: scale(1.05);


}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.cat-card-fav {
  background: #a282b5;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}


.cat-info {
  padding: 1.2rem;
}

.cat-name {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.cat-image-fav {
    width: 100%;
  max-width: 320px;
  height: auto;
  aspect-ratio: 4 / 3;
  /* Garantiza proporción visual similar */
  object-fit: cover;
  object-position: center;
  border-radius: 8px;

}

.cat-id {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.cat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50px;
  gap: 0.3rem;
}

.action-btn.info {
    background-color: #653480 !important;
    border-color: #653480 !important;
}

.action-btn.danger {
    background-color: #c74d4d !important;
    border-color: #c74d4d !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .favorites-container {
    padding: 1rem;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 576px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .cat-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>