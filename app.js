(()=>{'use strict';
const $=s=>document.querySelector(s),svg=$('#field'),ns='http://www.w3.org/2000/svg';
const make=(tag,attrs,parent)=>{let e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.appendChild(e);return e};

let language='es',dictionary={};
const t=(key)=>dictionary[key]||key;
function translateStatic(){
 document.documentElement.lang=language;
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
 const fieldTexts=document.querySelectorAll('#field text');fieldTexts.forEach(el=>{
  const value=el.getAttribute('data-i18n-svg');if(value)el.textContent=t(value)
 });
 document.querySelectorAll('[data-player-label]').forEach(el=>{el.textContent=t('label'+el.getAttribute('data-player-label'))});
 document.querySelector('#lang-picker').value=language;
}
async function changeLanguage(lang){
 if(lang!=='en'&&lang!=='es')lang='es';
 try{const response=await fetch('./locales/'+lang+'.json',{cache:'no-cache'});if(!response.ok)throw Error('Locale HTTP '+response.status);dictionary=await response.json();language=lang;}
 catch(e){if(lang!=='es')return changeLanguage('es');dictionary={"title": "Fuera de juego", "subtitle": "Simulador didáctico · Arrastra a los cinco jugadores y observa cómo cambia la línea.", "direction": "El equipo azul ataca hacia la derecha →", "moment": "Instante en que sale el pase", "own": "CAMPO PROPIO", "opponent": "CAMPO RIVAL", "limit": "Límite de fuera de juego", "attacker": "Atacantes", "defender": "Defensas", "goalkeeper": "Arquero", "boundary": "Límite", "startStatus": "Posición habilitada", "second": "Penúltimo rival", "setsLine": "Marca la línea", "ahead": "Rivales por delante", "try": "Prueba estas cinco jugadas", "scenario1": "1. Arquero en su sitio", "scenario2": "2. Arquero adelantado", "scenario3": "3. Dos defensas habilitan", "scenario4": "4. El balón habilita", "scenario5": "5. Línea del medio", "involved": "El receptor juega el balón o interfiere en la jugada", "footnote": "El balón se mueve con el pasador azul. La posición de los marcadores es una simplificación didáctica: en el reglamento se consideran las partes válidas del cuerpo (no manos ni brazos). Un futbolista en posición adelantada solo comete infracción al intervenir de las maneras previstas por la Regla 11.", "offline": "Funciona sin internet ni servicios de IA. Reglamento oficial:", "ifab": "IFAB · Regla 11", "labelpass": "PASE", "labelrecv": "RECIBE", "labeld1": "DEF 4", "labeld2": "DEF 5", "labelgk": "ARQUERO", "gkValue": "Arquero", "defValue": "Defensa", "of3": "de 3", "midValue": "Mitad", "ballValue": "Balón", "secondValue": "Penúltimo rival", "offense": "✕ Infracción de fuera de juego", "offenseDetail": "El receptor está en el campo rival y por delante del balón y del penúltimo adversario. Si recibe el pase, se sanciona con tiro libre indirecto.", "positionOnly": "⚠ Posición adelantada, sin infracción", "positionOnlyDetail": "Está adelantado al salir el pase, pero en este ejemplo no participa en el juego ni interfiere con un adversario.", "onside": "✓ Receptor habilitado", "ownDetail": "El receptor está en su propio campo o en la línea central; allí no puede estar en posición adelantada.", "ballDetail": "El receptor está a la altura o por detrás del balón, incluso si no hay adversarios delante.", "defDetail": "El receptor está a la altura o por detrás del penúltimo adversario, contando también al arquero.", "otherDetail": "La posición respecto al balón permite recibir el pase.", "language": "Idioma", "update": "Nueva versión disponible", "updateButton": "Actualizar ahora", "dismiss": "Después", "updateFailed": "No se pudo descargar el idioma. Se muestra el español.", "loadError": "La aplicación no pudo iniciar. Actualiza la página para volver a intentar."};language='es';}
 try{localStorage.setItem('offside-language',language)}catch(e){}
 translateStatic();if(typeof render==='function'&&Object.keys(elements).length===5)render();
}

const specs=[{id:'pass',short:t('labelpass'),num:'8',fill:'#277EEB',x:350,y:305},{id:'recv',short:t('labelrecv'),num:'9',fill:'#277EEB',x:610,y:185},{id:'d1',short:t('labeld1'),num:'4',fill:'#F36A61',x:655,y:107},{id:'d2',short:t('labeld2'),num:'5',fill:'#F36A61',x:705,y:302},{id:'gk',short:t('labelgk'),num:'1',fill:'#F0C14C',x:828,y:204}];
const players={},elements={},layer=$('#players');let activeCase='normal';
specs.forEach(p=>{players[p.id]={x:p.x,y:p.y};const g=make('g',{'class':'movable','data-id':p.id,transform:`translate(${p.x} ${p.y})`},layer);make('circle',{r:32,fill:'white','fill-opacity':'.1'},g);make('circle',{r:23,fill:p.fill,stroke:p.id==='gk'?'#FFEE9E':'#DAEFFF','stroke-width':3,filter:'url(#shade)'},g);const t=make('text',{y:7,'font-size':22,'font-weight':800,'text-anchor':'middle',fill:p.id==='gk'?'#3F3421':'white','pointer-events':'none'},g);t.textContent=p.num;const label=make('text',{y:-34,'font-size':14,'font-weight':700,'text-anchor':'middle',fill:'white','pointer-events':'none'},g);label.textContent=p.short;label.setAttribute('data-player-label',p.id);if(p.id==='pass')make('circle',{cx:23,cy:14,r:9,fill:'white',stroke:'#273440','stroke-width':2,'pointer-events':'none'},g);elements[p.id]=g});
const scenarios={normal:{pass:[350,305],recv:[610,185],d1:[655,107],d2:[705,302],gk:[828,204]},keeperout:{pass:[355,307],recv:[750,177],d1:[690,100],d2:[605,304],gk:[300,204]},two:{pass:[310,285],recv:[690,172],d1:[770,112],d2:[805,292],gk:[260,210]},ball:{pass:[785,285],recv:[735,170],d1:[550,100],d2:[625,305],gk:[450,205]},half:{pass:[250,303],recv:[475,176],d1:[115,92],d2:[220,305],gk:[325,205]}};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));let dragged=null;
function render(){specs.forEach(p=>elements[p.id].setAttribute('transform',`translate(${players[p.id].x} ${players[p.id].y})`));const ball=players.pass.x+23;const rivals=['d1','d2','gk'].map(id=>({id,x:players[id].x})).sort((a,b)=>b.x-a.x);const second=rivals[1],edge=Math.max(450,ball,second.x),recv=players.recv;const off=recv.x>450.5&&recv.x>ball+.5&&recv.x>second.x+.5;const ahead=['d1','d2','gk'].filter(id=>players[id].x>recv.x+.5).length;
for(let id of ['limit','def-line','ball-line']){const e=$('#'+id);const x=id==='limit'?edge:id==='def-line'?second.x:ball;e.setAttribute('x1',x);e.setAttribute('x2',x)}$('#zone').setAttribute('x',edge);$('#zone').setAttribute('width',Math.max(0,885-edge));$('#limit-tag').setAttribute('transform',`translate(${clamp(edge,105,795)} 22)`);for(const [a,v] of Object.entries({x1:ball,y1:players.pass.y+14,x2:recv.x,y2:recv.y}))$('#passline').setAttribute(a,v);
$('#second').textContent=second.id==='gk'?t('gkValue'):t('defValue')+' '+(second.id==='d1'?'4':'5');$('#driver').textContent=edge<=450.5?t('midValue'):ball>=second.x-.5?t('ballValue'):t('secondValue');$('#ahead').textContent=ahead+' '+t('of3');const involved=$('#involved').checked,verdict=$('#verdict'),reason=$('#reason');
if(off){if(involved){verdict.textContent=t('offense');verdict.style.color='#ff9a8f';reason.textContent=t('offenseDetail')}else{verdict.textContent=t('positionOnly');verdict.style.color='#ffe19b';reason.textContent=t('positionOnlyDetail')}}else{verdict.textContent=t('onside');verdict.style.color='#79e8ac';if(recv.x<=450.5)reason.textContent=t('ownDetail');else if(recv.x<=ball+.5&&ball>=second.x-.5)reason.textContent=t('ballDetail');else if(recv.x<=second.x+.5)reason.textContent=t('defDetail');else reason.textContent=t('otherDetail')}document.querySelectorAll('.scenario').forEach(b=>b.setAttribute('aria-pressed',String(activeCase===b.dataset.case)))}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=svg.getScreenCTM();return m?p.matrixTransform(m.inverse()):p}
Object.values(elements).forEach(g=>{g.addEventListener('pointerdown',e=>{dragged={id:g.dataset.id,pointer:e.pointerId};activeCase='';layer.appendChild(g);g.setPointerCapture(e.pointerId);e.preventDefault()});g.addEventListener('pointermove',e=>{if(!dragged||dragged.id!==g.dataset.id||dragged.pointer!==e.pointerId)return;const q=point(e);players[dragged.id]={x:clamp(q.x,36,862),y:clamp(q.y,64,352)};render()});g.addEventListener('pointerup',()=>dragged=null);g.addEventListener('pointercancel',()=>dragged=null)});
document.querySelectorAll('.scenario').forEach(b=>b.addEventListener('click',()=>{let s=scenarios[b.dataset.case];Object.keys(s).forEach(id=>players[id]={x:s[id][0],y:s[id][1]});activeCase=b.dataset.case;render()}));$('#involved').addEventListener('change',render);render();
$('#lang-picker').addEventListener('change',e=>changeLanguage(e.target.value));
let preferred='es';try{preferred=localStorage.getItem('offside-language')||(navigator.language.toLowerCase().startsWith('es')?'es':'en')}catch(e){}changeLanguage(preferred);
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
 let latestWorker=null;
 const updateBar=$('#update-banner');
 const showUpdate=worker=>{latestWorker=worker;updateBar.hidden=false;};
 $('#update-now').addEventListener('click',()=>{if(latestWorker)latestWorker.postMessage({type:'SKIP_WAITING'});else location.reload();});
 $('#update-later').addEventListener('click',()=>{updateBar.hidden=true;});
 navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());
 navigator.serviceWorker.register('./service-worker.js',{updateViaCache:'none'}).then(reg=>{
  if(reg.waiting&&navigator.serviceWorker.controller)showUpdate(reg.waiting);
  reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)showUpdate(worker);});});
  reg.update().catch(()=>{});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{})});
 }).catch(()=>{});
}
})();
