<template>
<div class="flex items-center justify-center space-x-2">
  <div class="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>
</template>

<script>
export default {
  name: "loadingSpinner",
};
</script>