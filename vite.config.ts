import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        containerApp: "src/main/ContainerApp/index.ts",
        microApp: "src/main/MicroApp/index.ts"
      }
    }
  },
  plugins: [
    dts({
      outDir: "dist",
      tsconfigPath: "./tsconfig.build.json",
      rollupTypes: true
    })
  ]
});
