import { useState, useCallback, useRef, useEffect, useMemo } from "react";

const C = {
  bg:"#ffffff",surface:"#f5f5f7",border:"#e2e2e8",borderLight:"#ececf0",
  navBg:"#111111",navIcon:"#ffffff",navActive:"#7c6ff7",filterBg:"#eeeef2",filterBorder:"#dddde2",
  accent:"#5b50d6",internal:"#4a90e2",external:"#e8943a",text:"#1a1a2e",textDim:"#7a7a8e",
  success:"#22a66e",danger:"#e04545",warning:"#e8943a",topBar:"#0a0a0a",
};
const font="'Segoe UI',system-ui,sans-serif";
const SEGMENTS=["All","Hospitals","Corporate Services","Universities","Government"];
const BRANDS=["All","Chick-fil-A","Subway","McDonald's","Panera Bread","Chipotle","Wendy's","Taco Bell","Panda Express","Five Guys"];
const CATEGORIES=["All","CPG","Cold Beverage","Snacks","Hot Entree","Dessert","Breakfast","Sides"];

const FISCAL_DATA={"2026":["Jan","Feb","Mar","Apr","May","Jun"],"2025":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};

// Realistic continental US outline
const US="M 108 175 L 103 180 L 100 190 L 97 205 L 95 220 L 94 235 L 97 248 L 102 258 L 108 268 L 118 278 L 122 285 L 120 295 L 125 308 L 135 318 L 148 330 L 160 340 L 172 348 L 182 352 L 195 358 L 210 365 L 230 372 L 252 378 L 275 383 L 300 387 L 325 390 L 342 392 L 350 395 L 355 400 L 362 405 L 375 402 L 390 398 L 400 392 L 405 388 L 412 382 L 420 378 L 430 372 L 445 368 L 458 362 L 468 358 L 478 355 L 490 350 L 500 345 L 508 338 L 515 330 L 520 322 L 528 315 L 535 308 L 542 300 L 550 292 L 560 285 L 568 278 L 576 272 L 582 268 L 590 262 L 600 255 L 610 248 L 618 242 L 625 238 L 630 235 L 632 232 L 635 228 L 638 222 L 642 218 L 648 215 L 655 210 L 660 205 L 662 198 L 665 192 L 668 188 L 670 185 L 672 182 L 668 178 L 662 175 L 655 172 L 648 170 L 640 168 L 632 167 L 625 168 L 618 170 L 615 168 L 618 162 L 622 158 L 625 155 L 622 152 L 618 150 L 612 150 L 605 152 L 598 155 L 590 158 L 580 160 L 568 162 L 555 163 L 542 164 L 528 165 L 512 166 L 498 167 L 482 168 L 468 168 L 452 168 L 435 168 L 418 169 L 400 170 L 382 171 L 365 172 L 348 173 L 330 174 L 312 174 L 295 174 L 278 173 L 262 172 L 248 172 L 235 172 L 222 172 L 210 172 L 200 173 L 190 174 L 178 175 L 165 176 L 155 176 L 145 176 L 135 176 L 125 175 L 118 175 Z";

// Item templates for internal restaurants (20 items each)
function mkInternalItems(seed, salesMatchPct) {
  const allItems = [
    {name:"Grilled Chicken Wrap",cat:"Hot Entree",price:8.99+seed*0.2,sales:1240000+seed*50000},
    {name:"Caesar Salad",cat:"CPG",price:7.49+seed*0.15,sales:820000+seed*30000},
    {name:"Iced Coffee",cat:"Cold Beverage",price:3.49+seed*0.1,sales:1890000+seed*40000},
    {name:"Chocolate Chip Cookie",cat:"Dessert",price:2.29+seed*0.05,sales:670000+seed*20000},
    {name:"Turkey Club Sandwich",cat:"Hot Entree",price:10.49+seed*0.3,sales:1560000+seed*60000},
    {name:"Sparkling Water",cat:"Cold Beverage",price:2.99+seed*0.08,sales:2210000+seed*35000},
    {name:"Trail Mix",cat:"Snacks",price:3.29+seed*0.12,sales:430000+seed*15000},
    {name:"BBQ Burger",cat:"Hot Entree",price:9.99+seed*0.25,sales:1980000+seed*70000},
    {name:"Lemonade",cat:"Cold Beverage",price:2.79+seed*0.07,sales:1120000+seed*25000},
    {name:"Brownie",cat:"Dessert",price:3.49+seed*0.1,sales:510000+seed*18000},
    {name:"Veggie Bowl",cat:"Hot Entree",price:8.49+seed*0.18,sales:940000+seed*32000},
    {name:"Chips & Dip",cat:"Snacks",price:2.19+seed*0.06,sales:1420000+seed*28000},
    {name:"Fish Tacos",cat:"Hot Entree",price:9.29+seed*0.22,sales:780000+seed*22000},
    {name:"Smoothie",cat:"Cold Beverage",price:4.99+seed*0.15,sales:1350000+seed*38000},
    {name:"Granola Bar",cat:"Snacks",price:3.19+seed*0.09,sales:610000+seed*16000},
    {name:"Pancake Stack",cat:"Breakfast",price:6.99+seed*0.2,sales:890000+seed*24000},
    {name:"Breakfast Burrito",cat:"Breakfast",price:7.49+seed*0.18,sales:1150000+seed*42000},
    {name:"French Fries",cat:"Sides",price:3.49+seed*0.08,sales:1780000+seed*55000},
    {name:"Coleslaw",cat:"Sides",price:2.49+seed*0.05,sales:320000+seed*10000},
    {name:"Energy Drink",cat:"Cold Beverage",price:3.99+seed*0.12,sales:920000+seed*27000},
  ];
  // ~20% underpriced (price < matchPrice), rest overpriced
  const brands=["Chick-fil-A","Subway","McDonald's","Panera Bread","Chipotle","Wendy's","Taco Bell"];
  return allItems.map((it,i)=>{
    const matched = i < 14; // 14 out of 20 matched
    const underpriced = i === 10 || i === 12 || i === 15; // 3 underpriced ~21%
    const mb = brands[i % brands.length];
    const mp = underpriced ? +(it.price + 0.5 + seed*0.1).toFixed(2) : +(it.price - 0.8 - seed*0.05).toFixed(2);
    return {
      ...it,
      price: +it.price.toFixed(2),
      sales: Math.round(it.sales),
      match: matched,
      matchBrand: matched ? mb : undefined,
      matchPrice: matched ? Math.max(1.49, mp) : undefined,
      matchCount: matched ? 1 + (i % 4) : 0,
    };
  });
}

