<script setup>
import { reactive, ref } from "vue";
import { createUser } from "../services/api";
import PanelHeader from "./PanelHeader.vue";
import StatusPill from "./StatusPill.vue";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  photos: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["status", "created", "clearPhotos"]);

const saving = ref(false);
const form = reactive({
  nombre: "",
  codigo: "",
});

function statusTone(status) {
  if (["Guardado", "Fotos listas"].includes(status)) return "ok";
  if (["Error", "Sin camara"].includes(status)) return "error";
  if (status === "Subiendo") return "warn";
  return "neutral";
}

async function submitUser() {
  if (!form.nombre.trim()) {
    alert("Ingresa el nombre del usuario.");
    return;
  }

  if (!form.codigo.trim()) {
    alert("Ingresa el codigo del estudiante.");
    return;
  }

  if (!props.photos.length) {
    alert("Toma al menos una foto del usuario.");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", form.nombre.trim());
  formData.append("codigo", form.codigo.trim());
  props.photos.forEach((photo, index) => {
    formData.append("fotos", photo.blob, `foto_${index + 1}.jpg`);
  });

  saving.value = true;
  emit("status", "Subiendo");

  try {
    const data = await createUser(formData);
    alert(data.message || "Usuario creado correctamente");
    form.nombre = "";
    form.codigo = "";
    emit("clearPhotos");
    emit("created");
    emit("status", "Guardado");
  } catch (error) {
    console.error("Error creando usuario:", error);
    emit("status", "Error");
    alert(error.message || "Error al crear usuario.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section id="registro" class="panel">
    <PanelHeader title="Registro de usuario" :description="`${photos.length} fotos capturadas`">
      <StatusPill :label="status" :tone="statusTone(status)" />
    </PanelHeader>

    <div class="panel-body">
      <div class="form-grid">
        <label>
          Nombre del usuario
          <input v-model.trim="form.nombre" type="text" autocomplete="off" placeholder="Ejemplo: Maria Gomez" />
        </label>

        <label>
          Codigo del estudiante
          <input v-model.trim="form.codigo" type="text" autocomplete="off" placeholder="Ejemplo: 2026001" />
        </label>

        <div class="form-actions">
          <button class="btn btn-primary" type="button" :disabled="saving" @click="submitUser">
            Crear usuario
          </button>
          <button class="btn" type="button" @click="$emit('clearPhotos')">
            Limpiar fotos
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
