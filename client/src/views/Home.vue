<template>
  <div class="h-screen relative">
    <GeoErrorModal @closeGeoError="closeGeoError" v-if="geoError" :geoErrorMsg="geoErrorMsg"/>    
    <MapFeatures @removeResult="removeResult" @toggleSearchResults="togglesearchResults"  @plotResult="plotResult" @getGeoLocation="getGeolocation" :coords="coords"  :searchResults="searchResults"/>
    <div id="map" class="h-full z-[1]"></div>
    <Footer/>
  </div>
</template>

<script>
import leaflet from 'leaflet'
import { onMounted, ref } from 'vue'
import GeoErrorModal from '../components/GeoErrorModal.vue'
import MapFeatures from '../components/MapFeatures.vue'
import Footer from '../components/Footer.vue'

export default {
  name: '',
  components: {
    GeoErrorModal,
    MapFeatures,
    Footer
  },
  setup() {
    let map
    onMounted(() => {
      map = leaflet.map('map').setView([28.538336, -81.379234], 10)  

      leaflet
        .tileLayer(
          `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.VUE_APP_API_KEY}`,
          {
            maxZoom: 18,
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
            accessToken: process.env.VUE_APP_API_KEY,
          }
        )
      .addTo(map)  
      
      map.on('moveend', () => {
        closeSearchResults()
      })
      getGeolocation()
    })

    const coords = ref(null)
    const fetchCoords = ref(true)
    const geoMarker = ref(null)
    const geoError = ref(null)
    const geoErrorMsg = ref('test')

    const getGeolocation = () => {
      if (coords.value) {
        coords.value = null
        sessionStorage.removeItem('coords')
        map.removeLayer(geoMarker.value)
        return
      }
      if (sessionStorage.getItem('coords')) {
        coords.value = JSON.parse(sessionStorage.getItem('coords'))
        plotGeolocation(coords.value)
        return
      }
      fetchCoords.value = true
      navigator.geolocation.getCurrentPosition(setCoords, getLocError)
    }

    const setCoords = (pos) => {
      fetchCoords.value = null

      const setSessionCoords = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }
      sessionStorage.setItem('coords', JSON.stringify(setSessionCoords))
      
      coords.value = setSessionCoords

      plotGeolocation(coords.value)
    }
    
    const getLocError = (err) => {
      fetchCoords.value = null
      geoError.value = true
      geoErrorMsg.value = err.message 
    }

    const plotGeolocation = (coords) => {
      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map-marker-red.svg'),
        iconSize: [35, 35]
      })

      

      geoMarker.value = leaflet
      .marker([coords.lat, coords.lng], {icon: customMarker})
      .addTo(map)

      map.setView([coords.lat, coords.lng], 10)
    }

    const closeGeoError = () => {
        geoError.value = null
        geoErrorMsg.value = null
      }

    const resultMarker = ref(null)      
    const plotResult = (coords) => {
      if (resultMarker.value) {
        map.removeLayer(resultMarker.value)
      }

      const customMarker = leaflet.icon({
        iconUrl: require('../assets/map-marker-blue.svg'),
        iconSize: [35, 35]
      })

      resultMarker.value = leaflet
      .marker([coords.coordinates[1], coords.coordinates[0]], {icon: customMarker})
      .addTo(map)

      map.setView([coords.coordinates[1], coords.coordinates[0]], 14)

      closeSearchResults()
    }  

    const searchResults = ref(null)
    const togglesearchResults = () => {
      searchResults.value = !searchResults.value  
    }
    const closeSearchResults = () => {
      searchResults.value = null
    }

    const removeResult = () => {
      map.removeLayer(resultMarker.value);
    };


    return {
      coords,
      geoMarker,
      closeGeoError,
      geoError,
      geoErrorMsg,
      getGeolocation,
      plotResult,
      searchResults,
      togglesearchResults,
      closeSearchResults,
      removeResult
    }
  } 
}
</script>

<style scoped>
</style>