<script setup>
import MetricCard from "../components/MetricCard.vue";
import ControlPanel from "../components/ControlPanel.vue";

defineProps({
  recordsCount: {
    type: Number,
    required: true,
  },
  usersCount: {
    type: Number,
    required: true,
  },
  latestAttendance: {
    type: String,
    required: true,
  },
  loadStatus: {
    type: String,
    required: true,
  },
  secondsLeft: {
    type: Number,
    required: true,
  },
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
  <section class="page-stack">
    <div class="metrics" aria-label="Indicadores">
      <MetricCard label="Asistencias" :value="recordsCount" detail="Registros cargados" />
      <MetricCard label="Usuarios" :value="usersCount" detail="Estudiantes guardados" />
      <MetricCard label="Ultima" :value="latestAttendance" :detail="loadStatus" />
      <MetricCard label="Sincroniza" :value="`${secondsLeft}s`" detail="Actualizacion automatica" />
    </div>

    <ControlPanel
      :api-status="apiStatus"
      :api-tone="apiTone"
      :loading="loading"
      @start="$emit('start')"
      @report="$emit('report')"
      @refresh-records="$emit('refreshRecords')"
      @refresh-users="$emit('refreshUsers')"
      @docs="$emit('docs')"
    />
  </section>
</template>
