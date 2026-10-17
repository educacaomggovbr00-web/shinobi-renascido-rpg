import test from 'node:test';
import assert from 'node:assert/strict';
import {INITIAL,isValidSave,applyDemoAction,advance,START_SCENE} from '../site/engine.js';
test('começa no episódio 1 com Henrique Uchiha, 12 anos, sem técnicas',()=>{
 const s=INITIAL();assert.equal(s.hero.name,'Henrique Uchiha');assert.equal(s.hero.age,12);assert.deepEqual(s.techniques,[]);assert.match(START_SCENE,/Hana/);assert.ok(isValidSave(s));
});
test('observação única na Academia ensina Bunshin e não consome chakra',()=>{
 const s=INITIAL();applyDemoAction(s,'Vou até a Academia Ninja');const before=s.chakra;
 const once=applyDemoAction(s,'Observar a demonstração de Bunshin do instrutor');
 assert.match(once.text,/aprendeu/);assert.deepEqual(s.techniques,['Bunshin no Jutsu']);assert.equal(s.chakra,before);
 applyDemoAction(s,'Observar a demonstração novamente');assert.equal(s.techniques.length,1);
});
test('não executa o jutsu antes de vê-lo, execução consome chakra depois',()=>{
 const s=INITIAL();applyDemoAction(s,'Vou à Academia Ninja');
 assert.match(applyDemoAction(s,'Tento usar bunshin').text,/ainda não observou/);
 assert.equal(s.chakra,45);
 applyDemoAction(s,'Observar jutsu do professor');const out=applyDemoAction(s,'Vou fazer bunshin');
 assert.match(out.text,/técnica funciona/);assert.equal(s.chakra,38);
});
test('as falas dos pais não mudam o local, avançam relógio e não criam itens',()=>{
 const s=INITIAL();const items=[...s.inventory];applyDemoAction(s,'Conversar com meus pais');
 assert.equal(s.locationKey,'home');assert.deepEqual(s.inventory,items);assert.equal(s.minute,8);
});
test('avanço do relógio atravessa dias',()=>{
 const s=INITIAL();advance(s,24*60+61);assert.equal(s.day,2);assert.equal(s.hour,8);assert.equal(s.minute,6);
});