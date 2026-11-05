import { Icon } from "./Icon.jsx";
import { useI18n } from "../lib/i18n.jsx";

const day=ts=>new Date(ts).setHours(0,0,0,0);
const groupOf=(h,sod)=>h.pinned?"pinned":day(h.ts)>=sod?"today":day(h.ts)>=sod-864e5?"yesterday":"earlier";

export function History({q,setQ,onNew,onLoad,hist}){
  const {t,lang}=useI18n();
  const loc=lang==="vi"?"vi-VN":"en-US";
  const sod=day(Date.now());
  const list=hist.items.filter(h=>h.src.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.ts-a.ts);
  const when=h=>new Date(h.ts).toLocaleString(loc,groupOf(h,sod)==="earlier"||h.pinned&&day(h.ts)<sod?{day:"numeric",month:"short"}:{hour:"2-digit",minute:"2-digit"});
  return <>
    <button className="btn" onClick={onNew}><Icon n="plus"/>{t("hist.new")}</button>
    <input className="field" aria-label={t("hist.search")} placeholder={t("hist.search")} value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="hist">
      {["pinned","today","yesterday","earlier"].map(g=>{
        const rows=list.filter(h=>groupOf(h,sod)===g);
        return rows.length>0&&<div key={g} role="group" aria-label={t("hist."+g)}>
          <div className="hgroup">{t("hist."+g)}</div>
          {rows.map(h=><div key={h.id} className={"hitem"+(h.pinned?" pin":"")}>
            <button className="hmain" onClick={()=>onLoad(h)}>
              <span className="t">{h.src}</span>
              <span className="m"><span className="badge">{t("dir."+h.dir)}</span><span>{when(h)}</span></span>
            </button>
            <div className="acts">
              <button className="iconbtn pinb" aria-pressed={h.pinned} aria-label={t(h.pinned?"hist.unpin":"hist.pin")} onClick={()=>hist.pin(h.id)}><Icon n="pin"/></button>
              <button className="iconbtn" aria-label={t("hist.delete")} onClick={()=>hist.remove(h.id)}><Icon n="trash"/></button>
            </div>
          </div>)}
        </div>;
      })}
      {!list.length&&<div className="empty">{t(hist.items.length?"hist.none":"hist.empty")}</div>}
    </div>
  </>;
}
