import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMatch,step,awardGoal,passTarget} from '../src/match/engine.ts';
import {goalAt} from '../src/physics/movement.ts';
import {offsideLine,snapshot} from '../src/rules/offside.ts';
const idle={x:0,y:0,pass:false,shoot:false,tackle:false,switch:false};
test('eight players, two keepers; selection never includes keeper',()=>{const m=createMatch();assert.equal(m.players.length,8);assert.equal(m.players.filter(p=>p.keeper).length,2);for(let i=0;i<12;i++){step(m,{...idle,switch:true},1/60);assert.equal(m.players[m.selected]!.keeper,false);}});
test('movement normalized and bounded',()=>{const a=createMatch(),b=createMatch();step(a,{...idle,x:1},1/60);step(b,{...idle,x:1,y:1},1/60);assert.ok(Math.abs(Math.hypot(a.players[1]!.x-350,a.players[1]!.y-270)-Math.hypot(b.players[1]!.x-350,b.players[1]!.y-270))<1e-8);for(let i=0;i<600;i++)step(a,{...idle,x:-1},1/60);assert.ok(a.players[1]!.x>=16);});
test('goal uses swept crossing within mouth and whole ball',()=>{assert.equal(goalAt({x:950,y:270},{x:970,y:270}),'blue');assert.equal(goalAt({x:10,y:270},{x:-10,y:270}),'red');assert.equal(goalAt({x:950,y:100},{x:970,y:100}),null);assert.equal(goalAt({x:950,y:270},{x:960,y:270}),null);});
test('seven goals ends match and ignores later goals',()=>{const m=createMatch();for(let i=0;i<7;i++)awardGoal(m,'blue');assert.equal(m.phase,'finished');assert.equal(m.winner,'blue');awardGoal(m,'red');assert.equal(m.score.red,0);});
test('time expires with leader; tie enters unlimited golden goal',()=>{const m=createMatch();m.elapsed=119.99;m.score.red=1;step(m,idle,1/60);assert.equal(m.winner,'red');const tie=createMatch();tie.elapsed=119.99;step(tie,idle,1/60);assert.equal(tie.phase,'golden');tie.elapsed=10000;step(tie,idle,1/60);assert.equal(tie.phase,'golden');awardGoal(tie,'red');assert.equal(tie.winner,'red');});
test('goal resets positions and gives conceding team kickoff',()=>{const m=createMatch();awardGoal(m,'blue');assert.equal(m.ball.owner,5);assert.equal(m.score.blue,1);assert.equal(m.elapsed,0);});
test('pass releases ball and chooses directional teammate',()=>{const m=createMatch();assert.equal(passTarget(m,m.players[1]!,0,-1)?.id,2);step(m,{...idle,pass:true,y:-1},1/60);assert.equal(m.ball.owner,null);assert.ok(m.ball.vy<0);});
test('offside reference accounts for keeper, ball and halfway for both teams',()=>{const m=createMatch();m.players[4]!.x=300;m.players[5]!.x=600;m.players[6]!.x=700;m.players[7]!.x=800;assert.equal(offsideLine(m,'blue'),700);m.ball.x=850;assert.equal(offsideLine(m,'blue'),850);m.ball.x=100;for(const p of m.players.filter(p=>p.team==='red'))p.x=200;assert.equal(offsideLine(m,'blue'),480);m.players[0]!.x=700;m.players[1]!.x=300;m.players[2]!.x=200;m.players[3]!.x=100;m.ball.x=400;assert.equal(offsideLine(m,'red'),200);});
test('historical snapshot is immutable relative to later simulation',()=>{const m=createMatch(),s=snapshot(m);m.players[1]!.x=900;m.ball.x=800;assert.equal(s.players[1]!.x,350);assert.equal(s.ball.x,350);});
test('fixed ticks are reproducible and remain finite during a full match',()=>{const a=createMatch(),b=createMatch();for(let i=0;i<7500;i++){step(a,idle,1/60);step(b,idle,1/60);}assert.deepEqual(a,b);assert.ok(a.players.every(p=>Number.isFinite(p.x)&&p.x>=16&&p.x<=944));assert.ok(a.elapsed>=120||a.phase==='finished');});
test('ball can travel fully over goal line over multiple ticks',()=>{const m=createMatch();m.players.forEach(p=>{p.y=100;});m.ball={x:950,y:270,vx:440,vy:0,owner:null,lastTeam:'blue',immunity:1};for(let i=0;i<4;i++)step(m,idle,1/60);assert.equal(m.score.blue,1);});

