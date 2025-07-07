
<template>
  <div class="google-auth-success">
    <p>Iniciando sesión con Google...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'


const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  await auth.handleGoogleAuth()
  router.push('/') // Redirige a home o donde quieras

});

</script>

<style scoped>
.google-auth-success {
  text-align: center;
  padding: 2rem;
  color: #333;
}
</style>
