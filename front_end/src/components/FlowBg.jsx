import { useEffect } from "react";

// Liquid / aurora wave background. Colours are uniforms read from CSS vars (no literals in GLSL).
// Tweakables: SPEED (flow rate), SCALE (noise size), WARP (domain-warp amount), STATIC_T (frozen frame),
// strength per theme in STRENGTH, wave shape in the ridge lines of FRAG.
const SPEED=0.25,SCALE=1.6,WARP=3.0,STATIC_T=40;
const STRENGTH={dark:0.85,light:0.45};

const VERT=`attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG=`precision highp float;
uniform vec2 uRes;uniform float uT,uStr,uScale,uWarp;uniform vec3 uInk,uBlue,uAcc;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return s;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.)*uScale;
  float t=uT;
  vec2 q=vec2(fbm(p+.04*t),fbm(p+vec2(5.2,1.3)+.04*t));
  vec2 r=vec2(fbm(p+uWarp*q+vec2(1.7,9.2)+.08*t),fbm(p+uWarp*q+vec2(8.3,2.8)+.08*t));
  float f=fbm(p+uWarp*r);
  float side=pow(abs(uv.x-.5)*2.,2.);
  float crest=.30+.12*sin(uv.x*2.+.12*t+f*1.8)+.30*side+.25*(f-.5);
  float d=crest-uv.y;
  float mask=smoothstep(-.02,.55,d);
  // squares via multiplication: pow() with a negative base is undefined in GLSL (NaN on many GPUs)
  float bx=(d-.06)/.12,band=exp(-bx*bx);
  vec3 col=mix(mix(uInk,uBlue,.25),uBlue,smoothstep(.25,.85,f));
  col=mix(col,uBlue*1.2,band*.55);
  // orange = crest band + ripple-tail fringe + warm pool low-right; gated softly by the flow so it drifts with the water
  float tx=(d-.02)/.08,tail=exp(-tx*tx)*(1.-smoothstep(.2,.5,d));
  float warm=band*smoothstep(.40,.70,r.x)*.8+tail*smoothstep(.35,.65,f)*.9+smoothstep(.40,.75,r.y)*smoothstep(.2,1.,uv.x)*smoothstep(.05,.5,d)*.8;
  warm=clamp(warm,0.,1.);
  col=mix(col,uAcc,warm);
  col+=(hash(gl_FragCoord.xy+fract(t))-.5)/255.;
  // orange also lifts alpha so it stays visible on the nearly transparent fringe
  float a=mask*uStr;a=clamp(a+warm*.5*(1.-a),0.,1.);
  gl_FragColor=vec4(clamp(col,0.,1.)*a,a);
}`;

// Resolve any CSS colour expression (incl. color-mix) to 0..1 rgb by painting 1x1 px.
const resolver=()=>{
  const probe=document.createElement("i"),cx=document.createElement("canvas").getContext("2d",{willReadFrequently:true});
  cx.canvas.width=cx.canvas.height=1;
  document.body.appendChild(probe);
  const get=v=>{probe.style.color="";probe.style.color=v;cx.clearRect(0,0,1,1);cx.fillStyle=getComputedStyle(probe).color;cx.fillRect(0,0,1,1);
    const d=cx.getImageData(0,0,1,1).data;return [d[0]/255,d[1]/255,d[2]/255];};
  return {get,done:()=>probe.remove()};
};

export function FlowBg(){
  useEffect(()=>{
    const bg=document.querySelector(".bg");if(!bg)return;
    const cv=document.createElement("canvas");
    cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    const gl=cv.getContext("webgl",{premultipliedAlpha:true,alpha:true,antialias:false})||cv.getContext("experimental-webgl");
    if(!gl){console.warn("FlowBg: WebGL unavailable, using CSS orbs");return;}

    let prog,U,raf=0,t0=performance.now(),dead=false,lost=false;
    const mq=matchMedia("(prefers-reduced-motion: reduce)");
    const still=()=>mq.matches||document.body.classList.contains("reduce");
    const sh=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    const init=()=>{
      prog=gl.createProgram();
      gl.attachShader(prog,sh(gl.VERTEX_SHADER,VERT));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FRAG));
      gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW); // full-screen triangle
      const a=gl.getAttribLocation(prog,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
      U={};["uRes","uT","uStr","uScale","uWarp","uInk","uBlue","uAcc"].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
      gl.disable(gl.BLEND);
      gl.uniform1f(U.uScale,SCALE);gl.uniform1f(U.uWarp,WARP);
    };
    const colors=()=>{
      const R=resolver();
      gl.uniform3fv(U.uInk,R.get("var(--ink-0)"));
      gl.uniform3fv(U.uBlue,R.get("var(--blue)"));
      gl.uniform3fv(U.uAcc,R.get("var(--accent)"));
      R.done();
      gl.uniform1f(U.uStr,document.documentElement.dataset.theme==="light"?STRENGTH.light:STRENGTH.dark);
    };
    const size=()=>{
      const s=Math.max(.5,Math.min(window.devicePixelRatio||1,2)*.5);
      cv.width=Math.max(1,Math.round(bg.clientWidth*s));cv.height=Math.max(1,Math.round(bg.clientHeight*s));
      gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(U.uRes,cv.width,cv.height);
    };
    const draw=()=>{
      gl.uniform1f(U.uT,still()?STATIC_T:(performance.now()-t0)/1000*SPEED);
      gl.drawArrays(gl.TRIANGLES,0,3);
    };
    const frame=()=>{raf=0;draw();if(!still()&&!document.hidden&&!lost)raf=requestAnimationFrame(frame);};
    const kick=()=>{if(dead||lost)return;cancelAnimationFrame(raf);raf=0;if(still()){draw();}else if(!document.hidden)raf=requestAnimationFrame(frame);};

    try{init();colors();size();}catch(e){console.warn("FlowBg: shader failed, using CSS orbs",e);return;}
    bg.insertBefore(cv,bg.querySelector(".noise"));bg.classList.add("gl");
    kick();

    const ro=new ResizeObserver(()=>{size();kick();});ro.observe(bg);
    const mo=new MutationObserver(()=>{colors();kick();});
    mo.observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
    mo.observe(document.body,{attributes:true,attributeFilter:["class"]});
    const vis=()=>kick();
    const onLost=e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;};
    const onRest=()=>{lost=false;try{init();colors();size();kick();}catch(e){console.warn("FlowBg: restore failed",e);bg.classList.remove("gl");}};
    document.addEventListener("visibilitychange",vis);mq.addEventListener("change",kick);
    cv.addEventListener("webglcontextlost",onLost);cv.addEventListener("webglcontextrestored",onRest);

    return()=>{
      dead=true;cancelAnimationFrame(raf);ro.disconnect();mo.disconnect();
      document.removeEventListener("visibilitychange",vis);mq.removeEventListener("change",kick);
      cv.remove();bg.classList.remove("gl");
    };
  },[]);
  return null;
}
