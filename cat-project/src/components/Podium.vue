<script setup>
import { computed, ref } from 'vue';
import { useFixedFacesStore } from '@/store/fixedFaces';
import { useMissingImagesStore } from '@/store/missingImages';
import { useWindowSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const fixedFaces = useFixedFacesStore();
const missingImages = useMissingImagesStore();
const { width } = useWindowSize();


const emit = defineEmits(['highlight-location', 'clear-highlight', 'show-tooltip', 'hide-tooltip']);

const props = defineProps({
    cats: Array,
    ratingType: {
        type: String,
        validator: value => ['affection_level', 'life_span', 'intelligence', 'social_needs', 'energy_level', 'weight_kg', 'vocalisation', 'child_friendly', 'dog_friendly'].includes(value)
    },
    isSingleBreed: Boolean,
    hasContinentSelected: Boolean,
});

const isOtherDimension = computed(() => width.value < 1400);

const isHovered1 = ref(false);
const isHovered2 = ref(false);
const isHovered3 = ref(false);


let getFaceStyle = (cat) => {
    const breedId = cat?.id?.substring(0, 4);
    const { zoom, x = '0px', y = '0px' } = fixedFaces.getSettings(breedId, isOtherDimension.value);

    return {
        objectPosition: `${x} ${y}`,  // Combina x e y (ej: "30% 70%")
        objectFit: 'cover',           // Asegura que la imagen cubra el espacio
        transform: `scale(${zoom})`,  // Zoom aplicado

    };
};

const getCatImage = (cat) => {
    const breedId = cat?.id?.substring(0, 4).toLowerCase();
    return missingImages.getImage(breedId) || cat?.image; // Usa la override si existe
};



</script>

<template>
    <div v-if="!cats || cats.length === 0" class="no-cats-message text-center p-3">
        {{ t('rankingContinente') }}
    </div>
    <div v-else :class="['podium-container', { 'single-breed': isSingleBreed }]">
        <!-- 1º lugar -->
        <div class="podium-item" :style="{ '--order': 1 }">
            <span class="podium-rank">{{ t('primero') }} {{ cats[0]?.name }}</span>
            <div class="podium-bar place-1">
                <router-link :to="{ name: 'cat', params: { name: cats[0].name.toLowerCase() } }">
                    <div class="image-container place-1">
                        <div class="image-border place-1">
                            <div class="image-wrapper place-1">
                                <img v-if="getCatImage(cats[0])" :src="getCatImage(cats[0])" class="cat-image place-1"
                                    :style="getFaceStyle(cats[0])" alt="1º lugar" @mouseenter="() => {
                                        if (!hasContinentSelected) {
                                            isHovered1 = true;
                                            emit('highlight-location', { code: cats[0]?.country_code, cat: cats[0] });
                                        } else {
                                            emit('show-tooltip', cats[0]?.id, cats[0]);
                                        }
                                    }" @mouseleave="() => {
                                        if (!hasContinentSelected) {
                                            isHovered1 = false;
                                            emit('clear-highlight');
                                        } else {
                                            emit('hide-tooltip', cats[0]?.id);
                                        }
                                    }" />

                            </div>
                        </div>
                    </div>
                </router-link>
                <span :class="[
                    'rating-value',
                    'place-1',
                    ratingType === 'life_span' ? 'life-span' : '',
                    ratingType === 'weight_kg' ? 'weight-kg' : ''
                ]" :data-cat="cats[0].id">
                    {{ cats[0]?.score ?? '-' }}
                </span>
            </div>
        </div>

        <!-- 2º lugar -->
        <template v-if="!isSingleBreed && cats.length > 1">
            <div class="podium-item" :style="{ '--order': 2 }">
                <span class="podium-rank">{{ t('segundo') }} {{ cats[1]?.name }}</span>
                <div class="podium-bar place-2">
                    <router-link :to="{ name: 'cat', params: { name: cats[1].name.toLowerCase() } }">
                        <div class="image-container place-2">
                            <div class="image-border place-2">
                                <div class="image-wrapper place-2">
                                    <img v-if="getCatImage(cats[1])" :src="getCatImage(cats[1])"
                                        class="cat-image place-2" :style="getFaceStyle(cats[1])" alt="2º lugar"
                                        @mouseenter="() => {
                                            if (!hasContinentSelected) {
                                                isHovered2 = true;
                                                emit('highlight-location', { code: cats[1]?.country_code, cat: cats[1] });
                                            } else {
                                                emit('show-tooltip', cats[1]?.id, cats[1]);
                                            }
                                        }" @mouseleave="() => {
                                            if (!hasContinentSelected) {
                                                isHovered2 = false;
                                                emit('clear-highlight');
                                            } else {
                                                emit('hide-tooltip', cats[1]?.id);
                                            }
                                        }" />

                                </div>
                            </div>
                        </div>
                    </router-link>
                    <span :class="[
                        'rating-value',
                        'place-2',
                        ratingType === 'life_span' ? 'life-span' : '',
                        ratingType === 'weight_kg' ? 'weight-kg' : ''
                    ]" :data-cat="cats[1].id">
                        {{ cats[1]?.score ?? '-' }}
                    </span>
                </div>
            </div>

            <!-- 3º lugar -->
            <div class="podium-item" :style="{ '--order': 3 }">
                <span class="podium-rank">{{ t('tercero') }} {{ cats[2]?.name }}</span>
                <div class="podium-bar place-3">
                    <router-link :to="{ name: 'cat', params: { name: cats[2].name.toLowerCase() } }">
                        <div class="image-container place-3">
                            <div class="image-border place-3">
                                <div class="image-wrapper place-3">
                                    <img v-if="getCatImage(cats[2])" :src="getCatImage(cats[2])"
                                        class="cat-image place-3" :style="getFaceStyle(cats[2])" alt="3º lugar"
                                        @mouseenter="() => {
                                            if (!hasContinentSelected) {
                                                isHovered3 = true;
                                                emit('highlight-location', { code: cats[2]?.country_code, cat: cats[2] });
                                            } else {
                                                emit('show-tooltip', cats[2]?.id, cats[2]);
                                            }
                                        }" @mouseleave="() => {
                                            if (!hasContinentSelected) {
                                                isHovered3 = false;
                                                emit('clear-highlight');
                                            } else {
                                                emit('hide-tooltip', cats[2]?.id);
                                            }
                                        }" />

                                    <!-- Overlay del país -->
                                    <div v-if="isHovered3 && !hasContinentSelected"
                                        class="hover-country-overlay d-flex justify-content-center align-items-center">
                                        <span class="text-white fw-bold text-center px-2">{{ cats[2]?.origin }}</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </router-link>
                    <span :class="[
                        'rating-value',
                        'place-3',
                        ratingType === 'life_span' ? 'life-span' : '',
                        ratingType === 'weight_kg' ? 'weight-kg' : ''
                    ]" :data-cat="cats[2].id">
                        {{ cats[2]?.score ?? '-' }}
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
@keyframes growWidth {
    from {
        width: 0;
        opacity: 0;
        padding-left: 0;
        padding-right: 0;
    }

    to {
        width: var(--target-width);
        opacity: 1;
        padding-left: 1rem;
        padding-right: 1rem;
    }
}

