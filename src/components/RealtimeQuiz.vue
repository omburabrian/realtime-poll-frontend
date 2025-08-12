<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useSocketIO } from "../composables/useSocketIO";
import { useSnackbar } from "../composables/useSnackbar.js";

const { socket } = useSocketIO();
const { showErrorSnackbar } = useSnackbar();
const messages = ref([]);
const newMessage = ref("");
const user = ref(JSON.parse(localStorage.getItem("user")));
const chatContainer = ref(null); // Ref for the scrollable element

const props = defineProps({
  pollEventGuid: {
    type: [String, Number],
    required: true,
  },
});


onMounted(() => {
  // Join the specific poll event's chat room on the server
  socket.emit("joinPollEvent", props.pollEventGuid);

  // Listen for new messages broadcasted from the server
  socket.on("newMessage", (message) => {
    messages.value.push(message);
  });

  // Optional: Listen for any chat-specific errors from the server
  socket.on("chatError", (errorMsg) => {
    showErrorSnackbar(errorMsg, "Chat Error");
  });
});

onUnmounted(() => {
  // Tell the server we are leaving the poll event room
  socket.emit("leavePollEvent", props.pollEventGuid);

  // Clean up the event listeners to prevent memory leaks
  socket.off("newMessage");
  socket.off("chatError");
});

function sendMessage() {
  if (!newMessage.value.trim()) return;

  const payload = {
    pollEventGuid: props.pollEventGuid,
    message: newMessage.value,
  };

  // Send the message directly to the server via WebSocket
  socket.emit("newMessage", payload);
  newMessage.value = "";
}
</script>
