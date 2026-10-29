import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const stripSourceEntryIntegrity={
  name:"strip-source-entry-integrity",
  transformIndexHtml(html:string){
    return html.replace(/<script\b[^>]*src=["']\.\/src\/main\.tsx["'][^>]*>/i,tag=>tag.replace(/\s+(?:integrity|crossorigin)=["'][^"']*["']/gi,""));
  },
};

export default defineConfig({
  plugins:[stripSourceEntryIntegrity,react(),tailwindcss()],
  build:{target:"es2022",sourcemap:true},
  server:{host:"127.0.0.1",port:5173,allowedHosts:["terminal.local"]},
  preview:{host:"127.0.0.1",port:4173,allowedHosts:["terminal.local"]},
});
