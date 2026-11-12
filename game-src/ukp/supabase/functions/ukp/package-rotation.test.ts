import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectQuestionOrder,type Question} from './logic.ts';
for(const [level,size] of [['A',300],['B',300],['C',413]] as const){
 test(`${level}: fixed packages, unique questions, rotation and independent shuffle`,()=>{
  const bank=new Map(Array.from({length:size},(_,i)=>[String(i+1),{id:String(i+1),sequence:i+1} as Question]));
  const packageOf=(id:string)=>Math.min(Math.floor((Number(id)-1)/100),Math.floor(size/100)-1);
  const history:string[][]=[];
  const seen=new Set<number>();
  for(let i=0;i<Math.floor(size/100);i++){
   const order=selectQuestionOrder(bank,history.flat(),level);
   assert.equal(order.length,100);assert.equal(new Set(order).size,100);
   const packages=new Set(order.map(packageOf));assert.equal(packages.size,1);
   const selected=[...packages][0];assert.ok(!seen.has(selected));seen.add(selected);history.push(order);
  }
  const first=selectQuestionOrder(bank,[],level);
  const runs=Array.from({length:30},()=>selectQuestionOrder(bank,[],level));
  assert.ok(runs.some(order=>packageOf(order[0])!==packageOf(first[0])));
  assert.ok(runs.every(order=>order.join(',')!==first.join(',')));
  const mixed=Array.from({length:100},(_,i)=>String(i*2+1));
  assert.equal(new Set(selectQuestionOrder(bank,mixed,level).map(packageOf)).size,1);
 });
}
