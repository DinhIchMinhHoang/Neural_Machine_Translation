export function Toggle({on,set,label}){return <button className={"sw"+(on?" on":"")} role="switch" aria-checked={on} aria-label={label} onClick={()=>set(!on)}/>;}
