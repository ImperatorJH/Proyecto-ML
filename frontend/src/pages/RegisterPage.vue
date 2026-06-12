<script setup>
import UserRegistration from "../components/UserRegistration.vue";
import CameraCapture from "../components/CameraCapture.vue";

defineProps({
  status: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
    required: true,
  },
});

defineEmits(["status", "created", "clearPhotos", "updatePhotos"]);
</script>

<template>
  <div class="register-grid">
    <UserRegistration
      :status="status"
      :photos="photos"
      @status="$emit('status', $event)"
      @created="$emit('created')"
      @clear-photos="$emit('clearPhotos')"
    />
    <CameraCapture
      :status="status"
      :photos="photos"
      @status="$emit('status', $event)"
      @update:photos="$emit('updatePhotos', $event)"
    />
  </div>
</template>
