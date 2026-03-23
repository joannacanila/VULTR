"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

const PRESETS = {
  IDENTITY:  { k:[0,0,0,0,1,0,0,0,0], desc:"No change — passthrough" },
  MEAN_BLUR: { k:[1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9], desc:"Smooth out noise" },
  SHARPEN:   { k:[0,-1,0,-1,5,-1,0,-1,0], desc:"Enhance edges" },
  SOBEL_X:   { k:[-1,0,1,-2,0,2,-1,0,1], desc:"Detect horizontal edges" },
  SOBEL_Y:   { k:[-1,-2,-1,0,0,0,1,2,1], desc:"Detect vertical edges" },
  EMBOSS:    { k:[-2,-1,0,-1,1,1,0,1,2], desc:"Sculpt the surface" },
  EDGE:      { k:[0,1,0,1,-4,1,0,1,0], desc:"Isolate all edges" },
  GAUSSIAN:  { k:[1/16,2/16,1/16,2/16,4/16,2/16,1/16,2/16,1/16], desc:"Natural blur" },
};

const STORY_STEPS = [
  { title:"BOOT SEQUENCE", msg:"Initializing VULTR-CONVOLVE laboratory systems...", color:"#39FF14" },
  { title:"MISSION BRIEFING", msg:"You are a pixel engineer. Load an image and manipulate its matrix DNA.", color:"#FFD700" },
  { title:"KERNEL DETECTED", msg:"3×3 convolution matrix online. Drag dials to rewrite pixel reality.", color:"#FF4500" },
  { title:"PRESET LOADED", msg:"Filter engaged. Watch the numbers shift. Feel the math.", color:"#FFD700" },
  { title:"ANALYSIS COMPLETE", msg:"PSNR and SSIM metrics computed. How much did you destroy?", color:"#39FF14" },
];

const LABELS = ['TL','TC','TR','ML','MC','MR','BL','BC','BR'];

function useAnimatedValue(target, duration=600) {
  const [val, setVal] = useState(target);
  const ref = useRef(null);
  useEffect(() => {
    const start = val, end = target, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now-t0)/duration, 1);
      const ease = 1-Math.pow(1-p,3);
      setVal(start+(end-start)*ease + (p<1?(Math.random()-0.5)*0.3:0));
      if(p<1) ref.current = requestAnimationFrame(tick);
      else setVal(end);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);
  return val;
}

