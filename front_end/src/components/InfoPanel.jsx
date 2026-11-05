import { useState } from "react";
import { useI18n } from "../lib/i18n.jsx";
import info from "../i18n/info.js";

/* accordion, one topic open at a time; height animates via grid-template-rows (see inspector.css) */
export function InfoPanel(){
  const {t,lang}=useI18n(),topics=(info[lang]||info.vi).topics;
  const [open,setOpen]=useState(null);
  return <section className="info" aria-label={t("info.title")}>
    <h3>{t("info.title")}</h3>
    {topics.map(p=>{
      const on=open===p.id;
      return <div key={p.id} className={"acc"+(on?" open":"")}>
        <button id={"acc-b-"+p.id} aria-expanded={on} aria-controls={"acc-p-"+p.id} onClick={()=>setOpen(on?null:p.id)}>
          <span>{p.title}</span><i aria-hidden="true"/>
        </button>
        <div className="accbody" id={"acc-p-"+p.id} role="region" aria-labelledby={"acc-b-"+p.id} inert={!on}>
          <div className="accin">
            <ul>{p.pts.map((x,i)=><li key={i}>{x}</li>)}</ul>
            {p.f&&<pre className="formula">{p.f}</pre>}
          </div>
        </div>
      </div>;
    })}
  </section>;
}
