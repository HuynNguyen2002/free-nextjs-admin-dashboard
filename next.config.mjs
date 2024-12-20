/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // Thêm tên miền Cloudinary tại đây
  },
};

export default nextConfig;
