//  Use this in all views that use the "snackbar" to simplify the code.

import { ref } from 'vue';

export function useSnackbar() {

  const snackbar = ref({
    value: false,
    color: '',
    text: '',
    timeout: 5000,  // Default timeout = 5K milliseconds = 5 seconds
  });

  function showSnackbar(text, color = 'success', timeout = 5000) {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.timeout = timeout;
    snackbar.value.value = true;
  }

  function showErrorSnackbar(error, defaultMessage = 'An unexpected error occurred.') {

    let message;

    //  If the passed 'error' is a string, then just display it.
    if (typeof error === 'string') {
      message = error;
    } else {
      //  Otherwise, use the message in the error object.
      message = error?.response?.data?.message || error?.message || defaultMessage;
    }

    //  Show error messages for 10 seconds (10K milliseconds)
    //  (or make them persistent with -1 ?)
    showSnackbar(message, "error", 10000);
  }

  function closeSnackbar() {
    snackbar.value.value = false;
  }

  return { snackbar, showSnackbar, showErrorSnackbar, closeSnackbar };
}
