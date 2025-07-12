<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Podium from './Podium.vue';

const props = defineProps({
  title: String,
  cats: Array,
  prop: String,
  isLifeSpan: Boolean,
  isWeight: Boolean,
  hasContinentSelected: Boolean,
});

const emit = defineEmits(['update-podium', 'highlight-location', 'clear-highlight', 'show-tooltip', 'hide-tooltip']);

const shouldAnimate = ref(false);

const isSingleBreed = computed(() => props.cats.length === 1);

// Retrasa la animación para sincronizar con zoom
onMounted(() => {
  setTimeout(() => {
    shouldAnimate.value = true;
    // Emite los 3 mejores gatos al padre
    if (!isSingleBreed.value) {
      emit('update-podium', props.cats.slice(0, 3));
    } else {
      emit('update-podium', props.cats); // por si hay solo 1
    }
  }, 400); // Igual que la duración de tu zoom
});

watch(() => props.cats, (newCats) => {
  if (!isSingleBreed.value) {
    emit('update-podium', newCats.slice(0, 3));
  } else {
    emit('update-podium', newCats);
  }
});

</script>

<template>
  <section class="ranking-section">

    <h3>{{ title }}</h3>

    <Podium :cats="isSingleBreed ? cats.slice(0, 1) : cats.slice(0, 3)" :ratingType="prop" :animate="shouldAnimate"
      :is-single-breed="isSingleBreed" :hasContinentSelected="hasContinentSelected"
      @highlight-location="$emit('highlight-location', $event)" @clear-highlight="$emit('clear-highlight')"
      @show-tooltip="(catId, cat) => $emit('show-tooltip', catId, cat)"
      @hide-tooltip="(code, cat) => $emit('hide-tooltip', code, cat)" />

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
