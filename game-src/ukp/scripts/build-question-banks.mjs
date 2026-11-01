import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const additionalPath=path.join(root,"src/data/questions.additional.json");
const demoTarget=path.join(root,"src/data/questions.demo.json");
const privateTarget=path.join(root,"functions/data/questions.private.json");
const original=JSON.parse(fs.readFileSync(demoTarget,"utf8"));
const additional=JSON.parse(fs.readFileSync(additionalPath,"utf8"));

if(!Array.isArray(original)||original.length!==100)throw new Error(`Bank awal harus tepat 100 soal; ditemukan ${original.length}.`);
if(!Array.isArray(additional)||additional.length!==100)throw new Error(`Bank tambahan harus tepat 100 soal; ditemukan ${additional.length}.`);
const ids=new Set();
const prompts=new Set();

function validateQuestion(item,index,group){
  if(!item||typeof item!=="object")throw new Error(`Soal ${group} indeks ${index} tidak valid.`);
  if(typeof item.id!=="string"||ids.has(item.id))throw new Error(`ID soal tidak valid/duplikat pada ${group} indeks ${index}.`);
  if(typeof item.prompt!=="string"||!item.prompt.trim()||prompts.has(item.prompt))throw new Error(`Teks soal tidak valid/duplikat pada ${item.id}.`);
  if(!Array.isArray(item.options)||item.options.length!==4)throw new Error(`${item.id} harus memiliki empat opsi.`);
  const optionIds=item.options.map(option=>option?.id);
  const optionTexts=item.options.map(option=>option?.text);
  if(optionIds.some(id=>typeof id!=="string")||new Set(optionIds).size!==4)throw new Error(`ID opsi ${item.id} harus unik.`);
  if(optionTexts.some(text=>typeof text!=="string"||!text.trim())||new Set(optionTexts).size!==4)throw new Error(`Teks opsi ${item.id} harus unik dan terisi.`);
  if(!optionIds.includes(item.correctOptionId))throw new Error(`Kunci ${item.id} tidak menunjuk salah satu opsi.`);
  if(!["draft","verified","inactive"].includes(item.editorialStatus))throw new Error(`Status editorial ${item.id} tidak valid.`);
  ids.add(item.id);
  prompts.add(item.prompt);
  return item;
}

const privateBank=[
  ...original.map((item,index)=>validateQuestion(item,index,"awal")),
  ...additional.map((item,index)=>validateQuestion(item,index,"tambahan")),
];
if(new Set(privateBank.map(question=>question.id)).size!==200)throw new Error("Bank gabungan harus memiliki 200 ID unik.");
if(new Set(privateBank.map(question=>question.prompt)).size!==200)throw new Error("Bank gabungan harus memiliki 200 pertanyaan unik.");

fs.mkdirSync(path.dirname(privateTarget),{recursive:true});
fs.writeFileSync(privateTarget,`${JSON.stringify(privateBank,null,2)}\n`);

console.log(JSON.stringify({questions:privateBank.length,original:original.length,additional:additional.length,target:path.relative(root,privateTarget)}));