// Coordinates well inside USA outline
const INTERNAL=[
  {id:"i1",name:"Boston Medical Center",lat:192,lng:618,segment:"Hospitals",salesMatchPct:72,items:mkInternalItems(0,72)},
  {id:"i2",name:"NYC Corporate Tower",lat:205,lng:608,segment:"Corporate Services",salesMatchPct:68,items:mkInternalItems(1,68)},
  {id:"i3",name:"Chicago HQ Plaza",lat:218,lng:458,segment:"Corporate Services",salesMatchPct:75,items:mkInternalItems(2,75)},
  {id:"i4",name:"Houston Medical Park",lat:348,lng:382,segment:"Hospitals",salesMatchPct:63,items:mkInternalItems(3,63)},
  {id:"i5",name:"LA University Campus",lat:282,lng:140,segment:"Universities",salesMatchPct:71,items:mkInternalItems(4,71)},
  {id:"i6",name:"Denver Government Bldg",lat:248,lng:290,segment:"Government",salesMatchPct:66,items:mkInternalItems(5,66)},
  {id:"i7",name:"Atlanta Health Campus",lat:305,lng:508,segment:"Hospitals",salesMatchPct:78,items:mkInternalItems(6,78)},
  {id:"i8",name:"Seattle Tech Center",lat:182,lng:160,segment:"Corporate Services",salesMatchPct:74,items:mkInternalItems(7,74)},
];

function mkExtItems(seed) {
  const base=[
    {name:"Classic Burger",cat:"Hot Entree",price:7.49+seed*0.3},
    {name:"Chicken Sandwich",cat:"Hot Entree",price:9.49+seed*0.2},
    {name:"Spicy Wrap",cat:"Hot Entree",price:8.29+seed*0.15},
    {name:"Grilled Chicken Salad",cat:"CPG",price:8.99+seed*0.1},
    {name:"Garden Salad",cat:"CPG",price:6.49+seed*0.12},
    {name:"Waffle Fries",cat:"Sides",price:3.29+seed*0.08},
    {name:"Onion Rings",cat:"Sides",price:3.99+seed*0.1},
    {name:"Sweet Potato Fries",cat:"Sides",price:4.29+seed*0.05},
    {name:"Cola",cat:"Cold Beverage",price:1.99+seed*0.05},
    {name:"Lemonade",cat:"Cold Beverage",price:2.59+seed*0.08},
    {name:"Iced Tea",cat:"Cold Beverage",price:2.29+seed*0.06},
    {name:"Milkshake",cat:"Cold Beverage",price:4.99+seed*0.15},
    {name:"Cookie",cat:"Dessert",price:1.99+seed*0.04},
    {name:"Brownie",cat:"Dessert",price:2.99+seed*0.07},
    {name:"Ice Cream Cup",cat:"Dessert",price:3.49+seed*0.1},
    {name:"Chips",cat:"Snacks",price:1.79+seed*0.03},
    {name:"Nachos",cat:"Snacks",price:4.49+seed*0.12},
    {name:"Pretzel Bites",cat:"Snacks",price:3.49+seed*0.09},
    {name:"Breakfast Sandwich",cat:"Breakfast",price:5.99+seed*0.18},
    {name:"Hash Browns",cat:"Breakfast",price:2.49+seed*0.05},
  ];
  return base.map(i=>({...i,price:+i.price.toFixed(2)}));
}

