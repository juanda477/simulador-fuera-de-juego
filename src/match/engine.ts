import type {Input,Match,Player,Team} from '../entities/types.ts';
import {DIFFICULTY as D} from '../config/settings.ts';
import {clamp,distance,goalAt,moveTo} from '../physics/movement.ts';
import {inKeeperArea,outsideKeeperArea} from '../rules/keeperArea.ts';
import {shotTarget} from '../rules/aim.ts';
import {parryLongShot} from '../physics/goalkeeping.ts';
import {keeperPassChoice} from '../ai/keeperDistribution.ts';
import {targetFor} from '../ai/tactics.ts';
export function createMatch():Match {const m:Match={players:[],ball:{x:480,y:270,vx:0,vy:0,owner:1,lastTeam:'blue',immunity:0},selected:1,score:{blue:0,red:0},elapsed:0,phase:'playing',winner:null,goals:0};resetPositions(m,'blue');return m;}
function resetPositions(m:Match,team:Team){m.players=[];for(let i=0;i<8;i++){const blue=i<4,j=i%4;const x=[38,350,240,240][j]!;m.players.push({id:i,team:blue?'blue':'red',keeper:j===0,facingX:blue?1:-1,facingY:0,x:blue?x:960-x,y:[270,270,130,410][j]!,state:'hold',cooldown:1,keeperTargetY:270,keeperReactAt:D.keeperReaction,supportTargetX:480,supportTargetY:270,supportReactAt:0,keeperReleaseAt:0});}const id=team==='blue'?1:5;m.selected=1;m.ball={x:m.players[id]!.x,y:270,vx:0,vy:0,owner:id,lastTeam:team,immunity:0};}
export function passTarget(m:Match,p:Player,x:number,y:number):Player|undefined {const directional=Math.hypot(x,y)>.2;return m.players.filter(q=>q.team===p.team&&!q.keeper&&q.id!==p.id).sort((a,b)=>{const rank=(q:Player)=>{const d=distance(p,q);if(directional)return ((q.x-p.x)*x+(q.y-p.y)*y)/Math.max(1,d)-d/2000;const blocked=m.players.some(r=>r.team!==p.team&&distance(p,r)+distance(r,q)<d+15);return -d-(blocked?1000:0);};return rank(b)-rank(a);})[0];}
function takePossession(m:Match,p:Player){
 m.ball.owner=p.id;m.ball.lastTeam=p.team;delete m.ball.flight;if(p.keeper)p.keeperReleaseAt=m.elapsed+D.keeperExtraWait;
 if(p.team==='blue'&&!p.keeper)m.selected=p.id;
}
function kick(m:Match,p:Player,x:number,y:number,speed:number,kind:'shot'|'pass'='pass'){const len=Math.hypot(x,y)||1;m.ball.flight={kind,origin:{x:p.x,y:p.y},team:p.team,parried:false};m.ball.owner=null;m.ball.x=p.x+x/len*19;m.ball.y=p.y+y/len*19;m.ball.vx=x/len*speed;m.ball.vy=y/len*speed;m.ball.lastTeam=p.team;m.ball.immunity=.13;p.cooldown=.45;}
export function awardGoal(m:Match,team:Team){if(m.phase==='finished')return;m.score[team]++;m.goals++;if(m.score[team]>=7||m.phase==='golden'){m.phase='finished';m.winner=team;return;}resetPositions(m,team==='blue'?'red':'blue');}
export function step(m:Match,input:Input,dt:number){if(m.phase==='finished')return;m.elapsed+=dt;if(m.phase==='playing'&&m.elapsed>=120){if(m.score.blue===m.score.red)m.phase='golden';else {m.phase='finished';m.winner=m.score.blue>m.score.red?'blue':'red';return;}}
 // A goalkeeper always stays under AI control, including restored/invalid selections.
 if(!m.players.some(p=>p.id===m.selected&&p.team==='blue'&&!p.keeper))m.selected=m.players.find(p=>p.team==='blue'&&!p.keeper)!.id;
 const heldBy=m.players.find(p=>p.id===m.ball.owner),protectedKeeper=heldBy?.keeper?heldBy:undefined;
 const insideAtStart=new Set(protectedKeeper?m.players.filter(p=>!p.keeper&&inKeeperArea(p,protectedKeeper)).map(p=>p.id):[]);
 if(input.switch){const ids=m.players.filter(p=>p.team==='blue'&&!p.keeper).map(p=>p.id);m.selected=ids[(ids.indexOf(m.selected)+1)%ids.length]!;}
 const targets=new Map(m.players.filter(p=>p.id!==m.selected).map(p=>[p.id,targetFor(m,p)]));
 for(const p of m.players){p.cooldown=Math.max(0,p.cooldown-dt);if(p.id===m.selected){if(Math.hypot(input.x,input.y)>.2){const length=Math.hypot(input.x,input.y);p.facingX=input.x/length;p.facingY=input.y/length;}const len=Math.max(1,Math.hypot(input.x,input.y));if(protectedKeeper){const current={x:p.x,y:p.y},desired=inKeeperArea(p,protectedKeeper)?outsideKeeperArea(p,protectedKeeper):outsideKeeperArea({x:clamp(p.x+input.x/len*155*dt,16,944),y:clamp(p.y+input.y/len*155*dt,16,524)},protectedKeeper);moveTo(p,desired,155,dt);const dx=p.x-current.x,dy=p.y-current.y,d=Math.hypot(dx,dy);if(d>0){p.facingX=dx/d;p.facingY=dy/d;}}else {p.x=clamp(p.x+input.x/len*155*dt,16,944);p.y=clamp(p.y+input.y/len*155*dt,16,524);}}else {const tactical=targets.get(p.id)!,target=protectedKeeper&&!p.keeper?outsideKeeperArea(inKeeperArea(p,protectedKeeper)?p:tactical,protectedKeeper):tactical,dx=target.x-p.x,dy=target.y-p.y,length=Math.hypot(dx,dy);if(length>1){p.facingX=dx/length;p.facingY=dy/length;}moveTo(p,target,p.keeper?D.keeperSpeed:D.speed,dt);}}
 // Separate overlapping bodies; simulation owns positions, never Phaser physics.
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=m.players[i]!,b=m.players[j]!,d=distance(a,b);if(d>0&&d<25){const s=(25-d)/2,dx=(a.x-b.x)/d*s,dy=(a.y-b.y)/d*s;a.x=clamp(a.x+dx,16,944);a.y=clamp(a.y+dy,16,524);b.x=clamp(b.x-dx,16,944);b.y=clamp(b.y-dy,16,524);}}
 // Keep cleared players out; finish the last small evacuation step after body separation.
 if(protectedKeeper)for(const p of m.players){if(p.keeper||!inKeeperArea(p,protectedKeeper))continue;const exit=outsideKeeperArea(p,protectedKeeper);if(!insideAtStart.has(p.id)||distance(p,exit)<=3){p.x=exit.x;p.y=exit.y;}}
 const selected=m.players[m.selected]!,owner=m.players.find(p=>p.id===m.ball.owner);
 if(owner){m.ball.x=owner.x+owner.facingX*22;m.ball.y=owner.y+owner.facingY*22;
 if(owner.id===selected.id){if(input.shoot){const aim=shotTarget(owner);kick(m,owner,aim.x-owner.x,aim.y-owner.y,D.shotSpeed,'shot');}else if(input.pass){const q=passTarget(m,owner,owner.facingX,owner.facingY);if(q)kick(m,owner,q.x-owner.x,q.y-owner.y,D.passSpeed);}}
 else if(owner.cooldown===0&&(!owner.keeper||!m.players.some(p=>!p.keeper&&inKeeperArea(p,owner)))){const goalX=owner.team==='blue'?960:0;if(owner.keeper||Math.abs(goalX-owner.x)>D.aiShotRange){if(owner.keeper||m.players.some(p=>p.team!==owner.team&&distance(p,owner)<70)){const choice=owner.keeper?keeperPassChoice(m,owner):{target:passTarget(m,owner,owner.team==='blue'?1:-1,0),wait:false};const q=choice.target;if(q&&!choice.wait){kick(m,owner,q.x-owner.x,q.y-owner.y,D.passSpeed);owner.cooldown=D.decisionDelay;}}}else {const keeper=m.players.find(p=>p.team!==owner.team&&p.keeper)!,targetY=keeper.y<=270?322:218;const goalLine=owner.team==='blue'?966:-6;kick(m,owner,goalLine-owner.x,targetY-owner.y,D.shotSpeed,'shot');}}
 if(m.ball.owner!==null&&!owner.keeper){for(const p of m.players){if(p.team===owner.team||distance(p,owner)>32||p.cooldown>0)continue;if(p.id===selected.id&&!input.tackle)continue;takePossession(m,p);p.cooldown=.7;break;}}
 }else {const before={x:m.ball.x,y:m.ball.y};m.ball.x+=m.ball.vx*dt;m.ball.y+=m.ball.vy*dt;m.ball.immunity=Math.max(0,m.ball.immunity-dt);const goal=goalAt(before,m.ball);if(goal){awardGoal(m,goal);return;}if(m.ball.y<6||m.ball.y>534){m.ball.y=clamp(m.ball.y,6,534);m.ball.vy*=-.7;}const inMouth=m.ball.y>=216&&m.ball.y<=324;if(!inMouth&&(m.ball.x<6||m.ball.x>954)){m.ball.x=clamp(m.ball.x,6,954);m.ball.vx*=-.7;}const drag=Math.exp(-.65*dt);m.ball.vx*=drag;m.ball.vy*=drag;
 if(m.ball.immunity===0){const q=m.players.filter(p=>distance(p,m.ball)<(p.keeper?D.keeperReach:20)).sort((a,b)=>distance(a,m.ball)-distance(b,m.ball))[0];if(q){if(!parryLongShot(m,q))takePossession(m,q);q.cooldown=.45;}}
 }
 const carrier=m.players.find(p=>p.id===m.ball.owner);if(carrier){m.ball.x=carrier.x+carrier.facingX*22;m.ball.y=carrier.y+carrier.facingY*22;}
}
