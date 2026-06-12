<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  detail: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <article class="metric">
    <span>{{ label }}</span>
    <strong>{{ value }}</strong>
    <small>{{ detail }}</small>
  </article>
</template>
