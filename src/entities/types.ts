export type Team = 'blue' | 'red';
export interface Vec { x:number; y:number }
export type AIState = 'hold'|'support'|'press'|'mark'|'intercept'|'attack'|'guard';
export interface Player extends Vec { id:number; team:Team; keeper:boolean; facingX:number; facingY:number; state:AIState; cooldown:number; keeperTargetY:number; keeperReactAt:number; supportTargetX:number; supportTargetY:number; supportReactAt:number; keeperReleaseAt:number }
export interface Ball extends Vec { vx:number; vy:number; owner:number|null; lastTeam:Team; immunity:number; flight?:{kind:'shot'|'pass';origin:Vec;team:Team;parried:boolean} }
export interface Match { players:Player[]; ball:Ball; selected:number; score:Record<Team,number>; elapsed:number; phase:'playing'|'golden'|'finished'; winner:Team|null; goals:number }
export interface Input { x:number; y:number; pass:boolean; shoot:boolean; tackle:boolean; switch:boolean }
