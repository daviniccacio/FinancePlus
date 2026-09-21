// src/utils/notify.jsx
import toast from 'react-hot-toast';
import CustomToast from '../components/common/CustomToast';

const OPCOES_TOAST = {
  duration: 3500,
  position: 'bottom-right',
};

export const notify = {
  success: (msg) =>
    toast.custom(
      (t) => <CustomToast t={t} mensagem={msg} tipo="success" />,
      OPCOES_TOAST
    ),

  error: (msg) =>
    toast.custom(
      (t) => <CustomToast t={t} mensagem={msg} tipo="error" />,
      OPCOES_TOAST
    ),

  info: (msg) =>
    toast.custom(
      (t) => <CustomToast t={t} mensagem={msg} tipo="info" />,
      OPCOES_TOAST
    ),
};