.podium-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1rem;
}

.podium-item {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.podium-rank {

    margin-bottom: 1.1rem;
    font-size: 1rem;
    color: #ffffff;
    opacity: 0;

    animation: fadeIn 0.3s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s);
}

/* ESTADO INICIAL Y ANIMACIÓN COMBINADOS EN UN SOLO BLOQUE */
.podium-bar {
    /* Estado inicial */
    width: 0;
    opacity: 0;
    padding-left: 0;
    padding-right: 0;
    position: relative;

    /* Estilos base */
    height: 50px;
    overflow: visible;
    position: relative;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    transform-origin: left;

    /* Animación */
    animation: growWidth 0.4s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s);
}



.image-container {
    position: relative;
    top: -1.65rem;
    transition: transform 0.3s ease;
    transform-origin: center 20px;
    cursor: pointer;
}



.image-container:hover {
    transform: scale(1.15);
    z-index: 10;
}



.image-border {
    position: absolute;
    top: -8px;
    /* Ajusta según altu    ra del podio */
    width: 70px;
    height: 70px;
    transform: translateX(-52%);
    border-radius: 50%;

    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    opacity: 0;
    animation: fadeIn 0.3s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s + 0.4s);
    box-shadow: 0 8px 5px rgba(0, 0, 0, 0.2);
}

