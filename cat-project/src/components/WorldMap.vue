<template>
    <div>
        <div id="mapdiv"></div>
    </div>

</template>

<script setup>
import { onMounted } from "vue";
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

const missingImages = useMissingImagesStore();

const getCatImage = (breed) => {
  if (!breed) return null;

  const breedId = breed.id.toLowerCase(); // Normaliza a minúsculas
  const overrideImage = missingImages.getImage(breedId);


  // Si hay imagen override, úsala; si no, usa la imagen por defecto
  return overrideImage || `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
};


const router = useRouter();

let root, chart, countrySeries, series, pointSeries;

let zoomControl;

let currentContinent = null;

const emit = defineEmits(['continent-selected', 'reset']); //para que muestre los rankings




// 1. Definimos la función fuera de onMounted pero que usa las variables let
const showContinentData = (continentId, color = am5.color(0x53a785)) => {
    if (!chart || !series || continentId === currentContinent) return;

    currentContinent = continentId;
    series.hide();

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
    const filteredPoints = allPoints.filter(p =>
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



// 2. Exponemos la función usando window (alternativa a defineExpose)
window._mapAPI = { showContinentData, goHome };




async function fetchBreeds() {
    const response = await fetch("https://api.thecatapi.com/v1/breeds");
    const data = await response.json();
    return data;
}

let allPoints = [];



onMounted(async () => {
    //await nextTick(); // Espera a que el DOM esté completamente listo

    const breeds = await fetchBreeds();

    const points = breeds.map(breed => {
        let code = breed.country_code || breed.country_codes; // Ej: "TR"

        // Corrección manual de errores comunes
        if (code === "SP") code = "SG"; // Singapore

        const countryName = breed.origin; // Ej: "Turkey"
        if (code && countryCoordinates[code]) {
            const coords = countryCoordinates[code];
            // Añadir desplazamiento pequeño para que no queden apilados
            const lat = coords.latitude;
            const lon = coords.longitude;
            return {
                id: breed.id,
                image: getCatImage(breed),
                latitude: lat,
                longitude: lon,
                name: breed.name,
                country: code,       // Aquí el código ISO, para filtrar
                countryName: countryName,  // Para mostrar el nombre
            };
        } else {
            console.warn("País sin coordenadas:", code);
            return null;
        }
    }).filter(Boolean);

    allPoints = points;

    console.log('Points a mostrar:', allPoints.length);

    // Crear raíz
    root = am5.Root.new("mapdiv");

    // Tema animado
    root.setThemes([am5themes_Animated.new(root)]);

    chart = root.container.children.push(
        am5map.MapChart.new(root, {

            projection: am5map.geoMercator(),

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

    // Configurar tooltip e interacción
    series.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        templateField: "polygonSettings",
        tooltip: am5.Tooltip.new(root, {})  // crea o reinicia tooltip
    });

    // Hover color
    series.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x53a785)
    });

    // Colores de continentes
    series.data.setAll([
        { id: "asia", polygonSettings: { fill: am5.color(0x9E78D2) } },
        { id: "africa", polygonSettings: { fill: am5.color(0xC042A2) } },
        { id: "northAmerica", polygonSettings: { fill: am5.color(0x864EC4) } },
        { id: "southAmerica", polygonSettings: { fill: am5.color(0xd071d5) } },
        { id: "europe", polygonSettings: { fill: am5.color(0xB796DC) } },
        { id: "oceania", polygonSettings: { fill: am5.color(0xC68D54) } },
    ]);


    pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {
        latitudeField: "latitude",
        longitudeField: "longitude",
    }));

    pointSeries.bullets.push((root) => {

        const circle = am5.Circle.new(root, {

            radius: 5,
            fill: am5.color(0xffffff),
            stroke: am5.color(0x000000),
            strokeWidth: 1.5,
            tooltipHTML: `
      <div style="text-align:center;">
        <strong>{name}</strong><br />
        <img src="{image}" alt="{name}" width="100"/><br />
        Origen: {countryName}
      </div>
    `,
            opacity: 0,
            cursorOverStyle: "pointer",
            tooltipPosition: "pointer",
            pointerOrientation: "auto",


        });

        const tooltip = am5.Tooltip.new(root, {
            layer: 200,
            animationDuration: 300, // en ms
            animationEasing: am5.ease.out(am5.ease.cubic)
        });

        circle.set("tooltip", tooltip);


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

        return am5.Bullet.new(root, {
            sprite: circle,

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

</script>

<style scoped>
#mapdiv {
    width: 100%;
    height: 100%;
    color: #53a785;
}
</style>
