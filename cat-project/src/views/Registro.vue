<template>
    <div class="gradient">
        <div class="container">

            <div class="scratch-container" :class="{ blurred: showSuccessAnimation || showErrorAnimation }">

                <!-- Pata izquierda con líneas -->
                <div class="paw-group left-group">
                    <div v-for="(pos, i) in leftPawFingers" :key="'left-scratch-' + i" class="scratch-line"
                        :style="{ left: pos + '%' }"></div>
                    <div class="cat-paw left"></div>
                </div>


                <div class="cat-silhouette">

                    <form id="register-form" ref="registerForm" class="needs-validation" novalidate
                        @submit.prevent="handleRegister" :class="{ 'was-validated': validated }">
                        <button @click="cambiarIdioma"  class="idioma-button"
                            v-tooltip="t('cambiarIdioma')" style="cursor:pointer;background-color:transparent;" >

                            <img v-if="locale === 'es'" alt="ES" src="@/assets/es.png" width="50" />
                            <img v-else alt="EN" src="@/assets/en.png" width="50" />
                        </button>
                        <h2>{{ t('crearcuenta') }}</h2>
                        

                        <!-- Nombre -->
                        <div class="mb-3">
                            <input type="text" v-model="name" class="form-control" :class="nameValidationClass"
                                @blur="nameTouched = true" required :placeholder="t('nombre')" />
                            <div class="invalid-feedback">
                                {{ t('feedbackNombre') }}
                            </div>
                        </div>

                        <!-- Apellidos -->
                        <div class="mb-3">
                            <input type="text" v-model="surname" class="form-control" :class="surnameValidationClass"
                                @blur="surnameTouched = true" required :placeholder="t('apellidos')" />
                            <div class="invalid-feedback">
                                {{ t('feedbackApellidos') }}
                            </div>
                        </div>

                        <!-- Email -->
                        <div class="mb-3">
                            <input type="email" v-model="email" class="form-control" :class="emailValidationClass"
                                @blur="emailTouched = true" required :placeholder="t('correoelectronico')" />
                            <div class="invalid-feedback">
                                {{ t('feedbackCorreo') }}
                            </div>
                        </div>

                        <!-- Contraseña -->
                        <div class="mb-3">
                            <input type="password" v-model="password" class="form-control"
                                :class="passwordValidationClass" @blur="passwordTouched = true" required
                                :placeholder="t('contraseña')" />
                            <div class="invalid-feedback">
                                {{ t('feedbackContraseña') }}
                            </div>
                        </div>

                        <!-- Confirmar contraseña -->
                        <div class="mb-3">
                            <input type="password" v-model="confirmPassword" class="form-control"
                                :class="confirmPasswordValidationClass" @blur="confirmPasswordTouched = true" required
                                :placeholder="t('confirmarcontraseña')" />
                            <div class="invalid-feedback">
                                {{ t('feedbackConfirmarContraseña') }}
                            </div>
                        </div>

                        <div v-if="passwordMismatch" class="text-danger mb-3">
                            {{ t('feedbackConfirmarContraseña') }}
                        </div>

                        <div class="mb-3">
                            <button type="submit" class="btn btn-primary" :disabled="formDisabled">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"
                                    aria-hidden="true"></span>
                                {{ t('crear') }}
                            </button>
                        </div>

                        <button type="button" @click="loginWithGoogle" class="btn-google">
                            <img src="@/assets/google-icon.png" alt="Google icon" class="google-icon" />
                            {{ t('iniciarsesionGoogle') }}
                        </button>

                        <span class="login-button" @click="irALogin">{{ t('yatengocuenta') }}</span>

                    </form>
                </div>

                <!-- Pata derecha con líneas -->
                <div class="paw-group right-group">
                    <div v-for="(pos, i) in rightPawFingers" :key="'right-scratch-' + i" class="scratch-line"
                        :style="{ left: pos + '%' }"></div>
                    <div class="cat-paw right"></div>
                </div>



            </div>

            <!-- Animación de éxito -->
            <div v-if="showSuccessAnimation" class="animation-overlay">
                <div class="animation-box text-center">
                    <DotLottieVue :src="successLottie" autoplay :loop="false"
                        style="width: 250px; height: 250px; display: block; margin: 0 auto;" />
                    <h4 class="text-dark mb-2">{{ t('registroexitoso') }}</h4>
                    <p class="text-muted mb-1">{{ t('cuentacreada') }}</p>
                    <p class="text-muted mb-3">{{ t('explorar') }}</p>

                    <div class="btn-group">
                        <button class="volver" @click="irARegistro">{{ t('volver') }}</button>
                        <button class="home" @click="irAHome">{{ t('iralinicio') }}</button>
                    </div>
                </div>
            </div>

            <!-- Animación de error -->
            <div v-if="showErrorAnimation" class="animation-overlay">
                <div class="animation-box text-center">
                    <DotLottieVue :src="errorLottie" autoplay :loop="false"
                        style="width: 240px; height: 240px; display: block; margin: 0 auto;" />
                    <h4 class="text-dark mb-2">{{ errorTitle }}</h4>
                    <p class="text-muted mb-1">{{ errorLine1 }}</p>
                    <p class="text-muted mb-3">{{ errorLine2 }}</p>

                    <div class="btn-group">
                        <button class="volver1" @click="irARegistro">Volver</button>

                    </div>
                </div>
            </div>
        </div>



    </div>

