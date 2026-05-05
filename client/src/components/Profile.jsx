import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import axios from "axios";
import fallbackImage from "../assets/default-profile.png";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = ({ openModal }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    };
    fetchUser();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profileWrapper">
      <img
        src={user.profilePicture || fallbackImage}
        alt="profile"
        className="profilePic"
      />
      <p className="username">@{user.username}</p>
      <p className="email">{user.email}</p>
      <button className="editBtn" onClick={openModal}>
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
