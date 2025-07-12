<template>
    <div>
        <div id="mapdiv"></div>
    </div>

</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from 'vue-router';
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_continentsLow from "@amcharts/amcharts5-geodata/continentsLow";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import countryCoordinates from "@/store/countryCoordinates";
import continentCountries from "@/store/continentCountries";
import fixedPoints from "@/store/fixedPoints";
import { useMissingImagesStore } from "@/store/missingImages";
import { useI18n } from 'vue-i18n';
import { useGetTranslatedBreeds } from '@/composables/useSaveBreeds';
import { useFixedFacesStore } from '@/store/fixedFaces';

const fixedFaces = useFixedFacesStore();

const { t, locale } = useI18n();

let container;


const missingImages = useMissingImagesStore();

const getCatImage = (breed) => {
    if (!breed) return null;

    const breedId = breed.id.toLowerCase(); // Normaliza a minúsculas
    const overrideImage = missingImages.getImage(breedId);


    // Si hay imagen override, úsala; si no, usa la imagen por defecto
    return overrideImage || `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
};

const getCatStyle = (cat, isOtherDimension = false, isCatView = false, isTooltip = false) => {
    const breedId = cat?.id?.substring(0, 4).toLowerCase();
    const { zoom, x = '0px', y = '0px' } = fixedFaces.getSettings(breedId, isOtherDimension, isCatView, isTooltip);

    return {
        objectPosition: `${x} ${y}`,
        objectFit: 'cover',
        transform: `scale(${zoom})`,
    };
};


const router = useRouter();

let root, chart, countrySeries, countrySeriesRanking, series, pointSeries, projection;

let zoomControl;

let currentContinent = null;



const emit = defineEmits(['continent-selected', 'reset']); //para que muestre los rankings

const props = defineProps({
    podiumCats: Array,
});

const circlesMap = new Map();


// 1. Definimos la función fuera de onMounted pero que usa las variables let
const showContinentData = (continentId, color = am5.color(0x53a785)) => {
    if (!chart || !series || continentId === currentContinent) return;

    currentContinent = continentId;
    series.hide();

    if (countrySeriesRanking) {
        countrySeriesRanking.set("visible", false);
    }

    // Crear serie de países si no existe
    if (!countrySeries) {
        countrySeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow,
            exclude: ["antarctica"]
        }));

    }

    // Configurar países del continente
    countrySeries.set("include", continentCountries[continentId] || []);
    countrySeries.set("fill", color);
    countrySeries.set("visible", true);

    // Configurar controles de navegación
    chart.setAll({
        panX: "translateX",
        panY: "translateY",
        wheelX: "zoomX",
        wheelY: "zoomY",
        pinchZoom: true
    });

    zoomControl.set("visible", true);
    zoomControl.homeButton.set("visible", true);

    // Filtrar y preparar puntos
    const filteredPoints = allPoints.value.filter(p =>
        continentCountries[continentId].includes(p.country)
    );

    // Aplicar jitter a los puntos
    const countryCounters = {};
    const jitteredPoints = filteredPoints.map((p) => {
        const country = p.country;
        countryCounters[country] = (countryCounters[country] || 0);

        if (fixedPoints[country]) {
            const index = countryCounters[country] % fixedPoints[country].length;
            const coords = fixedPoints[country][index];
            countryCounters[country]++;
            return {
                ...p,
                latitude: coords.latitude,
                longitude: coords.longitude
            };
        }
        return p;
    });

    // Precargar imágenes
    jitteredPoints.forEach(point => {
        if (point.image) new Image().src = point.image;
    });


    // Mostrar puntos
    if (pointSeries) {
        pointSeries.data.setAll([]);
        setTimeout(() => {
            circlesMap.clear();
            pointSeries.data.setAll(jitteredPoints);
            pointSeries.set("visible", true);
            pointSeries.set("layer", 100);
        }, 100);
    }


    // Coordenadas y zoom para cada continente
    const zoomSettings = {
        asia: { longitude: 97, latitude: 52, zoomLevel: 1.7 },
        europe: { longitude: 25, latitude: 57, zoomLevel: 3.3 },
        africa: { longitude: 18, latitude: 2, zoomLevel: 3.2 },
        northAmerica: { longitude: -104, latitude: 53, zoomLevel: 2 },
        southAmerica: { longitude: -62, latitude: -25, zoomLevel: 2.5 },
        oceania: { longitude: 140, latitude: -25, zoomLevel: 3 },
    };

    setTimeout(() => {
        const coords = zoomSettings[continentId];
        if (coords) {
            chart.zoomToGeoPoint(
                { longitude: coords.longitude, latitude: coords.latitude },
                coords.zoomLevel,
                true
            );
        }
    }, 100);


    emit('continent-selected', continentId);
};

const goHome = () => {

    chart.set("homeGeoPoint", { longitude: 10, latitude: 45 });
    chart.set("homeZoomLevel", 1);

    chart.goHome();

    // Mostrar la serie de continentes (si estaba oculta)
    if (series.isHidden()) {
        series.show();
    }

    // Eliminar/ocultar series de países si existen
    if (countrySeries) {
        chart.series.removeValue(countrySeries);
        countrySeries.dispose();
        countrySeries = null;
    }

    if (countrySeriesRanking) {
        chart.series.removeValue(countrySeriesRanking);
        countrySeriesRanking.dispose();
        countrySeriesRanking = null;
    }

    // Borrar puntos y ocultar pointSeries
    if (pointSeries) {
        pointSeries.setAll([]);
        pointSeries.set("visible", false);

        if (pointSeries.get("tooltip")) {
            pointSeries.get("tooltip").hide(0);
        }
    }

    // Reactiva tooltip base
    series.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        tooltip: am5.Tooltip.new(root, {}),
    });
    series.mapPolygons.template.get("tooltip").hide(0);

    // Opcional: ocultar el zoomControl y el botón Home si quieres
    zoomControl.set("visible", false);
    zoomControl.homeButton.set("visible", false);

    currentContinent = null;
    emit('reset');

};

// Variables para guardar referencias a polígonos activos
let highlightedCountryPolygon = null;
let countryPolygonsMap = new Map();
let isShowingCountries = ref(false);
let pendingCountryCode = null;
let isCountrySeriesReady = false;

let customTooltip = null;
let catIdToCircleMap = new Map();

function showCatTooltip(catId, catData) {
    const circle = catIdToCircleMap.get(catId);
    if (!circle) {
        console.warn("Tooltip no encontrado para catId:", catId);
        return;
    }

    // Crear el tooltip si no existe o actualizarlo
    if (!circle.get("tooltip")) {
        const tooltip = am5.Tooltip.new(root, {
            pointerOrientation: "down",
            getFillFromSprite: false,
            labelHTML: getTooltipHTML(catData),
            layer: 600,
            pointerBaseWidth: 20,
            pointerLength: 20,
        });

        tooltip.get("background").setAll({
            fill: am5.color(0xffffff),
            stroke: am5.color(0x000000),
            strokeWidth: 1.5,
            opacity: 0.95,
            cornerRadius: 10,
        });

        circle.set("tooltip", tooltip);
    } else {
        // Actualizar contenido si ya existía
        circle.get("tooltip").set("labelHTML", getTooltipHTML(catData));
    }

    circle.showTooltip();
}

function createCountryTooltip(code, catData) {
    console.log("createCountryTooltip called with:", code, catData);

    if (!chart || !catData || typeof code !== 'string') {
        console.warn("Parámetros inválidos para createCountryTooltip:", { code, catData });
        return;
    }

    const polygon = countryPolygonsMap.get(code.toUpperCase());
    if (!polygon) return;



    if (customTooltip && !customTooltip.isDisposed()) {
        customTooltip.dispose();
    }

    customTooltip = am5.Tooltip.new(root, {
        pointerOrientation: "down", // flecha abajo (puntero en la parte inferior del tooltip)
        getFillFromSprite: false,
        labelHTML: getTooltipHTML(catData), // Usamos HTML
        layer: 600,
        pointerBaseWidth: 20,
        pointerLength: 20,

    });

    // Cambiar el fondo del tooltip (sin perder la flecha)
    customTooltip.get("background").setAll({
        fill: am5.color(0xffffff),
        stroke: am5.color(0x000000),
        strokeWidth: 1.5,
        opacity: 0.9,
        cornerRadius: 10,

    });


    polygon.setAll({
        interactive: true,
        tooltip: customTooltip,
        tooltipText: " "
    });

    polygon.showTooltip();

    const geoCentroid = polygon.geoCentroid();

    chart.zoomToGeoPoint(
        geoCentroid,
        chart.get("zoomLevel") || 2.5,
        true
    );


}


const countryZoomSettings = {
    US: { longitude: -105, latitude: 50, zoomLevel: 2.5 },
    EG: { longitude: 30, latitude: 26, zoomLevel: 2.5 },
    JP: { longitude: 138, latitude: 37, zoomLevel: 3 },
    RU: { longitude: 107, latitude: 67, zoomLevel: 2.0 },
    FR: { longitude: 2.2, latitude: 46.2, zoomLevel: 3 },
    GB: { longitude: -1.5, latitude: 58, zoomLevel: 4 },
    GR: { longitude: 22.9, latitude: 45.0, zoomLevel: 4 }
};


function highlightCountry(countryCode, podiumIndex = -1) {

    highlightedCountryPolygon = countryPolygonsMap.get(countryCode);
    if (highlightedCountryPolygon) {

        highlightedCountryPolygon.set("fill", getColorForIndex(podiumIndex));
    }
}

// Función para quitar resaltado país
function clearCountryHighlight() {
    if (highlightedCountryPolygon) {
        // Eliminar la referencia al tooltip antes del dispose
        highlightedCountryPolygon.set("tooltip", null);
        highlightedCountryPolygon.set("tooltipText", null);
        highlightedCountryPolygon.set("interactive", false);
        highlightedCountryPolygon.set("fill", am5.color(0x53a785));
        highlightedCountryPolygon = null;
    }

    // Dispose solo si existe y no fue eliminado
    if (customTooltip && !customTooltip.isDisposed?.()) {
        try {
            customTooltip.dispose();
        } catch (e) {
            console.warn("Tooltip ya estaba eliminado:", e);
        }
        customTooltip = null;
    }

}


function clearHighlightAndShowContinents() {
    clearCountryHighlight();

    if (countrySeriesRanking && isShowingCountries) {
        countrySeriesRanking.hide();
        series?.show();

        chart.set("homeGeoPoint", { longitude: 12, latitude: 40 });
        chart.set("homeZoomLevel", 1);
        chart.set("homeRotationX", -12);
        chart.set("rotationX", -12);

        chart.goHome();
        isShowingCountries = false;
    }

    if (customTooltip && !customTooltip.isDisposed?.()) {
        try {
            customTooltip.dispose();
        } catch (e) {
            console.warn("Tooltip ya estaba eliminado:", e);
        }
        customTooltip = null;
    }
}

function hideCatTooltip(catId) {
    const circle = catIdToCircleMap.get(catId);
    if (circle) {
        circle.hideTooltip();
    } else {
        console.warn("Tooltip no encontrado para catId:", catId);
    }
}



// Esta es la función interna que hace el cambio de mapa y resalta 
function highlightAndSwitch(code, catData) {
    if (!countrySeriesRanking) return;

    series.hide();             // oculta continentes
    countrySeriesRanking.show();      // muestra países
    isShowingCountries = true;

    const settings = countryZoomSettings[code.toUpperCase()];
    const polygon = countryPolygonsMap.get(code.toUpperCase());

    if (settings && polygon) {
        const podiumIndex = props.podiumCats?.findIndex(cat => cat.id === catData.id) ?? -1;
        highlightCountry(code, podiumIndex);
        createCountryTooltip(code, catData);

        chart.zoomToGeoPoint(
            { longitude: settings.longitude, latitude: settings.latitude },
            settings.zoomLevel,
            true
        );


    } else {
        console.warn("No hay zoomSettings definidos para", code);
    }

}

function highlightCountryOnHover({ code, cat }) {

    pendingCountryCode = code;

    if (countrySeries) {
        countrySeries.set("visible", false);
    }

    if (!countrySeriesRanking) {

        countrySeriesRanking = chart.series.push(am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow,
            exclude: ["AQ"]
        }));

        countrySeriesRanking.mapPolygons.template.setAll({
            fill: am5.color(0x53a785),
        });

        countrySeriesRanking.set("visible", true);

        countrySeriesRanking.events.once("datavalidated", () => {

            countryPolygonsMap.clear();

            countrySeriesRanking.mapPolygons.each((polygon) => {
                const id = polygon.dataItem?.get("id");
                if (id === "AQ") {
                    polygon.hide();
                    return;
                }
                countryPolygonsMap.set(id.toUpperCase(), polygon);
            });

            isCountrySeriesReady = true;

            if (pendingCountryCode) {
                highlightAndSwitch(pendingCountryCode, cat);
            }
        });
    } else if (isCountrySeriesReady) {
        highlightAndSwitch(code, cat);
    }
}




// 2. Exponemos la función usando window (alternativa a defineExpose)
window._mapAPI = {
    showContinentData,
    goHome,
    highlightCountry: highlightCountryOnHover,
    clearCountryHighlight: clearHighlightAndShowContinents,
    showCatTooltip,
    hideCatTooltip,

};


async function fetchBreeds() {
    const response = await fetch("https://api.thecatapi.com/v1/breeds");
    const data = await response.json();
    return data;
}

function getColorForIndex(index) {
    const colors = [0xFFD700, 0xC0C0C0, 0xCD7F32]; // oro, plata, bronce
    return index !== -1 ? am5.color(colors[index]) : am5.color(0xffffff);
}

const animateRankingSequentially = async (rankingList) => {
    for (let i = 0; i < rankingList.length; i++) {
        const cat = rankingList[i];
        const container = circlesMap.get(cat.id);
        if (!container || container.isDisposed()) continue;

        container.set("layer", 500);

        if (container.parent) {
            container.parent.children.moveValue(container, container.parent.children.length - 1);
        }

        const circleChild = container.children.getIndex(0);
        let label = container._rankingLabel || null;

        const color = getColorForIndex(i);

        // Círculo
        if (circleChild) {
            circleChild.setAll({
                radius: 5,
                fill: color,
                opacity: 1,
                layer: 500,
            });

            circleChild.markDirty();

            circleChild.animate({
                key: "radius",
                to: 10,
                duration: 600,
                easing: am5.ease.out(am5.ease.cubic),
            });

            circleChild.animate({
                key: "opacity",
                to: 1,
                duration: 1000,
                easing: am5.ease.out(am5.ease.cubic),
            });
        }

        // Label
        if (!label) {

            label = am5.Label.new(root, {
                text: String(i + 1),
                fontSize: 12,
                fontWeight: "bold",
                centerX: am5.p50,
                centerY: am5.p50,
                fill: am5.color(0x000000),
                opacity: 0,
            });
            container.children.push(label);
            container._rankingLabel = label;
        } else {
            label.set("text", String(i + 1));
            label.set("layer", 520);
        }

        label.animate({
            key: "opacity",
            to: 1,
            duration: 400,
            easing: am5.ease.out(am5.ease.cubic)
        });

        // Esperar antes de mostrar el siguiente
        await new Promise(resolve => setTimeout(resolve, 300));
    }
};


let allPoints = ref([]);


const loadPoints = async () => {
    let breeds = [];

    if (locale.value === 'es') {
        const { getTranslatedBreeds } = useGetTranslatedBreeds();
        const data = await getTranslatedBreeds();
        if (Array.isArray(data)) {
            breeds = data;
        }
    } else {
        breeds = await fetchBreeds();
    }

    // Mapeamos a puntos
    const points = breeds.map((breed) => {
        let code = breed.country_code || breed.country_codes;

        if (code === "SP") code = "SG"; // Corrección

        const countryName = breed.origin;
        if (code && countryCoordinates[code]) {
            const coords = countryCoordinates[code];
            return {
                id: breed.id,
                image: getCatImage(breed),
                latitude: coords.latitude,
                longitude: coords.longitude,
                name: breed.name,
                country: code,
                countryName: countryName,
            };
        } else {
            console.warn("País sin coordenadas:", code);
            return null;
        }
    }).filter(Boolean);

    allPoints.value = points;


};

function styleObjectToCSS(styleObj) {
    return Object.entries(styleObj)
        .map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value};`)
        .join(' ');
}

