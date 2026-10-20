import type {Player,Vec} from '../entities/types.ts';

// Pitch penalty rectangles, expanded by the player radius plus a small margin.
export function inKeeperArea(position:Vec,keeper:Player):boolean {
 return position.y>132&&position.y<408&&(keeper.team==='blue'?position.x<166:position.x>794);
}

export function outsideKeeperArea(position:Vec,keeper:Player):Vec {
 if(!inKeeperArea(position,keeper))return {...position};
 const exits=[{x:keeper.team==='blue'?166:794,y:position.y},{x:position.x,y:132},{x:position.x,y:408}];
 return exits.sort((a,b)=>Math.hypot(a.x-position.x,a.y-position.y)-Math.hypot(b.x-position.x,b.y-position.y))[0]!;
}
