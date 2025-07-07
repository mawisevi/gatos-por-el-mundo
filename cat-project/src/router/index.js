import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
   
    {
      path: '/gatos/',
      name: 'gatos',

      component: () => import('../views/GatosView.vue'),
    },

    {
      path: "/gatos/:name",
      name: "cat",
      component: () => import("../views/CatView.vue"),
    },

    {
      path: "/favoritos",
      name: "favoritos",
      component: () => import("../views/FavoritosView.vue"),
    },

    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
      meta: { hideNavbar: true, hideFooter: true, fullPage: true }
    },

    {
      path: "/register",
      name: "register",
      component: () => import("../views/Registro.vue"),
      meta: { hideNavbar: true, hideFooter: true, fullPage: true }
    },

    {
      path: "/perfil",
      name: "perfil",
      component: () => import("../views/PerfilView.vue"),
    },

    { 
      path: "/google-auth-success", 
      name: "google",
      component: () => import("../views/GoogleAuthSuccess.vue"),
    },


    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
    },



  ],
})

export default router
