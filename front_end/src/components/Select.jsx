import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const OPT_H=32,PAD=4,MAXH=240; // must match select.css

/* custom listbox dropdown; popover is portaled + position:fixed so overflow:auto sidebars never clip it */
export function Select({value,options,onChange,label,id}){
  const [open,setOpen]=useState(false),[closing,setClosing]=useState(false),[act,setAct]=useState(0),[pos,setPos]=useState(null);
  const btn=useRef(null),pop=useRef(null),buf=useRef({s:"",t:0});
  const sel=Math.max(0,options.findIndex(o=>o.value===value)),cur=options[sel];
  const uid=(id||"sel")+"-lb";

  const show=()=>{
    const r=btn.current.getBoundingClientRect(),h=Math.min(options.length*OPT_H+PAD*2,MAXH);
    const up=innerHeight-r.bottom<h+12&&r.top>innerHeight-r.bottom;
    setPos({left:r.left,width:r.width,...(up?{bottom:innerHeight-r.top+6,up:true}:{top:r.bottom+6})});
    setAct(sel);setClosing(false);setOpen(true);
  };
  const hide=(focus=true)=>{
    if(!open)return;
    const instant=document.body.classList.contains("reduce")||matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(instant){setOpen(false);}else{setClosing(true);setTimeout(()=>{setOpen(false);setClosing(false);},140);}
    if(focus&&btn.current)btn.current.focus();
  };
  const pick=i=>{onChange(options[i].value);hide();};

  useEffect(()=>{
    if(!open)return;
    const away=e=>{if(!pop.current?.contains(e.target)&&!btn.current?.contains(e.target))hide(false);};
    const sc=e=>{if(!pop.current?.contains(e.target))hide(false);}; // a scrolled parent would leave the fixed popover stranded
    document.addEventListener("pointerdown",away);window.addEventListener("scroll",sc,true);window.addEventListener("resize",sc);
    return()=>{document.removeEventListener("pointerdown",away);window.removeEventListener("scroll",sc,true);window.removeEventListener("resize",sc);};
  });
  useEffect(()=>{ // keep active option in view
    if(open&&pop.current)pop.current.children[act]?.scrollIntoView({block:"nearest"});
  },[act,open]);

  const key=e=>{
    const n=options.length;
    if(!open){
      if(["Enter"," ","ArrowDown","ArrowUp"].includes(e.key)){e.preventDefault();show();}
      return;
    }
    if(e.key==="Escape"){e.preventDefault();e.stopPropagation();hide();}
    else if(e.key==="ArrowDown"){e.preventDefault();setAct(a=>(a+1)%n);}
    else if(e.key==="ArrowUp"){e.preventDefault();setAct(a=>(a-1+n)%n);}
    else if(e.key==="Home"){e.preventDefault();setAct(0);}
    else if(e.key==="End"){e.preventDefault();setAct(n-1);}
    else if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(act);}
    else if(e.key==="Tab"){hide(false);}
    else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){ // type-ahead, 700ms buffer
      const b=buf.current,now=Date.now();b.s=(now-b.t>700?"":b.s)+e.key.toLowerCase();b.t=now;
      const i=options.findIndex(o=>String(o.label).toLowerCase().startsWith(b.s));if(i>=0)setAct(i);
    }
  };

  return <>
    <button type="button" id={id} className="sel-btn" aria-haspopup="listbox" aria-expanded={open&&!closing} aria-controls={open?uid:undefined} aria-label={label} onClick={()=>open?hide():show()} onKeyDown={key} ref={btn}>
      <span>{cur?cur.label:""}</span>
      <svg className="i sel-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    {open&&pos&&createPortal(
      <div className={"sel-pop glass"+(pos.up?" up":"")+(closing?" out":"")} id={uid} role="listbox" aria-label={label} aria-activedescendant={uid+"-"+act} ref={pop}
        style={{left:pos.left,width:pos.width,top:pos.top,bottom:pos.bottom,"--r":"14px"}}>
        {options.map((o,i)=><div key={o.value} id={uid+"-"+i} role="option" aria-selected={i===sel} className={"sel-opt"+(i===act?" act":"")+(i===sel?" on":"")}
          onPointerEnter={()=>setAct(i)} onClick={()=>pick(i)}>
          <span>{o.label}</span>
          {i===sel&&<svg className="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>}
        </div>)}
      </div>,document.body)}
  </>;
}
