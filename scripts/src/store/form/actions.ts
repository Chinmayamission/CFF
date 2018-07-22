
import {Auth} from "aws-amplify";
import { Cache } from 'aws-amplify';

export const setFormData = (formData) => ({
  type: 'SET_FORM_DATA',
  formData
});