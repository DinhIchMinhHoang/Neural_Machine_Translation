import { useState, useEffect } from "react";

const KEY="lumen.theme"; // "dark" | "light" | "auto"; index.html applies it pre-paint
const Q="(prefers-color-scheme: light)";

export function useTheme(){
  const [theme,setThemeS]=useState(()=>{try{const v=localStorage.getItem(KEY);return v==="light"||v==="auto"?v:"dark";}catch{return "dark";}});
  const setTheme=v=>{setThemeS(v);try{localStorage.setItem(KEY,v);}catch{}};
  useEffect(()=>{
    const mq=window.matchMedia(Q);
    const apply=()=>{document.documentElement.dataset.theme=theme==="auto"?(mq.matches?"light":"dark"):theme;};
    apply();
    if(theme!=="auto")return;
    mq.addEventListener("change",apply);return()=>mq.removeEventListener("change",apply);
  },[theme]);
  return [theme,setTheme];
}
