import type {Player} from '../entities/types.ts';

/** Screen coordinates: negative Y points up. Rear-facing aim saturates at a post. */
export function shotTarget(p:Player):{x:number;y:number} {
 const forward=p.team==='blue'?1:-1;
 const angle=Math.atan2(p.facingY,p.facingX*forward);
 const vertical=Math.max(-1,Math.min(1,angle/(Math.PI/2)));
 return {x:p.team==='blue'?966:-6,y:270+vertical*52};
}
