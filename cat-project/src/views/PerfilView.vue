<template>
  <div class="profile-container">
    <h1>{{ t('perfil')}}</h1>

    <div v-if="auth.user">
      <p><strong>{{ t('nombrePerfil') }}</strong> {{ auth.user.name }}</p>
      <p><strong>{{ t('correoPerfil') }}</strong> {{ auth.user.email }}</p>

      <div v-if="auth.user.avatar">
        <img :src="auth.user.avatar" alt="Avatar de usuario" class="avatar" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/store/auth'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const auth = useAuthStore()
</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 2rem auto;
  background: #ffffff22;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 1rem;
}
</style>