const mk=(id,n,lat,lng,b,seed,hasMatch=true)=>({id,name:n,lat,lng,brand:b,items:mkExtItems(seed),hasMatch});
const EXT=[
  // Boston area (near i1: 192,618)
  mk("e1","Chick-fil-A - Cambridge",182,628,"Chick-fil-A",0.1),
  mk("e2","Subway - Back Bay",202,625,"Subway",0.2),
  mk("e3","Panera - Fenway",185,608,"Panera Bread",0.3),
  mk("e4","McDonald's - Dorchester",200,622,"McDonald's",0.15),
  mk("e5","Wendy's - Brookline",188,630,"Wendy's",0.25),
  mk("e51","Panda Express - Allston",196,632,"Panda Express",0.4,false),
  mk("e52","Five Guys - Somerville",184,612,"Five Guys",0.35,false),
  // NYC area (near i2: 205,608)
  mk("e6","Subway - Manhattan",215,618,"Subway",0.5),
  mk("e7","Chipotle - Midtown",198,598,"Chipotle",0.6),
  mk("e8","Panera - Brooklyn",218,602,"Panera Bread",0.45),
  mk("e9","Taco Bell - Queens",198,620,"Taco Bell",0.55),
  mk("e10","Chick-fil-A - Jersey City",218,596,"Chick-fil-A",0.65),
  mk("e53","Five Guys - SoHo",210,612,"Five Guys",0.7,false),
  mk("e54","Panda Express - Flushing",195,618,"Panda Express",0.5,false),
  // Chicago area (near i3: 218,458)
  mk("e11","McDonald's - Loop",208,468,"McDonald's",0.3),
  mk("e12","Chick-fil-A - Wicker Park",228,448,"Chick-fil-A",0.4),
  mk("e13","Wendy's - Lincoln Park",208,448,"Wendy's",0.35),
  mk("e14","Subway - Lakeview",230,465,"Subway",0.45),
  mk("e15","Taco Bell - South Loop",230,472,"Taco Bell",0.5),
  mk("e55","Panda Express - Chinatown",222,460,"Panda Express",0.55,false),
  mk("e56","Five Guys - River North",212,452,"Five Guys",0.6,false),
  // Houston area (near i4: 348,382)
  mk("e16","Chipotle - Houston",358,392,"Chipotle",0.2),
  mk("e17","Subway - Galleria",340,372,"Subway",0.3),
  mk("e18","Wendy's - Katy",355,370,"Wendy's",0.35),
  mk("e19","McDonald's - Montrose",340,390,"McDonald's",0.25),
  mk("e20","Taco Bell - Sugar Land",360,378,"Taco Bell",0.4),
  mk("e57","Panda Express - Katy",345,375,"Panda Express",0.45,false),
  mk("e58","Five Guys - Midtown HOU",352,395,"Five Guys",0.5,false),
  // LA area (near i5: 282,140)
  mk("e21","Chipotle - Santa Monica",292,132,"Chipotle",0.15),
  mk("e22","McDonald's - Hollywood",272,150,"McDonald's",0.25),
  mk("e23","Panera - Westwood",295,148,"Panera Bread",0.3),
  mk("e24","Subway - Venice",275,132,"Subway",0.2),
  mk("e25","Taco Bell - Culver City",298,138,"Taco Bell",0.35),
  mk("e59","Five Guys - Westfield",285,148,"Five Guys",0.4,false),
  // Denver area (near i6: 248,290)
  mk("e26","McDonald's - Denver DT",258,280,"McDonald's",0.3),
  mk("e27","Chipotle - LoDo",238,298,"Chipotle",0.4),
  mk("e28","Subway - Capitol Hill",255,300,"Subway",0.35),
  mk("e29","Wendy's - Aurora",238,278,"Wendy's",0.45),
  mk("e30","Chick-fil-A - Highlands Ranch",260,295,"Chick-fil-A",0.5),
  mk("e60","Panda Express - Lakewood",245,282,"Panda Express",0.55,false),
  mk("e61","Five Guys - Cherry Creek",252,292,"Five Guys",0.6,false),
  // Atlanta area (near i7: 305,508)
  mk("e31","Chick-fil-A - Buckhead",295,518,"Chick-fil-A",0.2),
  mk("e32","McDonald's - Midtown ATL",315,500,"McDonald's",0.3),
  mk("e33","Subway - Decatur",298,520,"Subway",0.35),
  mk("e34","Wendy's - Marietta",318,498,"Wendy's",0.4),
  mk("e35","Panera - Sandy Springs",315,518,"Panera Bread",0.45),
  mk("e62","Panda Express - Decatur",308,515,"Panda Express",0.5,false),
  mk("e63","Five Guys - Midtown ATL",312,502,"Five Guys",0.55,false),
  // Seattle area (near i8: 182,160)
  mk("e36","Chipotle - Capitol Hill SEA",175,170,"Chipotle",0.25),
  mk("e37","Subway - Pioneer Sq",192,152,"Subway",0.3),
  mk("e38","Panera - Bellevue",178,172,"Panera Bread",0.35),
  mk("e39","Taco Bell - Renton",195,165,"Taco Bell",0.4),
  mk("e40","Wendy's - Redmond",176,150,"Wendy's",0.45),
  mk("e64","Panda Express - U-District",188,162,"Panda Express",0.5,false),
  mk("e65","Five Guys - Bellevue",180,175,"Five Guys",0.55,false),
];

function Badge({children,color=C.accent}){return <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,background:color+"15",color,fontSize:10,fontWeight:600}}>{children}</span>;}
function Sel({label,value,onChange,options}){return(<div><div style={{fontSize:9,fontWeight:700,color:C.textDim,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>{label}</div><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"5px 6px",borderRadius:4,border:"1px solid "+C.filterBorder,background:"#fff",color:C.text,fontSize:11,outline:"none",cursor:"pointer"}}>{options.map(o=><option key={o}>{o}</option>)}</select></div>);}
function dist(a,b){return Math.sqrt((a.lat-b.lat)**2+(a.lng-b.lng)**2);}
const NEARBY=60;

function FiscalDropdown({selected,setSelected}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const toggleYear=y=>{const months=FISCAL_DATA[y];const keys=months.map(m=>y+"-"+m);const allSel=keys.every(k=>selected.includes(k));if(allSel)setSelected(selected.filter(k=>!keys.includes(k)));else setSelected([...new Set([...selected,...keys])]);};
  const toggleMonth=(y,m)=>{const k=y+"-"+m;setSelected(selected.includes(k)?selected.filter(x=>x!==k):[...selected,k]);};
  const label=selected.length===0?"Select periods":selected.length+" period"+(selected.length>1?"s":"");
  return(
    <div ref={ref} style={{position:"relative"}}>
      <div style={{fontSize:9,fontWeight:700,color:C.textDim,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>Fiscal Period</div>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"5px 6px",borderRadius:4,border:"1px solid "+C.filterBorder,background:"#fff",color:C.text,fontSize:11,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{label}</span><span style={{fontSize:8,color:C.textDim}}>{open?"▲":"▼"}</span>
      </button>
      {open&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:100,background:"#fff",border:"1px solid "+C.filterBorder,borderRadius:4,maxHeight:220,overflowY:"auto",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginTop:2}}>
        {Object.entries(FISCAL_DATA).map(([year,months])=>{
          const keys=months.map(m=>year+"-"+m);const allSel=keys.every(k=>selected.includes(k));const someSel=keys.some(k=>selected.includes(k));
          return(<div key={year}>
            <label style={{display:"flex",alignItems:"center",gap:5,padding:"5px 8px",cursor:"pointer",fontSize:11,fontWeight:700,background:"#fafafc",borderBottom:"1px solid "+C.borderLight}}>
              <input type="checkbox" checked={allSel} ref={el=>{if(el)el.indeterminate=someSel&&!allSel;}} onChange={()=>toggleYear(year)} style={{width:12,height:12}}/>{year}
            </label>
            <div style={{display:"flex",flexWrap:"wrap",padding:"4px 8px 6px 22px",gap:2}}>
              {months.map(m=>{const k=year+"-"+m;const isSel=selected.includes(k);
                return <button key={k} onClick={()=>toggleMonth(year,m)} style={{padding:"2px 6px",borderRadius:3,border:"1px solid "+(isSel?C.accent:C.filterBorder),background:isSel?C.accent+"18":"#fff",color:isSel?C.accent:C.textDim,fontSize:9,fontWeight:600,cursor:"pointer"}}>{m}</button>;})}
            </div>
          </div>);
        })}
      </div>}
    </div>
  );
}

