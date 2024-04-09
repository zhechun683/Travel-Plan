import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    build: {
        rollupOptions: {
            output: {
                entryFileNames: "[name].js", // 指定输出的 JS 文件名，包含 hash
                chunkFileNames: "[name].js", // 指定输出的代码分割块文件名，包含 hash
                assetFileNames: "[name].[ext]", // 指定输出的静态资源文件名，包含 hash
            },
        },
    },
});
