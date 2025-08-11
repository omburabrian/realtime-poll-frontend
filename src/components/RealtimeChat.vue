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
  chatRoomId: {
    type: [String, Number],
    required: true,
  },
});

const roomName = `chat-room-${props.chatRoomId}`;

// Auto-scroll to the bottom when new messages are added
watch(
  messages,
  async () => {
    await nextTick();
    const container = chatContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },
  { deep: true }
);

onMounted(() => {
  // Join the specific chat room on the server
  socket.emit("joinRoom", roomName);

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
  // Tell the server we are leaving the room
  socket.emit("leaveRoom", roomName);

  // Clean up the event listeners to prevent memory leaks
  socket.off("newMessage");
  socket.off("chatError");
});

function sendMessage() {
  if (!newMessage.value.trim()) return;

  const messagePayload = {
    room: roomName,
    text: newMessage.value,
  };

  // Send the message directly to the server via WebSocket
  socket.emit("sendMessage", messagePayload);
  newMessage.value = "";
}
</script>

<template>
  <v-card class="elevation-5">
    <v-card-title>Chat Room {{ chatRoomId }}</v-card-title>
    <v-card-text ref="chatContainer" style="height: 300px; overflow-y: auto">
      <div v-for="msg in messages" :key="msg.timestamp" class="mb-2">
        <strong>{{ msg.user?.firstName || "User" }}:</strong> {{ msg.text }}
      </div>
    </v-card-text>
    <v-card-text>
      <v-form @submit.prevent="sendMessage">
        <v-text-field
          v-model="newMessage"
          label="Type a message..."
          append-icon="mdi-send"
          @click:append="sendMessage"
          hide-details
          outlined
        ></v-text-field>
      </v-form>
    </v-card-text>
  </v-card>
</template>
