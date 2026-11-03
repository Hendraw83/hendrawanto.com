import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {harden} from "./security-policy.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=join(root,"game-src/ukp/dist"),target=join(root,"game/ukp");
if(!existsSync(join(source,"index.html")))throw new Error("Build UKP belum tersedia.");
const assets=join(target,"assets");mkdirSync(assets,{recursive:true});
for(const name of readdirSync(assets))if(/\.(js|css|map)$/.test(name))rmSync(join(assets,name));
for(const name of readdirSync(join(source,"assets"))){
  if(!/\.(js|css)$/.test(name))continue;
  const content=readFileSync(join(source,"assets",name),"utf8");
  if(/he-ukp-a-0\d|he-ukp-b-\d|questions\.demo\.json|questions\.additional\.json/.test(content))throw new Error("Bank demo tidak boleh masuk build online.");
  copyFileSync(join(source,"assets",name),join(assets,name));
}
const index=readFileSync(join(source,"index.html"),"utf8");
writeFileSync(join(target,"index.html"),harden(index,"game/ukp/index.html"));
console.log("Build UKP online dikemas dengan CSP dan SRI.");
