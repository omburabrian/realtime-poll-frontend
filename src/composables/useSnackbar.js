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

  function closeSnackBar() {
    snackbar.value.value = false;
  }

  return { snackbar, showSnackbar, closeSnackBar };
}
