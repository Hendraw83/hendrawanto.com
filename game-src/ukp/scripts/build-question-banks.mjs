import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const sourcePath=path.join(root,"content/questions.source.json");
const targets=[
  path.join(root,"src/data/questions.demo.json"),
  path.join(root,"functions/data/questions.private.json"),
];
const source=JSON.parse(fs.readFileSync(sourcePath,"utf8"));

if(!Array.isArray(source)||source.length!==100)throw new Error(`Bank sumber harus tepat 100 soal; ditemukan ${source.length}.`);
const ids=new Set();
const prompts=new Set();
const letters=["a","b","c","d"];

const bank=source.map((item,index)=>{
  if(typeof item.id!=="string"||ids.has(item.id))throw new Error(`ID soal tidak valid/duplikat pada indeks ${index}.`);
  if(typeof item.stem!=="string"||prompts.has(item.stem))throw new Error(`Teks soal tidak valid/duplikat pada ${item.id}.`);
  if(!Array.isArray(item.choices)||item.choices.length!==4||new Set(item.choices).size!==4)throw new Error(`${item.id} harus memiliki empat opsi unik.`);
  if(!Number.isInteger(item.correctIndex)||item.correctIndex<0||item.correctIndex>3)throw new Error(`Kunci ${item.id} tidak valid.`);
  ids.add(item.id);prompts.add(item.stem);
  const options=item.choices.map((text,choiceIndex)=>({id:`${item.id}-opt-${letters[choiceIndex]}`,text}));
  return {
    id:item.id,
    sequence:index+1,
    topic:item.topic,
    prompt:item.stem,
    options,
    correctOptionId:options[item.correctIndex].id,
    explanation:item.explanation,
    source:{
      label:item.reference?.label??"Bank soal Aa Hendra",
      url:item.reference?.url??"https://hendrawanto.com/",
      official:false,
    },
    officialSourceUrl:null,
    verifiedAt:null,
    effectivePeriod:"Belum diverifikasi untuk kompetisi online; gunakan sebagai materi demo/editorial.",
    validFrom:null,
    validUntil:null,
    editorialStatus:"draft",
    competitionEligible:false,
    calculationAssumptions:null,
  };
});

for(const target of targets){
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,`${JSON.stringify(bank,null,2)}\n`);
}

console.log(JSON.stringify({questions:bank.length,status:"draft",targets:targets.map(p=>path.relative(root,p))}));
