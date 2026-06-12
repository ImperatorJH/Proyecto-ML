<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: "neutral",
  },
});
</script>

<template>
  <span class="status-pill" :class="`status-${tone}`">
    <span class="status-dot"></span>
    {{ label }}
  </span>
</template>
