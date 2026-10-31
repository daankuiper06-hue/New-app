import {test} from 'node:test';
import assert from 'node:assert/strict';
import {priceLine,calculation,snapshot,number,escapeHtml,storedReceipt} from '../cloudflare-app/core.mjs';
const mk=(record_type,id,data,project_legacy_id=null)=>({record_type,id,legacy_id:id,data,project_legacy_id});
const p=mk('project','p',{projectnaam:'Test',prijsbasis:'excl',inkoopbasis:'excl',marge_percentage:20});
const customer=mk('klant','c',{naam:'Testklant'});
test('inclusive and exclusive prices both calculate 100 + 21',()=>{
 assert.deepEqual([priceLine({qty:1,price:121,vat:21,basis:'incl'}).net,priceLine({qty:1,price:100,vat:21,basis:'excl'}).gross],[100,121]);
});
test('zero VAT stays zero; mixed VAT rounds per line',()=>{
 const a=priceLine({qty:3,price:.99,vat:9,basis:'incl'}),b=priceLine({qty:1,price:25,vat:0,basis:'excl'});
 assert.equal(a.net,2.72);assert.equal(a.tax,.25);assert.equal(b.tax,0);
});
test('20% markup applies to net purchase price and project-wide setting',()=>{
 const r=mk('materiaal','m',{naam:'Spot',aantal:2,inkoopprijs:121,inkoopbasis:'incl',prijsmodus:'opslag',btw_percentage:21},'p');
 let c=calculation(p,[r]);assert.equal(c.net,240);assert.equal(c.cost,200);assert.equal(c.result,40);
 c=calculation({...p,data:{...p.data,marge_percentage:30}},[r]);assert.equal(c.net,260);
});
test('own labor adds to result and hired labor subtracts cost',()=>{
 const own=mk('uur','a',{aantal_uren:2,uurtarief:25,arbeidstype:'eigen',kostentarief:99},'p'),hired=mk('uur','b',{aantal_uren:3,uurtarief:35,arbeidstype:'inhuur',kostentarief:20},'p');
 const c=calculation(p,[own,hired]);assert.equal(c.net,155);assert.equal(c.cost,60);assert.equal(c.result,95);
});
test('legacy basis is not guessed and snapshot is blocked',()=>{
 const legacy={...p,data:{projectnaam:'Old'}};const r=mk('materiaal','m',{aantal:1,inkoopprijs:10,verkoopprijs:12},'p');
 assert.equal(calculation(legacy,[r]).unresolved.length,1);
 assert.throws(()=>snapshot(legacy,[r],customer,{},{}),/historische/);
});
test('archived and unrelated lines excluded',()=>{
 const a=mk('materiaal','a',{aantal:1,inkoopprijs:10,verkoopprijs:12,archived:true},'p'),b=mk('materiaal','b',{aantal:1,inkoopprijs:10,verkoopprijs:12},'elsewhere');assert.equal(calculation(p,[a,b]).gross,0);
});
test('document is immutable snapshot and never includes purchase or margin',()=>{
 const r=mk('materiaal','m',{naam:'Kabel',aantal:1,inkoopprijs:10,verkoopprijs:12},'p');
 const s=snapshot(p,[r],customer,{voet:'Dank'},{nummer:'2026-001',datum:'2026-10-31',vervaldatum:'2026-11-14'});
 r.data.verkoopprijs=999;customer.data.naam='Changed';assert.equal(s.gross,14.52);assert.equal(s.klant.naam,'Testklant');
 assert.ok(!JSON.stringify(s).includes('inkoop'));assert.ok(!('cost' in s.lines[0]));assert.ok(!('result' in s));
});
test('invalid amounts and markup inputs rejected',()=>{for(const n of [-1,NaN,Infinity,'',null,'abc'])assert.throws(()=>number(n));assert.equal(number('2,5'),2.5);assert.throws(()=>priceLine({qty:1,price:2,vat:10,basis:'excl'}));});
test('HTML injection escaped',()=>assert.equal(escapeHtml('<img src=x onerror="evil()">'),'&lt;img src=x onerror=&quot;evil()&quot;&gt;'));
test('legacy receipt uses saved total regardless of changed project prices',()=>{
 const r=mk('kwitantie','k',{subtotaal:'1301.2975000000001',btw_bedrag:'0',totaal:'1301.2975000000001',include_uren:'false'});
 const before=JSON.stringify(r),v=storedReceipt(r);assert.equal(v.total,1301.2975000000001);assert.equal(v.tax,0);assert.equal(v.includesHours,false);assert.equal(JSON.stringify(r),before);
});
test('missing historical amounts remain unknown; explicit zero stays zero',()=>{
 const v=storedReceipt(mk('kwitantie','k',{totaal:'0',include_uren:'true'}));assert.equal(v.total,0);assert.equal(v.tax,null);assert.equal(v.subtotal,null);assert.equal(v.includesHours,true);
});
test('mixed tax bases calculate per line, not from a global assumption',()=>{
 const m1=mk('materiaal','one',{naam:'Inclusief',aantal:1,inkoopprijs:60.5,inkoopbasis:'incl',verkoopprijs:121,prijsbasis:'incl'},'p');
 const m2=mk('materiaal','two',{naam:'Exclusief',aantal:1,inkoopprijs:50,inkoopbasis:'excl',verkoopprijs:100,prijsbasis:'excl'},'p');
 const c=calculation(p,[m1,m2]);assert.equal(c.net,200);assert.equal(c.tax,42);assert.equal(c.gross,242);assert.equal(c.cost,100);assert.equal(c.unresolved.length,0);
});
test('legacy labor type must be explicitly classified',()=>{const h=mk('uur','h',{aantal_uren:2,uurtarief:25},'p');assert.equal(calculation(p,[h]).unresolved.length,1)});
test('invalid due dates cannot create document',()=>{const r=mk('materiaal','m',{aantal:1,inkoopprijs:10,verkoopprijs:12},'p');assert.throws(()=>snapshot(p,[r],mk('klant','x',{naam:'X'}),{},{nummer:'1',datum:'2026-11-01',vervaldatum:'2026-10-01'}),/vervaldatum/)});
