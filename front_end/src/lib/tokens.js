export const toks=s=>s.replace(/[.!?,;]+/g," ").split(/\s+/).filter(Boolean).slice(0,10);
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
