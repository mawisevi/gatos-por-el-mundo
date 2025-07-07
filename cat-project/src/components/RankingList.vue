<script setup>
import { ref, onMounted, computed } from 'vue';
import Podium from './Podium.vue';

const props = defineProps({
  title: String,
  cats: Array,
  prop: String,
  isLifeSpan: Boolean,
  isWeight: Boolean
});

const shouldAnimate = ref(false);

const isSingleBreed = computed(() => props.cats.length === 1);

// Retrasa la animación para sincronizar con zoom
onMounted(() => {
  setTimeout(() => {
    shouldAnimate.value = true;
  }, 400); // Igual que la duración de tu zoom
});

</script>

<template>
  <section class="ranking-section">
    <h3>{{ title }}</h3>

    <Podium :cats="isSingleBreed ? cats.slice(0, 1) : cats.slice(0, 3)" :ratingType="prop" :animate="shouldAnimate"
      :is-single-breed="isSingleBreed" />

  </section>
</template>

<style scoped>
.ranking-section {
  display: flex;
  flex-direction: column;

}

.ranking-section h3 {
  margin-bottom: 4px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 4px;
  text-align: center;
  font-size: 1.5rem;

}
</style>