function InfoTooltip({text}){
  const [show,setShow]=useState(false);
  return(
    <span style={{position:"relative",display:"inline-block",marginLeft:4}}>
      <span onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:13,height:13,borderRadius:"50%",background:C.accent+"20",color:C.accent,fontSize:8,fontWeight:700,cursor:"help"}}>i</span>
      {show&&<div style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",marginBottom:4,background:C.text,color:"#fff",padding:"6px 10px",borderRadius:5,fontSize:10,width:180,lineHeight:1.4,zIndex:200,boxShadow:"0 2px 8px rgba(0,0,0,0.2)",pointerEvents:"none",textAlign:"left"}}>{text}<div style={{position:"absolute",top:"100%",left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:"5px solid "+C.text}}/></div>}
    </span>
  );
}

function ZoomMap({fI,fE,selected,setSelected,hov,setHov}){
  const ref=useRef(null);
  const [vb,setVb]=useState({x:70,y:140,w:640,h:290});
  const [pan,setPan]=useState(null);
  const hw=useCallback(e=>{e.preventDefault();const s=ref.current;if(!s)return;const r=s.getBoundingClientRect();const mx=(e.clientX-r.left)/r.width,my=(e.clientY-r.top)/r.height;const f=e.deltaY>0?1.12:0.89;setVb(v=>{const nw=Math.min(700,Math.max(60,v.w*f)),nh=Math.min(310,Math.max(30,v.h*f));return{x:v.x+(v.w-nw)*mx,y:v.y+(v.h-nh)*my,w:nw,h:nh};});},[]);
  useEffect(()=>{const s=ref.current;if(!s)return;s.addEventListener("wheel",hw,{passive:false});return()=>s.removeEventListener("wheel",hw);},[hw]);
  const onD=e=>{if(e.target.closest("[data-pin]"))return;setPan({sx:e.clientX,sy:e.clientY,vx:vb.x,vy:vb.y});};
  const onM=e=>{if(!pan)return;const s=ref.current;if(!s)return;const r=s.getBoundingClientRect();setVb(v=>({...v,x:pan.vx-(e.clientX-pan.sx)/r.width*v.w,y:pan.vy-(e.clientY-pan.sy)/r.height*v.h}));};
  const onU=()=>setPan(null);
  const pr=Math.max(2,vb.w/140),fs=Math.max(5.5,vb.w/95);
  const zoomed=vb.w<250;
  const labelFs=Math.max(3,vb.w/110);
  const vis=r=>r.lng>=vb.x-10&&r.lng<=vb.x+vb.w+10&&r.lat>=vb.y-10&&r.lat<=vb.y+vb.h+10;
  return(
    <svg ref={ref} viewBox={vb.x+" "+vb.y+" "+vb.w+" "+vb.h} style={{width:"100%",height:"100%",cursor:pan?"grabbing":"grab",touchAction:"none"}} preserveAspectRatio="xMidYMid meet" onPointerDown={onD} onPointerMove={onM} onPointerUp={onU} onPointerLeave={onU}>
      <rect x="0" y="0" width="800" height="500" fill="#f0f0f6"/>
      <path d={US} fill="#e6e4f0" stroke="#b8b4cc" strokeWidth={Math.max(0.4,vb.w/800)} strokeLinejoin="round"/>
      {fE.map(r=>{const s=selected===r.id,h=hov===r.id,v=vis(r);return(
        <g key={r.id} data-pin style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSelected(r.id);}} onMouseEnter={()=>setHov(r.id)} onMouseLeave={()=>setHov(null)}>
          <rect x={r.lng-pr*0.55} y={r.lat-pr*0.55} width={pr*1.1} height={pr*1.1} rx={0.4} fill={s?C.external:r.hasMatch===false?C.external+"44":C.external+"88"} stroke={s?"#333":C.external} strokeWidth={s?1:0.3} transform={"rotate(45,"+r.lng+","+r.lat+")"}/>
          {h&&<g><rect x={r.lng+pr+2} y={r.lat-fs*0.65} width={r.name.length*fs*0.46+6} height={fs*1.4} rx={2} fill="#fff" stroke="#ddd" strokeWidth={0.3}/><text x={r.lng+pr+5} y={r.lat+fs*0.28} fill={C.text} fontSize={fs} fontFamily={font}>{r.name}</text></g>}
          {zoomed&&!h&&v&&<text x={r.lng+pr+2} y={r.lat+labelFs*0.3} fill={C.external} fontSize={labelFs} fontFamily={font} opacity="0.8" style={{pointerEvents:"none"}}>{r.brand}</text>}
        </g>);})}
      {fI.map(r=>{const s=selected===r.id,h=hov===r.id,v=vis(r);return(
        <g key={r.id} data-pin style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSelected(r.id);}} onMouseEnter={()=>setHov(r.id)} onMouseLeave={()=>setHov(null)}>
          <circle cx={r.lng} cy={r.lat} r={s?pr*1.5:pr} fill={s?C.internal:C.internal+"cc"} stroke={s?"#333":"#fff"} strokeWidth={s?1:0.5}/>
          {h&&<g><rect x={r.lng+pr+2} y={r.lat-fs*0.65} width={r.name.length*fs*0.46+6} height={fs*1.4} rx={2} fill="#fff" stroke="#ddd" strokeWidth={0.3}/><text x={r.lng+pr+5} y={r.lat+fs*0.28} fill={C.text} fontSize={fs} fontFamily={font}>{r.name}</text></g>}
          {zoomed&&!h&&v&&<text x={r.lng+pr+2} y={r.lat-pr-1} fill={C.internal} fontSize={labelFs*1.15} fontWeight="700" fontFamily={font} style={{pointerEvents:"none"}}>{r.name}</text>}
        </g>);})}
    </svg>
  );
}

const NAV=[
  {id:"home",label:"Map Explorer",d:"M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"},
  {id:"local",label:"Local Market Basket",d:"M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"},
  {id:"brand",label:"Compare to a Brand",d:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},
  {id:"item",label:"Compare Pricing Groups",d:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},
  {id:"tiers",label:"Review Pricing Tiers",d:"M4 6h16M4 10h16M4 14h16M4 18h16"},
  {id:"alerts",label:"Pricing Alerts",d:"M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.96l-6.93-12a2 2 0 00-3.5 0l-6.93 12A2 2 0 005.07 19z"},
];

