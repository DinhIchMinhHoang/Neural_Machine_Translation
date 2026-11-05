/* pure attention statistics; a[t][s] = weight of source s at target step t */
export const entropy=r=>-r.reduce((h,p)=>p>0?h+p*Math.log(p):h,0); // nats
const sum=v=>v.reduce((a,b)=>a+b,0);

export function attnStats(a){
  const T=a.length,S=T?a[0].length:0;
  const rows=a.map(r=>{const mx=Math.max(...r),h=entropy(r);return {max:mx,arg:r.indexOf(mx),h,hn:S>1?h/Math.log(S):0};});
  const cov=S?a[0].map((_,s)=>sum(a.map(r=>r[s]))):[];
  const cm=S?sum(cov)/S:0;
  return {T,S,rows,cov,
    meanMax:T?sum(rows.map(r=>r.max))/T:0,meanH:T?sum(rows.map(r=>r.h))/T:0,
    covMin:S?Math.min(...cov):0,covMean:cm,covMax:S?Math.max(...cov):0,
    under:cov.filter(c=>c<.5*cm).length};
}

/* GNMT (Wu et al. 2016): lp=((5+|Y|)/6)^alpha, cp=beta*sum_s ln(min(sum_t a,1)), s=logP/lp+cp */
export function gnmtScore(logP,a,len,alpha,beta){
  const lp=Math.pow((5+len)/6,alpha);
  const cp=beta*sum((a.length?a[0]:[]).map((_,s)=>Math.log(Math.min(sum(a.map(r=>r[s])),1))));
  return {lp,cp,score:logP/lp+cp};
}

/* console self-check: import("/src/lib/stats.js").then(m=>m.selfCheck()) */
export function selfCheck(){
  const near=(x,y)=>Math.abs(x-y)<1e-9;
  console.assert(near(entropy([.5,.5]),Math.log(2)),"entropy uniform");
  console.assert(near(entropy([1,0]),0),"entropy onehot");
  const a=[[.5,.5],[.5,.5]],s=attnStats(a);
  console.assert(s.under===0&&near(s.covMean,1)&&near(s.rows[0].hn,1),"attnStats");
  const g=gnmtScore(-1,a,1,0,1); // lp=1, cp=ln(1)+ln(1)=0
  console.assert(near(g.lp,1)&&near(g.cp,0)&&near(g.score,-1),"gnmt");
  return true;
}
