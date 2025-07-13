<script setup>

import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import Footer from '@/components/Footer.vue';
import { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { useI18n } from 'vue-i18n';
import { onMounted, computed } from 'vue';
import defaultCat from '@/assets/avatars/defaultCat.png'

// Lo comentado es para volver a regenerar el archivo breeds-es.json una vez eliminado

// import { useGetData } from '@/composables/getData';
// import { useGetTranslatedBreeds } from '@/composables/useSaveBreeds';

// const { getData, data } = useGetData();
// const { saveBreeds } = useGetTranslatedBreeds();

// onMounted(async () => {
//   await getData('/breeds'); 
//   if (data.value && Array.isArray(data.value)) {
//     await saveBreeds(data.value);
//   } else {
//     console.warn("No se han cargado las razas correctamente");
//   }
// });

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
auth.loadFromStorage();
const toast = useToast();


async function logout() {
  try {
    await auth.logout();
    toast.success(t('sesioncerrada'));
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    toast.error(t('errorcerrarsesion'));
  }
}



const { t, locale } = useI18n()


function cambiarIdioma() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
  localStorage.setItem('idioma', locale.value)

}

onMounted(() => {
  auth.loadFromStorage(); 
  auth.loadCustomAvatar()
})

const navbarAvatar = computed(() => {
  if (auth.user?.avatar) {
    return auth.user.avatar // Avatar de Google
  }

  if (auth.customAvatar && auth.customAvatar !== defaultCat) {
    return auth.customAvatar // Avatar personalizado
  }

  return null; // Mostrar icono por defecto
})

</script>

<template>

  <div class="page-wrapper">
    <!-- Navbar -->
    <nav v-if="!route.meta.hideNavbar" class="navbar">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <router-link class="navbar-brand text-white" to="/">
          <img alt="Vue logo" src="@/assets/refugio-de-animales.png" width="30" height="24"
            class="d-inline-block align-text-top" />

          {{ $t('gatosporelmundo') }}

        </router-link>
        <div v-if="auth.isLoggedIn" class="d-flex align-items-center justify-content-center">

          <button @click="cambiarIdioma" class="btn btn-link p-0 border-0 icon-container custom-btn"
            v-tooltip="t('cambiarIdioma')" style="cursor:pointer;">

            <img v-if="locale === 'es'" alt="ES" src="@/assets/es-nuevo.png" width="50" style="margin-top: 1px;"
              class="icon-default" />
            <img v-else alt="EN" src="@/assets/en-nuevo.png" width="50" style="margin-top: 1px;" />
          </button>

          <router-link active-class="active" class="icon-container" v-tooltip="t('home')" style="cursor:pointer;"
            to="/">
            <i class="bi bi-house icon-hover fs-2 icon-default" style="margin-top: 1px;"></i>
            <i class="bi bi-house-fill icon-hover fs-2 icon-active"></i>
          </router-link>

          <router-link active-class="active" class="icon-container" v-tooltip="t('razas')"
            style="cursor:pointer; text-decoration: none;" to="/gatos">
            <!-- Icono normal (visible por defecto) -->
            <i class="fi fi-rr-cat-head fs-3 icon-default" style="margin-top: 8px;"></i>

            <!-- Icono activo (oculto por defecto) -->
            <i class="fi fi-sr-cat-head fs-3 icon-active" style="margin-top: 10px;"></i>
          </router-link>

          <router-link active-class="active" class="icon-container" v-tooltip="t('favoritos')" style="cursor:pointer;"
            to="/favoritos">
            <i class="bi bi-heart icon-hover fs-3 icon-default" style="margin-top: 3px;"></i>
            <i class="bi bi-heart-fill icon-hover fs-3 icon-active"></i>
          </router-link>

          <router-link active-class="active" class="icon-container" v-tooltip="t('perfil')" style="cursor:pointer;"
            to="/perfil">
            <template v-if="navbarAvatar">
              <img :src="navbarAvatar" alt="avatar" class="navbar-avatar-img" style="margin-top: 3px;"/>
            </template>
            <template v-else>
              <i class="bi bi-person icon-hover fs-2 icon-default" style="margin-top: 2px;"></i>
              <i class="bi bi-person-fill icon-hover fs-2 icon-active"  style="margin-top: 2px;"></i>
            </template>
          </router-link>


          <button @click="logout" class="btn btn-link p-0 border-0 icon-container custom-btn"
            v-tooltip="t('cerrarsesion')" style="cursor:pointer; margin-top: 3px;">
            <i class="bi bi-box-arrow-right fs-2 icon-hover"></i>
          </button>

        </div>

        <div v-else class="d-flex align-items-center justify-content-center">
          <button @click="cambiarIdioma" class="btn btn-link p-0 border-0 icon-container custom-btn"
            v-tooltip="t('cambiarIdioma')" style="cursor:pointer;">

            <img v-if="locale === 'es'" alt="ES" src="@/assets/es-nuevo.png" width="50" style="margin-top: 1px;"
              class="icon-default" />
            <img v-else alt="EN" src="@/assets/en-nuevo.png" width="50" style="margin-top: 1px;" />
          </button>

          <router-link active-class="active" class="icon-container" v-tooltip="t('home')" style="cursor:pointer;"
            to="/">
            <i class="bi bi-house icon-hover fs-2 icon-default" style="margin-top: 1px;"></i>
            <i class="bi bi-house-fill icon-hover fs-2 icon-active"></i>
          </router-link>

          <router-link active-class="active" class="icon-container" v-tooltip="t('razas')"
            style="cursor:pointer; text-decoration: none;" to="/gatos">
            <!-- Icono normal (visible por defecto) -->
            <i class="fi fi-rr-cat-head fs-3 icon-default" style="margin-top: 8px;"></i>

            <!-- Icono activo (oculto por defecto) -->
            <i class="fi fi-sr-cat-head fs-3 icon-active" style="margin-top: 10px;"></i>
          </router-link>
          <router-link active-class="active" class="icon-container" v-tooltip="t('iniciarsesion')"
            style="cursor:pointer;" to="/login">
            <i class="bi bi-door-open fs-3 icon-hover"></i>
          </router-link>
        </div>
      </div>
    </nav>


    <!-- Contenido principal -->
    <main :class="route.meta.fullPage ? '' : 'container'">
      <RouterView :key="route.fullPath" />
    </main>

    <Footer v-if="!route.meta.hideFooter"></Footer>

  </div>
