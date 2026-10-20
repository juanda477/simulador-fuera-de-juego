import Phaser from 'phaser';
import type {Match} from '../entities/types.ts';
import {offsideLine} from '../rules/offside.ts';
import {passTarget} from '../match/engine.ts';
export class Pitch extends Phaser.Scene {
 ink!:Phaser.GameObjects.Graphics;
 lineLabel!:Phaser.GameObjects.Text;
 constructor(private match:()=>Match,private tick:(dt:number)=>void,private offsideCaption:()=>string){super('pitch');}
 create(){this.ink=this.add.graphics();this.lineLabel=this.add.text(480,18,'',{fontFamily:'system-ui, sans-serif',fontSize:'13px',fontStyle:'bold',color:'#ffdc69',backgroundColor:'#142d24',padding:{x:7,y:4},align:'center'}).setOrigin(.5,0).setDepth(10);}
 update(_time:number,delta:number){this.tick(delta/1000);const m=this.match(),g=this.ink;g.clear();g.fillStyle(0x207547);g.fillRect(0,0,960,540);for(let x=0;x<960;x+=160){g.fillStyle(0xffffff,.035);g.fillRect(x,0,80,540);}g.lineStyle(2,0xffffff,.65);g.strokeRect(8,8,944,524);g.lineBetween(480,8,480,532);g.strokeCircle(480,270,70);g.strokeRect(8,150,140,240);g.strokeRect(812,150,140,240);g.strokeRect(8,210,45,120);g.strokeRect(907,210,45,120);g.fillStyle(0xcde4db,.5);g.fillRect(0,210,8,120);g.fillRect(952,210,8,120);
 const line=offsideLine(m,m.ball.lastTeam);this.lineLabel.setText(this.offsideCaption());this.lineLabel.x=Phaser.Math.Clamp(line,this.lineLabel.width/2+12,948-this.lineLabel.width/2);g.lineStyle(3,0xffdc69,.9);for(let y=8;y<532;y+=18)g.lineBetween(line,y,line,y+10);
 const selected=m.players[m.selected]!,dir={x:selected.facingX,y:selected.facingY},target=m.ball.owner===m.selected?passTarget(m,selected,dir.x,dir.y):undefined;
 for(const p of m.players){if(p.id===m.selected||p.id===target?.id){g.lineStyle(3,p.id===m.selected?0xffffff:0xffdc69);g.strokeCircle(p.x,p.y,22);}g.fillStyle(0x000000,.2);g.fillEllipse(p.x,p.y+12,32,12);g.fillStyle(p.keeper?(p.team==='blue'?0xffd45c:0xb899ff):(p.team==='blue'?0x4ca2ff:0xff6a72));g.fillCircle(p.x,p.y,15);g.lineStyle(2,p.keeper?0xffdc69:0xffffff);g.strokeCircle(p.x,p.y,15);g.lineStyle(3,0x142d24);g.lineBetween(p.x+p.facingX*6,p.y+p.facingY*6,p.x+p.facingX*16,p.y+p.facingY*16);g.fillStyle(0xffffff);g.fillCircle(p.x+p.facingX*16,p.y+p.facingY*16,3);}
 g.fillStyle(0x000000,.25);g.fillEllipse(m.ball.x,m.ball.y+5,14,9);g.fillStyle(0xffffff);g.fillCircle(m.ball.x,m.ball.y,7);g.lineStyle(2,0x20332e);g.strokeCircle(m.ball.x,m.ball.y,7);
 }
}
