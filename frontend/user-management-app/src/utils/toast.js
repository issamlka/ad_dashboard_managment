import toast from "react-hot-toast";

export const showToast = {
  success: (message) =>
    toast.success(message, {
      duration: 3000,
      style: {
        background: "#eafaf1",
        color: "#27ae60",
        border: "1px solid #27ae60",
        borderRadius: "10px",
        fontSize: "14px",
      },
    }),

  error: (message) =>
    toast.error(message, {
      duration: 4000,
      style: {
        background: "#fdecea",
        color: "#e74c3c",
        border: "1px solid #e74c3c",
        borderRadius: "10px",
        fontSize: "14px",
      },
    }),

  warning: (message) =>
    toast(message, {
      duration: 3000,
      icon: "⚠️",
      style: {
        background: "#fef9e7",
        color: "#d35400",
        border: "1px solid #e67e22",
        borderRadius: "10px",
        fontSize: "14px",
      },
    }),

  info: (message) =>
    toast(message, {
      duration: 3000,
      icon: "ℹ️",
      style: {
        background: "#ebf5fb",
        color: "#2980b9",
        border: "1px solid #3498db",
        borderRadius: "10px",
        fontSize: "14px",
      },
    }),

  loading: (message) =>
    toast.loading(message, {
      style: {
        borderRadius: "10px",
        fontSize: "14px",
      },
    }),

  dismiss: (toastId) => toast.dismiss(toastId),
};
