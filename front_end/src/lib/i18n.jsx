import { createContext, useContext, useEffect, useState } from "react";
import inspector from "../i18n/inspector.js";
import notch from "../i18n/notch.js";
import info from "../i18n/info.js";

// UI language (separate from the EN<->VI translation direction)
const own={
  en:{
    "side.toggle":"Toggle sidebar","insp.toggle":"Toggle inspector","insp.title":"Attention Inspector","insp.hover":"Hover a message",
    "tab.history":"History","tab.settings":"Settings",
    "hist.new":"New translation","hist.search":"Search history","hist.none":"No matches.","hist.empty":"No history yet.",
    "hist.pinned":"Pinned","hist.today":"Today","hist.yesterday":"Yesterday","hist.earlier":"Earlier",
    "hist.pin":"Pin","hist.unpin":"Unpin","hist.delete":"Delete","hist.deleted":"Deleted from history","hist.undo":"Undo",
    "set.model":"Model","set.beam":"Beam size","set.ln":"Length normalization α","set.cov":"Coverage penalty β",
    "set.attn":"Show attention","set.blur":"Glass blur","set.reduce":"Reduce motion",
    "set.theme":"Theme","theme.dark":"Dark","theme.light":"Light","theme.auto":"Auto (system)","set.lang":"Interface language",
    "chat.start":"Try an example or type below.","chat.translating":"Translating","chat.copy":"Copy translation",
    "chat.error":"Translation failed.","chat.retry":"Retry",
    "comp.label":"Text to translate","comp.ph.en":"Type English to translate to Vietnamese...","comp.ph.vi":"Type Vietnamese to translate to English...",
    "comp.send":"Send","comp.hint":"Enter to send · Shift+Enter new line · Ctrl/Cmd+Shift+L swap · Esc to leave",
    "comp.over":"Too long: limit is {n} characters.","net.offline":"You are offline. Translation may fail.",
    "dir.en":"EN→VI","dir.vi":"VI→EN"
  },
  vi:{
    "side.toggle":"Bật/tắt thanh bên","insp.toggle":"Bật/tắt bảng phân tích","insp.title":"Attention Inspector","insp.hover":"Di chuột vào một tin nhắn",
    "tab.history":"Lịch sử","tab.settings":"Cài đặt",
    "hist.new":"Bản dịch mới","hist.search":"Tìm trong lịch sử","hist.none":"Không có kết quả.","hist.empty":"Chưa có lịch sử.",
    "hist.pinned":"Đã ghim","hist.today":"Hôm nay","hist.yesterday":"Hôm qua","hist.earlier":"Trước đó",
    "hist.pin":"Ghim","hist.unpin":"Bỏ ghim","hist.delete":"Xóa","hist.deleted":"Đã xóa khỏi lịch sử","hist.undo":"Hoàn tác",
    "set.model":"Mô hình","set.beam":"Kích thước beam","set.ln":"Chuẩn hóa độ dài α","set.cov":"Phạt độ phủ β",
    "set.attn":"Hiện attention","set.blur":"Độ mờ kính","set.reduce":"Giảm chuyển động",
    "set.theme":"Giao diện","theme.dark":"Tối","theme.light":"Sáng","theme.auto":"Tự động (theo hệ thống)","set.lang":"Ngôn ngữ giao diện",
    "chat.start":"Thử một ví dụ hoặc nhập bên dưới.","chat.translating":"Đang dịch","chat.copy":"Sao chép bản dịch",
    "chat.error":"Dịch thất bại.","chat.retry":"Thử lại",
    "comp.label":"Văn bản cần dịch","comp.ph.en":"Nhập tiếng Anh để dịch sang tiếng Việt...","comp.ph.vi":"Nhập tiếng Việt để dịch sang tiếng Anh...",
    "comp.send":"Gửi","comp.hint":"Enter để gửi · Shift+Enter xuống dòng · Ctrl/Cmd+Shift+L đổi chiều · Esc để thoát",
    "comp.over":"Quá dài: tối đa {n} ký tự.","net.offline":"Bạn đang ngoại tuyến. Có thể dịch thất bại.",
    "dir.en":"EN→VI","dir.vi":"VI→EN"
  }
};
const dict={en:{...own.en,...inspector.en,...notch.en,...info.en},vi:{...own.vi,...inspector.vi,...notch.vi,...info.vi}};
const KEY="lumen.ui";
const Ctx=createContext({t:k=>k,lang:"vi",setLang:()=>{}});

export function I18nProvider({children}){
  const [lang,setLangS]=useState(()=>{try{const v=localStorage.getItem(KEY);return v==="en"||v==="vi"?v:"vi";}catch{return "vi";}});
  const setLang=l=>{setLangS(l);try{localStorage.setItem(KEY,l);}catch{}};
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  const t=(k,v)=>{let s=dict[lang][k]??dict.en[k]??k;if(v)for(const n in v)s=s.replace("{"+n+"}",v[n]);return s;};
  return <Ctx.Provider value={{t,lang,setLang}}>{children}</Ctx.Provider>;
}
export const useI18n=()=>useContext(Ctx);