test('blue outfield recovery automatically selects receiver; keeper remains automatic',()=>{
 const m=createMatch();m.players.forEach(p=>{p.x=800;p.y=100;});
 const receiver=m.players[2]!;receiver.x=400;receiver.y=400;
 m.ball={x:400,y:400,vx:0,vy:0,owner:null,lastTeam:'red',immunity:0};
 step(m,idle,1/60);assert.equal(m.ball.owner,2);assert.equal(m.selected,2);
 const keeper=m.players[0]!;keeper.x=38;keeper.y=270;
 m.ball={x:38,y:270,vx:0,vy:0,owner:null,lastTeam:'red',immunity:0};
 step(m,idle,1/60);assert.equal(m.ball.owner,0);assert.equal(m.selected,2);
});

test('neither keeper can be dispossessed while holding the ball',()=>{
 for(const id of [0,4]){const m=createMatch(),keeper=m.players[id]!;
 keeper.cooldown=10;m.ball.owner=id;
 const rival=m.players[id===0?5:1]!;rival.x=keeper.x+22;rival.y=keeper.y;rival.cooldown=0;
 step(m,{...idle,tackle:true},1/60);assert.equal(m.ball.owner,id);
 }
});

test('facing persists after releasing movement and determines the pass',()=>{
 const m=createMatch();m.players[2]!.x=350;m.players[2]!.y=100;
 m.players[3]!.x=350;m.players[3]!.y=430;
 step(m,{...idle,y:1},1/60);step(m,idle,1/60);
 assert.equal(m.players[1]!.facingY,1);
 assert.equal(passTarget(m,m.players[1]!,m.players[1]!.facingX,m.players[1]!.facingY)?.id,3);
 step(m,{...idle,pass:true},1/60);assert.ok(m.ball.vy>0);assert.equal(m.ball.owner,null);
});

test('shot angles map linearly onto goal and rear angles saturate for either team',async()=>{
 const {shotTarget}=await import('../src/rules/aim.ts');
 for(const team of ['blue','red'] as const){const p=createMatch().players[1]!;p.team=team;const forward=team==='blue'?1:-1;
 for(const degrees of [-180,-135,-90,-45,0,45,90,135,180]){const radians=degrees*Math.PI/180;p.facingX=Math.cos(radians)*forward;p.facingY=Math.sin(radians);
 const target=shotTarget(p);assert.equal(target.x,team==='blue'?966:-6);assert.ok(Math.abs(target.y-(270+Math.max(-1,Math.min(1,degrees/90))*52))<1e-8);}
 }
});

test('actual shot follows the retained facing toward chosen point',()=>{
 const m=createMatch();step(m,{...idle,y:-1},1/60);const p=m.players[1]!;
 step(m,{...idle,shoot:true},1/60);
 assert.equal(m.ball.owner,null);assert.ok(m.ball.vx>0);
 const crossing=m.ball.y+(966-m.ball.x)*m.ball.vy/m.ball.vx;
 assert.ok(Math.abs(crossing-218)<1e-8);
});

test('carried ball follows facing in all four directions',()=>{
 for(const [x,y] of [[1,0],[-1,0],[0,-1],[0,1]]){const m=createMatch();step(m,{...idle,x,y},1/60);const p=m.players[1]!;assert.ok(Math.abs(m.ball.x-p.x-x*22)<1e-8);assert.ok(Math.abs(m.ball.y-p.y-y*22)<1e-8);}
});

