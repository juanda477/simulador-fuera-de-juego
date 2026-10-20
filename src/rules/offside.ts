import type { Match,Team } from '../entities/types.ts';
/** Visual reference only. This release does not sanction offside. */
export function offsideLine(m:Match,team:Team):number {const rivals=m.players.filter(p=>p.team!==team).map(p=>p.x).sort((a,b)=>team==='blue'?b-a:a-b);return team==='blue'?Math.max(480,m.ball.x,rivals[1]!):Math.min(480,m.ball.x,rivals[1]!);}
export function snapshot(m:Match){return structuredClone({ball:m.ball,players:m.players,time:m.elapsed});}
