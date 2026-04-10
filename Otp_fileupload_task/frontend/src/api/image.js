import axios from "axios";

const API = "http://localhost:5000/api/images";

export const uploadImage = (file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  return axios.post(`${API}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getImages = (token) =>
  axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });