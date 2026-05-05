import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextProvider";
import { toast } from "react-toastify";
import "../styles/EditProfileModal.css";

// Assets
import CloseBTN from "../assets/close-btn.png";
import fallbackImage from "../assets/default-profile.png";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const EditProfileModal = ({ closeModal }) => {
  const { user: contextUser } = useAuth(); // Used for initial display
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const refreshPage = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!token || !user || !user._id) {
      toast.error("Session error. Please log in again.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (selectedFile) formData.append("profilePicture", selectedFile);
    if (username) formData.append("username", username);

    try {
      const res = await axios.put(
        `${BASE_URL}/api/auth/updateProfile/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local storage with new user data
      const updatedUser = {
        ...user,
        username: res.data.user?.username || user.username,
        profilePicture: res.data.user?.profilePicture || user.profilePicture,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      closeModal();
      refreshPage();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error("Error updating profile");
      setLoading(false);
      console.error("Update error:", err);
    }
  };

  return (
    <div className="editProfileModalWrapper" onClick={closeModal}>
      <div
        className="editProfileModalContent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h3 className="modalTitle">Edit Profile</h3>
          <img
            src={CloseBTN}
            alt="Close"
            className="closeButton"
            onClick={closeModal}
          />
        </div>

        <div className="profile-upload-section">
          <div className="image-container">
            <img
              src={preview || contextUser?.profilePicture || fallbackImage}
              alt="preview"
              className="profilePicModal"
            />
          </div>

          <div className="fileUploadWrapper">
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label htmlFor="profilePicture" className="uploadButton">
              Update Picture
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="usernameInput">
            <label htmlFor="profileUsername">Username</label>
            <input
              type="text"
              id="profileUsername"
              className="profileUsername"
              placeholder={contextUser?.username || "Enter username"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <button
          className="confirmChangesBTN"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "SAVE CHANGES"}
        </button>
      </div>
    </div>
  );
};
