import React from "react";
import "../styles/ConfirmationModal.css";

export const ConfirmationModal = ({ onClose, icon, text, onSubmit }) => {
  return (
    <div className="confirmationModalWrapper" onClick={onClose}>
      <div
        className="confirmationModalContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmIconBox">
          <img src={icon} alt="Icon" className="passIcon" />
        </div>

        <p className="modalText">{text}</p>

        <div className="buttonsWrapper">
          <button className="modalButton cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modalButton confirm" onClick={onSubmit}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
