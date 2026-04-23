// app/common/common.ts
import { StyleSheet } from 'react-native';
import Toast, { ToastType } from 'react-native-toast-message';

// Reusable global styles
export const commonStyles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 12
  },
  formInputView: {
    margin: 20
  }
});

//  Reusable toast function
export function showToaster(message: string, type: ToastType = 'success') {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 60,
  });
}
