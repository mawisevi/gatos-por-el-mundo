<script setup>

import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { onMounted, watch } from 'vue';
import Footer from '@/components/Footer.vue';
import { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
auth.loadFromStorage();
const toast = useToast();


async function logout() {
  try {
    await auth.logout();
    toast.success('Sesión cerrada con éxito');
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    toast.error('Ocurrió un error al cerrar la sesión');
  }
}

onMounted(() => {
  initTooltips();

  
});

watch(() => auth.isLoggedIn, () => {
  initTooltips();
});

async function initTooltips() {
  const bootstrap = await import('bootstrap');
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    if (el._tooltipInstance) {
      el._tooltipInstance.dispose();
    }
    el._tooltipInstance = new bootstrap.Tooltip(el);
    el.addEventListener('mouseleave', () => {
      el._tooltipInstance.hide();
    });

    el.addEventListener('click', () => {
      el._tooltipInstance.hide();
    });
  });
}


</script>

<template>


  <!-- Navbar -->
  <nav v-if="!route.meta.hideNavbar" class="navbar">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <router-link class="navbar-brand text-white" to="/">
        <img alt="Vue logo" src="@/assets/refugio-de-animales.png" width="30" height="24"
          class="d-inline-block align-text-top" />
        Gatos por el Mundo
      </router-link>
      <div v-if="auth.isLoggedIn" class="d-flex align-items-center justify-content-center">

        <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Home" style="cursor:pointer;" to="/">
          <i class="bi bi-house icon-hover fs-2 icon-default" style="margin-top: 1px;"></i>
          <i class="bi bi-house-fill icon-hover fs-2 icon-active"></i>
        </router-link>

        <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Razas" style="cursor:pointer; text-decoration: none;"
          to="/gatos">
          <!-- Icono normal (visible por defecto) -->
          <i class="fi fi-rr-cat-head fs-3 icon-default" style="margin-top: 8px;"></i>

          <!-- Icono activo (oculto por defecto) -->
          <i class="fi fi-sr-cat-head fs-3 icon-active" style="margin-top: 10px;"></i>
        </router-link>

        <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Favoritos" style="cursor:pointer;" to="/favoritos">
          <i class="bi bi-heart icon-hover fs-3 icon-default" style="margin-top: 3px;"></i>
          <i class="bi bi-heart-fill icon-hover fs-3 icon-active" ></i>
        </router-link>

        <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Perfil" style="cursor:pointer;" to="/perfil">
          <i class="bi bi-person icon-hover fs-3 icon-default" style="margin-top: 0px;"></i>
          <i class="bi bi-person-fill icon-hover fs-3 icon-active" ></i>
        </router-link>


        <button @click="logout" class="btn btn-link p-0 border-0 icon-container custom-btn" data-bs-toggle="tooltip"
          data-bs-placement="bottom" title="Cerrar Sesión" style="cursor:pointer;">
          <i class="bi bi-box-arrow-right fs-2 icon-hover"></i>
        </button>
        
      </div>

      <div v-else class="d-flex align-items-center justify-content-center">
         <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Razas" style="cursor:pointer; text-decoration: none;"
          to="/gatos">
          <!-- Icono normal (visible por defecto) -->
          <i class="fi fi-rr-cat-head fs-3 icon-default" style="margin-top: 8px;"></i>

          <!-- Icono activo (oculto por defecto) -->
          <i class="fi fi-sr-cat-head fs-3 icon-active" style="margin-top: 10px;"></i>
        </router-link>
        <router-link active-class="active" class="icon-container" data-bs-toggle="tooltip" data-bs-placement="bottom"
          title="Iniciar sesión" style="cursor:pointer;" to="/login">
          <i class="bi bi-door-open fs-3 icon-hover"></i>
        </router-link>
      </div>
    </div>
  </nav>


  <!-- Contenido principal -->
  <div :class="route.meta.fullPage ? '' : 'container'">
    <RouterView :key="route.fullPath"/>
  </div>

  <Footer v-if="!route.meta.hideFooter"></Footer>


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

.navbar {
  background-color: #864ec4;
}

a {
  color: white !important;

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
</style>
