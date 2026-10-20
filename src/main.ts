import Phaser from 'phaser';
import {createMatch,step} from './match/engine.ts';
import {FIXED_STEP} from './config/settings.ts';
import {Controls} from './controls/input.ts';
import {Pitch} from './scenes/Pitch.ts';
import es from '../locales/game.es.json';
import en from '../locales/game.en.json';
import './style.css';
let m=createMatch(),paused=false,accumulator=0,lang:'es'|'en'='es';
try{lang=localStorage.getItem('offside-language')==='en'?'en':'es';}catch{}
const controls=new Controls(()=>m.players.find(p=>p.id===m.ball.owner)?.team==='blue'),$=(id:string)=>document.getElementById(id)!;
function translate(){const t=lang==='es'?es:en;document.documentElement.lang=lang;for(const id of ['title','play','learn','blue','red','restart','pass','shoot','switch','help','notice'] as const)$(id).textContent=t[id];$('pause').textContent=paused?t.resume:t.pause;($('language') as HTMLSelectElement).value=lang;}
$('language').addEventListener('change',e=>{lang=(e.target as HTMLSelectElement).value as 'es'|'en';try{localStorage.setItem('offside-language',lang);}catch{}translate();});
$('restart').addEventListener('click',()=>{m=createMatch();accumulator=0;paused=false;controls.clear();translate();});
$('pause').addEventListener('click',()=>{paused=!paused;controls.clear();translate();});
$('play').addEventListener('click',()=>$('game').scrollIntoView({behavior:'smooth'}));
// Hidden tabs pause explicitly: elapsed wall time never advances the match.
document.addEventListener('visibilitychange',()=>{if(document.hidden){paused=true;accumulator=0;translate();}});
const tick=(dt:number)=>{if(!paused){accumulator+=Math.min(dt,.1);while(accumulator>=FIXED_STEP){step(m,controls.read(),FIXED_STEP);accumulator-=FIXED_STEP;}}const t=lang==='es'?es:en;const remaining=Math.max(0,Math.ceil(120-m.elapsed));$('score').textContent=`${m.score.blue} : ${m.score.red}`;$('clock').textContent=m.phase==='golden'?`+${Math.floor(m.elapsed-120)}s`:`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;$('status').textContent=paused?t.paused:m.phase==='finished'?t.finished+t[m.winner!]:t[m.phase];const carrier=m.players.find(p=>p.id===m.ball.owner),own=carrier?.team==='blue',canAttack=own&&!carrier?.keeper&&carrier?.id===m.selected&&!paused&&m.phase!=='finished';const canDefend=!own&&!carrier?.keeper&&!paused&&m.phase!=='finished';$('pass').textContent=own?t.pass:t.tackle;($('pass') as HTMLButtonElement).disabled=own?!canAttack:!canDefend;($('shoot') as HTMLButtonElement).disabled=!canAttack;};
translate();new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#207547',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:new Pitch(()=>m,tick,()=>{const t=lang==='es'?es:en;return `${t.offsideLine} ${m.ball.lastTeam==='blue'?'→':'←'}`;}),render:{antialias:true},input:{touch:false,mouse:false,keyboard:false,gamepad:false},audio:{noAudio:true}});
if('serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register('./service-worker.js').catch(console.error);
