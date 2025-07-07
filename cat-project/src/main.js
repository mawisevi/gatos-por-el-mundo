import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.css'
import 'bootstrap'
import '@/assets/styles/global.css'
import '@flaticon/flaticon-uicons/css/all/all.css';
import Toast,  { POSITION } from 'vue-toastification';
import GoogleSignInPlugin from "vue3-google-signin"



const pinia = createPinia()
const app = createApp(App)


app.use(GoogleSignInPlugin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

app.use(BootstrapVue3)
app.use(Toast, {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  toastClassName: 'custom-toast', 
  bodyClassName: ['custom-toast-body'], 
  hideProgressBar: false,
})

app.use(router)

app.use(pinia)
app.mount('#app')

// Restaura sesión al iniciar
import { useAuthStore } from '@/store/auth';
const auth = useAuthStore();
auth.loadFromStorage();
