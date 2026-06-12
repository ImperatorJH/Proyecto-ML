<script setup>
import logoUrl from "../assets/recfacial-logo.svg";

defineProps({
  activePage: {
    type: String,
    required: true,
  },
});

defineEmits(["navigate"]);

const links = [
  { id: "dashboard", label: "Dashboard" },
  { id: "asistencias", label: "Asistencias" },
  { id: "usuarios", label: "Usuarios" },
  { id: "registro", label: "Registro" },
];
</script>

<template>
  <aside class="sidebar" aria-label="Navegacion principal">
    <div class="brand">
      <img class="brand-logo" :src="logoUrl" alt="RecFacial" />
      <div>
        <strong>RecFacial</strong>
        <span>IDEAD ML 2026</span>
      </div>
    </div>

    <nav class="nav-list">
      <button
        v-for="link in links"
        :key="link.id"
        class="nav-link"
        :class="{ active: activePage === link.id }"
        type="button"
        @click="$emit('navigate', link.id)"
      >
        {{ link.label }}
      </button>
      <a class="nav-link" href="/portafolio">Portafolio</a>
    </nav>
  </aside>
</template>
