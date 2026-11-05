import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Icon } from "./Icon.jsx";
import { useI18n } from "../lib/i18n.jsx";
import dict from "../i18n/notch.js";

/* status: 'ready' | 'translating' | 'error'; non-ready states keep the status pill open, ready returns to hover-reveal */
export function Notch({dir,setDir,status="ready"}){
  const {lang}=useI18n(),d=dict[lang]||dict.vi;
  const root=useRef(null),first=useRef(true);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const reduce=document.body.classList.contains("reduce")||matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur=first.current||reduce?0:.5;first.current=false;
    const ctx=gsap.context(()=>{
      const st=el.querySelector(".status"),dot=el.querySelector(".status b"),txt=el.querySelector(".status span");
      const on=status!=="ready";
      gsap.to(el,{paddingLeft:on?14:8,paddingRight:on?14:8,columnGap:on?14:10,duration:dur,ease:"back.out(1.4)",clearProps:on?"":"paddingLeft,paddingRight,columnGap"});
      gsap.to(st,{maxWidth:on?150:0,opacity:on?1:0,duration:dur,ease:"power3.out",clearProps:on?"":"maxWidth,opacity"});
      gsap.to(dot,{backgroundColor:status==="error"?"var(--accent)":status==="translating"?"var(--blue)":"var(--fog-2)",duration:dur});
      if(status==="translating"&&!reduce)gsap.fromTo(dot,{scale:.7},{scale:1.25,duration:.7,repeat:-1,yoyo:true,ease:"sine.inOut"});
      else gsap.to(dot,{scale:1,duration:dur});
      gsap.fromTo(txt,{y:4},{opacity:1,y:0,duration:dur});
    },el);
    return()=>ctx.kill(); // kill, not revert: revert snaps styles back and flickers; next effect tweens from current state
  },[status]);
  return <div className="notch glass" ref={root} style={{"--r":"99px"}}>
    <div className={"lang "+dir} role="group" aria-label={d.dirLabel}>
      <div className="thumb"/>
      <button className={dir==="en"?"on":""} onClick={()=>setDir("en")}>EN</button>
      <button className={dir==="vi"?"on":""} onClick={()=>setDir("vi")}>VI</button>
    </div>
    <button className="iconbtn" aria-label={d.swap} onClick={()=>setDir(d=>d==="en"?"vi":"en")}><Icon n="swap"/></button>
    <div className="status" role="status"><b/><span>{d[status]||d.ready}</span></div>
  </div>;
}
