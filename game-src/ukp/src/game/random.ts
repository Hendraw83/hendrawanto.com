export function secureShuffle<T>(values:readonly T[]):T[]{
  const result=[...values];
  for(let i=result.length-1;i>0;i--){
    const bytes=new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const limit=Math.floor(0x1_0000_0000/(i+1))*(i+1);
    let value=bytes[0];
    while(value>=limit){crypto.getRandomValues(bytes);value=bytes[0];}
    const j=value%(i+1);
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

export function randomId(){
  if(typeof globalThis.crypto?.randomUUID==="function")return globalThis.crypto.randomUUID();
  const bytes=new Uint8Array(16);
  if(globalThis.crypto?.getRandomValues)globalThis.crypto.getRandomValues(bytes);
  else for(let index=0;index<bytes.length;index++)bytes[index]=Math.floor(Math.random()*256);
  bytes[6]=(bytes[6]!&0x0f)|0x40;bytes[8]=(bytes[8]!&0x3f)|0x80;
  const hex=[...bytes].map(value=>value.toString(16).padStart(2,"0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
