import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Controls} from '../src/controls/input.ts';

class Element extends EventTarget {
 disabled=false;style:{transform?:string}={};
 getBoundingClientRect(){return {left:0,top:0,width:124,height:124};}
 setPointerCapture(_id:number){}
}
function fire(target:EventTarget,type:string,properties:Record<string,unknown>={}){
 const event=new Event(type,{cancelable:true});Object.assign(event,properties);target.dispatchEvent(event);
}
test('touch actions respond on pointerdown while joystick remains held, exactly once',()=>{
 const elements=new Map(['pass','shoot','tackle','switch','joystick','stick'].map(id=>[id,new Element()]));
 const windowStub=new EventTarget(),documentStub=Object.assign(new EventTarget(),{getElementById:(id:string)=>elements.get(id),hidden:false});
 Object.assign(globalThis,{window:windowStub,document:documentStub,HTMLButtonElement:Element,HTMLSelectElement:class extends Element{}});
 const controls=new Controls();
 fire(elements.get('joystick')!,'pointerdown',{pointerId:1,clientX:62,clientY:107});
 for(const action of ['pass','shoot'] as const){
 fire(elements.get(action)!,'pointerdown',{pointerId:2});
 const input=controls.read();assert.equal(input[action],true);assert.ok(input.y>.9);
 fire(elements.get(action)!,'click',{detail:1});assert.equal(controls.read()[action],false);
 }
 fire(elements.get('pass')!,'click',{detail:0});assert.equal(controls.read().pass,true);
 elements.get('shoot')!.disabled=true;fire(elements.get('shoot')!,'pointerdown',{pointerId:2});assert.equal(controls.read().shoot,false);
});

test('native mobile touches keep joystick active when another finger taps actions',()=>{
 const elements=new Map(['pass','shoot','tackle','switch','joystick','stick'].map(id=>[id,new Element()]));
 Object.assign(globalThis,{window:new EventTarget(),document:Object.assign(new EventTarget(),{getElementById:(id:string)=>elements.get(id),hidden:false}),HTMLButtonElement:Element,HTMLSelectElement:class extends Element{}});
 const controls=new Controls(),pad=elements.get('joystick')!;
 const finger={identifier:7,clientX:62,clientY:107};
 fire(pad,'pointerdown',{pointerType:'touch',pointerId:12,clientX:62,clientY:107});
 assert.equal(controls.read().y,0);
 fire(pad,'touchstart',{changedTouches:[finger],touches:[finger]});
 for(const action of ['pass','shoot','switch'] as const){
 const button=elements.get(action)!;
 fire(button,'pointerdown',{pointerType:'touch',pointerId:15});assert.equal(controls.read()[action],false);
 fire(button,'touchstart',{changedTouches:[{identifier:9}],touches:[finger,{identifier:9}]});
 const input=controls.read();assert.equal(input[action],true);assert.ok(input.y>.9);
 fire(pad,'touchend',{changedTouches:[{identifier:9}],touches:[finger]});assert.ok(controls.read().y>.9);
 assert.equal(controls.read()[action],false);
 }
 fire(pad,'touchmove',{touches:[{...finger,clientY:17}]});assert.ok(controls.read().y<-.9);
 fire(pad,'touchcancel',{changedTouches:[finger],touches:[]});assert.equal(controls.read().y,0);
});

test('same touch button becomes tackle in defence and pass in attack',()=>{
 const elements=new Map(['pass','shoot','switch','joystick','stick'].map(id=>[id,new Element()]));
 Object.assign(globalThis,{window:new EventTarget(),document:Object.assign(new EventTarget(),{getElementById:(id:string)=>elements.get(id),hidden:false}),HTMLButtonElement:Element,HTMLSelectElement:class extends Element{}});
 let attack=false;const controls=new Controls(()=>attack),button=elements.get('pass')!;
 fire(button,'touchstart',{});let input=controls.read();assert.equal(input.tackle,true);assert.equal(input.pass,false);
 attack=true;fire(button,'touchstart',{});input=controls.read();assert.equal(input.pass,true);assert.equal(input.tackle,false);
});