const getTooltipHTML = (catData) => {
    if (!catData) return "";
    const styleObj = getCatStyle(catData, false, false, true);
    const style = styleObjectToCSS(styleObj);
    return `
        <div style="text-align:center; color: black; font-family: 'Manrope', sans-serif;">
          <strong>${catData.name}</strong><br/>
          <img src="${catData.image}" alt="${catData.name}" style="width: 120px; height: 120px; border-radius: 6px; object-fit: cover; margin-top: 6px; margin-bottom: 2px; border: solid 2px black;  ${style}"/><br/>
        ${catData.origin || catData.countryName}
        </div>
      `;
};


onMounted(async () => {

    await loadPoints();


    console.log('Points a mostrar:', allPoints.value.length);


    // Crear raíz
    root = am5.Root.new("mapdiv");

    // Tema animado
    root.setThemes([am5themes_Animated.new(root)]);

    projection = am5map.geoMercator();
    chart = root.container.children.push(
        am5map.MapChart.new(root, {

            projection: projection,

            homeZoomLevel: 1,
            homeGeoPoint: { latitude: 0, longitude: 0 },
            homeRotationX: -12,
            rotationX: -12,        // Esto rota el mapa para centrar Asia
            panX: "none",
            panY: "none",
            wheelX: "none",
            wheelY: "none",
            pinchZoom: false,

        })
    );


    zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);
    chart.children.push(zoomControl);
    zoomControl.set("visible", false); // oculto al inicio
    zoomControl.homeButton.set("visible", false);

    zoomControl.homeButton.events.on("click", () => {
        goHome();
    });



    // Serie para continentes
    series = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_continentsLow,
            exclude: ["antarctica"]
        })
    );

    chart.seriesContainer.events.on("click", function (ev) {
        const geoPoint = chart.invert({ x: ev.point.x, y: ev.point.y });
        console.log("Latitud:", geoPoint.latitude, "Longitud:", geoPoint.longitude);
    });

    series.mapPolygons.template.setAll({
        interactive: true,
        templateField: "polygonSettings",
        tooltip: am5.Tooltip.new(root, {})
    });

    series.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
        const id = target.dataItem?.dataContext?.id;
        if (!id) return "";
        // Buscar el nombre traducido del continente según el id
        const continent = getTranslatedContinents.value.find(c => c.id === id);
        return continent ? continent.name : "";
    });


    // Hover color
    series.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x53a785)
    });

    // Colores de continentes
    const getTranslatedContinents = computed(() => [

        { id: "asia", name: t('asia'), polygonSettings: { fill: am5.color(0x9E78D2) } },
        { id: "africa", name: t('africa'), polygonSettings: { fill: am5.color(0xC042A2) } },
        { id: "northAmerica", name: t('americanorte'), polygonSettings: { fill: am5.color(0x864EC4) } },
        { id: "southAmerica", name: t('americasur'), polygonSettings: { fill: am5.color(0xd071d5) } },
        { id: "europe", name: t('europa'), polygonSettings: { fill: am5.color(0xB796DC) } },
        { id: "oceania", name: t('oceania'), polygonSettings: { fill: am5.color(0xC68D54) } }

    ]);

    series.data.setAll(getTranslatedContinents.value);


    pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {
        latitudeField: "latitude",
        longitudeField: "longitude",
    }));



    pointSeries.bullets.clear();

    pointSeries.bullets.push((root, series, dataItem) => {

        const dataContext = dataItem.dataContext;

        // Verificar si dataContext existe
        if (!dataContext) {
            console.error("dataContext is undefined", dataItem);
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: am5.color(0xff0000) // Rojo para indicar error
                })
            });
        }

        const catId = dataContext.id;

        const hasRanking = props.podiumCats && props.podiumCats.length > 0;
        // Buscar índice en Ranking
        const podiumIndex = hasRanking ? props.podiumCats.findIndex(cat => cat.id === catId) : -1;

        container = am5.Container.new(root, {
            centerX: am5.p50,
            centerY: am5.p50
        });

        const circle = am5.Circle.new(root, {
            radius: podiumIndex !== -1 ? 10 : 5,
            fill: getColorForIndex(podiumIndex),
            stroke: am5.color(0x000000),
            strokeWidth: 1.5,
            opacity: 0,
            cursorOverStyle: "pointer",
            tooltipPosition: "pointer",
            pointerOrientation: "auto",
        });


        container.children.push(circle);

        // Guardar el círculo para mostrar tooltip luego
        if (dataContext?.id) {
            catIdToCircleMap.set(dataContext.id, circle);
        }

        // Label solo si está rankeado
        let label = null;

        if (podiumIndex !== -1) {
            circle.set("layer", 500);
            label = am5.Label.new(root, {
                text: String(podiumIndex + 1),
                fontSize: 12,
                fontWeight: "bold",
                layer: 500,
                centerX: am5.p50,
                centerY: am5.p50,
                fill: am5.color(0x000000),
                opacity: 0

            });

            container.children.push(label);
            container._rankingLabel = label;


            circle.animate({
                key: "radius",
                to: 10,
                duration: 600,
                easing: am5.ease.out(am5.ease.cubic)
            });

            circle.animate({
                key: "fill",
                to: getColorForIndex(podiumIndex),
                duration: 600,
                easing: am5.ease.out(am5.ease.cubic)
            });

            if (label) {

                label.animate({
                    key: "opacity",
                    to: 1,
                    duration: 600,
                    easing: am5.ease.out(am5.ease.cubic)
                });

            }
        }


        const tooltip = am5.Tooltip.new(root, {
            layer: 600,
            animationDuration: 300, // en ms
            animationEasing: am5.ease.out(am5.ease.cubic)
        });

        // Poner borde negro y grosor
        tooltip.get("background").setAll({
            stroke: am5.color(0x000000),
            strokeWidth: 1.5,
            fill: am5.color(0xffffff), // si quieres también fondo blanco
            opacity: 0.9,
            cornerRadius: 10,
        });

        circle.set("tooltip", tooltip);

        // Usamos un adaptador para que el contenido del tooltip sea dinámico según el dataItem y traducción
        circle.adapters.add("tooltipHTML", (html, target) => {
            const data = target.dataItem?.dataContext;
            console.log("Tooltip data:", data);
            return getTooltipHTML(data);
        });


        circle.events.on("click", (ev) => {
            const data = ev.target.dataItem?.dataContext;

            if (data && data.name) {
                router.push(`/gatos/${data.name}`);
            } else {
                console.log("Clic en círculo: no tiene nombre");
            }
        });

        circle.animate({
            key: "opacity",
            to: 1,
            duration: 600,
            easing: am5.ease.out(am5.ease.cubic)
        });

        circlesMap.set(catId, container);

        return am5.Bullet.new(root, {
            sprite: container,

        });
    });


    series.mapPolygons.template.setAll({
        interactive: true,
        cursorOverStyle: "pointer",
    });

    currentContinent = null;


    // Evento click en polígonos de continentes para zoom y selección
    series.events.once("datavalidated", () => {
        series.mapPolygons.each(polygon => {
            polygon.events.on("click", ev => {
                const continentId = ev.target.dataItem?.dataContext?.id;
                const color = ev.target.get("fill");
                if (continentId) showContinentData(continentId, color);
            });

        });

    });


});

