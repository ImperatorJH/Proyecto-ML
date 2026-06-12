<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  createReport,
  getRecognitionStreamUrl,
  getDocsUrl,
  getAttendance,
  getUsers,
  deleteUser,
  startRecognition,
  stopRecognition,
} from "./services/api";
import { formatTime, sortRecentFirst } from "./utils/formatters";
import SidebarNav from "./components/SidebarNav.vue";
import TopBar from "./components/TopBar.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import AttendancePage from "./pages/AttendancePage.vue";
import UsersPage from "./pages/UsersPage.vue";
import RegisterPage from "./pages/RegisterPage.vue";
import RecognitionModal from "./components/RecognitionModal.vue";

const REFRESH_SECONDS = 60;

const records = ref([]);
const users = ref([]);
const secondsLeft = ref(REFRESH_SECONDS);
const loadingAction = ref(false);
const recognitionModalOpen = ref(false);
const recognitionNotice = ref(null);
const apiStatus = ref("Conectando");
const loadStatus = ref("Cargando datos...");
const userStatus = ref("Listo");
const capturedPhotos = ref([]);
const tableMessage = ref("No hay asistencias registradas.");
const usersMessage = ref("No hay usuarios registrados.");
const activePage = ref("dashboard");
const intervals = [];
let recognitionPollInterval = null;
let recognitionNoticeTimer = null;
let lastRecognitionRecordId = 0;

const pages = {
  dashboard: {
    title: "Dashboard de asistencia",
    description: "Resumen operativo del reconocimiento facial y los registros.",
  },
  asistencias: {
    title: "Asistencias",
    description: "Consulta los registros ordenados desde el mas reciente.",
  },
  usuarios: {
    title: "Usuarios",
    description: "Listado de estudiantes registrados con codigo y fotos.",
  },
  registro: {
    title: "Registro de usuario",
    description: "Captura fotos y crea nuevos estudiantes en el sistema.",
  },
};

const latestAttendance = computed(() => {
  if (!records.value.length) return "Sin datos";
  const record = records.value[0];
  return `${record.nombre ?? "-"} - ${formatTime(record.hora)}`;
});

const apiTone = computed(() => {
  if (apiStatus.value === "En linea") return "ok";
  if (apiStatus.value === "Sin conexion") return "error";
  return "warn";
});

const currentPage = computed(() => pages[activePage.value] ?? pages.dashboard);

async function loadRecords(manual = false) {
  try {
    loadStatus.value = manual ? "Actualizando..." : "Sincronizando...";
    apiStatus.value = "Conectando";
    records.value = sortRecentFirst(await getAttendance());
    loadStatus.value = `Ultima carga: ${new Date().toLocaleTimeString("es-CO")}`;
    apiStatus.value = "En linea";
    tableMessage.value = "No hay asistencias registradas.";
    secondsLeft.value = REFRESH_SECONDS;
  } catch (error) {
    console.error("Error cargando datos:", error);
    loadStatus.value = "No se pudieron cargar los datos";
    apiStatus.value = "Sin conexion";
    tableMessage.value = "Revisa que el backend este ejecutandose.";
  }
}

async function loadUsers(manual = false) {
  try {
    if (manual) usersMessage.value = "Cargando usuarios...";
    users.value = await getUsers();
    usersMessage.value = "No hay usuarios registrados.";
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    usersMessage.value = "No se pudieron cargar los usuarios.";
  }
}

async function loadAll(manual = false) {
  await Promise.all([loadRecords(manual), loadUsers(manual)]);
}

function getLatestRecordId(items = records.value) {
  return items.reduce((latest, record) => Math.max(latest, Number(record.id) || 0), 0);
}

function showRecognitionNotice(record) {
  recognitionNotice.value = {
    title: "Asistencia registrada",
    message: `${record.nombre ?? "Usuario"}${record.codigo ? ` (${record.codigo})` : ""}`,
    time: formatTime(record.hora),
  };

  clearTimeout(recognitionNoticeTimer);
  recognitionNoticeTimer = setTimeout(() => {
    recognitionNotice.value = null;
  }, 4200);
}

async function checkRecognitionRegistrations() {
  try {
    const latestRecords = sortRecentFirst(await getAttendance());
    const newestRecord = latestRecords[0];
    const newestId = getLatestRecordId(latestRecords);

    if (newestRecord && newestId > lastRecognitionRecordId) {
      lastRecognitionRecordId = newestId;
      records.value = latestRecords;
      loadStatus.value = `Ultima carga: ${new Date().toLocaleTimeString("es-CO")}`;
      apiStatus.value = "En linea";
      showRecognitionNotice(newestRecord);
    }
  } catch (error) {
    console.error("Error revisando registros del reconocimiento:", error);
  }
}

function startRecognitionPolling() {
  stopRecognitionPolling();
  lastRecognitionRecordId = getLatestRecordId();
  recognitionPollInterval = setInterval(checkRecognitionRegistrations, 1800);
}

