<template>
  <v-card class="qr-code-generator" elevation="2">
    <!-- Input Form - Show when no QR code is generated -->
    <v-card-text v-if="!qrCodeDataUrl">
      <v-form @submit.prevent="generateQR">
        <v-text-field
          v-model="url"
          label="Enter URL or Text"
          placeholder="https://example.com or any text"
          variant="outlined"
          :rules="[rules.required]"
          clearable
          @keyup.enter="generateQR"
        ></v-text-field>
        
        <v-btn
          color="primary"
          block
          :loading="loading"
          @click="generateQR"
          :disabled="!url"
          class="mt-3"
        >
          <v-icon start>mdi-qrcode-scan</v-icon>
          Generate QR Code
        </v-btn>
      </v-form>
    </v-card-text>
    
    <!-- QR Code Display - Show when QR code is generated -->
    <v-card-text v-if="qrCodeDataUrl" class="text-center">
      <div class="qr-code-container">
        <img
          :src="qrCodeDataUrl"
          :alt="'QR Code for ' + url"
          class="qr-code-image"
        />
      </div>
      
      <div class="mt-4">
        <v-chip
          color="primary"
          variant="outlined"
          class="text-body-1"
        >
          {{ url }}
        </v-chip>
      </div>
      
      <v-btn
        color="secondary"
        variant="outlined"
        @click="resetQR"
        class="mt-4"
      >
        <v-icon start>mdi-refresh</v-icon>
        Generate New QR Code
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'QuizQR',
  data() {
    return {
      url: '',
      qrCodeDataUrl: '',
      loading: false,
      rules: {
        required: value => !!value || 'URL or text is required'
      }
    }
  },
  methods: {
    async generateQR() {
      if (!this.url) {
        return
      }
      
      this.loading = true
      
      try {
        const options = {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        }
        
        this.qrCodeDataUrl = await QRCode.toDataURL(this.url, options)
      } catch (error) {
        console.error('Error generating QR code:', error)
      } finally {
        this.loading = false
      }
    },
    
    resetQR() {
      this.qrCodeDataUrl = ''
      this.url = ''
    }
  }
}
</script>

<style scoped>
.qr-code-generator {
  max-width: 600px;
  margin: 0 auto;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 16px;
}

.qr-code-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style> 