</template>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/axios'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

function cambiarIdioma() {
    locale.value = locale.value === 'es' ? 'en' : 'es'
    localStorage.setItem('idioma', locale.value)

}

// Componentes y router
const router = useRouter()

// Datos del formulario
const name = ref('')
const nameTouched = ref(false)

const surname = ref('')
const surnameTouched = ref(false)

const email = ref('')
const emailTouched = ref(false)

const password = ref('')
const passwordTouched = ref(false)

const confirmPassword = ref('')
const confirmPasswordTouched = ref(false)

const validated = ref(false)
const passwordMismatch = ref(false)

const showSuccessAnimation = ref(false)
const successLottie = new URL('@/assets/success.lottie', import.meta.url).href

const showErrorAnimation = ref(false)
const errorLottie = new URL('@/assets/error.lottie', import.meta.url).href

// Variable reactiva para el texto del mensaje de error
const errorTitle = ref('')
const errorLine1 = ref('')
const errorLine2 = ref('')

// Posiciones de las patas
const leftPawFingers = ref([25.2, 44.6, 55.7, 74.7])
const rightPawFingers = ref([25.2, 44.65, 55.8, 74.9])

// Agregación de spinner en el botón Crear
const loading = ref(false)

//Deshabilitar el botón de Crear
const formDisabled = ref(false)

// Refs para elementos DOM
const registerForm = ref(null)

// Definir el usuario
const auth = useAuthStore();

// Validaciones computadas
const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.value))
const emailValidationClass = computed(() =>
    !emailTouched.value ? '' : validEmail.value ? 'is-valid' : 'is-invalid'
)

const validName = computed(() =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(name.value.trim()) && name.value.trim().length >= 2
)
const nameValidationClass = computed(() =>
    !nameTouched.value ? '' : validName.value ? 'is-valid' : 'is-invalid'
)

const validSurname = computed(() =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(surname.value.trim()) && surname.value.trim().length >= 2
)
const surnameValidationClass = computed(() =>
    !surnameTouched.value ? '' : validSurname.value ? 'is-valid' : 'is-invalid'
)

const validPassword = computed(() => password.value.length >= 6)
const passwordValidationClass = computed(() =>
    !passwordTouched.value ? '' : validPassword.value ? 'is-valid' : 'is-invalid'
)

const validConfirmPassword = computed(() =>
    confirmPassword.value === password.value && validPassword.value
)
const confirmPasswordValidationClass = computed(() =>
    !confirmPasswordTouched.value ? '' : validConfirmPassword.value ? 'is-valid' : 'is-invalid'
)

function loginWithGoogle() {
    window.location.href = 'http://127.0.0.1:8000/login-google';
}


// Métodos de navegación
function irALogin() {
    router.push({ name: 'login' })
}



async function irAHome() {

    try {
        await auth.login(email.value, password.value);
        router.push({ name: 'home' });
    } catch (e) {
        console.log(e);
    }

}

function irARegistro() {
    showSuccessAnimation.value = false
    showErrorAnimation.value = false

}

async function getCsrfCookie() {
    await api.get('/sanctum/csrf-cookie');
}

// Envío del formulario
async function handleRegister() {
    if (!validEmail.value || !validName.value || !validConfirmPassword.value) {
        return
    }

    validated.value = true

    const form = registerForm.value
    if (!form?.checkValidity()) {
        return
    }

    loading.value = true
    formDisabled.value = true

    await getCsrfCookie();

    try {

        await api.post('/api/register', {
            name: name.value,
            surname: surname.value,
            email: email.value,
            password: password.value,
            password_confirmation: confirmPassword.value
        })

        showSuccessAnimation.value = true;

    } catch (error) {
        console.error('Error en el registro:', error);

        if (error.response) {
            console.log('Código de estado:', error.response.status);
            console.log('Respuesta:', error.response.data);
        }
        if (error.response && error.response.status === 422) {
            // Error de cuenta existente
            errorTitle.value = t('cuentaexistente')
            errorLine1.value = t('direccioncorreo')
            errorLine2.value = t('otrocorreo')
        } else {
            // Otros errores
            errorTitle.value = t('errorinesperado')
            errorLine1.value = t('completarRegistro')
            errorLine2.value = t('intentar')
        }
        showErrorAnimation.value = true
    } finally {
        loading.value = false
    }

}
</script>


<style>
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


.scratch-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 60px;
    width: auto;
    max-width: 900px; 
    margin: 0 auto;
    
}