watch(locale, async () => {

    await loadPoints();
    allPoints.value.forEach(point => {
        const dataItem = pointSeries.dataItems.find(di => di.dataContext.id === point.id);
        if (dataItem) {
            dataItem.dataContext.countryName = point.countryName;
            dataItem.set("tooltipHTML", getTooltipHTML(point));
        }
    });


});


watch(() => [props.podiumCats, circlesMap.size],
    ([newPodium]) => {
        if (!Array.isArray(newPodium)) return;

        animateRankingSequentially(newPodium);

        circlesMap.forEach((container, catId) => {


            if (!container || container.isDisposed()) return;

            const index = newPodium.findIndex(cat => cat.id === catId);
            const isRanked = index !== -1;
            const circleChild = container.children.getIndex(0);
            const label = container._rankingLabel || null;

            if (!isRanked) {
                if (circleChild) {
                    circleChild.set("layer", 500);
                    // Animamos el radio a 5 (normal) y el color a blanco de forma suave, sin tocar la opacidad
                    circleChild.animate({
                        key: "radius",
                        to: 5,
                        duration: 700,
                        easing: am5.ease.out(am5.ease.cubic),
                    });
                    circleChild.animate({
                        key: "fill",
                        to: am5.color(0xffffff),
                        duration: 700,
                        easing: am5.ease.out(am5.ease.cubic),
                    });
                    // Aseguramos que la opacidad quede en 1
                    circleChild.set("opacity", 1);
                    circleChild.markDirty();
                }
                if (label) {
                    label.set("layer", 600);
                    // Animamos opacidad a 0 para que desaparezca suave
                    label.animate({
                        key: "opacity",
                        to: 0,
                        duration: 700,
                        easing: am5.ease.out(am5.ease.cubic),


                    });
                }
            }
        });

    });



</script>

<style scoped>
#mapdiv {
    width: 100%;
    height: 100%;
    color: #53a785;
    overflow: visible;
}
</style>
