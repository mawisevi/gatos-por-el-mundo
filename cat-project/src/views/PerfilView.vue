<template>
  <div class="container">
    <div class="profile-container">
      <h1>{{ t('perfil') }}</h1>

      <div v-if="auth.user">
        <p><strong>{{ t('nombrePerfil') }}</strong> {{ auth.user.name }}</p>
        <p><strong>{{ t('correoPerfil') }}</strong> {{ auth.user.email }}</p>

        <div class="avatar-container" v-if="!isGoogleUser" @click="toggleSelector">
          <img :src="selectedAvatar" alt="Avatar de usuario" class="avatar avatar-selected" />
          <p class="change-text">{{ t('cambiarFoto') }}</p>
        </div>

        <!-- Si es de Google, muestra solo su avatar -->
        <div class="avatar-container" v-else>
          <img :src="auth.user.avatar" alt="Avatar de Google" class="avatar" />
        </div>
      </div>

      <!-- Modal para seleccionar imagen -->
      <div v-if="showSelector" class="animation-overlay" @click.self="showSelector = false">
        <div class="animation-box text-center">
          <h4 class="text-dark mb-2">{{ t('seleccionarFoto') }}</h4>
          <div class="avatar-options">
            <img v-for="img in avatarOptions" :key="img" :src="img" class="avatar-option"
              :class="{ selected: pendingAvatar === img }" @click="selectAvatar(img)" />
          </div>

          <div class="btn-group">
            <button class="button-options close" @click="showSelector = false">{{ t('cerrar') }}</button>
            <button @click="guardarCambios" class="button-options save" :disabled="!avatarHasChanged">{{
              t('guardarCambios') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';
import avatar from '../assets/avatars/gato.png';
import avatar1 from '../assets/avatars/gato1.png';
import avatar2 from '../assets/avatars/gato2.png';
import avatar3 from '../assets/avatars/gato3.png';
import avatar4 from '../assets/avatars/gato4.png';
import avatar5 from '../assets/avatars/gato5.png';
import avatar6 from '../assets/avatars/gato6.png';
import avatar7 from '../assets/avatars/gato7.png';
import avatar8 from '../assets/avatars/gato8.png';
import avatar9 from '../assets/avatars/gato9.png';
import avatar10 from '../assets/avatars/gato10.png';
import avatar11 from '../assets/avatars/gato11.png';
import defaultCat from '../assets/avatars/defaultCat.png';

const { t } = useI18n();

const auth = useAuthStore();

const showSelector = ref(false);

const avatarOptions = [avatar, avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10, avatar11];

const isGoogleUser = computed(() => !!auth.user.avatar && !localStorage.getItem('customAvatar'));

const avatarHasChanged = computed(() => {
  return pendingAvatar.value !== auth.customAvatar;
});

const storedAvatar = localStorage.getItem('customAvatar') || defaultCat;
const selectedAvatar = ref(storedAvatar);
const pendingAvatar = ref(storedAvatar);

const changed = ref(false);


auth.loadCustomAvatar();


function selectAvatar(img) {
  pendingAvatar.value = img; // Solo cambia el temporal
}

watch(selectedAvatar, (newVal) => {
  if (newVal !== auth.customAvatar) {
    changed.value = true;
  } else {
    changed.value = false;
  }
});

function guardarCambios() {
  selectedAvatar.value = pendingAvatar.value;  // Actualiza el avatar visible en Perfil
  localStorage.setItem('customAvatar', selectedAvatar.value);
  auth.setCustomAvatar(selectedAvatar.value); // Guarda en localStorage y store
  showSelector.value = false;                   // Cierra el modal
}

function toggleSelector() {
  if (!isGoogleUser.value) {
    showSelector.value = !showSelector.value;
  }
}

</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.container {
  height: calc(100vh - 372px);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-container {
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  /* clave para evitar que crezca demasiado */
  overflow-y: auto;
  /* permite scroll interno solo si es necesario */
  margin: 2rem auto;
  background: #ffffff22;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;

}


.avatar-container {
  cursor: pointer;
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;

  border: 2px solid white;
}

.avatar-selected {
  object-position: center center;
}


.change-text {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #ccc;
}

.animation-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.animation-box {
  background: rgba(246, 234, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* 3 columnas iguales */
  gap: 1rem;
  margin: 1rem 0;
  justify-items: center;
}

.avatar-option {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid transparent;
  cursor: pointer;
  transition: border 0.2s;
}

.avatar-option:hover {
  border-color: #e86fba;
  transform: scale(1.05);
}

.avatar-option.selected {
  border-color: #e86fba;
  /* azul activo */
}

.btn-group {
  gap: 20px;
}

.button-options {
  padding: 0.5rem 1.2rem;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;

}

.button-options.close {
  background-color: #6e30ff;

}

.button-options.save {
  background-color: #e86fba;
}


.button-options.close:hover {
  background-color: #421e96;
  transform: scale(1.05);
}

.button-options.save:not(:disabled):hover {
  background-color: #773a60;
  transform: scale(1.05);
}

.button-options.save:disabled {
  opacity: 0.5;
  cursor: auto;
  transform: scale(1);
}
</style>
