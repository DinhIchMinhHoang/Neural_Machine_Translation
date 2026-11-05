import { useState, useEffect, useRef } from "react";
import { translateText } from "./lib/api.js";
import { toks, wait } from "./lib/tokens.js";
import { useI18n } from "./lib/i18n.jsx";
import { useTheme } from "./lib/useTheme.js";
import { useHistory } from "./lib/useHistory.js";
import { Notch } from "./components/Notch.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Chat } from "./components/Chat.jsx";
import { Composer, MAX } from "./components/Composer.jsx";
import { Inspector } from "./components/Inspector.jsx";
import { Icon } from "./components/Icon.jsx";

let uid=100;
const DEF_MODEL="GNMT 8-layer LSTM";
// message = request fields + translateText() result (tgt, srcTokens, tgtTokens, attention, logP, ms)
const mkEx=async(src,dir,model=DEF_MODEL,beam=4,lenNorm=0.2,cov=0.2)=>{
  const r=await translateText(src,dir,{model,beam,lenNorm,cov});
  return {id:"e"+(uid++),src,dir,model,phase:"done",shown:99,...r};
};

export default function App(){
  const {t}=useI18n();
  const [theme,setTheme]=useTheme();
  const hist=useHistory();
  const w=window.innerWidth;
  const [dir,setDir]=useState("en"),[tab,setTab]=useState("history"),[q,setQ]=useState("");
  const [left,setLeft]=useState(w>=800),[right,setRight]=useState(w>=1100);
  const [exs,setExs]=useState(null); // null until seeded: render nothing to avoid empty-state flash
  const [sel,setSel]=useState(null),[text,setText]=useState(""),[copied,setCopied]=useState(null),[busy,setBusy]=useState(false);
  const [online,setOnline]=useState(navigator.onLine);
  const [st,setSt]=useState({model:DEF_MODEL,beam:4,lenNorm:0.2,cov:0.2,attn:true,blur:24,reduce:false});
  const up=(k,v)=>setSt(s=>({...s,[k]:v}));
  const end=useRef(null),runTok=useRef(0); // bumped whenever exs is replaced so in-flight runs bail out

  useEffect(()=>{let live=true;Promise.all([mkEx("hello world","en"),mkEx("Cảm ơn bạn rất nhiều","vi")]).then(s=>{if(live)setExs(s);}).catch(()=>{if(live)setExs([]);});return()=>{live=false;};},[]);
  useEffect(()=>{document.documentElement.style.setProperty("--blur",st.blur+"px");},[st.blur]);
  useEffect(()=>{document.body.classList.toggle("reduce",st.reduce);},[st.reduce]);
  useEffect(()=>{end.current&&end.current.scrollIntoView({behavior:st.reduce?"auto":"smooth",block:"end"});},[exs]);
  useEffect(()=>{ // pointer-following sheen on every glass panel
    const mv=e=>document.querySelectorAll(".glass").forEach(el=>{const r=el.getBoundingClientRect();el.style.setProperty("--mx",(e.clientX-r.left)+"px");el.style.setProperty("--my",(e.clientY-r.top)+"px");});
    window.addEventListener("mousemove",mv);return()=>window.removeEventListener("mousemove",mv);
  },[]);
  useEffect(()=>{ // collapse/expand sidebars only when a breakpoint is crossed
    let pw=window.innerWidth;
    const rs=()=>{const nw=window.innerWidth;
      if((pw>=1100)!==(nw>=1100))setRight(nw>=1100);
      if((pw>=800)!==(nw>=800))setLeft(nw>=800);
      pw=nw;};
    window.addEventListener("resize",rs);return()=>window.removeEventListener("resize",rs);
  },[]);
  useEffect(()=>{
    const on=()=>setOnline(true),off=()=>setOnline(false);
    window.addEventListener("online",on);window.addEventListener("offline",off);
    return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);};
  },[]);
  useEffect(()=>{ // Ctrl/Cmd+Shift+L swaps translation direction
    const k=e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==="l"){e.preventDefault();setDir(d=>d==="en"?"vi":"en");}};
    window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k);
  },[]);

  if(!exs)return null;

  const run=async(id,src,d,model=st.model)=>{
    const tok=++runTok.current;
    setBusy(true);
    setExs(x=>x.map(m=>m.id===id?{...m,phase:"typing",shown:0}:m));
    try{
      const [r]=await Promise.all([translateText(src,d,{model,beam:st.beam,lenNorm:st.lenNorm,cov:st.cov}),wait(st.reduce?150:700)]);
      if(tok!==runTok.current)return;
      const words=r.tgt.split(" ");
      setExs(x=>x.map(m=>m.id===id?{...m,...r,phase:"stream"}:m));
      for(let i=1;i<=words.length;i++){await wait(st.reduce?8:40);if(tok!==runTok.current)return;setExs(x=>x.map(m=>m.id===id?{...m,shown:i}:m));}
      setExs(x=>x.map(m=>m.id===id?{...m,phase:"done"}:m));
      hist.add(src,d);
    }catch{
      if(tok===runTok.current)setExs(x=>x.map(m=>m.id===id?{...m,phase:"error"}:m));
    }finally{setBusy(false);} // stale runs also reset busy: whoever replaced exs left no other run to own it
  };
  const send=async override=>{
    const src=(typeof override==="string"?override:text).trim();if(!src||busy||src.length>MAX)return;
    const id="e"+(uid++);
    setText("");setExs(x=>[...x,{id,src,dir,model:st.model,phase:"typing",shown:0}]);setSel(null);
    await run(id,src,dir);
  };
  const retry=m=>{if(!busy)run(m.id,m.src,m.dir,m.model);};
  const reset=()=>{runTok.current++;setExs([]);setSel(null);};
  const load=async h=>{
    runTok.current++;
    setDir(h.dir);
    try{setExs([await mkEx(h.src,h.dir,st.model,st.beam,st.lenNorm,st.cov)]);}catch{setExs([{id:"e"+(uid++),src:h.src,dir:h.dir,model:st.model,phase:"error",shown:0}]);}
    setSel(null);if(window.innerWidth<800)setLeft(false);
  };
  const copy=m=>{navigator.clipboard&&navigator.clipboard.writeText(m.tgt).then(()=>{setCopied(m.id);setTimeout(()=>setCopied(null),1200);}).catch(()=>{});};
  const cur=exs.find(e=>e.id===sel)||exs[exs.length-1];

  return <>
    {!online&&<div className="banner" role="status">{t("net.offline")}</div>}
    <Notch dir={dir} setDir={setDir} status={!online?"error":busy?"translating":"ready"}/>
    <button className="iconbtn tbtn l" aria-label={t("side.toggle")} aria-expanded={left} onClick={()=>setLeft(v=>!v)}><Icon n="panel"/></button>
    <button className="iconbtn tbtn r" aria-label={t("insp.toggle")} aria-expanded={right} onClick={()=>setRight(v=>!v)}><Icon n="panelR"/></button>
    {left&&<div className="scrim l" onClick={()=>setLeft(false)}/>}
    {right&&st.attn&&<div className="scrim r" onClick={()=>setRight(false)}/>}

    <div className="app">
      <Sidebar left={left} tab={tab} setTab={setTab} q={q} setQ={setQ} onNew={reset} onLoad={load} st={st} up={up} setRight={setRight} hist={hist} theme={theme} setTheme={setTheme}/>

      <main className="mid">
        <Chat exs={exs} cur={cur} setSel={setSel} copied={copied} copy={copy} end={end} dir={dir} onExample={send} onRetry={retry} busy={busy}/>
        <Composer dir={dir} text={text} setText={setText} busy={busy} send={send}/>
      </main>

      <aside className={"side right glass"+(right&&st.attn?"":" closed")} aria-hidden={!(right&&st.attn)} inert={!(right&&st.attn)}><div className="in">
        <div><h2>{t("insp.title")}</h2><div className="sub" style={{marginTop:4}}>{cur?`${t("dir."+cur.dir)} · ${cur.model}`:t("insp.hover")}</div></div>
        <Inspector ex={cur&&cur.phase==="done"?cur:null} settings={st}/>
      </div></aside>
    </div>
    {hist.undo&&<div className="toast glass" role="status"><span>{t("hist.deleted")}</span><button onClick={hist.restore}>{t("hist.undo")}</button></div>}
  </>;
}
