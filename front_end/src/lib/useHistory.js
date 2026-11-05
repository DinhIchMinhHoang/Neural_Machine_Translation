import { useState, useEffect } from "react";
import { HIST } from "../data/history.js";

const KEY="lumen.history";
const load=()=>{try{const v=JSON.parse(localStorage.getItem(KEY));if(Array.isArray(v))return v.filter(h=>h&&typeof h.src==="string");}catch{}return HIST;};

// items: {id, src, dir, ts, pinned}; `undo` holds the last deleted item for the toast
export function useHistory(){
  const [items,setItems]=useState(load),[undo,setUndo]=useState(null);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{}},[items]);
  useEffect(()=>{if(!undo)return;const id=setTimeout(()=>setUndo(null),5000);return()=>clearTimeout(id);},[undo]);
  const add=(src,dir)=>setItems(l=>{
    const same=h=>h.src===src&&h.dir===dir,ts=Date.now();
    return l.some(same)?l.map(h=>same(h)?{...h,ts}:h):[{id:"h"+ts,src,dir,ts,pinned:false},...l];
  });
  const pin=id=>setItems(l=>l.map(h=>h.id===id?{...h,pinned:!h.pinned}:h));
  const remove=id=>{const i=items.findIndex(h=>h.id===id);if(i<0)return;setUndo({item:items[i],i});setItems(l=>l.filter(h=>h.id!==id));};
  const restore=()=>{if(!undo)return;const {item,i}=undo;setItems(l=>{const c=[...l];c.splice(Math.min(i,c.length),0,item);return c;});setUndo(null);};
  return {items,add,pin,remove,undo,restore};
}
