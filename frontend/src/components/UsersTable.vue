<script setup>
import { getInitial } from "../utils/formatters";

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
  <section class="table-panel">
    <div class="table-header">
      <div>
        <h2>Usuarios registrados</h2>
        <p>{{ users.length }} usuarios</p>
      </div>
      <button class="btn btn-small" type="button" @click="$emit('refresh')">Actualizar</button>
    </div>

    <div v-if="users.length" class="table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Codigo</th>
            <th>Fotos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="`user-${user.codigo}-${user.nombre}`">
            <td>
              <span class="avatar">
                <img v-if="user.foto" :src="user.foto" :alt="user.nombre || 'Usuario'" />
                <span v-else>{{ getInitial(user) }}</span>
              </span>
            </td>
            <td class="name-cell">{{ user.nombre ?? "-" }}</td>
            <td>{{ user.codigo ?? "-" }}</td>
            <td>{{ user.total_fotos ?? 0 }}</td>
            <td>
              <button class="btn btn-danger btn-small" type="button" @click="$emit('delete', user)">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">{{ emptyMessage }}</div>
  </section>
</template>