test('all outfield players including selected leave keeper area before distribution',async()=>{
 const {inKeeperArea}=await import('../src/rules/keeperArea.ts');
 for(const keeperId of [0,4]){const m=createMatch(),keeper=m.players[keeperId]!;m.ball.owner=keeperId;keeper.cooldown=0;
 m.players.filter(p=>!p.keeper).forEach((p,i)=>{p.x=keeper.team==='blue'?70+i*10:890-i*10;p.y=190+i*30;p.cooldown=10;});
 for(let i=0;i<240&&m.ball.owner===keeperId;i++){
 const occupied=m.players.some(p=>!p.keeper&&inKeeperArea(p,keeper));
 step(m,idle,1/60);
 if(occupied&&m.ball.owner!==keeperId)assert.ok(m.players.every(p=>p.keeper||!inKeeperArea(p,keeper)));
 assert.ok(!m.players[m.selected]!.keeper);
 }
 assert.equal(m.ball.owner,null);assert.ok(m.players.every(p=>p.keeper||!inKeeperArea(p,keeper)));
 }
});

test('invalid keeper focus is repaired before applying user input',()=>{
 const m=createMatch();m.selected=0;m.ball.owner=0;m.players[0]!.cooldown=10;
 step(m,{...idle,x:1,shoot:true,pass:true},1/60);
 assert.equal(m.selected,1);assert.equal(m.ball.owner,0);
});

test('keeper reacts on delayed observations rather than mirroring every tick',async()=>{
 const {targetFor}=await import('../src/ai/tactics.ts');const {DIFFICULTY:D}=await import('../src/config/settings.ts');
 const m=createMatch(),keeper=m.players[4]!;m.ball.y=100;
 assert.equal(targetFor(m,keeper).y,270);
 m.elapsed=D.keeperReaction;assert.equal(targetFor(m,keeper).y,218);
 m.ball.y=400;m.elapsed+=1/60;assert.equal(targetFor(m,keeper).y,218);
 m.elapsed+=D.keeperReaction;assert.equal(targetFor(m,keeper).y,322);
 const y=keeper.y;step(m,idle,1/60);assert.ok(Math.abs(keeper.y-y)<=D.keeperSpeed/60+1e-8);
 assert.ok(D.keeperSpeed<D.speed);
});

test('opponent shoots from outside penalty area toward corner away from keeper',()=>{
 for(const keeperY of [218,322]){const m=createMatch();m.ball.owner=5;
 const shooter=m.players[5]!;shooter.x=380;shooter.y=270;shooter.cooldown=0;
 m.players[0]!.y=keeperY;m.players[0]!.keeperTargetY=keeperY;
 step(m,idle,1/60);assert.equal(m.ball.owner,null);assert.ok(m.ball.vx<0);
 const yAtGoal=m.ball.y+(-6-m.ball.x)*m.ball.vy/m.ball.vx;
 assert.ok(Math.abs(yAtGoal-(keeperY<270?322:218))<1e-8);
 }
});

test('a corner shot can beat an out-of-position keeper without a close-range tap-in',()=>{
 const m=createMatch();m.players.filter(p=>!p.keeper&&p.id!==1).forEach((p,i)=>{p.x=220+i*55;p.y=60;});
 const shooter=m.players[1]!;shooter.x=580;shooter.y=270;shooter.facingX=0;shooter.facingY=1;
 m.players[4]!.y=218;m.players[4]!.keeperTargetY=218;
 step(m,{...idle,shoot:true},1/60);
 for(let i=0;i<120&&m.goals===0;i++)step(m,idle,1/60);
 assert.equal(m.score.blue,1);
});

test('each team keeps cover behind attack, rotating when that player has possession',async()=>{
 const {teamRoles,targetFor}=await import('../src/ai/tactics.ts');
 for(const team of ['blue','red'] as const){const m=createMatch();m.ball.owner=team==='blue'?1:5;m.ball.x=team==='blue'?800:160;
 let cover=teamRoles(m,team).cover;assert.notEqual(cover.id,m.ball.owner);assert.notEqual(cover.id,m.selected);
 const target=targetFor(m,cover);assert.ok(team==='blue'?target.x<=340:target.x>=620);assert.equal(cover.state,'hold');
 m.ball.owner=cover.id;const next=teamRoles(m,team).cover;assert.notEqual(next.id,cover.id);
 }
});