.image-border.place-1 {
    border: 4px solid gold;


}

.image-border.place-2 {
    border: 4px solid rgba(192, 192, 192);

}


.image-border.place-3 {
    border: 4px solid rgba(205, 127, 50);
}


.image-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    position: relative;
    overflow: hidden;


}



.cat-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation: fadeIn 0.3s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s + 0.4s);


}

.rating-value {
    position: absolute;
    transform: translateY(-50%);
    text-align: center;
    font-size: 1.1rem;
    color: white;
    top: 50%;
    padding: 12px 60px;
    border-radius: 12px 0 0 12px;
    padding-right: 12px;
    opacity: 0;
    z-index: -1;
    animation: fadeIn 0.4s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s + 0.4s);

}

.rating-value.place-1 {
    right: 138px;
    background: rgba(0, 0, 0, 0.3);


}

.rating-value.place-2 {
    right: 93px;
    background: rgba(0, 0, 0, 0.3);

}

.rating-value.place-3 {
    right: 54px;
    background: rgba(0, 0, 0, 0.3);

}

.rating-value.life-span {
    font-size: 0.9rem;
    padding: 14px 60px;
    padding-right: 12px;
    white-space: nowrap;
    animation: fadeIn 0.6s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s + 0.6s);
}

.rating-value.weight-kg {
    font-size: 0.9rem;
    padding: 14px 60px;
    padding-right: 12px;
    white-space: nowrap;
    animation: fadeIn 0.6s ease-out forwards;
    animation-delay: calc(var(--order) * 0.3s + 0.6s);
}

.rating-value.place-1.life-span {
    right: 108px;

}

.rating-value.place-2.life-span {
    right: 64px;


}

.rating-value.place-3.life-span {
    right: 25px;

}

.rating-value.place-1.weight-kg {
    right: 118px;
}

.rating-value.place-2.weight-kg {
    right: 75px;
}

.rating-value.place-3.weight-kg {
    right: 35px;
}


/* Colores de borde */
.place-1 {
    --target-width: 100%;
    background: rgba(255, 215, 0);
}

.place-2 {
    --target-width: 80%;
    background: rgba(192, 192, 192);
}

.place-3 {
    --target-width: 62%;
    background: rgba(205, 127, 50);
}

.no-cats-message {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: #fff;
    font-size: 1.1rem;
    padding: 20px;
    text-align: center;
    margin-top: 20px;
}



@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

