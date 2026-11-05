/* ---------- mock data ---------- */
const MIN=6e4,H=36e5,D=864e5,sod=new Date().setHours(0,0,0,0),now=Date.now();
export const HIST=[
  ["good morning","en",now-2*MIN],["Cảm ơn bạn rất nhiều","vi",now-14*MIN],["where is the train station","en",now-H],
  ["Tôi yêu học máy","vi",now-3*H],["how much is this","en",sod-3*H],["Hẹn gặp lại ngày mai","vi",sod-8*H],
  ["nice to meet you","en",now-2*D],["Tôi không hiểu","vi",now-3*D]
].map(([src,dir,ts],i)=>({id:"h"+i,src,dir,ts,pinned:false}));