function HierarchyTable({items,isInt}){
  const cats=useMemo(()=>{
    const map={};(items||[]).forEach(it=>{if(!map[it.cat])map[it.cat]=[];map[it.cat].push(it);});return Object.entries(map);
  },[items]);
  const [expanded,setExpanded]=useState({});
  useEffect(()=>{const obj={};cats.forEach(([c])=>{obj[c]=true;});setExpanded(obj);},[cats.length]);
  const toggle=c=>setExpanded(p=>({...p,[c]:!p[c]}));
  if(!items||items.length===0)return null;
  const sn=(v,d=0)=>typeof v==="number"&&!isNaN(v)?v:d;
  const th={padding:"7px 10px",textAlign:"left",color:C.textDim,fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:0.4,borderBottom:"2px solid "+C.border};
  const td={padding:"4px 10px",borderBottom:"1px solid "+C.borderLight,fontSize:11};
  const gapEl=v=>{if(v==null)return "—";return (v>0?"+":"")+v.toFixed(1)+"%";};
  const gapColor=v=>{if(v==null)return C.textDim;return v>0?C.danger:C.success;};

  if(!isInt){
    const rows=[];
    cats.forEach(([cat,ci])=>{
      rows.push({key:"c_"+cat,t:"cat",name:cat,count:ci.length});
      if(expanded[cat])ci.forEach((it,i)=>{rows.push({key:"i_"+cat+i,t:"item",name:it.name,price:it.price,cat:it.cat});});
    });
    return(
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th style={th}>Category / Item</th><th style={{...th,textAlign:"right"}}>Price</th></tr></thead>
        <tbody>{rows.map(r=>
          r.t==="cat"
            ? <tr key={r.key} onClick={()=>toggle(r.name)} style={{cursor:"pointer",background:"#fafafc"}}><td style={{...td,fontWeight:600,fontSize:11}}><span style={{marginRight:6,fontSize:9,color:C.textDim}}>{expanded[r.name]?"▼":"▶"}</span>{r.name} <span style={{color:C.textDim,fontWeight:400,fontSize:10}}>({r.count})</span></td><td style={{...td,textAlign:"right",color:C.textDim}}>—</td></tr>
            : <tr key={r.key}><td style={{...td,paddingLeft:28}}>{r.name}</td><td style={{...td,textAlign:"right",fontWeight:600}}>${r.price.toFixed(2)}</td></tr>
        )}</tbody>
      </table>
    );
  }

  // Internal
  const totalSales=items.reduce((a,i)=>a+sn(i.sales),0);
  const totalMatches=items.reduce((a,i)=>a+sn(i.matchCount),0);
  const mfg=items.filter(i=>i.match&&i.matchPrice);
  const ms=mfg.reduce((a,i)=>a+sn(i.sales),0);
  const totalGap=ms>0?mfg.reduce((a,i)=>a+((i.price-i.matchPrice)/i.matchPrice*100)*sn(i.sales),0)/ms:null;

  const rows=[];
  rows.push({key:"__t",t:"total",sales:totalSales,matches:totalMatches,gap:totalGap});
  cats.forEach(([cat,ci])=>{
    const cs=ci.reduce((a,i)=>a+sn(i.sales),0);
    const cm=ci.reduce((a,i)=>a+sn(i.matchCount),0);
    const cmf=ci.filter(i=>i.match&&i.matchPrice);
    const cms=cmf.reduce((a,i)=>a+sn(i.sales),0);
    const cg=cms>0?cmf.reduce((a,i)=>a+((i.price-i.matchPrice)/i.matchPrice*100)*sn(i.sales),0)/cms:null;
    rows.push({key:"c_"+cat,t:"cat",name:cat,count:ci.length,sales:cs,matches:cm,gap:cg});
    if(expanded[cat])ci.forEach((it,i)=>{
      const ig=it.match&&it.matchPrice?(it.price-it.matchPrice)/it.matchPrice*100:null;
      rows.push({key:"i_"+cat+i,t:"item",name:it.name,sales:sn(it.sales),price:it.price,matches:sn(it.matchCount),gap:ig});
    });
  });

  return(
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead><tr><th style={th}>Category / Item</th><th style={{...th,textAlign:"right"}}>Sales</th><th style={{...th,textAlign:"right"}}>Price</th><th style={{...th,textAlign:"center"}}>Matches</th><th style={{...th,textAlign:"right"}}>Underpriced</th></tr></thead>
      <tbody>{rows.map(r=>{
        if(r.t==="total")return(<tr key={r.key} style={{background:"#f0eef8"}}><td style={{...td,fontWeight:700,fontSize:11,color:C.accent}}>TOTAL</td><td style={{...td,textAlign:"right",fontWeight:700,fontSize:11}}>${(r.sales/1e6).toFixed(1)}M</td><td style={{...td,textAlign:"right"}}>—</td><td style={{...td,textAlign:"center"}}><span style={{background:C.success+"18",color:C.success,padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:700}}>{r.matches}</span></td><td style={{...td,textAlign:"right",color:gapColor(r.gap),fontWeight:600,fontSize:11}}>{gapEl(r.gap)}</td></tr>);
        if(r.t==="cat")return(<tr key={r.key} onClick={()=>toggle(r.name)} style={{cursor:"pointer",background:"#fafafc"}}><td style={{...td,fontWeight:600,fontSize:11}}><span style={{marginRight:6,fontSize:9,color:C.textDim}}>{expanded[r.name]?"▼":"▶"}</span>{r.name} <span style={{color:C.textDim,fontWeight:400,fontSize:10}}>({r.count})</span></td><td style={{...td,textAlign:"right",fontWeight:600,fontSize:11}}>${(r.sales/1e6).toFixed(1)}M</td><td style={{...td,textAlign:"right",color:C.textDim}}>—</td><td style={{...td,textAlign:"center"}}><span style={{background:r.matches>0?C.success+"18":"transparent",color:r.matches>0?C.success:C.textDim,padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:700}}>{r.matches}</span></td><td style={{...td,textAlign:"right",color:gapColor(r.gap),fontWeight:600,fontSize:11}}>{gapEl(r.gap)}</td></tr>);
        return(<tr key={r.key}><td style={{...td,paddingLeft:28}}>{r.name}</td><td style={{...td,textAlign:"right",color:C.textDim,fontSize:10}}>${(r.sales/1e6).toFixed(2)}M</td><td style={{...td,textAlign:"right",fontWeight:600}}>${r.price.toFixed(2)}</td><td style={{...td,textAlign:"center"}}>{r.matches>0?<span style={{color:C.success,fontWeight:600,fontSize:10}}>{r.matches}</span>:<span style={{color:C.textDim,fontSize:10}}>0</span>}</td><td style={{...td,textAlign:"right",color:gapColor(r.gap),fontWeight:600,fontSize:11}}>{gapEl(r.gap)}</td></tr>);
      })}</tbody>
    </table>
  );
}

