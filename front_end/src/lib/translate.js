/* ---------- fake translator ---------- */
const EN2VI={
  "hello world":"xin chào thế giới","how are you":"bạn khỏe không","good morning":"chào buổi sáng",
  "good night":"chúc ngủ ngon","thank you very much":"cảm ơn bạn rất nhiều","i love machine learning":"tôi yêu học máy",
  "where is the train station":"ga tàu ở đâu","what is your name":"tên bạn là gì","my name is anna":"tên tôi là Anna",
  "i am hungry":"tôi đói","see you tomorrow":"hẹn gặp lại ngày mai","how much is this":"cái này giá bao nhiêu",
  "neural networks learn patterns":"mạng nơ-ron học các mẫu","i do not understand":"tôi không hiểu","nice to meet you":"rất vui được gặp bạn"
};
const VI2EN=Object.fromEntries(Object.entries(EN2VI).map(([e,v])=>[v.toLowerCase(),e.charAt(0).toUpperCase()+e.slice(1)]));
const W_EN={hello:"xin chào",world:"thế giới",i:"tôi",you:"bạn",love:"yêu",is:"là",am:"là",are:"là",good:"tốt",thank:"cảm ơn",thanks:"cảm ơn",
  morning:"sáng",night:"đêm",the:"",a:"một",water:"nước",food:"đồ ăn",book:"sách",friend:"bạn",today:"hôm nay",tomorrow:"ngày mai",
  where:"đâu",what:"gì",my:"của tôi",your:"của bạn",name:"tên",very:"rất",much:"nhiều",learn:"học",machine:"máy",learning:"học",
  train:"tàu",station:"ga",house:"nhà",we:"chúng tôi",they:"họ",he:"anh ấy",she:"cô ấy",not:"không",yes:"vâng",no:"không",please:"làm ơn"};
const W_VI={};Object.entries(W_EN).forEach(([e,v])=>{if(v&&!v.includes(" ")&&!W_VI[v])W_VI[v]=e;});
const norm=s=>s.toLowerCase().replace(/[.!?,;]+/g," ").replace(/\s+/g," ").trim();
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
export function translate(text,dir){
  const k=norm(text),tbl=dir==="en"?EN2VI:VI2EN,hit=tbl[k];
  if(hit)return dir==="en"?cap(hit):hit;
  const W=dir==="en"?W_EN:W_VI;
  const out=k.split(" ").map(w=>w in W?W[w]:w).filter(Boolean).join(" ");
  return cap(out||text); // shortcut: unknown words pass through unchanged, upgrade = real model
}
