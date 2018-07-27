export const setFormData = (formData) => ({
  type: 'SET_FORM_DATA',
  formData
});

export const setFormLoading = (loading: boolean) => ({
  type: 'SET_FORM_LOADING',
  loading
});