export const hash=(a,b,c)=>{const x=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return x-Math.floor(x);};

/* ---------- pseudo attention ---------- */
export function softmax(r){const m=Math.max(...r),e=r.map(v=>Math.exp(v-m)),s=e.reduce((a,b)=>a+b,0);return e.map(v=>v/s);}
// GNMT-style single additive attention: softmax over encoder states per decoder step, soft monotonic alignment
export function attnMat(T,S){
  return Array.from({length:T},(_,i)=>softmax(Array.from({length:S},(_,j)=>{
    const d=j/Math.max(S-1,1)-i/Math.max(T-1,1);
    return -d*d*14+(hash(i,j,7)-.5)*3.2;
  })));
}
