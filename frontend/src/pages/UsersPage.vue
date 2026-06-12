<script setup>
import UsersTable from "../components/UsersTable.vue";

defineProps({
  users: {
    type: Array,
    required: true,
  },
  emptyMessage: {
    type: String,
    required: true,
  },
});

defineEmits(["refresh", "delete"]);
</script>

<template>
  <UsersTable
    :users="users"
    :empty-message="emptyMessage"
    @refresh="$emit('refresh')"
    @delete="$emit('delete', $event)"
  />
</template>
