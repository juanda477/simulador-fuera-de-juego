import type {Team} from '../entities/types.ts';

export class MatchFlow {
 started=false;
 paused=false;
 celebration:null|{team:Team;elapsed:number;blue:number;red:number}=null;
 get running(){return this.started&&!this.paused&&!this.celebration;}
 toggle(){if(this.celebration)return;if(!this.started){this.started=true;this.paused=false;}else this.paused=!this.paused;}
 reset(){this.started=false;this.paused=false;this.celebration=null;}
 pause(){if(this.started)this.paused=true;}
 goal(team:Team,score:Record<Team,number>){this.celebration={team,elapsed:0,blue:score.blue,red:score.red};}
 advance(dt:number){if(!this.celebration||this.paused)return;this.celebration.elapsed+=dt;if(this.celebration.elapsed>=2.8)this.celebration=null;}
}
