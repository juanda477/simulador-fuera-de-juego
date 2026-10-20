import type {Vec} from '../entities/types.ts';
export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export const distance=(a:Vec,b:Vec)=>Math.hypot(a.x-b.x,a.y-b.y);
export function moveTo(p:Vec,target:Vec,speed:number,dt:number){const d=distance(p,target);if(d>1){const s=Math.min(d,speed*dt)/d;p.x+=(target.x-p.x)*s;p.y+=(target.y-p.y)*s;}p.x=clamp(p.x,16,944);p.y=clamp(p.y,16,524);}
export function goalAt(previous:Vec,current:Vec):'blue'|'red'|null {
 for(const [line,team] of [[966,'blue'],[-6,'red']] as const){if((previous.x-line)*(current.x-line)<=0&&previous.x!==current.x){const t=(line-previous.x)/(current.x-previous.x);if(t<0||t>1)continue;const y=previous.y+t*(current.y-previous.y);if(y>=216&&y<=324)return team;}}return null;
}
