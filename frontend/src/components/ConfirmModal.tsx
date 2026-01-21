import Modal from "./Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="text-sm text-gray-700">{message}</p>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          {cancelText}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
