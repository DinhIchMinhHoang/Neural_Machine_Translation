export const matrixJson=ex=>JSON.stringify({src:ex.srcTokens,tgt:ex.tgtTokens,attention:ex.attention},null,1);

/* draws the heatmap from the numbers with the same tint as the DOM cells; colours come from live CSS vars */
export function downloadHeatmapPng(ex,name="attention"){
  const S=ex.srcTokens,T=ex.tgtTokens,M=ex.attention,cs=getComputedStyle(document.documentElement);
  const v=k=>cs.getPropertyValue(k).trim(),cw=48,ch=32,gap=3,pl=90,pt=60,pad=12;
  const W=pl+S.length*(cw+gap)+pad,H=pt+T.length*(ch+gap)+pad,k=2;
  const c=document.createElement("canvas");c.width=W*k;c.height=H*k;
  const g=c.getContext("2d");g.scale(k,k);
  g.fillStyle=v("--ink-1");g.fillRect(0,0,W,H);
  g.font="11px system-ui,sans-serif";g.fillStyle=v("--fog-1");g.textBaseline="middle";
  S.forEach((s,j)=>{g.save();g.translate(pl+j*(cw+gap)+cw/2,pt-6);g.rotate(-Math.PI/4);g.textAlign="left";g.fillText(s,0,0);g.restore();});
  M.forEach((r,i)=>{
    const m=Math.max(...r);g.textAlign="right";g.fillStyle=v("--fog-1");g.fillText(T[i],pl-8,pt+i*(ch+gap)+ch/2);
    r.forEach((w,j)=>{g.fillStyle=`color-mix(in srgb,${v("--blue")} ${Math.round(w/m*88)}%,${v("--ink-2")})`;g.beginPath();g.roundRect(pl+j*(cw+gap),pt+i*(ch+gap),cw,ch,5);g.fill();});
  });
  c.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name+".png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
}
