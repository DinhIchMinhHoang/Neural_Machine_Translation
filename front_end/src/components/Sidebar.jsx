import { History } from "./History.jsx";
import { Settings } from "./Settings.jsx";
import { useI18n } from "../lib/i18n.jsx";

export function Sidebar({left,tab,setTab,q,setQ,onNew,onLoad,st,up,setRight,hist,theme,setTheme}){
  const {t}=useI18n();
  return <aside className={"side left glass"+(left?"":" closed")} aria-hidden={!left} inert={!left}><div className="in">
    <div className="brand">Translatetor</div>
    <div className="seg" role="tablist">
      <button role="tab" aria-selected={tab==="history"} className={tab==="history"?"on":""} onClick={()=>setTab("history")}>{t("tab.history")}</button>
      <button role="tab" aria-selected={tab==="settings"} className={tab==="settings"?"on":""} onClick={()=>setTab("settings")}>{t("tab.settings")}</button>
    </div>
    {tab==="history"?<History q={q} setQ={setQ} onNew={onNew} onLoad={onLoad} hist={hist}/>:<Settings st={st} up={up} setRight={setRight} theme={theme} setTheme={setTheme}/>}
  </div></aside>;
}