export default function App(){
  const [page,setPage]=useState("home");
  const [selected,setSelected]=useState(null);
  const [segment,setSegment]=useState("All");
  const [brand,setBrand]=useState("All");
  const [category,setCategory]=useState("All");
  const [profitCenter,setProfitCenter]=useState("All");
  const [fiscalSel,setFiscalSel]=useState(["2026-Jan","2026-Feb","2026-Mar"]);
  const [search,setSearch]=useState("");
  const [matchesOnly,setMatchesOnly]=useState(false);
  const [hov,setHov]=useState(null);
  const [selBench,setSelBench]=useState(null);
  const [selBrand,setSelBrand]=useState("Chick-fil-A");
  const [selItem,setSelItem]=useState("BBQ Burger");

  const pcOpts=["All",...INTERNAL.map(r=>r.name)];
  const fI=INTERNAL.filter(r=>(segment==="All"||r.segment===segment)&&(profitCenter==="All"||r.name===profitCenter)&&(search===""||r.items.some(i=>i.name.toLowerCase().includes(search.toLowerCase()))));
  const fE=EXT.filter(r=>{
    if(brand!=="All"&&r.brand!==brand)return false;
    if(search!==""&&!r.items.some(i=>i.name.toLowerCase().includes(search.toLowerCase())))return false;
    if(matchesOnly&&r.hasMatch===false)return false;
    if(fI.length<INTERNAL.length){if(!fI.some(ir=>dist(ir,r)<=NEARBY))return false;}
    return true;
  });

  const selR=selected?[...INTERNAL,...EXT].find(r=>r.id===selected):null;
  const isInt=selected?.startsWith("i");
  const getItems=()=>{if(!selR)return[];let it=selR.items;if(category!=="All")it=it.filter(i=>i.cat===category);if(search)it=it.filter(i=>i.name.toLowerCase().includes(search.toLowerCase()));return it;};
  const allItems=[...new Set(INTERNAL.flatMap(r=>r.items.map(i=>i.name)))];

  const matchedItems=fI.flatMap(r=>r.items).filter(i=>i.match);
  const underpricedCount=matchedItems.filter(i=>i.matchPrice&&i.price<i.matchPrice).length;
  const underpricedPct=matchedItems.length>0?Math.round(underpricedCount/matchedItems.length*100):0;
  const comparedCount=matchedItems.length;
  const salesCompared=matchedItems.reduce((a,i)=>a+i.sales,0);

  const pageWrap={fontFamily:font,background:C.bg,color:C.text,minHeight:"100vh",padding:24};
  const backBtn=<button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:13,marginBottom:14,padding:0,fontWeight:600}}>{"← Back to Explorer"}</button>;
  const thS2={padding:"8px 10px",textAlign:"left",color:C.textDim,fontWeight:700,fontSize:9,textTransform:"uppercase",borderBottom:"2px solid "+C.border};
  const tdS2={padding:"7px 10px",borderBottom:"1px solid "+C.borderLight,fontSize:12};

  if(page==="local"){
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>Local Market Basket</h2>
      <p style={{color:C.textDim,fontSize:12,marginBottom:16}}>{selBench?"Basket: "+INTERNAL.find(r=>r.id===selBench)?.name:"Select an internal restaurant."}</p>
      {!selBench?<div style={{display:"flex",flexWrap:"wrap",gap:8}}>{INTERNAL.map(r=><button key={r.id} onClick={()=>setSelBench(r.id)} style={{padding:"8px 14px",borderRadius:6,border:"1px solid "+C.border,background:"#fff",color:C.text,cursor:"pointer",fontSize:12}}>{r.name}</button>)}</div>
      :<div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={thS2}>Item</th><th style={{...thS2,textAlign:"right"}}>Sales</th><th style={{...thS2,textAlign:"right"}}>Your Price</th><th style={thS2}>Competitor</th><th style={{...thS2,textAlign:"right"}}>Their Price</th><th style={{...thS2,textAlign:"right"}}>Gap</th></tr></thead><tbody>
        {INTERNAL.find(r=>r.id===selBench)?.items.filter(i=>i.match).map((it,idx)=>{const g=((it.price-it.matchPrice)/it.matchPrice*100);return(<tr key={idx}><td style={{...tdS2,fontWeight:500}}>{it.name}</td><td style={{...tdS2,textAlign:"right"}}>${(it.sales/1e6).toFixed(2)}M</td><td style={{...tdS2,textAlign:"right"}}>${it.price.toFixed(2)}</td><td style={tdS2}><Badge color={C.external}>{it.matchBrand}</Badge></td><td style={{...tdS2,textAlign:"right"}}>${it.matchPrice.toFixed(2)}</td><td style={{...tdS2,textAlign:"right",color:g>0?C.danger:C.success,fontWeight:600}}>{(g>0?"+":"")+g.toFixed(1)}%</td></tr>);})}</tbody></table></div>}</div>);
  }
  if(page==="brand"){
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>Compare to a Brand</h2>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{BRANDS.slice(1).map(b=><button key={b} onClick={()=>setSelBrand(b)} style={{padding:"5px 11px",borderRadius:5,border:"1px solid "+(selBrand===b?C.external:C.border),background:selBrand===b?C.external+"15":"#fff",color:selBrand===b?C.external:C.text,cursor:"pointer",fontSize:11,fontWeight:600}}>{b}</button>)}</div>
      <div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={thS2}>Restaurant</th><th style={thS2}>Item</th><th style={{...thS2,textAlign:"right"}}>Your Price</th><th style={{...thS2,textAlign:"right"}}>{selBrand}</th><th style={{...thS2,textAlign:"right"}}>Gap</th></tr></thead><tbody>
        {INTERNAL.flatMap(r=>r.items.filter(i=>i.match&&i.matchBrand===selBrand).map((it,idx)=>{const g=((it.price-it.matchPrice)/it.matchPrice*100);return(<tr key={r.id+idx}><td style={tdS2}>{r.name}</td><td style={{...tdS2,fontWeight:500}}>{it.name}</td><td style={{...tdS2,textAlign:"right"}}>${it.price.toFixed(2)}</td><td style={{...tdS2,textAlign:"right"}}>${it.matchPrice.toFixed(2)}</td><td style={{...tdS2,textAlign:"right",color:g>0?C.danger:C.success,fontWeight:600}}>{(g>0?"+":"")+g.toFixed(1)}%</td></tr>);}))}</tbody></table></div></div>);
  }
  if(page==="item"){
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>Compare Pricing Groups</h2>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{allItems.slice(0,12).map(it=><button key={it} onClick={()=>setSelItem(it)} style={{padding:"5px 11px",borderRadius:5,border:"1px solid "+(selItem===it?C.accent:C.border),background:selItem===it?C.accent+"15":"#fff",color:selItem===it?C.accent:C.text,cursor:"pointer",fontSize:11,fontWeight:500}}>{it}</button>)}</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{INTERNAL.filter(r=>r.items.some(i=>i.name===selItem)).map(r=>{const it=r.items.find(i=>i.name===selItem);const g=it.match&&it.matchPrice?(it.price-it.matchPrice)/it.matchPrice*100:null;return(<div key={r.id} style={{background:"#fff",borderRadius:8,padding:14,minWidth:170,border:"1px solid "+C.border}}><div style={{fontSize:11,color:C.textDim,marginBottom:4}}>{r.name}</div><div style={{fontSize:20,fontWeight:700,color:C.accent}}>${it.price.toFixed(2)}</div><div style={{fontSize:10,color:C.textDim}}>Sales: ${(it.sales/1e6).toFixed(2)}M</div>{g!=null&&<div style={{marginTop:4,fontSize:10,color:g>0?C.danger:C.success,fontWeight:600}}>vs {it.matchBrand}: {(g>0?"+":"")+g.toFixed(1)}%</div>}</div>);})}</div></div>);
  }
  if(page==="tiers"){
    const tiers=["Premium","Standard","Value"];
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>Review Pricing Tiers</h2>
      <div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={thS2}>Restaurant</th><th style={thS2}>Segment</th><th style={thS2}>Tier</th><th style={thS2}>Coef</th><th style={thS2}>Index</th></tr></thead><tbody>
        {INTERNAL.map((r,idx)=>{const t=tiers[idx%3],co=t==="Premium"?1.15:t==="Standard"?1.0:0.88;return(<tr key={r.id}><td style={{...tdS2,fontWeight:500}}>{r.name}</td><td style={tdS2}><Badge>{r.segment}</Badge></td><td style={tdS2}><Badge color={t==="Premium"?C.success:t==="Value"?C.warning:C.accent}>{t}</Badge></td><td style={{...tdS2,fontWeight:600}}>{"×"+co.toFixed(2)}</td><td style={tdS2}>{95+idx*3}</td></tr>);})}</tbody></table></div></div>);
  }
  if(page==="alerts"){
    const al=INTERNAL.flatMap(r=>r.items.filter(i=>i.match&&i.matchPrice).map(i=>({rest:r.name,item:i.name,price:i.price,sales:i.sales,comp:i.matchBrand,cp:i.matchPrice,gap:((i.price-i.matchPrice)/i.matchPrice*100)}))).sort((a,b)=>Math.abs(b.gap)-Math.abs(a.gap)).slice(0,30);
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>Pricing Outliers</h2>
      <div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr><th style={thS2}>#</th><th style={thS2}>Restaurant</th><th style={thS2}>Item</th><th style={{...thS2,textAlign:"right"}}>Sales</th><th style={{...thS2,textAlign:"right"}}>Price</th><th style={thS2}>Competitor</th><th style={{...thS2,textAlign:"right"}}>Gap</th></tr></thead><tbody>
        {al.map((a,i)=><tr key={i} style={{background:i<3?"#fef2f2":"transparent"}}><td style={tdS2}>{i<3?<span style={{color:C.danger,fontWeight:700}}>{i+1}</span>:<span style={{color:C.textDim}}>{i+1}</span>}</td><td style={tdS2}>{a.rest}</td><td style={{...tdS2,fontWeight:500}}>{a.item}</td><td style={{...tdS2,textAlign:"right"}}>${(a.sales/1e6).toFixed(2)}M</td><td style={{...tdS2,textAlign:"right"}}>${a.price.toFixed(2)}</td><td style={tdS2}><Badge color={C.external}>{a.comp}</Badge> ${a.cp.toFixed(2)}</td><td style={{...tdS2,textAlign:"right",color:a.gap>0?C.danger:C.success,fontWeight:600}}>{(a.gap>0?"+":"")+a.gap.toFixed(1)}%</td></tr>)}</tbody></table></div></div>);
  }

  if(page==="matches"){
    const allMatches=INTERNAL.flatMap(r=>r.items.filter(i=>i.match&&i.matchPrice).map(i=>({rest:r.name,item:i.name,cat:i.cat,price:i.price,sales:i.sales,brand:i.matchBrand,extPrice:i.matchPrice,gap:((i.price-i.matchPrice)/i.matchPrice*100)})));
    return(<div style={pageWrap}>{backBtn}<h2 style={{fontSize:18,fontWeight:700,margin:"0 0 6px"}}>All Matched Items</h2>
      <p style={{color:C.textDim,fontSize:12,marginBottom:14}}>{allMatches.length} items matched across {INTERNAL.length} locations.</p>
      <div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden",maxHeight:"70vh",overflowY:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{position:"sticky",top:0,background:"#fff"}}><th style={thS2}>Restaurant</th><th style={thS2}>Item</th><th style={thS2}>Category</th><th style={{...thS2,textAlign:"right"}}>Sales</th><th style={{...thS2,textAlign:"right"}}>Our Price</th><th style={thS2}>Matched Brand</th><th style={{...thS2,textAlign:"right"}}>Their Price</th><th style={{...thS2,textAlign:"right"}}>Gap</th></tr></thead><tbody>
        {allMatches.map((m,i)=><tr key={i}><td style={tdS2}>{m.rest}</td><td style={{...tdS2,fontWeight:500}}>{m.item}</td><td style={tdS2}><Badge color={C.textDim}>{m.cat}</Badge></td><td style={{...tdS2,textAlign:"right"}}>${(m.sales/1e6).toFixed(2)}M</td><td style={{...tdS2,textAlign:"right"}}>${m.price.toFixed(2)}</td><td style={tdS2}><Badge color={C.external}>{m.brand}</Badge></td><td style={{...tdS2,textAlign:"right"}}>${m.extPrice.toFixed(2)}</td><td style={{...tdS2,textAlign:"right",color:m.gap>0?C.danger:C.success,fontWeight:600}}>{(m.gap>0?"+":"")+m.gap.toFixed(1)}%</td></tr>)}</tbody></table></div></div>);
  }

  return(
    <div style={{fontFamily:font,background:C.bg,color:C.text,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:C.topBar,padding:"12px 20px",flexShrink:0,textAlign:"center"}}>
        <span style={{color:"#fff",fontSize:20,fontWeight:700,letterSpacing:0.5}}>Price Positioning</span>
      </div>
      <div style={{display:"flex",flex:1,minHeight:0}}>
        <div style={{width:82,flexShrink:0,background:C.navBg,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:12,gap:4}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)} title={n.label}
              style={{width:72,height:68,borderRadius:8,border:"none",background:page===n.id?C.navActive+"30":"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={page===n.id?C.navActive:C.navIcon} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={n.d}/></svg>
              <span style={{fontSize:8,color:page===n.id?C.navActive:"#ccc",fontWeight:600,textAlign:"center",lineHeight:1.2,maxWidth:68}}>{n.label}</span>
            </button>
          ))}
        </div>

        <div style={{width:195,flexShrink:0,borderRight:"1px solid "+C.border,background:C.filterBg,padding:"10px 10px",display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text}}>Filters</div>
          <Sel label="Segment" value={segment} onChange={setSegment} options={SEGMENTS}/>
          <Sel label="Profit Center" value={profitCenter} onChange={setProfitCenter} options={pcOpts}/>
          <Sel label="External Brand" value={brand} onChange={setBrand} options={BRANDS}/>
          <Sel label="Category" value={category} onChange={setCategory} options={CATEGORIES}/>
          <FiscalDropdown selected={fiscalSel} setSelected={setFiscalSel}/>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:C.textDim,textTransform:"uppercase",letterSpacing:0.8,marginBottom:3}}>Search Product</div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="e.g. Burger..." style={{width:"100%",padding:"5px 7px",borderRadius:4,border:"1px solid "+C.filterBorder,background:"#fff",color:C.text,fontSize:11,boxSizing:"border-box",outline:"none"}}/>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:6,fontSize:11,cursor:"pointer",marginTop:2}}>
            <input type="checkbox" checked={matchesOnly} onChange={e=>setMatchesOnly(e.target.checked)} style={{width:13,height:13}}/>
            <span>Matches only</span>
            <InfoTooltip text="Filters out external restaurants where no items are matched to our internal items."/>
          </label>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden",background:"#fff"}}>
          <div style={{display:"flex",gap:0,borderBottom:"1px solid "+C.border,flexShrink:0}}>
            {[
              {icon:"internal",val:fI.length,label:"Internal Locations"},
              {icon:"external",val:fE.length,label:"External Locations"},
              {val:underpricedPct+"%",label:"Underpriced",color:underpricedPct>40?C.success:C.danger},
              {val:comparedCount,label:"Items Compared",link:true},
              {val:"$"+(salesCompared/1e6).toFixed(1)+"M",label:"Sales Compared"},
            ].map((k,i)=>(
              <div key={i} style={{flex:1,padding:"8px 14px",borderRight:i<4?"1px solid "+C.border:"none",display:"flex",alignItems:"center",gap:8}}>
                {k.icon==="internal"&&<div style={{width:10,height:10,borderRadius:"50%",background:C.internal}}/>}
                {k.icon==="external"&&<div style={{width:10,height:10,borderRadius:2,background:C.external,transform:"rotate(45deg)"}}/>}
                <div><div style={{fontSize:17,fontWeight:700,color:k.color||C.text}}>{k.val}</div><div style={{fontSize:8,color:C.textDim,fontWeight:600,textTransform:"uppercase",letterSpacing:0.4}}>{k.label}{k.link&&<span onClick={()=>setPage("matches")} style={{marginLeft:4,color:C.accent,cursor:"pointer",fontSize:9,fontWeight:600,textTransform:"none"}}>view all →</span>}</div></div>
              </div>
            ))}
          </div>

          <div style={{flex:"1 1 48%",minHeight:150,borderBottom:"1px solid "+C.border,background:"#f6f6fa",position:"relative"}}>
            <ZoomMap fI={fI} fE={fE} selected={selected} setSelected={setSelected} hov={hov} setHov={setHov}/>
            <div style={{position:"absolute",bottom:6,right:10,fontSize:9,color:C.textDim,opacity:0.5}}>Scroll to zoom · Drag to pan</div>
          </div>

          <div style={{flex:"1 1 38%",overflowY:"auto",padding:12,background:"#fff"}}>
            {!selected?(
              <div style={{textAlign:"center",padding:24,color:C.textDim}}>
                <div style={{fontSize:13,fontWeight:500}}>Click a pin on the map to see restaurant data</div>
                <div style={{fontSize:11,marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:"50%",background:C.internal,display:"inline-block"}}/> Internal</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.external,transform:"rotate(45deg)",display:"inline-block"}}/> External</span>
                </div>
              </div>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:700}}>{selR.name}</span>
                    {!isInt&&<Badge color={C.external}>{selR.brand}</Badge>}
                    {isInt&&<span style={{fontSize:12,color:C.accent,fontWeight:700,background:C.accent+"12",padding:"2px 8px",borderRadius:4}}>{selR.salesMatchPct}% sales matched</span>}
                  </div>
                  {isInt&&<button onClick={()=>{setSelBench(selected);setPage("local");}} style={{padding:"5px 12px",borderRadius:5,border:"1px solid "+C.accent,background:C.accent+"10",color:C.accent,cursor:"pointer",fontSize:11,fontWeight:600}}>View Market Basket →</button>}
                </div>
                <div style={{background:"#fff",borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}>
                  <HierarchyTable items={getItems()} isInt={isInt}/>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
