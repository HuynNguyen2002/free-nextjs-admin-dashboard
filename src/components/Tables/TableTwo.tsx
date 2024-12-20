"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

// Định nghĩa kiểu dữ liệu Dish
type Dish = {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  category: string;
  price: number;
};

type DishToday = {
  id: string;
  dishId: string;
};

const TableTwo = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]); // Lưu trữ món ăn được chọn
  const [isModalOpen, setIsModalOpen] = useState(false); // Điều khiển modal
  const [allDishes, setAllDishes] = useState<Dish[]>([]);

  // lấy dữ liêu món ăn
  const getAllDished = async () => {
    try {
      const response = await fetch("http://localhost:9999/api/getDish");
      const data = await response.json();
      console.log("Tất cả món ăn", data);
      setAllDishes(data);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  }

  // cập nhật danh sách
  

  const fetchDishes = async () => {
    try {
      const response = await fetch("http://localhost:9999/api/getDishToday");
      const data = await response.json();
      console.log("Dishes today:", data);
      setDishes(data); // Cập nhật state với dữ liệu lấy được
    } catch (error) {
      console.error("Error fetching dishes:", error);
    }
  };
  useEffect(() => {
    fetchDishes();
    getAllDished();
  }, []); // Chỉ chạy khi component được mount


  let categorizedDishes: { [key: string]: Dish[] } = {};

  if (allDishes.length > 0) {
    categorizedDishes = allDishes.reduce((acc, dish) => {
      if (!acc[dish.category]) {
        acc[dish.category] = [];
      }
      acc[dish.category].push(dish);
      return acc; // Trả về accumulator đúng
    }, {} as { [key: string]: Dish[] });
  }


  // Thêm món ăn trong ngày
  const handleAddDish = async () => {
    try {
      console.log("Selected dishes:", selectedDishes); // Log danh sách món ăn được chọn
  
      const response = await fetch("http://localhost:9999/api/addDishToday", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dishes: selectedDishes }), // Gửi danh sách món ăn được chọn
      });
  
      if (response.ok) {
        alert("Món ăn đã được thêm!");
        
        // Cập nhật lại danh sách món ăn sau khi thêm thành công
        // Loại bỏ các món ăn đã được thêm vào DishesToday
        setDishes((prevDishes) => {
          // Lọc ra các món ăn chưa được thêm vào DishesToday
          return prevDishes.filter((dish) => !selectedDishes.includes(dish.id));
        });
  
        setIsModalOpen(false); // Đóng modal
      } else {
        alert("Có lỗi xảy ra khi thêm món ăn.");
      }
    } catch (error) {
      console.error("Error adding dishes:", error);
    }
  };
  
  
  // Xóa món ăn
  const handleDeleteDish = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:9999/api/deleteDishToday/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDishes(dishes.filter((dish) => dish.id !== id)); // Cập nhật lại danh sách món ăn
        alert(`Món ăn đã bị xóa.`);
      } else {
        alert("Có lỗi xảy ra khi xóa món ăn.");
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Danh sách món ăn trong ngày
        </h4>
        <div>
        <button
        onClick={fetchDishes}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded"
        >
          Cập nhật danh sách
        </button>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Thêm món ăn
        </button>
        </div>

      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Tên món</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">Mô tả</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Danh mục</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Giá</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Hành động</p>
        </div>
      </div>

      {dishes && dishes.length > 0 ? (
        dishes.map((dish, key) => (
          <div
            className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
            key={dish.id}
          >
            <div className="col-span-3 flex items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-12.5 w-15 rounded-md">
                  <Image
                    src={dish.imageUrl}
                    width={60}
                    height={50}
                    alt="Dish"
                  />
                </div>
                <p className="text-sm text-black dark:text-white">{dish.name}</p>
              </div>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">{dish.description}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">{dish.category}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">${dish.price}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <button
                onClick={() => handleDeleteDish(dish.id)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-black dark:text-white mt-4">
          Không có món ăn trong ngày
        </p>
      )}


      {/* Modal thêm món ăn */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-1/2">
            <h4 className="text-xl font-semibold">Chọn món ăn</h4>
            <div className="mt-4">
              {Object.keys(categorizedDishes).length > 0 ? (
                Object.keys(categorizedDishes).map((category) => (
                  <div key={category} className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-800">{category}</h5>
                    <div>
                      {categorizedDishes[category].map((dish) => (
                        <div key={dish.id} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={selectedDishes.includes(dish.id)}
                            onChange={() => {
                              if (selectedDishes.includes(dish.id)) {
                                setSelectedDishes(selectedDishes.filter((id) => id !== dish.id));
                              } else {
                                setSelectedDishes([...selectedDishes, dish.id]);
                              }
                            }}
                          />
                          <Image
                            src={dish.imageUrl}
                            width={30}
                            height={30}
                            alt={dish.name}
                            className="rounded-md"
                          />
                          <span className="ml-2">{dish.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center">Không có món ăn để hiển thị</p>
              )}

            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleAddDish}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableTwo;
