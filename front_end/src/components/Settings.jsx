import { Toggle } from "./Toggle.jsx";
import { Select } from "./Select.jsx";
import { useI18n } from "../lib/i18n.jsx";

export function Settings({st,up,setRight,theme,setTheme}){
  const {t,lang,setLang}=useI18n();
  return <div>
    <div className="row"><div className="h"><label htmlFor="mdl">{t("set.model")}</label>
      <Select id="mdl" label={t("set.model")} value={st.model} onChange={v=>up("model",v)} options={["GNMT 8-layer LSTM","GNMT 4-layer LSTM"].map(m=>({value:m,label:m}))}/></div></div>
    <div className="row"><div className="h"><label htmlFor="bm">{t("set.beam")}</label><span className="v">{st.beam}</span></div>
      <input id="bm" type="range" min="1" max="8" step="1" value={st.beam} onChange={e=>up("beam",+e.target.value)}/></div>
    <div className="row"><div className="h"><label htmlFor="ln">{t("set.ln")}</label><span className="v">{st.lenNorm.toFixed(2)}</span></div>
      <input id="ln" type="range" min="0" max="1" step="0.05" value={st.lenNorm} onChange={e=>up("lenNorm",+e.target.value)}/></div>
    <div className="row"><div className="h"><label htmlFor="cv">{t("set.cov")}</label><span className="v">{st.cov.toFixed(2)}</span></div>
      <input id="cv" type="range" min="0" max="1" step="0.05" value={st.cov} onChange={e=>up("cov",+e.target.value)}/></div>
    <div className="row"><div className="h"><span className="lb">{t("set.attn")}</span><Toggle on={st.attn} set={v=>{up("attn",v);if(v)setRight(true);}} label={t("set.attn")}/></div></div>
    <div className="row"><div className="h"><label htmlFor="bl">{t("set.blur")}</label><span className="v">{st.blur}px</span></div>
      <input id="bl" type="range" min="0" max="48" step="1" value={st.blur} onChange={e=>up("blur",+e.target.value)}/></div>
    <div className="row"><div className="h"><span className="lb">{t("set.reduce")}</span><Toggle on={st.reduce} set={v=>up("reduce",v)} label={t("set.reduce")}/></div></div>
    <div className="row"><div className="h"><label htmlFor="th">{t("set.theme")}</label>
      <Select id="th" label={t("set.theme")} value={theme} onChange={setTheme} options={["dark","light","auto"].map(k=>({value:k,label:t("theme."+k)}))}/></div></div>
    <div className="row"><div className="h"><label htmlFor="ui">{t("set.lang")}</label>
      <Select id="ui" label={t("set.lang")} value={lang} onChange={setLang} options={[{value:"vi",label:"Tiếng Việt"},{value:"en",label:"English"}]}/></div></div>
  </div>;
}
