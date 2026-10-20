import type {Input} from '../entities/types.ts';
export class Controls {
 keys=new Set<string>(); axis={x:0,y:0}; actions={pass:false,shoot:false,tackle:false,switch:false};
 isAttacking:()=>boolean;
 constructor(isAttacking:()=>boolean=()=>true){this.isAttacking=isAttacking;window.addEventListener('keydown',e=>{if(e.target instanceof HTMLSelectElement)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Tab'].includes(e.key))e.preventDefault();this.keys.add(e.key.toLowerCase());if(!e.repeat){if(e.key.toLowerCase()==='j')this.actions.pass=true;if(e.key.toLowerCase()==='k')this.actions.shoot=true;if(e.key.toLowerCase()==='l')this.actions.tackle=true;if(e.key==='Tab')this.actions.switch=true;}});window.addEventListener('keyup',e=>this.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>this.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.clear();});
 for(const action of ['pass','shoot','switch'] as const){
 const button=document.getElementById(action)!;
 const trigger=()=>{this.actions[action==='pass'&&!this.isAttacking()?'tackle':action]=true;};
 // Queue on touch-down, without waiting for a synthesized click while another finger moves.
 button.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||(button as HTMLButtonElement).disabled)return;e.preventDefault();trigger();});
 // Native touch events have their own identifiers; a second finger is not a mouse click.
 button.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();if(!(button as HTMLButtonElement).disabled)trigger();},{passive:false});
 // Preserve keyboard and assistive activation without duplicating pointer actions.
 button.addEventListener('click',e=>{if(e.detail===0&&!(button as HTMLButtonElement).disabled)trigger();});
 }
 const pad=document.getElementById('joystick')!,stick=document.getElementById('stick')!;let pointer:number|null=null;
 const update=(clientX:number,clientY:number)=>{const r=pad.getBoundingClientRect(),radius=Math.min(r.width,r.height)*.36,x=(clientX-r.left-r.width/2)/radius,y=(clientY-r.top-r.height/2)/radius,len=Math.max(1,Math.hypot(x,y));this.axis={x:x/len,y:y/len};stick.style.transform=`translate(${this.axis.x*38}px,${this.axis.y*38}px)`;};
 const reset=()=>{this.axis={x:0,y:0};stick.style.transform='';};
 pad.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||pointer!==null)return;pointer=e.pointerId;pad.setPointerCapture(pointer);update(e.clientX,e.clientY);});
 pad.addEventListener('pointermove',e=>{if(pointer===e.pointerId)update(e.clientX,e.clientY);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(pointer!==(e as PointerEvent).pointerId)return;pointer=null;reset();});
 let touch:number|null=null;
 pad.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();if(touch!==null)return;const finger=e.changedTouches[0];if(finger){touch=finger.identifier;update(finger.clientX,finger.clientY);}},{passive:false});
 pad.addEventListener('touchmove',e=>{e.preventDefault();e.stopPropagation();const finger=Array.from(e.touches).find(t=>t.identifier===touch);if(finger)update(finger.clientX,finger.clientY);},{passive:false});
 for(const event of ['touchend','touchcancel'] as const)pad.addEventListener(event,e=>{e.preventDefault();e.stopPropagation();if(!Array.from(e.changedTouches).some(t=>t.identifier===touch))return;touch=null;reset();},{passive:false});

 }
 clear(){this.keys.clear();this.axis={x:0,y:0};for(const k of Object.keys(this.actions) as (keyof typeof this.actions)[])this.actions[k]=false;}
 direction(){const has=(...ks:string[])=>ks.some(k=>this.keys.has(k));return {x:this.axis.x+Number(has('d','arrowright'))-Number(has('a','arrowleft')),y:this.axis.y+Number(has('s','arrowdown'))-Number(has('w','arrowup'))};}
 read():Input {const has=(...ks:string[])=>ks.some(k=>this.keys.has(k));const i={x:this.axis.x+Number(has('d','arrowright'))-Number(has('a','arrowleft')),y:this.axis.y+Number(has('s','arrowdown'))-Number(has('w','arrowup')),...this.actions};for(const k of Object.keys(this.actions) as (keyof typeof this.actions)[])this.actions[k]=false;return i;}
}
