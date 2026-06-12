<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import PanelHeader from "./PanelHeader.vue";

const MAX_PHOTOS = 10;

const props = defineProps({
  photos: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["status", "update:photos"]);

const videoRef = ref(null);
const canvasRef = ref(null);
const stream = ref(null);
const removeBackground = ref(true);

const cameraActive = computed(() => Boolean(stream.value));

function updatePhotos(nextPhotos) {
  emit("update:photos", nextPhotos);
  emit("status", nextPhotos.length ? "Fotos listas" : "Listo");
}

async function startCamera() {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 900 }, height: { ideal: 900 }, facingMode: "user" },
      audio: false,
    });
    videoRef.value.srcObject = stream.value;
    emit("status", "Camara activa");
  } catch (error) {
    console.error("Error abriendo camara:", error);
    emit("status", "Sin camara");
    alert("No se pudo abrir la camara. Revisa permisos del navegador.");
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }

  if (videoRef.value) videoRef.value.srcObject = null;
  emit("status", props.photos.length ? "Fotos listas" : "Listo");
}

function drawFocusOval(ctx, sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const centerX = width / 2;
  const centerY = height * 0.54;
  const ovalHeight = height * 0.74;
  const ovalWidth = Math.min(ovalHeight * 0.5, width * 0.42);
  const radiusX = ovalWidth / 2;
  const radiusY = ovalHeight / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.filter = "blur(24px)";
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.filter = "none";

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.restore();

  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.94)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function capturePhoto() {
  const video = videoRef.value;
  const canvas = canvasRef.value;

  if (!stream.value || !video.videoWidth) {
    alert("Primero abre la camara.");
    return;
  }

  if (props.photos.length >= MAX_PHOTOS) {
    alert(`Puedes capturar maximo ${MAX_PHOTOS} fotos.`);
    return;
  }

  const side = Math.min(video.videoWidth, video.videoHeight);
  const sx = (video.videoWidth - side) / 2;
  const sy = (video.videoHeight - side) / 2;
  canvas.width = 700;
  canvas.height = 700;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, sx, sy, side, side, 0, 0, canvas.width, canvas.height);

  if (removeBackground.value) {
    const original = document.createElement("canvas");
    original.width = canvas.width;
    original.height = canvas.height;
    original.getContext("2d").drawImage(canvas, 0, 0);
    drawFocusOval(ctx, original);
  }

  canvas.toBlob((blob) => {
    if (!blob) {
      alert("No se pudo capturar la foto.");
      return;
    }

    updatePhotos([...props.photos, { blob, preview: URL.createObjectURL(blob) }]);
  }, "image/jpeg", 0.9);
}

function removePhoto(index) {
  const nextPhotos = [...props.photos];
  const [photo] = nextPhotos.splice(index, 1);
  if (photo?.preview) URL.revokeObjectURL(photo.preview);
  updatePhotos(nextPhotos);
}

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<template>
  <section class="panel">
    <PanelHeader title="Camara" description="Captura facial para el registro." />

    <div class="panel-body">
      <div class="camera-box">
        <video ref="videoRef" v-show="cameraActive" autoplay playsinline></video>
        <div v-show="!cameraActive" class="camera-placeholder">Camara inactiva</div>
        <div v-show="cameraActive" class="camera-focus" aria-hidden="true"></div>
        <div v-show="cameraActive" class="camera-oval" aria-hidden="true"></div>
        <div v-show="cameraActive" class="camera-hint" aria-hidden="true">
          Centra el rostro dentro del ovalo
        </div>
      </div>

      <label class="check-row compact-check">
        <input v-model="removeBackground" type="checkbox" />
        Aplicar enfoque ovalado al tomar foto
      </label>

      <div class="camera-actions">
        <button class="btn btn-primary" type="button" @click="startCamera">Abrir</button>
        <button class="btn" type="button" @click="capturePhoto">Tomar foto</button>
        <button class="btn btn-danger" type="button" @click="stopCamera">Cerrar</button>
      </div>

      <div class="preview-grid">
        <div v-for="(photo, index) in photos" :key="photo.preview" class="preview-card">
          <img :src="photo.preview" :alt="`Foto ${index + 1}`" />
          <button type="button" title="Eliminar foto" @click="removePhoto(index)">x</button>
        </div>
      </div>
    </div>

    <canvas ref="canvasRef"></canvas>
  </section>
</template>
