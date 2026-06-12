<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Dashboard de asistencia",
  },
  description: {
    type: String,
    default: "Control de reconocimiento facial, usuarios y registros academicos.",
  },
});

defineEmits(["start", "stop", "refresh"]);
</script>

<template>
  <header id="dashboard" class="topbar">
    <div class="page-title">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>

    <div class="toolbar">
      <button class="btn btn-primary" type="button" :disabled="loading" @click="$emit('start')">
        Iniciar
      </button>
      <button class="btn btn-danger" type="button" :disabled="loading" @click="$emit('stop')">
        Detener
      </button>
      <button class="btn" type="button" @click="$emit('refresh')">
        Actualizar
      </button>
    </div>
  </header>
</template>
