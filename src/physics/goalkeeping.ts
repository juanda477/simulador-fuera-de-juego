import type {Match,Player} from '../entities/types.ts';
import {DIFFICULTY as D} from '../config/settings.ts';
import {clamp,distance} from './movement.ts';

/** A first save of a distant opponent shot spills the ball back into play. */
export function parryLongShot(m:Match,keeper:Player):boolean {
 const flight=m.ball.flight;
 if(!keeper.keeper||!flight||flight.kind!=='shot'||flight.team===keeper.team||flight.parried||distance(flight.origin,keeper)<D.parryDistance)return false;
 const direction=keeper.team==='blue'?1:-1,offset=clamp(m.ball.y-keeper.y,-14,14);
 m.ball.owner=null;m.ball.x=keeper.x+direction*30;m.ball.y=keeper.y+offset;
 m.ball.vx=direction*D.parrySpeed;m.ball.vy=clamp(m.ball.vy*.35+offset*5,-100,100);
 m.ball.immunity=.18;m.ball.lastTeam=keeper.team;flight.parried=true;
 return true;
}
