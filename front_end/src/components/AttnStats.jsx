import { useI18n } from "../lib/i18n.jsx";
import { attnStats, gnmtScore } from "../lib/stats.js";

const f=n=>n.toFixed(3);

/* numeric panel under the heatmap: per-step table, global stats, GNMT score terms */
export function AttnStats({ex,settings}){
  const {t}=useI18n();
  const st=attnStats(ex.attention),g=gnmtScore(ex.logP,ex.attention,ex.tgtTokens.length,settings.lenNorm,settings.cov);
  const R=({k,v})=><div className="kv"><span>{t(k)}</span><b>{v}</b></div>;
  return <section className="stats" aria-label={t("st.title")}>
    <h3>{t("st.title")}</h3>
    <div className="list glass-list">
      <R k="st.dims" v={`${st.T} × ${st.S}`}/>
      <R k="st.counts" v={`${ex.srcTokens.length} → ${ex.tgtTokens.length}`}/>
      <R k="st.model" v={ex.model||settings.model}/>
      <R k="st.beam" v={settings.beam}/>
      <R k="st.ms" v={f(ex.ms)+" ms"}/>
    </div>
    <div className="tblwrap" tabIndex={0} role="region" aria-label={t("st.steps")}>
      <table>
        <thead><tr><th>#</th><th>{t("st.tgt")}</th><th>{t("st.arg")}</th><th>{t("st.max")}</th><th>H</th><th>H/ln S</th></tr></thead>
        <tbody>{st.rows.map((r,i)=><tr key={i}><td>{i+1}</td><td>{ex.tgtTokens[i]}</td><td>{ex.srcTokens[r.arg]}</td><td>{f(r.max)}</td><td>{f(r.h)}</td><td>{f(r.hn)}</td></tr>)}</tbody>
      </table>
    </div>
    <div className="list glass-list">
      <R k="st.meanMax" v={f(st.meanMax)}/>
      <R k="st.meanH" v={f(st.meanH)}/>
      <R k="st.covMin" v={f(st.covMin)}/>
      <R k="st.covMean" v={f(st.covMean)}/>
      <R k="st.covMax" v={f(st.covMax)}/>
      <R k="st.under" v={st.under}/>
    </div>
    <div className="list glass-list">
      <R k="st.logP" v={f(ex.logP)}/>
      <R k="st.alpha" v={f(settings.lenNorm)}/>
      <R k="st.beta" v={f(settings.cov)}/>
      <R k="st.lp" v={f(g.lp)}/>
      <R k="st.cp" v={f(g.cp)}/>
      <R k="st.score" v={f(g.score)}/>
      <R k="st.bleu" v={t("st.na")}/>
    </div>
  </section>;
}