</template>

<style scope>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: auto;
  /* Habilita scroll vertical */
  overflow-x: hidden;
  /* Evita scroll horizontal */
}



.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Ocupa al menos toda la altura de la ventana */
}


.navbar {
  background-color: #7444ab;
}

main {
  flex: 1;
  /* Hace que el contenido principal ocupe todo el espacio disponible */
}

a {
  color: white !important;

}



main {
  flex: 1;
  /* Esto empuja el footer al fondo */
}

.custom-btn {
  color: white !important;
  /* Cambia al color que quieras */
  text-decoration: none !important;
  /* Quita el subrayado */
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  /* Tamaño fijo para contenedores */

  color: white;
  gap: 5px;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

/* Efecto hover aplicado al CONTENEDOR (no al icono) */
.icon-container:hover {
  color: #cb9fe1 !important;
  transform: scale(1.10);
}


.icon-hover {
  display: inline-block;
  transition: transform 0.2s ease, color 0.2s ease;
}


.icon-hover:hover {
  color: #cb9fe1;
  transform: scale(1.10);
}

/* Oculta el icono activo por defecto */
.icon-container .icon-active {
  display: none;
}

/* Cuando está activo, muestra icono activo y oculta el normal */
.icon-container.active .icon-active {
  display: inline-block;
  color: #cb9fe1;
  transition: transform 0.2s ease, color 0.2s ease;
}

.icon-active:hover {
  display: inline-block;
  color: white !important;
}

.icon-container.active .icon-default {
  display: none;
}

.custom-toast {
  background-color: #53a785 !important;
  color: #ffffff !important;
  border: 4px solid #ded4d4 !important;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.custom-toast-body {
  font-family: inherit;
}

.navbar-avatar-img {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

</style>
