import type {Match,Player,Vec} from '../entities/types.ts';
import {DIFFICULTY as D} from '../config/settings.ts';
import {clamp,distance} from '../physics/movement.ts';

/** Roles are derived from the same state for every player: one cover and one presser. */
export function teamRoles(m:Match,team:Player['team']){
 const mates=m.players.filter(p=>p.team===team&&!p.keeper);
 const owner=m.players.find(p=>p.id===m.ball.owner);
 const progress=(p:Player)=>team==='blue'?p.x:960-p.x;
 const cover=[...mates].filter(p=>p.id!==owner?.id&&p.id!==m.selected).sort((a,b)=>progress(a)-progress(b)||a.id-b.id)[0]!;
 const presser=[...mates].filter(p=>p.id!==cover?.id).sort((a,b)=>distance(a,m.ball)-distance(b,m.ball)||a.id-b.id)[0]!;
 return {cover,presser};
}

export function targetFor(m:Match,p:Player):Vec {
 const right=p.team==='blue',dir=right?1:-1,owner=m.players.find(q=>q.id===m.ball.owner);
 if(p.keeper){
  p.state='guard';
  if(m.elapsed>=p.keeperReactAt){p.keeperTargetY=clamp(m.ball.y,218,322);p.keeperReactAt=m.elapsed+D.keeperReaction;}
  return {x:right?38:922,y:p.keeperTargetY};
 }
 const {cover,presser}=teamRoles(m,p.team);
 const receivers=m.players.filter(q=>q.team!==p.team&&!q.keeper&&q.id!==owner?.id).sort((a,b)=>right?a.x-b.x:b.x-a.x);
 const coverReceiver=owner&&owner.team!==p.team?receivers[0]:undefined;
 if(p.id===cover.id){
  p.state='hold';
  const x=right?clamp(m.ball.x-100,180,340):clamp(m.ball.x+100,620,780);
  return {x,y:clamp(m.ball.y,50,490)};
 }
 if(!owner){p.state='intercept';return presser.id===p.id?m.ball:{x:right?400:560,y:p.id%2?130:410};}
 if(owner.id===p.id){p.state='attack';return {x:right?920:40,y:270};}
 if(owner.team===p.team){
  // Keep the last observed run briefly, so a retreating carrier can leave this runner ahead.
  if(p.state!=='support'||m.elapsed>=p.supportReactAt){
   p.supportTargetX=clamp(owner.x+dir*90,60,900);
   p.supportTargetY=clamp(owner.y+(p.id%2?-100:100),70,470);
   p.supportReactAt=m.elapsed+D.supportReaction;
  }
  p.state='support';return {x:p.supportTargetX,y:p.supportTargetY};
 }
 if(presser.id===p.id){p.state='press';return owner;}
 // Cover receivers from the goal side, leaving room instead of chasing into their bodies.
 const markers=m.players.filter(q=>q.team===p.team&&!q.keeper&&q.id!==presser.id&&q.id!==cover.id).sort((a,b)=>a.id-b.id);
 const uncovered=receivers.filter(q=>q.id!==coverReceiver?.id);
 const rival=uncovered[markers.findIndex(q=>q.id===p.id)]??uncovered[0];
 p.state='mark';return {x:clamp((rival?.x??480)-dir*65,100,860),y:clamp(rival?.y??270,50,490)};
}
