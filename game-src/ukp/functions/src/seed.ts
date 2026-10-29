import {initializeApp} from "firebase-admin/app";
import {getFirestore,Timestamp} from "firebase-admin/firestore";
import bank from "../data/questions.private.json";
import type {PrivateQuestion} from "./model";

const projectId=process.env.GCLOUD_PROJECT||process.env.GOOGLE_CLOUD_PROJECT||"demo-puncak-kemenangan";
initializeApp({projectId});
const db=getFirestore();
const questions=bank as PrivateQuestion[];
async function main(){
  let batch=db.batch(),count=0;
  for(const question of questions){
    batch.set(db.collection("questionBank").doc(question.id),{...question,seededAt:Timestamp.now()},{merge:true});count++;
    if(count%400===0){await batch.commit();batch=db.batch();}
  }
  if(count%400!==0)await batch.commit();
  console.log(JSON.stringify({projectId,questions:count,emulator:process.env.FIRESTORE_EMULATOR_HOST??null,status:"seeded"}));
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
