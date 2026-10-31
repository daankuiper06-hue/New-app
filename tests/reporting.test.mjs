import test from 'node:test';
import assert from 'node:assert/strict';
import {yearReport,estimateCalculation,storedProjectLines,normalizedTemplate} from '../cloudflare-app/core.mjs';
const mk=(record_type,id,data,pid=null)=>({id,legacy_id:id,record_type,project_legacy_id:pid,data});
const p=mk('project','p',{datum:'2026-10-31',prijsbasis:'incl',inkoopbasis:'incl',marge_percentage:20});
const m=mk('materiaal','m',{naam:'Kabel',aantal:2,inkoopprijs:12.1,verkoopprijs:999,prijsmodus:'opslag',calculatie_id:'c'},'p');
test('year totals equal the sum of monthly project calculations and exclude unlinked items',()=>{
 const orphan=mk('materiaal','orphan',{aantal:1,inkoopprijs:1,verkoopprijs:9000},'missing');
 const r=yearReport([p,m,orphan],2026);
 assert.equal(r.months[9].gross,29.04);assert.equal(r.total.gross,29.04);assert.equal(r.total.projects,1);assert.equal(yearReport([p,m],2025).total.projects,0);
});
test('estimate overrides and standalone budget lines never change actual project records',()=>{
 const before=JSON.stringify([p,m]);
 const old=mk('calculatie','c',{marge_percentage:50});
 assert.equal(estimateCalculation(old,p,[m]).gross,36.3);
 const budget=mk('calculatie','new',{marge_percentage:0,regels:[{id:'row',kind:'materiaal',naam:'Apart',aantal:1,inkoopprijs:121,verkoopprijs:121,prijsbasis:'incl',inkoopbasis:'incl'}]});
 assert.equal(estimateCalculation(budget,p,[m]).gross,121);assert.equal(JSON.stringify([p,m]),before);
});
test('current receipt detail applies the same markup as the job calculation',()=>{
 const line=storedProjectLines(p,[m])[0];assert.equal(line.price,14.52);assert.equal(line.amount,29.04);assert.equal(line.basis,'incl');
});
test('editing an old template title takes precedence over its legacy title',()=>{
 assert.equal(normalizedTemplate({title:'Oud',titel:'Nieuw'}).titel,'Nieuw');assert.equal(normalizedTemplate({title:'Oud'}).titel,'Oud');
});
