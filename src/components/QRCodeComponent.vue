<template>
  <div class="qr-code-container">
    <div v-if="showInput" class="text-center mb-6">
      

    <div v-if="qrCodeUrl" class="text-center">
      <img :src="qrCodeUrl" :alt="`QR Code for ${currentUrl}`" class="qr-image" />
      <p class="mt-3 text-center">
        <a :href="currentUrl" target="_blank" class="text-primary text-body-2 text-decoration-none">
          {{ currentUrl }}
        </a>
      </p>
      </div>
    </div>
    <div v-else class="text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-2">Generating QR Code...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "QRCodeComponent",
  props: {
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 200
    },
    showInput: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      qrCodeUrl: null,
      inputUrl: this.url,
      currentUrl: this.url
    };
  },
  mounted() {
    this.generateQRCode();
  },
  methods: {
    generateQRCode() {
      // Using QR Server API to generate QR code
      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(this.currentUrl)}&size=${this.size}x${this.size}`;
      this.qrCodeUrl = qrServerUrl;
    },
    updateQRCode() {
      this.currentUrl = this.inputUrl;
      this.generateQRCode();
    }
  },
  watch: {
    url() {
      this.inputUrl = this.url;
      this.currentUrl = this.url;
      this.generateQRCode();
    }
  }
};
</script>

<style scoped>
.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.qr-image {
  width: 200px;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
</style>