/* Grupo de pata */
.paw-group {
    position: relative;
    width: 350px;
    height: 500px;
}

/* Imagen pata */
.cat-paw {
    width: 350px;
    height: 500px;
    background-size: contain;
    background-repeat: no-repeat;
    position: relative;
    z-index: 2;

    /* ajusta para que líneas salgan desde uñas */
    animation: pawMove 2s ease-in-out forwards;
}

.cat-paw.left {
    background-image: url('@/assets/pata_gato.png');
}

.cat-paw.right {
    background-image: url('@/assets/pata_gato.png');
}

/* Líneas */
.scratch-line {
    position: absolute;
    top: -210px;
    width: 2px;
    height: 0;
    background: #ccc;
    transform: translateX(-50%);
    animation: scratchGrow 2.5s ease-in-out forwards;
    z-index: 1;
}

/* Animación que crece la línea */
@keyframes scratchGrow {
    0% {
        height: 0px;
    }

    50% {
        height: 300px;
    }

    85% {
        height: 300px;
        opacity: 1;
    }

    100% {
        height: 300px;
        opacity: 0;
    }
}


@keyframes pawMove {
    0% {
        top: -300px;
    }

    100% {
        top: 50px;
    }
}



.cat-silhouette {
    display: flex;
    max-width: 362px;
    width: 100%;
    z-index: 3;
    background: linear-gradient(180deg,
            #dccce9,
            #d5a4ff);
    padding: 2rem;
    border-radius: 20px;

}



/* ICONO GOOGLE y botón*/
.btn-google {
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

.btn-google:hover {
    background-color: #e86fba !important;
    color: white !important;
}

.google-icon {
    width: 20px;
    height: 20px;
}

/* Formulario centrado dentro de la silueta */
#register-form {
    width: clamp(400px, 55%, 500px);
    position: relative;
    z-index: 1;
    padding: 3;
    align-items: center;

}


#register-form h2 {
    font-size: 35px;
    text-align: center;
    color: #000000;
    margin-bottom: 0.8rem;

}

/* Inputs y botón ocupan todo el ancho disponible del form */
#register-form input,
#register-form button {

    width: 300px;
    border-radius: 25px;
    font-size: 17px;
    padding: 0.6em 1em;
    box-sizing: border-box;

}

#register-form .idioma-button {
    all: unset; /* Anula todos los estilos heredados */
    cursor: pointer;
    background-color: transparent;
    display:flex;
    justify-content: center;
    align-items: center;
    margin-top: -25px;
    margin: -16px auto -4px auto;
}

#register-form .idioma-button img {
    width: 50px;
}


#register-form input {
    padding-left: 20px;
    padding-right: 35px;
}



#register-form input:focus {
    outline: none !important;
    border-color: white;

    box-shadow: inset 0 0 1px 2px rgb(0, 0, 0) !important;
}

input.is-invalid {
    border-width: 3px;
    /* Borde más grueso */

}

input.is-valid {
    border-width: 3px;
    border-color: #9570b4 !important;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%239570b4' d='M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1'/%3e%3c/svg%3e") !important;
}

#register-form button {
    border: none;
    background-color: #9570b4;
    transition: background-color 0.4s ease;
}

#register-form button:hover {
    background-color: #e86fba;
}


.login-button {
    display: block;
    width: max-content;
    margin: 0 auto;
    position: relative;
    border: none;
    color: #766981;
    font-weight: bold;
    cursor: pointer;
    position: relative;
    padding: 23px 27px;
    transition: color 0.3s ease;

    &::after {
        content: "";
        display: block;
        width: 55px;
        position: absolute;
        border-bottom: 2px solid #766981;
        left: -40px;
        top: 34px;
    }

    &::before {
        content: "";
        display: block;
        width: 55px;
        position: absolute;
        border-bottom: 2px solid #766981;
        right: -40px;
        top: 34px;
    }
}

.login-button:hover {
    color: #ffffff;
}

.blurred {
    filter: blur(5px);
    pointer-events: none;
    user-select: none;
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

    max-width: 380px;
    width: 100%;
}

.btn-group {
    align-items: center;
    gap: 20px;


}

.home {
    width: 125px;
    border-radius: 25px;
    font-size: 15px;

    padding: 0.6em 1em;

    background-color: #bb76ce;
    border: 2px solid #bb76ce;
    color: #ffffff;
    transition: background-color 0.3s ease;

}

.volver,
.volver1 {
    width: 125px;
    border-radius: 25px;
    font-size: 15px;
    color: black;
    padding: 0.6em 1em;
    background-color: #ffffff;
    border: 2px solid #000000;

    transition: background-color 0.3s ease;
}



.volver:hover {
    background-color: #e86fba;
    color: white;
    border: 2px solid #e86fba;


}

.volver1:hover {
    background-color: #ff3c00;
    color: #ffffff;
    border: 2px solid #ff3c00;
}

.home:hover {
    background-color: #e86fba;
    border: 2px solid #e86fba;
}
</style>