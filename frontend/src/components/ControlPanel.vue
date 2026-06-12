<script setup>
import PanelHeader from "./PanelHeader.vue";
import StatusPill from "./StatusPill.vue";

defineProps({
  apiStatus: {
    type: String,
    required: true,
  },
  apiTone: {
    type: String,
    default: "neutral",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["start", "report", "refreshRecords", "refreshUsers", "docs"]);
</script>

<template>
  <section class="panel">
    <PanelHeader title="Centro de control" description="Acciones principales del prototipo.">
      <StatusPill :label="apiStatus" :tone="apiTone" />
    </PanelHeader>

    <div class="panel-body">
      <div class="quick-actions">
        <button class="action-tile" type="button" :disabled="loading" @click="$emit('start')">
          <strong>Reconocimiento</strong>
          <span>Ejecutar proceso Python</span>
        </button>
        <button class="action-tile" type="button" @click="$emit('report')">
          <strong>Reporte CSV</strong>
          <span>Exportar asistencias</span>
        </button>
        <button class="action-tile" type="button" @click="$emit('refreshRecords')">
          <strong>Asistencias</strong>
          <span>Sincronizar tabla</span>
        </button>
        <button class="action-tile" type="button" @click="$emit('refreshUsers')">
          <strong>Usuarios</strong>
          <span>Actualizar listado</span>
        </button>
        <button class="action-tile" type="button" @click="$emit('docs')">
          <strong>Documentación</strong>
          <span>Abrir Swagger API</span>
        </button>
      </div>
    </div>
  </section>
</template>
