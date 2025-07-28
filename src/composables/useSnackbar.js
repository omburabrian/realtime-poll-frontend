//  ToDo:  Use this in all views that use the "snackbar" to simplify the code.
// src/composables/useSnackbar.js
import { ref } from 'vue';

export function useSnackbar() {
  const snackbar = ref({
    value: false,
    color: '',
    text: '',
  });

  function showSnackbar(text, color = 'success') {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.value = true;
  }

  function showErrorSnackbar(message) {
    showSnackbar(message, 'error');
  }

  function closeSnackbar() {
    snackbar.value.value = false;
  }

  return { snackbar, showSnackbar, showErrorSnackbar, closeSnackbar };
}