function Dial({ val, idx, active, onDown, onMove, onUp }) {
  const angle = -135 + ((val+5)/10)*270;
  const cx=28, r=22;
  const nx = cx + (r-6)*Math.sin(angle*Math.PI/180);
  const ny = cx - (r-6)*Math.cos(angle*Math.PI/180);
  const isActive = active===idx;
  return React.createElement('div', {
    style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'8px 4px', border:'2px solid #000', background: isActive?'#0f3a1e':'#0f2a1e', cursor:'ns-resize', transition:'background 0.1s', boxShadow: isActive?'inset 0 0 0 1px #FFD700':'none' },
    onPointerDown:(e)=>onDown(e,idx), onPointerMove:onMove, onPointerUp:onUp, onPointerLeave:onUp
  },
    React.createElement('svg', { width:56, height:56, viewBox:'0 0 56 56' },
      React.createElement('circle', { cx:28, cy:28, r:22, fill:'#1B3B2B', stroke:'#000', strokeWidth:3 }),
      React.createElement('circle', { cx:28, cy:28, r:22, fill:'none', stroke: isActive?'#FFD700':'rgba(255,255,255,0.1)', strokeWidth:1 }),
      Array.from({length:11}).map((_,i)=>{
        const a=-135+i*27, ar=a*Math.PI/180;
        return React.createElement('line', { key:i,
          x1:28+(22-2)*Math.sin(ar), y1:28-(22-2)*Math.cos(ar),
          x2:28+(22-7)*Math.sin(ar), y2:28-(22-7)*Math.cos(ar),
          stroke: i===5?'#FFD700':'rgba(255,255,255,0.2)', strokeWidth: i===5?2:1
        });
      }),
      React.createElement('circle', { cx:nx, cy:ny, r:4, fill: isActive?'#FFD700':'#FF4500', stroke:'#000', strokeWidth:1 }),
      React.createElement('circle', { cx:28, cy:28, r:3, fill:'rgba(255,255,255,0.1)' })
    ),
    React.createElement('div', { style:{ fontFamily:'monospace', fontSize:'10px', background:'#0A1F0F', color:'#39FF14', border:'1px solid #000', padding:'1px 4px', textShadow:'0 0 4px rgba(57,255,20,0.8)', minWidth:36, textAlign:'center' } }, val.toFixed(1)),
    React.createElement('span', { style:{ fontFamily:'monospace', fontSize:'8px', color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em' } }, LABELS[idx])
  );
}

function Gauge({ value, max, label, unit, tierColor }) {
  const displayed = useAnimatedValue(value);
  const pct = Math.min(displayed/max, 1);
  const angle = -135+pct*270;
  const ar = angle*Math.PI/180;
  const cx=50, r=38;
  const nx = cx+(r-8)*Math.sin(ar);
  const ny = cx-(r-8)*Math.cos(ar);
  const descArc=(sd,ed,radius)=>{
    const s=((sd-90)*Math.PI)/180, e=((ed-90)*Math.PI)/180;
    const x1=cx+radius*Math.cos(s),y1=cy+radius*Math.sin(s);
    const x2=cx+radius*Math.cos(e),y2=cy+radius*Math.sin(e);
    const cy2=50;
    return `M ${cx+radius*Math.cos(s)} ${cy2+radius*Math.sin(s)} A ${radius} ${radius} 0 ${ed-sd>180?1:0} 1 ${cx+radius*Math.cos(e)} ${cy2+radius*Math.sin(e)}`;
  };
  const cy=50;
  return React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 } },
    React.createElement('div', { style:{ position:'relative', width:100, height:100 } },
      React.createElement('svg', { width:100, height:100, viewBox:'0 0 100 100' },
        React.createElement('circle', { cx:50, cy:50, r:44, fill:'#0A0A0A', stroke:'#000', strokeWidth:3 }),
        React.createElement('path', { d:`M ${50+(38)*Math.sin(-135*Math.PI/180)} ${50-(38)*Math.cos(-135*Math.PI/180)} A 38 38 0 1 1 ${50+(38)*Math.sin(135*Math.PI/180)} ${50-(38)*Math.cos(135*Math.PI/180)}`, fill:'none', stroke:'rgba(255,255,255,0.06)', strokeWidth:6, strokeLinecap:'round' }),
        pct>0.01 && React.createElement('path', { d:`M ${50+(38)*Math.sin(-135*Math.PI/180)} ${50-(38)*Math.cos(-135*Math.PI/180)} A 38 38 0 ${pct>0.5?1:0} 1 ${50+(38)*Math.sin((-135+pct*270)*Math.PI/180)} ${50-(38)*Math.cos((-135+pct*270)*Math.PI/180)}`, fill:'none', stroke:tierColor, strokeWidth:6, strokeLinecap:'round' }),
        Array.from({length:11}).map((_,i)=>{
          const a=-135+i*27, ar2=a*Math.PI/180;
          return React.createElement('line', { key:i, x1:50+(44-2)*Math.sin(ar2), y1:50-(44-2)*Math.cos(ar2), x2:50+(44-7)*Math.sin(ar2), y2:50-(44-7)*Math.cos(ar2), stroke:'rgba(255,255,255,0.15)', strokeWidth: i%5===0?2:1 });
        }),
        React.createElement('line', { x1:50, y1:50, x2:nx, y2:ny, stroke:tierColor, strokeWidth:2, strokeLinecap:'round' }),
        React.createElement('circle', { cx:50, cy:50, r:5, fill:'#000', stroke:tierColor, strokeWidth:2 }),
        React.createElement('text', { x:50, y:54, textAnchor:'middle', fontFamily:'monospace', fontSize:14, fill:tierColor }, displayed.toFixed(1)),
        React.createElement('text', { x:50, y:66, textAnchor:'middle', fontFamily:'monospace', fontSize:8, fill:'rgba(255,255,255,0.3)' }, unit)
      )
    ),
    React.createElement('span', { style:{ fontFamily:'monospace', fontSize:'9px', color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase' } }, label)
  );
}

function RippleEffect({ active, onDone }) {
  useEffect(()=>{ if(active) { const t=setTimeout(onDone,700); return ()=>clearTimeout(t); } },[active]);
  if(!active) return null;
  return React.createElement('div', { style:{ position:'fixed', inset:0, pointerEvents:'none', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' } },
    [0,1,2].map(i=>React.createElement('div', { key:i, style:{ position:'absolute', width:100+i*200, height:100+i*200, borderRadius:'50%', border:`3px solid #FFD700`, animation:`ripple${i} 0.7s ease-out forwards`, opacity:0 } }))
  );
}

export default function Home() {
  const [kernel, setKernel]       = useState([0,0,0,0,1,0,0,0,0]);
  const [activePreset, setPreset] = useState('IDENTITY');
  const [metrics, setMetrics]     = useState({ psnr:0, ssim:0, mse:0, tier:'LOW', ms:0 });
  const [imgSrc, setImgSrc]       = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [dragIdx, setDragIdx]     = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [ripple, setRipple]       = useState(false);
  const [storyIdx, setStoryIdx]   = useState(0);
  const [glitch, setGlitch]       = useState(false);
  const [bootDone, setBootDone]   = useState(false);
  const [scanline, setScanline]   = useState(true);
  const [combo, setCombo]         = useState(0);
  const [score, setScore]         = useState(0);
  const [lastPreset, setLastPreset] = useState('');
  const [termLines, setTermLines] = useState([]);
  const fileRef = useRef(null);
  const termRef = useRef(null);

  useEffect(()=>{
    const lines = [
      '> VULTR-CONVOLVE v1.0.0 booting...',
      '> Loading WebGL context... OK',
      '> Initializing 3x3 convolution matrix... OK',
      '> Connecting to metrics engine... OK',
      '> PSNR/SSIM algorithms loaded... OK',
      '> Laboratory systems online.',
      '> Awaiting image input...',
    ];
    lines.forEach((line,i)=>{
      setTimeout(()=>{
        setTermLines(prev=>[...prev, line]);
        if(i===lines.length-1) setBootDone(true);
      }, i*300);
    });
  },[]);

  useEffect(()=>{ if(termRef.current) termRef.current.scrollTop=termRef.current.scrollHeight; },[termLines]);

  const addTermLine = (line) => setTermLines(prev=>[...prev.slice(-20), line]);

  const tierColor = { PRISTINE:'#39FF14', HIGH:'#FFD700', MEDIUM:'#FF4500', LOW:'#ff3333' }[metrics.tier]||'#FFD700';

  const triggerGlitch = () => { setGlitch(true); setTimeout(()=>setGlitch(false),400); };

  const applyPreset = (key) => {
    setKernel([...PRESETS[key].k]);
    setPreset(key);
    setRipple(true);
    triggerGlitch();
    const newCombo = lastPreset && lastPreset!==key ? combo+1 : 1;
    setCombo(newCombo);
    setScore(prev=>prev+100*newCombo);
    setLastPreset(key);
    setStoryIdx(3);
    addTermLine(`> PRESET: ${key} — ${PRESETS[key].desc}`);
    addTermLine(`> COMBO x${newCombo} — +${100*newCombo} pts`);
  };

  const handleFile = (file) => {
    if(!file||!file.type.startsWith('image/')) return;
    setImgSrc(URL.createObjectURL(file));
    setStoryIdx(2);
    addTermLine(`> IMAGE LOADED: ${file.name}`);
    addTermLine(`> Resolution: ${file.size} bytes`);
    triggerGlitch();
    setScore(prev=>prev+500);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const onDialDown = (e,i) => { e.currentTarget.setPointerCapture(e.pointerId); setDragIdx(i); setDragStart({y:e.clientY,val:kernel[i]}); };
  const onDialMove = (e) => {
    if(dragIdx===null||!dragStart) return;
    const delta=(dragStart.y-e.clientY)*0.05;
    const next=Math.round((dragStart.val+delta)*10)/10;
    setKernel(prev=>{ const k=[...prev]; k[dragIdx]=Math.min(5,Math.max(-5,next)); return k; });
    setPreset('CUSTOM');
  };
  const onDialUp = () => { setDragIdx(null); setDragStart(null); };

  const weightSum = kernel.reduce((a,b)=>a+b,0);

  return React.createElement('div', { style:{ minHeight:'100vh', background:'#FF4500', fontFamily:'"IBM Plex Mono",monospace', position:'relative', overflow:'hidden' } },

    React.createElement('style', null, `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes scanline { 0%{background-position:0 0} 100%{background-position:0 100%} }
      @keyframes glitch1 { 0%,100%{text-shadow:none} 20%{text-shadow:-3px 0 #f00,3px 0 #00f} 40%{text-shadow:3px 0 #0f0,-3px 0 #f00} 60%{text-shadow:-2px 0 #00f,2px 0 #0f0} 80%{text-shadow:2px 0 #f00,-2px 0 #00f} }
      @keyframes ripple0 { 0%{transform:scale(0);opacity:0.9} 100%{transform:scale(1);opacity:0} }
      @keyframes ripple1 { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
      @keyframes ripple2 { 0%{transform:scale(0);opacity:0.3} 100%{transform:scale(2);opacity:0} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      @keyframes scoreFloat { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(-40px);opacity:0} }
      .dial-cell:hover { background:#0f3a1e!important; }
      .preset-btn:hover { transform:translate(2px,2px)!important; box-shadow:2px 2px 0 #000!important; }
    `),

    scanline && React.createElement('div', { style:{ position:'fixed', inset:0, pointerEvents:'none', zIndex:998, backgroundImage:'repeating-linear-gradient(0deg,rgba(0,0,0,0.08) 0px,rgba(0,0,0,0.08) 1px,transparent 1px,transparent 3px)', backgroundSize:'100% 3px' } }),

    glitch && React.createElement('div', { style:{ position:'fixed', inset:0, pointerEvents:'none', zIndex:997, background:'rgba(255,69,0,0.05)', animation:'glitch1 0.4s ease-in-out' } }),

    ripple && React.createElement(RippleEffect, { active:ripple, onDone:()=>setRipple(false) }),

    React.createElement('div', { style:{ padding:'16px 24px 0', display:'flex', flexDirection:'column', gap:12 } },

      React.createElement('div', { style:{ border:'4px solid #000', background:'#000', boxShadow:'8px 8px 0 rgba(0,0,0,0.4)', padding:'10px 20px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' } },
        React.createElement('h1', { style:{ fontFamily:'monospace', fontSize:'clamp(20px,4vw,42px)', color:'#FFD700', letterSpacing:'0.08em', lineHeight:1, margin:0, animation: glitch?'glitch1 0.4s ease-in-out':'' } }, 'VULTR CONVOLVE'),
        React.createElement('span', { style:{ fontSize:'9px', color:'rgba(255,215,0,0.4)', letterSpacing:'0.15em', textTransform:'uppercase' } }, 'IMAGE CONVOLUTION LAB v1.0'),
        React.createElement('div', { style:{ marginLeft:'auto', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' } },
          React.createElement('div', { style:{ border:'2px solid #FFD700', padding:'4px 10px', display:'flex', flexDirection:'column', alignItems:'center' } },
            React.createElement('span', { style:{ fontSize:'8px', color:'rgba(255,215,0,0.5)', letterSpacing:'0.1em' } }, 'SCORE'),
            React.createElement('span', { style:{ fontSize:'18px', color:'#FFD700', fontFamily:'monospace', textShadow:'0 0 8px rgba(255,215,0,0.6)' } }, score.toString().padStart(6,'0'))
          ),
          combo>1 && React.createElement('div', { style:{ border:'2px solid #FF4500', padding:'4px 10px', background:'#FF4500', animation:'pulse 0.5s ease-in-out infinite' } },
            React.createElement('span', { style:{ fontSize:'14px', color:'#000', fontFamily:'monospace', fontWeight:'bold' } }, 'COMBO x'+combo)
          ),
          React.createElement('button', { onClick:()=>setScanline(s=>!s), style:{ fontFamily:'monospace', fontSize:'9px', padding:'4px 8px', border:'2px solid #000', background: scanline?'#1B3B2B':'#333', color: scanline?'#39FF14':'#666', cursor:'pointer', letterSpacing:'0.08em' } }, scanline?'SCANLINES ON':'SCANLINES OFF')
        )
      ),

      React.createElement('div', { style:{ border:'2px solid #000', background:'#000', padding:'6px 12px', minHeight:32 } },
        React.createElement('span', { style:{ fontSize:'11px', color: STORY_STEPS[storyIdx].color, letterSpacing:'0.08em' } },
          '[ ' + STORY_STEPS[storyIdx].title + ' ] ' + STORY_STEPS[storyIdx].msg
        )
      ),

      React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'1fr 310px', gap:16, alignItems:'start', paddingBottom:16 } },

        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:12 } },

          React.createElement('div', { style:{ border:'4px solid #000', background:'#1B3B2B', boxShadow:'8px 8px 0 #000' } },
            React.createElement('div', { style:{ background:'#000', color:'#FFD700', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
              React.createElement('span', null, '▸ LABORATORY CANVAS'),
              imgSrc && React.createElement('button', { onClick:()=>{ setImgSrc(null); addTermLine('> Image cleared.'); }, style:{ background:'transparent', border:'1px solid #FF4500', color:'#FF4500', fontFamily:'monospace', fontSize:'9px', padding:'1px 6px', cursor:'pointer' } }, '✕ CLEAR')
            ),
            React.createElement('div', {
              style:{ minHeight:380, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(255,255,255,0.05) 19px,rgba(255,255,255,0.05) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(255,255,255,0.05) 19px,rgba(255,255,255,0.05) 20px)', border: dragging?'3px dashed #FFD700':'3px dashed rgba(255,255,255,0.1)', margin:12, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor: imgSrc?'default':'pointer', transition:'border-color 0.2s' },
              onDrop, onDragOver:(e)=>{ e.preventDefault(); setDragging(true); }, onDragLeave:()=>setDragging(false),
              onClick:()=>!imgSrc&&fileRef.current&&fileRef.current.click()
            },
              imgSrc
                ? React.createElement('div', { style:{ position:'relative', display:'inline-block' } },
                    [{ top:8, left:8 },{ top:8, right:8 },{ bottom:8, left:8 },{ bottom:8, right:8 }].map((pos,i)=>
                      React.createElement('div', { key:i, style:{ position:'absolute', ...pos, width:14, height:14, borderRadius:'50%', background:'#FF4500', border:'2px solid #000', boxShadow:'2px 2px 0 #000', zIndex:10, animation:'float 2s ease-in-out infinite', animationDelay:i*0.2+'s' } })
                    ),
                    React.createElement('img', { src:imgSrc, style:{ maxWidth:'100%', maxHeight:460, display:'block', transform:'rotate(-0.4deg)', boxShadow:'0 16px 48px rgba(0,0,0,0.8),0 4px 12px rgba(0,0,0,0.6)', border:'4px solid #000' } })
                  )
                : React.createElement('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:40 } },
                    React.createElement('div', { style:{ width:72, height:72, border:'4px solid #FFD700', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'6px 6px 0 #000', animation:'float 3s ease-in-out infinite' } },
                      React.createElement('span', { style:{ fontSize:'32px', color:'#FFD700' } }, '⬆')
                    ),
                    React.createElement('div', { style:{ textAlign:'center' } },
                      React.createElement('div', { style:{ fontSize:'13px', color:'#FFD700', letterSpacing:'0.1em', marginBottom:6 } }, 'DROP IMAGE TO BEGIN'),
                      React.createElement('div', { style:{ fontSize:'10px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em' } }, 'JPEG · PNG · WEBP · GIF'),
                      React.createElement('div', { style:{ fontSize:'10px', color:'rgba(255,215,0,0.4)', marginTop:8, animation:'blink 1.2s ease-in-out infinite' } }, '[ +500 POINTS FOR FIRST IMAGE ]')
                    )
                  )
            ),
            imgSrc && React.createElement('div', { style:{ display:'flex', gap:8, padding:'0 12px 12px' } },
              React.createElement('button', { onClick:()=>fileRef.current&&fileRef.current.click(), style:{ flex:1, fontFamily:'monospace', fontSize:'10px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px', border:'3px solid #000', background:'#FF4500', color:'#000', cursor:'pointer', boxShadow:'4px 4px 0 #000' } }, '⬆ LOAD NEW'),
              React.createElement('button', { style:{ flex:1, fontFamily:'monospace', fontSize:'10px', letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px', border:'3px solid #000', background:'#FFD700', color:'#000', cursor:'pointer', boxShadow:'4px 4px 0 #000' } }, '⬇ EXPORT PNG')
            )
          ),
          React.createElement('input', { ref:fileRef, type:'file', accept:'image/*', style:{ display:'none' }, onChange:(e)=>handleFile(e.target.files[0]) }),

          React.createElement('div', { style:{ border:'4px solid #000', background:'#000', boxShadow:'8px 8px 0 #000' } },
            React.createElement('div', { style:{ background:'#111', color:'#39FF14', fontSize:'10px', letterSpacing:'0.1em', padding:'5px 12px', borderBottom:'2px solid #000' } }, '▸ TERMINAL OUTPUT'),
            React.createElement('div', { ref:termRef, style:{ height:100, overflowY:'auto', padding:'8px 12px', background:'#000' } },
              termLines.map((line,i)=>React.createElement('div', { key:i, style:{ fontSize:'10px', color: line.includes('ERROR')?'#ff3333':line.includes('COMBO')?'#FFD700':'#39FF14', fontFamily:'monospace', lineHeight:1.6 } }, line)),
              bootDone && React.createElement('span', { style:{ fontSize:'10px', color:'#39FF14', fontFamily:'monospace', animation:'blink 1s ease-in-out infinite' } }, '█')
            )
          )
        ),

        React.createElement('div', { style:{ display:'flex', flexDirection:'column', gap:12 } },

          React.createElement('div', { style:{ border:'4px solid #000', background:'#1B3B2B', boxShadow:'8px 8px 0 #000' } },
            React.createElement('div', { style:{ background:'#000', color:'#FFD700', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
              React.createElement('span', null, '▸ 3×3 KERNEL MATRIX'),
              React.createElement('button', { onClick:()=>{ setKernel([0,0,0,0,1,0,0,0,0]); setPreset('IDENTITY'); addTermLine('> Matrix reset to IDENTITY'); }, style:{ background:'transparent', border:'1px solid #FFD700', color:'#FFD700', fontFamily:'monospace', fontSize:'9px', padding:'1px 6px', cursor:'pointer' } }, 'RESET')
            ),
            React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4, padding:'10px 10px 6px' } },
              kernel.map((val,i)=>React.createElement(Dial, { key:i, val, idx:i, active:dragIdx, onDown:onDialDown, onMove:onDialMove, onUp:onDialUp }))
            ),
            React.createElement('div', { style:{ margin:'0 10px 8px', background:'#0A1F0F', border:'2px solid #000', padding:'4px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
              React.createElement('span', { style:{ fontSize:'9px', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' } }, 'WEIGHT SUM'),
              React.createElement('span', { style:{ fontSize:'14px', color: Math.abs(weightSum-1)<0.01?'#39FF14':weightSum===0?'#ff3333':'#FFD700', fontFamily:'monospace', textShadow:'0 0 6px rgba(57,255,20,0.5)' } }, weightSum.toFixed(2))
            ),
            React.createElement('div', { style:{ padding:'0 10px 10px' } },
              React.createElement('div', { style:{ fontSize:'8px', color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', marginBottom:5, textTransform:'uppercase' } }, 'PRESETS — +100pts each'),
              React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:4 } },
                Object.keys(PRESETS).map(key=>React.createElement('button', { key, className:'preset-btn',
                  onClick:()=>applyPreset(key),
                  style:{ fontFamily:'monospace', fontSize:'9px', letterSpacing:'0.06em', padding:'4px 7px', border:'2px solid #000', cursor:'pointer', textTransform:'uppercase', background: activePreset===key?'#FFD700':'#FF4500', color:'#000', boxShadow: activePreset===key?'2px 2px 0 #000':'4px 4px 0 #000', transform: activePreset===key?'translate(2px,2px)':'none', transition:'all 0.05s' } },
                  key.replace(/_/g,' ')
                ))
              )
            )
          ),

          React.createElement('div', { style:{ border:'4px solid #000', background:'#1B3B2B', boxShadow:'8px 8px 0 #000' } },
            React.createElement('div', { style:{ background:'#000', color:'#FFD700', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 12px', display:'flex', justifyContent:'space-between' } },
              React.createElement('span', null, '▸ METRIC SPEEDOMETERS'),
              React.createElement('span', { style:{ color:'rgba(255,215,0,0.4)', fontSize:'9px' } }, metrics.ms>0?metrics.ms+'ms':'AWAITING')
            ),
            React.createElement('div', { style:{ display:'flex', gap:12, justifyContent:'center', padding:'12px 10px 6px' } },
              React.createElement(Gauge, { value: Math.min(metrics.psnr,50), max:50, label:'PSNR', unit:'dB', tierColor }),
              React.createElement(Gauge, { value: metrics.ssim*100, max:100, label:'SSIM', unit:'%', tierColor })
            ),
            React.createElement('div', { style:{ margin:'0 10px', background:'#0A1F0F', border:'2px solid #000', padding:'4px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' } },
              React.createElement('span', { style:{ fontSize:'9px', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.08em' } }, 'MSE'),
              React.createElement('span', { style:{ fontSize:'14px', color:'#39FF14', fontFamily:'monospace', textShadow:'0 0 6px rgba(57,255,20,0.8)' } }, metrics.mse.toFixed(2))
            ),
            React.createElement('div', { style:{ padding:'8px 10px 10px', textAlign:'center' } },
              React.createElement('span', { style:{ fontFamily:'monospace', fontSize:'9px', padding:'3px 12px', border:'2px solid '+tierColor, color:tierColor, letterSpacing:'0.1em', textTransform:'uppercase', textShadow:'0 0 6px '+tierColor+'66' } }, metrics.tier==='LOW'?'LOAD IMAGE TO ANALYZE':metrics.tier)
            )
          ),

          React.createElement('div', { style:{ border:'4px solid #000', background:'#1B3B2B', boxShadow:'8px 8px 0 #000', padding:'10px' } },
            React.createElement('div', { style:{ background:'#000', color:'#FFD700', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', padding:'5px 12px', marginBottom:10, marginLeft:-10, marginRight:-10, marginTop:-10 } }, '▸ CURRENT KERNEL'),
            React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:3, fontSize:'11px', fontFamily:'monospace', textAlign:'center' } },
              kernel.map((v,i)=>React.createElement('div', { key:i, style:{ padding:'4px 2px', background: Math.abs(v)>0?'#0f2a1e':'#000', border:'1px solid #000', color: v>0?'#39FF14':v<0?'#ff3333':'rgba(255,255,255,0.2)', textShadow: Math.abs(v)>0?'0 0 4px currentColor':'' } }, v.toFixed(1)))
            )
          )
        )
      )
    )
  );
}