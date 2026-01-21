import Modal from "./Modal";

type AlertModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export default function AlertModal({
  isOpen,
  title = "Notice",
  message,
  buttonText = "OK",
  onClose,
}: AlertModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <p className="text-sm text-gray-700">{message}</p>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}
