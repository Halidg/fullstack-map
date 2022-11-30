<template>
  <div 
  :style="{ zIndex: 1000}"
  class="w-full md:w-auto absolute md:top-140px md:left-160px  flex gap-4 px-16 py-8 md:px-250 md:py-100 bg-transparent">
    <div class="relative flex-1 md:min-w-[350px]">
      <input  @focus="$emit('toggleSearchResults')" @input="search" v-model="searchQuery" placeholder="Find your place" class="pl-9 pr-4 py-3 text-sm focus:outline-none w-full shadow-md rounded-md" type="text">  
      <div class="absolute top-0 left-[8px] h-full flex items-center">
        <i class="fas fa-search"></i>
      </div>
      <div class="absolute mt-2 w-full">
        <div v-if="searchQuery && searchResults" class="h-[200px] overflow-scroll bg-white rounded-md">
          <loadingSpinner v-if="!searchData"/>
          <div v-else>
            <div 
            class="px-4 py-2 flex gap-x-2 cursor-pointer hover:bg-slate-600  hover:underline"
            v-for="(res, i) in searchData"
            :key="i"
            @click="selectResult(res)"
          >
          <i class="fas fa-map-marker-alt"></i>
            <p class="text-xs">{{res.place_name_en}}</p>
          </div>
          </div>  
        </div>
        <div v-if="selectedResult" class="mt-[8px] px-4 py-3 bg-white rounded-md">
          <i @click="removeResult" class="flex justify-end far fa-times-circle"></i>
          <h1 class="text-lg">{{ selectedResult.text }}</h1>
          <p class="text-xs mb-1">
            {{ selectedResult.properties.address }}, {{ selectedResult.city }},
            {{ selectedResult.state }}
          </p>
          <p class="text-xs">{{ selectedResult.properties.category }}</p>
        </div>
      </div>
    </div>
    <div  class="px-4 bg-white flex items-center shadow-md rounded-md min-h-[45px]" 
      :class="{'active' : coords}"
      @click="$emit('getGeoLocation')"
      >
      <i  class="fas fa-location-arrow text-state-600 text-[18px]" 
        :class="{'text-white' : coords, 'animate-pulse': fetchCoords}"></i>  
    </div>  
  </div>  
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  props: ['coords', 'fetchCoords', 'searchResults'],
  components: {
    LoadingSpinner
  },
  setup(props, { emit }) {
    const searchQuery = ref(null)
    const searchData = ref(null)
    const queryTimeout = ref(null)
    const selectedResult = ref(null)

    const search = () => {
      clearTimeout(queryTimeout.value)

      searchData.value = null
      queryTimeout.value = setTimeout(async () => {
        if (searchQuery.value !== '') {
          const params = new URLSearchParams({
            fuzzyMatch: true,
            language: 'en',
            limit: 10,
            proximity: props.coords ? `${props.coords.lng}, ${props.coords.lat} ` : "0,0"
          })
          const getData = await axios.get(`http://localhost:3000/api/search/${searchQuery.value}?${params}`)
          searchData.value = getData.data.features
          console.log(searchData.value);
        }
      }, 750)
    }

    const selectResult = (result) => {
      selectedResult.value = result
      emit('plotResult', result.geometry)  
    }

    const removeResult = () => {
      selectedResult.value = null;
      emit("removeResult");
    }

    return {
      searchQuery,
      searchData,
      queryTimeout,
      search,
      selectResult,
      selectedResult,
      removeResult
    }
  }
}
</script>

<style>
.active {
  background: rgb(73, 72, 72);
}

</style>