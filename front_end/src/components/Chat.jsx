import { Icon } from "./Icon.jsx";
import { useI18n } from "../lib/i18n.jsx";

const EXAMPLES={
  en:["good morning","where is the train station","how much is this","nice to meet you"],
  vi:["Cảm ơn bạn rất nhiều","Tôi yêu học máy","Hẹn gặp lại ngày mai","Tôi không hiểu"]
};

export function Chat({exs,cur,setSel,copied,copy,end,dir,onExample,onRetry,busy}){
  const {t}=useI18n();
  return <div className="chat">
    {!exs.length&&<div className="start">
      <div className="empty">{t("chat.start")}</div>
      <div className="chips">{EXAMPLES[dir].map(p=><button key={p} className="chip" disabled={busy} onClick={()=>onExample(p)}>{p}</button>)}</div>
    </div>}
    {exs.map(m=><div key={m.id} className={"ex"+(cur&&cur.id===m.id?" sel":"")} onMouseEnter={()=>setSel(m.id)}>
      <div className="bubble user">{m.src}</div>
      {m.phase==="error"?<div className="bubble ai err" role="alert">
        <div>{t("chat.error")}</div>
        <button className="retry" disabled={busy} onClick={()=>onRetry(m)}><Icon n="retry"/>{t("chat.retry")}</button>
      </div>:<div className="bubble ai">
        {m.phase==="typing"?<div className="dots" role="status" aria-label={t("chat.translating")}><i/><i/><i/></div>:<>
          <div aria-live="polite" aria-busy={m.phase==="stream"}>{m.phase==="done"?m.tgt:m.tgt.split(" ").slice(0,m.shown).join(" ")}{m.phase==="stream"&&<span className="cursor"/>}</div>
          {m.phase==="done"&&<div className="meta">
            <span>{m.model}</span><span>{m.ms} ms</span><span>log P {m.logP.toFixed(2)}</span>
            <button className="iconbtn copy" aria-label={t("chat.copy")} onClick={()=>copy(m)}><Icon n={copied===m.id?"check":"copy"}/></button>
          </div>}
        </>}
      </div>}
    </div>)}
    <div ref={end}/>
  </div>;
}