function stopRecognitionPolling() {
  if (recognitionPollInterval) {
    clearInterval(recognitionPollInterval);
    recognitionPollInterval = null;
  }

  clearTimeout(recognitionNoticeTimer);
  recognitionNotice.value = null;
}

async function handleDeleteUser(user) {
  const name = user?.nombre || "este usuario";
  const confirmed = window.confirm(
    `Eliminar ${name}? Tambien se borraran sus fotos de Cloudinary y del dataset local.`
  );

  if (!confirmed) return;

  try {
    await deleteUser(user.id_usuario);
    alert("Usuario eliminado correctamente");
    await loadUsers(true);
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    alert(error.message || "No se pudo eliminar el usuario.");
  }
}

async function runRecognitionAction(action, fallback) {
  loadingAction.value = true;
  try {
    const data = await action();
    alert(data.mensaje ?? fallback);
    await loadRecords(true);
    return true;
  } catch (error) {
    console.error(fallback, error);
    alert(error.message || fallback);
    return false;
  } finally {
    loadingAction.value = false;
  }
}

async function handleStartRecognition() {
  const started = await runRecognitionAction(startRecognition, "No se pudo iniciar el reconocimiento");
  if (started) {
    recognitionModalOpen.value = true;
    startRecognitionPolling();
  }
}

async function handleStopRecognition() {
  const stopped = await runRecognitionAction(stopRecognition, "No se pudo detener el reconocimiento");
  if (stopped) {
    recognitionModalOpen.value = false;
    stopRecognitionPolling();
  }
}

async function handleReport() {
  try {
    const data = await createReport();
    alert(`${data.message}\nArchivo: ${data.data.nombreArchivo}\nRuta: ${data.data.rutaArchivo}\nTotal registros: ${data.data.total}`);
  } catch (error) {
    console.error("Error generando reporte:", error);
    alert(error.message || "No se pudo generar el reporte.");
  }
}

function handleOpenDocs() {
  window.open(getDocsUrl(), "_blank", "noopener,noreferrer");
}

function clearCapturedPhotos() {
  capturedPhotos.value.forEach((photo) => URL.revokeObjectURL(photo.preview));
  capturedPhotos.value = [];
}

function syncPageFromHash() {
  const page = window.location.hash.replace("#", "");
  activePage.value = pages[page] ? page : "dashboard";
}

function navigate(page) {
  activePage.value = page;
  window.location.hash = page;
}

function tick() {
  secondsLeft.value = secondsLeft.value <= 0 ? REFRESH_SECONDS : secondsLeft.value - 1;
}

onMounted(() => {
  syncPageFromHash();
  window.addEventListener("hashchange", syncPageFromHash);
  loadAll();
  intervals.push(setInterval(tick, 1000));
  intervals.push(setInterval(() => loadRecords(), REFRESH_SECONDS * 1000));
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", syncPageFromHash);
  intervals.forEach((interval) => clearInterval(interval));
  stopRecognitionPolling();
  clearCapturedPhotos();
});
</script>

<template>
  <div class="app-shell">
    <SidebarNav :active-page="activePage" @navigate="navigate" />

    <main class="main">
      <TopBar
        :title="currentPage.title"
        :description="currentPage.description"
        :loading="loadingAction"
        @start="handleStartRecognition"
        @stop="handleStopRecognition"
        @refresh="loadAll(true)"
      />

      <DashboardPage
        v-if="activePage === 'dashboard'"
        :records-count="records.length"
        :users-count="users.length"
        :latest-attendance="latestAttendance"
        :load-status="loadStatus"
        :seconds-left="secondsLeft"
        :api-status="apiStatus"
        :api-tone="apiTone"
        :loading="loadingAction"
        @start="handleStartRecognition"
        @report="handleReport"
        @refresh-records="loadRecords(true)"
        @refresh-users="loadUsers(true)"
        @docs="handleOpenDocs"
      />

      <AttendancePage
        v-else-if="activePage === 'asistencias'"
        :records="records"
        :status="loadStatus"
        :api-status="apiStatus"
        :api-tone="apiTone"
        :empty-message="tableMessage"
        @refresh="loadRecords(true)"
      />

      <UsersPage
        v-else-if="activePage === 'usuarios'"
        :users="users"
        :empty-message="usersMessage"
        @refresh="loadUsers(true)"
        @delete="handleDeleteUser"
      />

      <RegisterPage
        v-else
        :status="userStatus"
        :photos="capturedPhotos"
        @status="userStatus = $event"
        @created="loadUsers(true)"
        @clear-photos="clearCapturedPhotos"
        @update-photos="capturedPhotos = $event"
      />

      <RecognitionModal
        :open="recognitionModalOpen"
        :stream-url="getRecognitionStreamUrl()"
        :notice="recognitionNotice"
        :stopping="loadingAction"
        @close="handleStopRecognition"
      />
    </main>
  </div>
</template>
