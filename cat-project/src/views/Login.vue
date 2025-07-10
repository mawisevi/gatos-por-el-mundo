<template>
    <div class="gradient">
        <div class="container">
            <button @click="cambiarIdioma" class="btn btn-link p-0 border-0 icon-container custom-btn"
                v-tooltip="t('cambiarIdioma')" style="cursor:pointer; position:absolute; top: 11rem; z-index: 10;">

                <img v-if="locale === 'es'" alt="ES" src="@/assets/es.png" width="50" />
                <img v-else alt="EN" src="@/assets/en.png" width="50" />
            </button>
            <div id="cat-silhouette">
                <form id="login-form" @submit.prevent="handleLogin">
                    <h2>{{ t('iniciarsesion') }}</h2>
                    <input type="email" :placeholder="t('correoelectronico')" v-model="email" />
                    <input type="password" :placeholder="t('contraseña')" v-model="password" />
                    <div class="forgot-password" id="contrañesa-olvidada">
                        <a href="#">{{ t('contraseñaOlvidada') }}</a>
                    </div>

                    <button type="submit" :disabled="formDisabled">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>
                        {{ t('entrar') }}
                    </button>

                    <button type="button" @click="loginWithGoogle" class="btn-google-login">
                        <img src="@/assets/google-icon.png" alt="Google icon" class="google-icon" />
                        {{ t('iniciarsesionGoogle') }}
                    </button>


                </form>
                <div id="register">
                    <p>{{ t('nuevo') }}</p>
                    <button id="btn-circle-login" type="submit" @click="irARegistro">{{ t('crearcuenta') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const auth = useAuthStore();
const router = useRouter();

const toast = useToast();

const email = ref('');
const password = ref('');
const loading = ref(false);
const formDisabled = ref(false);

function cambiarIdioma() {
    locale.value = locale.value === 'es' ? 'en' : 'es'
    localStorage.setItem('idioma', locale.value)

}

function irARegistro() {
    router.push({ name: 'register' })
}


function loginWithGoogle() {
    window.location.href = 'http://127.0.0.1:8000/login-google';
}


async function handleLogin() {
    loading.value = true;
    formDisabled.value = true;
    try {
        await auth.login(email.value, password.value);

        router.push({ name: 'home' });
    } catch (e) {
        if (e.response) {
            if (e.response.status === 401) {
                toast.error(t('credenciales'), {
                    position: 'top-center', toastClassName: 'custom-toast-login',
                    bodyClassName: ['custom-toast-body-login'],
                });
            } else {
                toast.error(t('errorservidor'));
            }
        }
    } finally {
        loading.value = false;
        formDisabled.value = true;

    }
}
</script>

<style>
.custom-toast {
    background-color: #c68787 !important;
    color: #ded4d4 !important;
    border: 4px solid #ded4d4 !important;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.custom-toast-body {
    font-family: inherit;
}


.icon-active {
    display: block;
    position: relative;
    height: 60px;
    width: 60px;
    color: white;
    top: 50px;

}

/* FONDO ANIMADO */
.gradient {

    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    background: linear-gradient(334deg, #6b97f7, #7525e2, #f7137e);
    background-size: 180% 180%;
    animation: gradient-animation 6s ease infinite;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    align-items: center;
}

@keyframes gradient-animation {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

/* ICONO GOOGLE y botón*/
.btn-google-login {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 10px;
    background-color: #ffffff !important;
    color: #7b4ba3 !important;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.btn-google-login:hover {
    background-color: #e548a9 !important;
    color: white !important;
}

.google-icon {
    width: 20px;
    height: 20px;
}

/* ENLACE CONTRASEÑA OLVIDADA */
#contrañesa-olvidada {
    width: 80%;
    text-align: right;
    font-size: 16px;

}

#contrañesa-olvidada a {

    text-decoration: none;
    color: #9570b4 !important;
}

#contrañesa-olvidada a:hover {
    color: #e548a9 !important;
}

.container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    position: relative;
}



/* Contenedor con la silueta del gato como fondo */
#cat-silhouette {
    position: relative;

    width: 700px;
    height: auto;
    aspect-ratio: 4 / 5;
    margin: 0 auto;
    /* relación de aspecto para mantener la forma */
    background: url('@/assets/cat2.png') no-repeat center center;
    background-size: contain;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-position: center center;
    /* mueve 100px desde la izquierda, vertical centro */
}

#register {
    position: absolute;
    width: 85%;
    min-width: 50px;
    /* evita que se vuelva demasiado pequeño */
    bottom: 13%;
    text-align: center;
}

#register p {
    margin-bottom: clamp(1px, 1.0vw, 6px);
    font-size: 17px;
    font-weight: bold;
    color: #2d1441;
}

#btn-circle-login {
    aspect-ratio: 1 / 1;
    /* mantiene forma cuadrada (círculo con border-radius) */
    width: 88px;
    /* 30% del contenedor, con límites mínimo y máximo */

    border-radius: 50%;
    background-color: #d58f16;
    color: white;
    border: none;
    font-size: 18px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    transform: translateX(286%);
}

#btn-circle-login:hover {
    background-color: #65440b;
}

/* Formulario centrado dentro de la silueta */
#login-form {
    width: 350px;
    /* o ajusta según el espacio dentro de la silueta */
    /* 60% del ancho de la ventana */

    display: flex;
    flex-direction: column;
    gap: 11px;
    /* más fluido para pantallas pequeñas */
    align-items: center;
    box-sizing: border-box;
    margin-bottom: 5px;
}


#login-form h2 {
    font-size: 35px;
    margin-bottom: 0.2rem;
    text-align: center;
    color: #9570b4;

}

/* Inputs y botón ocupan todo el ancho disponible del form */
#login-form input,
#login-form button {
    width: 78%;
    border-radius: 25px;
    font-size: 17px;
    /* escala entre 14 y 18px */
    padding: 0.6em 1em;
    box-sizing: border-box;
}

/* Inputs y botón */
#login-form input {

    border: 1px solid #ccc;
    padding-left: 15px;
    box-sizing: border-box;
    /* asegura que el padding no rompa el ancho */
}

#login-form button {
    border: none;
    background-color: #7b4ba3;
    color: white;
    cursor: pointer;
    transition: background-color 0.4s ease;
}

#login-form button:hover {
    background-color: #e548a9;
}
</style>
