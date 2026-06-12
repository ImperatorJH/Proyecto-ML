<script setup>
import AttendanceTable from "../components/AttendanceTable.vue";

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
  <AttendanceTable
    :records="records"
    :status="status"
    :api-status="apiStatus"
    :api-tone="apiTone"
    :empty-message="emptyMessage"
    @refresh="$emit('refresh')"
  />
</template>
