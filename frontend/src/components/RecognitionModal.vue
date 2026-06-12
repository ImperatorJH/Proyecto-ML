<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  streamUrl: {
    type: String,
    required: true,
  },
  stopping: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="recognition-overlay" role="dialog" aria-modal="true" aria-label="Reconocimiento facial">
      <div class="recognition-shell">
        <header class="recognition-header">
          <div>
            <strong>Reconocimiento facial</strong>
            <span>Camara activa desde el proceso de Python</span>
          </div>
          <button class="btn btn-danger" type="button" :disabled="stopping" @click="$emit('close')">
            Detener
          </button>
        </header>

        <div class="recognition-view">
          <img :src="streamUrl" alt="Video de reconocimiento facial" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
