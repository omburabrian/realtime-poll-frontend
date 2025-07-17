<template>
  <div class="qr-code-container">
    <div v-if="qrCode">
      <img :src="qrCode" alt="Quiz QR Code" style="width: 180px; height: 180px;" />
      <p class="mt-2">Quiz Link: <a :href="quizLink" target="_blank">{{ quizLink }}</a></p>
    </div>
    <div v-else>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </div>
</template>

<script>
export default {
  name: "QRCodeComponent",
  props: {
    quizId: {
      type: [String, Number],
      required: false
    },
    url: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      qrCode: null,
      quizLink: ''
    };
  },
  async mounted() {
    if (this.url) {
      this.quizLink = this.url;
      try {
        const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(this.url)}&size=180x180`);
        // Use the direct image URL for qrserver
        this.qrCode = response.url;
      } catch (error) {
        this.qrCode = null;
        alert('Failed to load QR code');
      }
    } else if (this.quizId) {
      this.quizLink = `http://ec2-3-133-87-51.us-east-2.compute.amazonaws.com/realtime-poll-frontend/quiz/${this.quizId}`;
      try {
        const response = await fetch(`http://ec2-3-133-87-51.us-east-2.compute.amazonaws.com/api/quiz/${this.quizId}/qrcode`);
        const data = await response.json();
        this.qrCode = data.qrCode;
      } catch (error) {
        this.qrCode = null;
        alert('Failed to load QR code');
      }
    }
  }
};
</script>

<style scoped>
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
}
</style> 