test('defence has a single presser and marks a different receiver at a distance',async()=>{
 const {teamRoles,targetFor}=await import('../src/ai/tactics.ts');
 for(const team of ['blue','red'] as const){const m=createMatch();m.ball.owner=team==='blue'?5:1;const owner=m.players[m.ball.owner]!;m.ball.x=owner.x;m.ball.y=owner.y;
 const defenders=m.players.filter(p=>p.team===team&&!p.keeper);
 const targets=new Map(defenders.map(p=>[p.id,targetFor(m,p)]));
 assert.equal(defenders.filter(p=>p.state==='press').length,1);
 assert.equal(defenders.filter(p=>p.state==='hold').length,1);
 const marker=defenders.find(p=>p.state==='mark')!,target=targets.get(marker.id)!;
 const receivers=m.players.filter(p=>p.team!==team&&!p.keeper&&p.id!==owner.id);
 assert.ok(receivers.every(p=>Math.hypot(p.x-target.x,p.y-target.y)>=64));
 assert.notEqual(teamRoles(m,team).presser.id,teamRoles(m,team).cover.id);
 }
});

test('cover tracks ball height instead of following a receiver toward the opposite flank',async()=>{
 const {teamRoles,targetFor}=await import('../src/ai/tactics.ts');
 for(const team of ['blue','red'] as const){const m=createMatch();m.ball.owner=team==='blue'?5:1;m.ball.y=60;
 m.players.filter(p=>p.team!==team&&!p.keeper&&p.id!==m.ball.owner).forEach(p=>p.y=450);
 const cover=teamRoles(m,team).cover,up=targetFor(m,cover);assert.equal(up.y,60);
 m.ball.y=480;assert.equal(targetFor(m,cover).y,480);
 assert.ok(team==='blue'?up.x<=340:up.x>=620);
 }
});

test('support runner delays retreat and can remain beyond offside line for either team',async()=>{
 const {teamRoles,targetFor}=await import('../src/ai/tactics.ts');const {DIFFICULTY:D}=await import('../src/config/settings.ts');
 for(const team of ['blue','red'] as const){const m=createMatch(),owner=m.players[team==='blue'?1:5]!;m.ball.owner=owner.id;owner.x=team==='blue'?700:260;m.ball.x=owner.x;
 const cover=teamRoles(m,team).cover,p=m.players.find(p=>p.team===team&&!p.keeper&&p.id!==owner.id&&p.id!==cover.id)!;
 const run=targetFor(m,p);p.x=run.x;p.y=run.y;
 owner.x=team==='blue'?500:460;m.ball.x=owner.x;m.elapsed=.2;
 assert.deepEqual(targetFor(m,p),run);
 const line=offsideLine(m,team);assert.ok(team==='blue'?p.x>line:p.x<line);
 m.elapsed=D.supportReaction+.01;const retreat=targetFor(m,p);assert.ok(team==='blue'?retreat.x<run.x:retreat.x>run.x);
 }
});

test('keeper parries long shots into play but catches passes and close shots',()=>{
 for(const keeperId of [0,4])for(const kind of ['long','close','pass'] as const){
 const m=createMatch(),keeper=m.players[keeperId]!,dir=keeper.team==='blue'?1:-1;
 m.players.filter(p=>!p.keeper).forEach((p,i)=>{p.x=400+i*35;p.y=60;});
 keeper.y=270;keeper.keeperTargetY=270;keeper.keeperReactAt=100;
 m.ball={x:keeper.x+dir*14,y:270,vx:-dir*250,vy:0,owner:null,lastTeam:keeper.team==='blue'?'red':'blue',immunity:0,flight:{kind:kind==='pass'?'pass':'shot',origin:{x:keeper.x+dir*(kind==='close'?100:400),y:270},team:keeper.team==='blue'?'red':'blue',parried:false}};
 step(m,idle,1/60);
 if(kind==='long'){assert.equal(m.ball.owner,null);assert.equal(m.ball.flight?.parried,true);assert.ok(m.ball.vx*dir>0);assert.ok(m.ball.immunity>0);}
 else assert.equal(m.ball.owner,keeperId);
 }
});

test('parried shot is not parried again and its attacking provenance is retained',async()=>{
 const {parryLongShot}=await import('../src/physics/goalkeeping.ts');const m=createMatch(),keeper=m.players[4]!;
 m.ball.flight={kind:'shot',origin:{x:500,y:270},team:'blue',parried:false};m.ball.owner=null;
 assert.equal(parryLongShot(m,keeper),true);assert.equal(m.ball.flight.team,'blue');assert.equal(parryLongShot(m,keeper),false);
});
