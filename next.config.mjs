/** @type {import('next').NextConfig} */
const nextConfig = {
  // 禁用图像优化，因为我们使用Three.js处理图像
  images: {
    unoptimized: true,
  },
  // 配置webpack以处理Three.js
  webpack: (config) => {
    // 允许导入glsl文件
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader'],
    });
    
    return config;
  },
  // 配置输出独立构建
  output: 'standalone',
};

export default nextConfig;

