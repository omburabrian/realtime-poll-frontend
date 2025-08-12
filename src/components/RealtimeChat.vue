<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useSocketIO } from "../composables/useSocketIO";
import { useSnackbar } from "../composables/useSnackbar.js";
import { SOCKET_MESSAGES } from "../constants/index.js";

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


  //  console.log("ABOUT TO:  socket.emit(\"joinPollEvent\", props.pollEventGuid);");
  //  console.log("props.pollEventGuid = " + props.pollEventGuid);

  // Join the specific poll event's chat room on the server
  socket.emit("joinPollEvent", props.pollEventGuid);


  //  console.log("SOCKET_MESSAGES.NEW_MESSAGE = " + SOCKET_MESSAGES.NEW_MESSAGE);
  //  console.log("SOCKET_MESSAGES.SEND_MESSAGE = " + SOCKET_MESSAGES.SEND_MESSAGE);

  // The line `messages.value.push("Just display something")` caused the "User:"
  // display because it's a string, but the template expects an object.
  // To test the display, you would use an object like this:
  // messages.value.push({ user: { firstName: 'System' }, message: 'Chat connected.', timestamp: new Date().toISOString() });


  //  messages.value.push({ user: { firstName: 'System' }, message: 'Chat connected.', timestamp: new Date().toISOString() });


  // Listen for new messages broadcasted from the server
  socket.on(SOCKET_MESSAGES.NEW_MESSAGE, (message) => {
  //  socket.on("newMessage", (message) => {



    console.log("Received message via socket (SOCKET_MESSAGES.NEW_MESSAGE): ", message);


    messages.value.push(message);
  });

  // Optional: Listen for any chat-specific errors from the server
  socket.on("chatError", (errorMsg) => {
    showErrorSnackbar(errorMsg, "Chat Error");
  });

  // Listen for generic errors from the socket server (e.g., failed to join room)
  socket.on("error", (error) => {
    console.error("Socket error received:", error);
    showErrorSnackbar(error.message || "A socket error occurred", "Error");
  });
});

onUnmounted(() => {
  // Tell the server we are leaving the poll event room
  socket.emit("leavePollEvent", props.pollEventGuid);

  // Clean up the event listeners to prevent memory leaks
  socket.off("error");
  socket.off(SOCKET_MESSAGES.NEW_MESSAGE);
  socket.off("chatError");
});

function sendMessage() {
  if (!newMessage.value.trim()) return;

  const payload = {
    pollEventGuid: props.pollEventGuid,
    message: newMessage.value,
  };

  console.log("Sending message:", payload);
  console.log("SOCKET_MESSAGES.NEW_MESSAGE = " + SOCKET_MESSAGES.NEW_MESSAGE);
  console.log("SOCKET_MESSAGES.SEND_MESSAGE = " + SOCKET_MESSAGES.SEND_MESSAGE);

  // Send the message directly to the server via WebSocket
  socket.emit(SOCKET_MESSAGES.SEND_MESSAGE, payload);
  newMessage.value = "";
}
</script>

<template>
  <v-card class="elevation-5">
    <v-card-title>Chat Room</v-card-title>
    <v-card-text ref="chatContainer" style="height: 300px; overflow-y: auto">
      <div v-for="msg in messages" :key="msg.timestamp" class="mb-2">
        <strong>{{ msg.user?.firstName || "User" }}:</strong> {{ msg.message }}
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
