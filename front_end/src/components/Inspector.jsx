import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useI18n } from "../lib/i18n.jsx";
import dict from "../i18n/inspector.js";
import { AttnStats } from "./AttnStats.jsx";
import { InfoPanel } from "./InfoPanel.jsx";
import { matrixJson, downloadHeatmapPng } from "../lib/export.js";

const fill=(s,o)=>s?s.replace(/\{(\w+)\}/g,(_,k)=>o[k]):"";

/* reads tokens + attention [T][S] from the message object (produced by lib/api.js) */
export function Inspector({ex,settings}){
  const {lang}=useI18n(),d=dict[lang]||dict.vi;
  const [hov,setHov]=useState(null),[lock,setLock]=useState(null),[tip,setTip]=useState(null),[copied,setCopied]=useState(false);
  const [nums,setNums]=useState(()=>localStorage.getItem("lumen.nums")!=="0"); // numeric labels inside heatmap cells
  const toggleNums=()=>setNums(v=>{localStorage.setItem("lumen.nums",v?"0":"1");return !v;});
  const card=useRef(null),grid=useRef(null);
  const S=ex?ex.srcTokens:[],Tt=ex?ex.tgtTokens:[];
  const M=ex?ex.attention:[];
  const coarse=()=>matchMedia("(pointer: coarse)").matches;
  const tilt=e=>{
    if(settings.reduce||coarse()||e.pointerType==="touch"||!card.current)return;
    const r=card.current.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    card.current.style.transform=`rotateX(${(-py*16).toFixed(2)}deg) rotateY(${(px*16).toFixed(2)}deg)`;
  };
  const untilt=()=>{if(card.current)card.current.style.transform="";setHov(null);setTip(null);};

  useEffect(()=>{setLock(null);setHov(null);setTip(null);},[ex]);
  useEffect(()=>{ // Esc unlocks
    if(!lock)return;
    const k=e=>{if(e.key==="Escape")setLock(null);};
    window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);
  },[lock]);
  useEffect(()=>{ // heatmap reveal: cells fade/scale in row by row
    if(!M.length||settings.reduce||matchMedia("(prefers-reduced-motion: reduce)").matches||!grid.current)return;
    const ctx=gsap.context(()=>{
      gsap.from(".cell",{opacity:0,scale:.6,duration:.4,ease:"power2.out",stagger:{each:.03,grid:[M.length,M[0].length],axis:"y",from:"start"},clearProps:"opacity,transform"});
    },grid);
    return()=>ctx.revert();
  },[M,settings.reduce]);

  if(!ex||!M.length)return <div className="empty">{d.empty}</div>;
  const act=lock||hov;
  const rowMax=M.map(r=>Math.max(...r)),colMax=S.map((_,j)=>Math.max(...M.map(r=>r[j])));
  const argmax=r=>r.indexOf(Math.max(...r));
  const T=Tt.length,Sn=S.length,cols={gridTemplateColumns:`repeat(${Sn},1fr)`};
  const lines=[];
  if(act&&act.type==="t")M[act.i].forEach((w,j)=>lines.push([j,act.i,w/rowMax[act.i],j===argmax(M[act.i])]));
  if(act&&act.type==="s")M.forEach((r,i)=>lines.push([act.j,i,r[act.j]/colMax[act.j],i===M.findIndex(x=>x[act.j]===colMax[act.j])]));
  if(act&&act.type==="c")M[act.i].forEach((w,j)=>lines.push([j,act.i,w/rowMax[act.i],j===argmax(M[act.i])]));
  const rowOn=i=>act&&(act.type==="t"||act.type==="c")&&act.i===i, colOn=j=>act&&(act.type==="s"||act.type==="c")&&act.j===j;
  const x=(k,n)=>((k+.5)/n*100).toFixed(2);
  // GNMT coverage: total attention each source token receives over all target steps
  const cov=S.map((_,j)=>M.reduce((a,r)=>a+r[j],0)),cMax=Math.max(...cov),cMin=Math.min(...cov),cMean=cov.reduce((a,b)=>a+b,0)/Sn;
  const low=S.filter((_,j)=>cov[j]<.5*cMean);
  // top alignment pair for the grid's aria-label
  let bi=0,bj=0;M.forEach((r,i)=>r.forEach((w,j)=>{if(w>M[bi][bj]){bi=i;bj=j;}}));
  // pointer: mouse previews while unlocked; touch/tap and keyboard toggle the lock
  const pv=v=>e=>{if(!lock&&e.pointerType==="mouse")setHov(v);};
  const tog=v=>setLock(l=>l&&l.type===v.type&&l.i===v.i&&l.j===v.j?null:v);
  const tk=v=>({tabIndex:0,role:"button","aria-pressed":!!(lock&&lock.type===v.type&&lock.i===v.i&&lock.j===v.j),onClick:()=>tog(v),onKeyDown:e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tog(v);}},onPointerEnter:pv(v),onPointerLeave:e=>{if(!lock&&e.pointerType==="mouse")setHov(null);}});
  const copyJson=()=>{navigator.clipboard&&navigator.clipboard.writeText(matrixJson(ex)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1200);}).catch(()=>{});};
  return <>
    <div className="heads" aria-label={d.chipType}>
      <span className="badge">{d.chip1}</span><span className="badge">{d.chip2}</span><span className="badge">{d.chip3}</span>
    </div>
    <div className="persp"><div className="card" ref={card} onPointerMove={tilt} onPointerLeave={untilt}>
      <div className="trow" aria-label={d.src}>{S.map((s,j)=><div key={j} className={"tok"+(colOn(j)?" hi":"")} {...tk({type:"s",j})}>{s}</div>)}</div>
      <div className="covbar" style={cols} aria-label={d.cov}>
        {cov.map((c,j)=><i key={j} className={cov[j]<.5*cMean?"low":""} title={`${S[j]}: ${c.toFixed(2)}`}><u style={{height:Math.max(8,c/cMax*100)+"%"}}/></i>)}
      </div>
      <div className="covlab"><span>{fill(d.covLabel,{max:cMax.toFixed(2),min:cMin.toFixed(2)})}</span>{low.length>0&&<em>{fill(d.low,{w:low.join(", ")})}</em>}</div>
      <svg className="lines" viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true">
        {lines.map(([j,i,w,pk])=><line key={j+"-"+i} className={pk?"pk":""} x1={x(j,Sn)} y1="0" x2={x(i,T)} y2="46" style={{opacity:Math.max(.04,w).toFixed(2)}}/>)}
      </svg>
      <div className="trow" aria-label={d.tgt}>{Tt.map((s,i)=><div key={i} className={"tok"+(rowOn(i)?" hi":"")} title={`${d.conf}: ${rowMax[i].toFixed(2)}`} {...tk({type:"t",i})}>{s}<i className="conf" style={{width:Math.round(rowMax[i]*100)+"%"}}/></div>)}</div>
      <div className="grid" ref={grid} style={cols} role="img" aria-label={fill(d.gridLabel,{t:Tt[bi],s:S[bj],w:M[bi][bj].toFixed(2)})} onMouseLeave={()=>{if(!lock)setHov(null);setTip(null);}}>
        {M.map((r,i)=>r.map((w,j)=>{
          const dim=act&&!(rowOn(i)||colOn(j));
          const strong=w/rowMax[i]>.5;
          return <div key={i+"-"+j} className={"cell"+(dim?" dim":"")+(rowOn(i)&&j===argmax(r)?" pk":"")+(nums?(strong?" num hi":" num"):"")}
            style={{background:`color-mix(in srgb,var(--blue) ${Math.round(w/rowMax[i]*88)}%,var(--ink-2))`}}
            onClick={()=>tog({type:"c",i,j})}
            onPointerEnter={e=>{if(e.pointerType!=="mouse")return;if(!lock)setHov({type:"c",i,j});setTip({x:e.clientX,y:e.clientY,t:`${Tt[i]} / ${S[j]}: ${w.toFixed(3)}`});}}
            onPointerMove={e=>{if(e.pointerType==="mouse")setTip({x:e.clientX,y:e.clientY,t:`${Tt[i]} / ${S[j]}: ${w.toFixed(3)}`});}}>{nums&&<span>{w<.005?"0":w.toFixed(2).replace(/^0/,"")}</span>}</div>;
        }))}
      </div>
      {nums&&<div className="colsum" style={cols} aria-label={d.cov}>{cov.map((c,j)=><span key={j} className={c<.5*cMean?"low":""}>{"Σ"+c.toFixed(1)}</span>)}</div>}
      <div className="legend"><span>0</span><i/><span>{d.max}</span></div>
    </div></div>
    <div className="xport">
      <button onClick={toggleNums} aria-pressed={nums}>{d.nums}</button>
      <button onClick={copyJson}>{copied?d.copied:d.copyJson}</button>
      <button onClick={()=>downloadHeatmapPng(ex)}>{d.png}</button>
    </div>
    {lock&&<div className="sub" role="status">{d.lock}</div>}
    <div className="sub">{d.sub}</div>
    <AttnStats ex={ex} settings={settings}/>
    <InfoPanel/>
    {tip&&<div className="tip" style={{left:tip.x,top:tip.y}}>{tip.t}</div>}
  </>;
}
