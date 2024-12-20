"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Dữ liệu mẫu

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; price: string; imageUrl: string; category: string }) => void;
  initialData?: { name: string; description: string; price: string; imageUrl: string; category: string };
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || { name: "", description: "", price: "", imageUrl: "", category: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]); // State lưu danh sách món ăn

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    console.log("Handle submit called");

    let imageUrl = formData.imageUrl;

    // Upload file lên Cloudinary
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      uploadData.append("upload_preset", "foodMad");

      try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dki4y4chk/image/upload", {
          method: "POST",
          body: uploadData,
        });
        const data = await response.json();
        imageUrl = data.secure_url;
        console.log("Image uploaded successfully:", imageUrl);  // Log ảnh upload
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        setUploading(false);
        return;
      }
    }

    const dishData = { ...formData, imageUrl };
    console.log("Dish data before send:", dishData);  // Log dữ liệu món ăn trước khi gửi

    try {
      const response = await fetch("http://localhost:9999/api/addDish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dishData),
      });

      const result = await response.json(); // Now parse the JSON response
      console.log("API response:", result);  // Log response từ API

      if (!response.ok) {
        console.error("Error response:", result.error);
        throw new Error(result.error || "Failed to add dish");
      }

      console.log("Dish added successfully:", result.message);
      onClose(); // Close the modal
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Chỉnh sửa món ăn" : "Thêm món ăn"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Tên món ăn</label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mô tả</label>
            <textarea
              name="description"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Giá</label>
            <input
              type="text"
              name="price"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Hình ảnh</label>
            <input type="file" className="w-full p-2 border border-gray-300 rounded mt-1" onChange={handleFileChange} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Danh mục</label>
            <select
              name="category"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Chọn danh mục
              </option>
              <option value="Hải sản">Hải sản</option>
              <option value="Món nướng">Món nướng</option>
              <option value="Món chay">Món chay</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={uploading}>
              {uploading ? "Đang upload..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Xác nhận xóa món ăn</h2>
        <p className="mb-4">Bạn có chắc chắn muốn xóa món ăn này không?</p>
        <div className="flex justify-end space-x-2">
          <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={onClose}>
            Hủy
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]); // State lưu danh sách món ăn
  const [loading, setLoading] = useState<boolean>(false); // State lưu trạng thái loading
  const [error, setError] = useState<string | null>(null); // State lưu thông báo lỗi
  const [currentDish, setCurrentDish] = useState<
    { id: number; name: string; description: string; price: string; imageUrl: string; category: string } | null
  >(null);
  const [deleteDishId, setDeleteDishId] = useState<number | null>(null);

