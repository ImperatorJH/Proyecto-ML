<script setup>
import { formatDate, formatTime } from "../utils/formatters";
import StatusPill from "./StatusPill.vue";

defineProps({
  records: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
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
  emptyMessage: {
    type: String,
    required: true,
  },
});

defineEmits(["refresh"]);
</script>

<template>
  <section id="asistencia" class="table-panel">
    <div class="table-header">
      <div>
        <h2>Asistencias recientes</h2>
        <p>{{ status }}</p>
      </div>
      <div class="table-tools">
        <StatusPill :label="apiStatus" :tone="apiTone" />
        <button class="btn btn-small" type="button" @click="$emit('refresh')">Actualizar</button>
      </div>
    </div>

    <div v-if="records.length" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Codigo</th>
            <th>Fecha</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="`record-${record.id}-${record.hora}`">
            <td class="id-cell">{{ record.id ?? "-" }}</td>
            <td class="name-cell">{{ record.nombre ?? "-" }}</td>
            <td>{{ record.codigo ?? "-" }}</td>
            <td>{{ formatDate(record.fecha) }}</td>
            <td>{{ formatTime(record.hora) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">{{ emptyMessage }}</div>
  </section>
</template>