@media (max-width: 1399.98px) {
    .podium-container {
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        position: relative;
        width: 100%;

    }

    .podium-item:nth-child(1) {
        /* Primer puesto (centro) */
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .podium-item:nth-child(2) {
        /* Segundo puesto (izquierda) */
        position: absolute;
        left: 20%;
        transform: translateX(-50%);
    }

    .podium-item:nth-child(3) {
        /* Tercer puesto (derecha) */
        position: absolute;
        left: 80%;
        transform: translateX(-50%);
    }

    .podium-item {
        flex-direction: column-reverse;
        height: 685px;
        align-items: center;
        z-index: 1;
        width: 200px;

    }


    /* Alturas de las barras */
    .place-1 {
        --target-height: 33%;
        background: linear-gradient(to top, rgba(255, 215, 0, 0.7), gold);
    }

    .place-2 {
        --target-height: 24%;
        background: linear-gradient(to top, rgba(192, 192, 192, 0.7), silver);
    }

    .place-3 {
        --target-height: 16%;
        background: linear-gradient(to top, rgba(205, 127, 50, 0.7), #CD7F32);
    }

    .image-container {
        position: relative;
        transition: transform 0.3s ease;
        transform-origin: 40px 80px;
        right: 2.67rem;
        opacity: 0;
        cursor: pointer;
        animation: fadeIn 0.5s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.4s);
    }

    .image-container.place-1 {
        top: -6.75rem;

    }

    .image-container.place-2 {
        top: -5rem;

    }

    .image-container.place-3 {
        top: -3.25rem;

    }


    .image-container.hovered {
        transform: scale(1.15);
        z-index: 10;
    }


    .image-border {
        position: absolute;
        top: -43px;
        /* Ajusta según altura del podio */
        width: 86px;
        height: 86px;
        transform: translateX(0%);
        border-radius: 50%;

        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10;
        opacity: 0;
        animation: fadeIn 0.3s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.4s);
        box-shadow: 0 8px 5px rgba(0, 0, 0, 0.2);
    }

    .image-border.place-1 {
        border: 6px solid gold;


    }

    .image-border.place-2 {
        border: 6px solid rgba(192, 192, 192);


    }


    .image-border.place-3 {
        border: 6px solid rgba(205, 127, 50);
    }


    .image-wrapper {
        width: 75px;
        height: 75px;
        border-radius: 50%;
        overflow: hidden;

    }


    /* Posición de las imágenes */
    .cat-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.4s);

    }



    /* Texto del ranking */
    .podium-rank {
        min-width: 120px;
        font-size: 1rem;
        color: #ffffff;
        text-align: center;
    }


    @keyframes growHeight {
        from {
            height: 0;
            opacity: 0;
        }

        to {
            height: var(--target-height);
            opacity: 1;
        }
    }

    .podium-bar {
        width: 75px;
        top: -20px;

        position: relative;
        border-radius: 12px 12px 0 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: center;
        animation: growHeight 0.8s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s);
    }

    .rating-value {
        position: absolute;
        transform: translateY(-50%);
        text-align: center;
        font-size: 1.1rem;
        color: white;


        padding: 9px 32.5px;
        border-radius: 12px 12px 0 0;

        opacity: 0;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.6s);

    }

    .rating-value.place-1 {
        right: 0px;
        top: 49px;
        padding-top: 40px;
        background: rgba(0, 0, 0, 0.3);

    }

    .rating-value.place-2 {
        right: 0px;
        top: 43px;
        padding-top: 51px;

        background: rgba(0, 0, 0, 0.3);

    }

    .rating-value.place-3 {
        right: 0px;
        top: 37px;
        padding-top: 60px;
        background: rgba(0, 0, 0, 0.3);

    }


    .rating-value.life-span {
        font-size: 0.85rem;
        padding: 10px 18.5px;
        border-radius: 12px 12px 0 0;
        white-space: nowrap;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.6s);
    }

    .rating-value.place-1.life-span,
    .rating-value.place-1.weight-kg {
        right: 0px;
        top: 45px;
        padding: 50px 18.5px;
        padding-bottom: 12px;

    }

    .rating-value.place-2.life-span {
        right: 0px;
        top: 41px;
        padding: 50px 18.5px;
        padding-bottom: 12px;


    }



    .rating-value.place-3.life-span {
        right: 0px;
        top: 42px;
        padding: 50px 19.5px;
        padding-bottom: 8px;

    }

    .rating-value.weight-kg {
        font-size: 0.85rem;
        padding: 10px 18.5px;
        border-radius: 12px 12px 0 0;
        white-space: nowrap;
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: calc(var(--order) * 0.3s + 0.6s);
    }


    .rating-value.place-1.weight-kg {
        right: 0px;
        top: 41px;
        padding: 50px 24.5px;
        padding-bottom: 12px;
    }


    .rating-value.place-2.weight-kg {
        right: 0px;
        top: 40px;
        padding: 50px 24.5px;
        padding-bottom: 12px;
    }

    .rating-value.place-3.weight-kg {
        right: 0px;
        top: 40px;
        padding: 50px 23.5px;
        padding-bottom: 8px;
    }

    .rating-value.weight-kg[data-cat="sava"] {
        right: 0px;
        top: 40px;
        padding: 50px 22.5px;
        padding-bottom: 12px;
    }


}
</style>
