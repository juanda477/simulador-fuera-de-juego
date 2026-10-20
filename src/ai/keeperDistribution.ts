import type {Match,Player} from '../entities/types.ts';
import {distance} from '../physics/movement.ts';
import {DIFFICULTY as D} from '../config/settings.ts';

export function keeperPassChoice(m:Match,keeper:Player){
 const opponents=m.players.filter(p=>p.team!==keeper.team);
 const candidates=m.players.filter(p=>p.team===keeper.team&&!p.keeper).map(player=>({player,space:Math.min(...opponents.map(r=>distance(player,r)))}));
 const bestSpace=Math.max(...candidates.map(c=>c.space));
 // Similar pressure (within 12 pitch units): prefer the shorter distribution.
 const tied=candidates.filter(c=>bestSpace-c.space<=D.keeperSpaceTie);
 tied.sort((a,b)=>distance(keeper,a.player)-distance(keeper,b.player)||a.player.id-b.player.id);
 return {target:tied[0]?.player,wait:bestSpace<D.keeperSafeSpace&&m.elapsed<keeper.keeperReleaseAt};
}