const handleLoadDish = async () => {
    fetchDishes();
  }

  const handleAddDish = () => {
    setCurrentDish(null);
    setModalOpen(true);
  };

  const handleEditDish = (dish: { id: number; name: string; description: string; price: string; imageUrl: string; category: string }) => {
    setCurrentDish(dish);
    setModalOpen(true);
  };

  const handleDeleteDish = (id: number) => {
    alert(`Delete dish with ID: ${id}`);
    setDeleteDishId(id);
    setConfirmDeleteOpen(true);
  };

  interface Dish {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    category: string;
  }

  const handleSaveDish = async (dish: Omit<Dish, "id">) => {
    setUploading(true); // Bắt đầu quá trình upload
    try {
      let imageUrl = dish.imageUrl;

      // Nếu có ảnh mới, upload lên Cloudinary
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("upload_preset", "foodMad"); // Thay upload preset của bạn

        const response = await fetch("https://api.cloudinary.com/v1_1/dki4y4chk/image/upload", {
          method: "POST",
          body: uploadData,
        });
        const data = await response.json();
        imageUrl = data.secure_url; // Lấy URL của ảnh mới
      }

      // Tạo đối tượng dishData mới
      const dishData = { ...dish, imageUrl };

      if (currentDish) {
        // Cập nhật món ăn nếu đang chỉnh sửa món ăn cũ
        const apiResponse = await fetch(`http://localhost:9999/api/updateDish/${currentDish.id}`, {
          method: "PUT", // Cập nhật (PUT)
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dishData),
        });

        const result = await apiResponse.json();
        if (!apiResponse.ok) {
          console.error("Error response:", result.error);
          throw new Error(result.error || "Failed to update dish");
        }

        console.log("Dish updated successfully:", result.message);
        fetchDishes();

        // Cập nhật lại món ăn trong danh sách
        setDishes(dishes.map((d) => (d.id === currentDish.id ? { ...dishData, id: currentDish.id } : d)));
      }

      // Đóng modal
      setModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi thêm hoặc sửa món ăn:", error);
    } finally {
      setUploading(false); // Dừng quá trình upload
    }
  };


  const confirmDeleteDish = async () => {
    if (deleteDishId !== null) {
      try {
        // Gửi yêu cầu xóa món ăn qua API
        const response = await fetch(`http://localhost:9999/api/deleteDish/${deleteDishId}`, {
          method: "DELETE",
        });

        const result = await response.json();
        if (!response.ok) {
          console.error("Error response:", result.error);
          throw new Error(result.error || "Failed to delete dish");
        }

        console.log("Dish deleted successfully:", result.message);

        // Cập nhật lại danh sách món ăn sau khi xóa
        setDishes(dishes.filter((d) => d.id !== deleteDishId));

        // Đóng modal xác nhận xóa
        setConfirmDeleteOpen(false);

        // Tải lại danh sách món ăn mới (nếu cần)
        fetchDishes();  // Nếu bạn muốn gọi lại API để lấy danh sách mới nhất sau khi xóa
      } catch (error) {
        console.error("Lỗi khi xóa món ăn:", error);
      }
    }
  };

  const fetchDishes = async () => {
    setLoading(true); // Bắt đầu tải dữ liệu
    setError(null); // Reset lỗi trước khi gọi API

    try {
      const response = await fetch("http://localhost:9999/api/getDish"); // Gọi API lấy danh sách món ăn

      if (!response.ok) {
        throw new Error("Failed to fetch dishes");
      }
      const data = await response.json(); // Parse response JSON
      console.log("Dishes fetched successfully:", data);
      setDishes(data); // Cập nhật danh sách món ăn vào state

    } catch (error: any) {
      setError(error.message); // Lưu thông báo lỗi nếu có lỗi xảy ra
    } finally {
      setLoading(false); // Kết thúc quá trình loading
    }
  };
  // Gọi API để lấy tất cả món ăn
  useEffect(() => {
    fetchDishes();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading khi đang tải dữ liệu
  }

  if (error) {
    return <div>Error: {error}</div>; // Hiển thị lỗi nếu có lỗi xảy ra
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Danh sách món ăn" />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Quản lý món ăn</h1>
          <div>
            <button className="text-white mr-2 bg-blue-500 px-4 py-2 rounded" onClick={handleLoadDish}>
              load món ăn
            </button>
            <button className="text-white bg-green-500 px-4 py-2 rounded hover:bg-green-600" onClick={handleAddDish}>
              Thêm món ăn
            </button>
          </div>
        </div>

        <div className="flex flex-wrap space-x-4">
          {dishes.map((dish) => (
            <div key={dish.id} className="w-[calc(25%-1rem)] bg-white shadow-lg rounded-lg overflow-hidden mb-4">
              <img className="w-full h-36 object-cover" src={dish.imageUrl} alt={`${dish.name} Image`} />
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800">{dish.name}</h2>
                <p className="text-gray-600 mt-2">{dish.description}</p>
                <h2 className="text-xl font-bold text-gray-800 mt-2">Giá: {dish.price}</h2>
                <p className="text-gray-600 mt-2">Danh mục: {dish.category}</p>
                <div className="mt-4 flex space-x-2">
                  <button className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600" onClick={() => handleEditDish(dish)}>Chỉnh sửa</button>
                  <button className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600" onClick={() => handleDeleteDish(dish.id)}>Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveDish} initialData={currentDish || undefined} />
      <ConfirmDeleteModal isOpen={isConfirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} onConfirm={confirmDeleteDish} />
    </DefaultLayout>
  );
};

export default Profile;

