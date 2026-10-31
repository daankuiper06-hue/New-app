import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const events={},app={innerHTML:'',addEventListener:(name,fn)=>events[name]=fn},error={textContent:''},toast={style:{}};
const mk=(record_type,id,data,pid=null)=>({id,legacy_id:id,owner_id:'demo',record_type,project_legacy_id:pid,data,updated_at:'2026-01-01T00:00:00Z'});
const fixture=[
 mk('klant','c',{naam:'Testklant'}),mk('klant','unused',{naam:'Ongebruikt',extra:'behouden'}),
 mk('project','p',{projectnaam:'Testklus',datum:'2026-10-01',klant_id:'c',prijsbasis:'incl',inkoopbasis:'incl',marge_percentage:20}),
 mk('medewerker','e',{naam:'Testmonteur',arbeidstype:'inhuur',uurtarief:35,kostentarief:25,prijsbasis:'incl'}),
 mk('materiaal','m',{naam:'Testmateriaal',aantal:2,inkoopprijs:10,verkoopprijs:15,prijsmodus:'opslag',prijsbasis:'incl',inkoopbasis:'incl',btw_percentage:21,calculatie_id:'oldcalc'},'p'),
 mk('uur','h',{medewerker_id:'e',aantal_uren:2,uurtarief:35,kostentarief:25,arbeidstype:'inhuur',prijsbasis:'incl',btw_percentage:21},'p'),
 mk('sjabloon','t',{naam:'Nieuw ontwerp',title:'Oude titel',titel:'Nieuwe titel',showDate:true,showQty:true,showPrice:true,showVat:true,showHours:true}),
 mk('kwitantie','old',{project_id:'p',klant_naam:'Testklant',totaal:'999',subtotaal:'999',btw_bedrag:'0',include_uren:'true'},'p'),
 mk('calculatie','oldcalc',{naam:'Oude begroting',project_id:'p',marge_percentage:20},'p'),
 mk('werkbon','oldwork',{titel:'Bewaarde werkbon',omschrijving:'Bewaarde werkzaamheden',datum:'2026-01-01'},'p'),
 mk('materiaal','orphan',{naam:'Losse regel',aantal:1,inkoopprijs:1,verkoopprijs:2,prijsbasis:'incl',inkoopbasis:'incl'},'missing')
];
let saved=JSON.stringify(fixture),writes=0;
globalThis.document={querySelector:s=>s==='#app'?app:s==='#toast'?toast:s==='#formerror'?error:null};
globalThis.location={search:'?demo=1'};globalThis.window={print:()=>{}};
globalThis.localStorage={getItem:()=>saved,setItem:(key,value)=>{saved=value;writes++},removeItem:()=>{saved='null'}};
globalThis.confirm=()=>true;
globalThis.FormData=class{constructor(form){this.values=form.values}*[Symbol.iterator](){yield*Object.entries(this.values)}};
const timer=globalThis.setTimeout;globalThis.setTimeout=(fn,ms)=>{const t=timer(fn,ms);t.unref?.();return t};
await import('../cloudflare-app/app.mjs?workflow-test');
const rows=()=>JSON.parse(saved),record=(id)=>rows().find(r=>r.legacy_id===id);
const click=async dataset=>{error.textContent='';await events.click({target:{closest:()=>({dataset})}})};
const submit=async(kind,values,checks={})=>{error.textContent='';const elements=Object.fromEntries(Object.entries(checks).map(([k,checked])=>[k,{checked}]));await events.submit({preventDefault(){},target:{dataset:{form:kind},values,elements,querySelectorAll:()=>[]}});};
test('cancel buttons are non-submit and never write records',async()=>{
 await click({action:'edit',type:'materiaal',id:'m'});const before=writes;
 assert.match(app.innerHTML,/<button type="button"[^>]*data-action="cancel"/);
 await click({action:'cancel'});assert.equal(writes,before);assert.match(app.innerHTML,/Testklus/);
});
test('every navigation section renders including estimates and yearly figures',async()=>{
 for(const page of ['dashboard','projecten','klanten','materialen','medewerkers','uren','calculaties','cijfers','facturen','sjablonen','instellingen']){
  await click({action:'go',page});assert.doesNotMatch(app.innerHTML,/Controle nodig/);assert.match(app.innerHTML,/<main/);
 }
 await click({action:'go',page:'cijfers'});assert.match(app.innerHTML,/Januari/);assert.match(app.innerHTML,/Omzet excl/);
});
test('historical receipt preserves its total and keeps mismatched current detail out of print',async()=>{
 await click({action:'legacydoc',id:'old'});const article=app.innerHTML.match(/<article[\s\S]*?<\/article>/)[0];
 assert.match(article,/999,00/);assert.doesNotMatch(article,/Testmateriaal/);
 assert.match(app.innerHTML,/section class="card noprint"/);assert.match(app.innerHTML,/Testmateriaal/);
 assert.doesNotMatch(article,/Deze regels tonen|Historische samenvatting|Uren inbegrepen/);
});
test('legacy work orders and calculations remain accessible',async()=>{
 await click({action:'go',page:'facturen'});assert.match(app.innerHTML,/Bewaarde werkbon/);
 await click({action:'oldwork',id:'oldwork'});assert.match(app.innerHTML,/Bewaarde werkzaamheden/);
 await click({action:'estimate',id:'oldcalc'});assert.match(app.innerHTML,/Testmateriaal/);assert.match(app.innerHTML,/24,00/);
});
test('employee selection copies both inclusive sales and exclusive cost',async()=>{
 const form={elements:Object.fromEntries(['arbeidstype','uurtarief','kostentarief','prijsbasis'].map(k=>[k,{value:''}]))};
 await events.change({target:{name:'medewerker_id',value:'e',form}});
 assert.equal(form.elements.prijsbasis.value,'incl');assert.equal(form.elements.uurtarief.value,35);assert.equal(form.elements.kostentarief.value,25);
});
test('a document without hours saves only materials, uses edited title and cannot reuse its number',async()=>{
 await click({action:'newdoc',id:'p'});
 const input={soort:'kosten',nummer:'TEST-1',datum:'2026-10-31',vervaldatum:'2026-11-10',sjabloon_id:'t'};
 await submit('document',input,{include_uren:false});assert.equal(error.textContent,'');
 const doc=rows().find(r=>r.record_type==='factuur');assert.equal(doc.data.gross,24);assert.equal(doc.data.lines.length,1);assert.equal(doc.data.sjabloon.titel,'Nieuwe titel');
 const n=rows().length;await click({action:'newdoc',id:'p'});await submit('document',input,{include_uren:true});
 assert.match(error.textContent,/bestaat al/);assert.equal(rows().length,n);
 await click({action:'opendoc',id:doc.legacy_id});assert.match(app.innerHTML,/Nieuwe titel/);
});
test('document status transitions preserve amounts and keep an audit history',async()=>{
 const doc=rows().find(r=>r.record_type==='factuur'),amounts=JSON.stringify(doc.data.lines);
 await click({action:'docstatus',id:doc.legacy_id});assert.equal(record(doc.legacy_id).data.status,'Verstuurd');
 await click({action:'docstatus',id:doc.legacy_id});assert.equal(record(doc.legacy_id).data.status,'Betaald');
 await click({action:'docstatus',id:doc.legacy_id});assert.equal(record(doc.legacy_id).data.status,'Verstuurd');
 assert.equal(record(doc.legacy_id).data.statushistorie.length,3);assert.equal(JSON.stringify(record(doc.legacy_id).data.lines),amounts);
});
test('new work order contains quantities and labor but no customer prices',async()=>{
 await click({action:'newdoc',id:'p'});await submit('document',{soort:'werkbon',nummer:'WORK-1',datum:'2026-10-31',vervaldatum:'2026-10-31',sjabloon_id:''},{include_uren:true});
 const doc=rows().find(r=>r.data.nummer==='WORK-1');assert.ok(doc);await click({action:'opendoc',id:doc.legacy_id});
 const article=app.innerHTML.match(/<article[\s\S]*?<\/article>/)[0];assert.match(article,/Testmonteur/);assert.doesNotMatch(article,/Prijs p.s.|Totaal incl.|€/);
});
test('create, edit, archive and restore an estimate line without changing actual costs',async()=>{
 const actual=JSON.stringify(record('m'));
 await click({action:'new',type:'calculatie',id:'p'});await submit('edit',{naam:'Nieuwe begroting',project_id:'p',marge_percentage:'20',status:'Concept'});
 let estimate=rows().find(r=>r.data.naam==='Nieuwe begroting');assert.ok(estimate);assert.deepEqual(estimate.data.regels,[]);
 await click({action:'estimateadd',id:estimate.legacy_id});
 const line={kind:'materiaal',naam:'Begrote kabel',aantal:'3',aantal_uren:'1',inkoopprijs:'12.1',verkoopprijs:'0',inkoopbasis:'incl',prijsbasis:'incl',prijsmodus:'opslag',uurtarief:'35',kostentarief:'0',arbeidstype:'eigen',btw_percentage:'21'};
 await submit('estimate-line',line);assert.equal(error.textContent,'');assert.match(app.innerHTML,/43,56/);
 estimate=record(estimate.legacy_id);const lineId=estimate.data.regels[0].id;
 await click({action:'estimateremoveline',id:estimate.legacy_id,line:lineId});assert.equal(record(estimate.legacy_id).data.regels[0].archived,true);
 await click({action:'estimaterestoreline',id:estimate.legacy_id,line:lineId});assert.equal(record(estimate.legacy_id).data.regels[0].archived,false);
 assert.equal(JSON.stringify(record('m')),actual);
});
test('archive/restore preserves unknown fields and blocks used customers',async()=>{
 await click({action:'archive',type:'klant',id:'unused'});assert.equal(record('unused').data.archived,true);
 await click({action:'restore',type:'klant',id:'unused'});assert.equal(record('unused').data.archived,false);assert.equal(record('unused').data.extra,'behouden');
 const before=writes;await click({action:'archive',type:'klant',id:'c'});assert.equal(writes,before);
});
test('a missing job link can be repaired in both normalized and legacy fields',async()=>{
 await click({action:'linkorphan',id:'orphan',type:'materiaal'});await submit('link-orphan',{project_id:'p'});
 assert.equal(record('orphan').project_legacy_id,'p');assert.equal(record('orphan').data.project_id,'p');
});
test('create and edit client, product, employee and job records preserving extra fields',async()=>{
 await click({action:'new',type:'klant',id:''});await submit('edit',{naam:'Nieuwe klant',email:'test@example.com',adres:'Teststraat'});
 const client=rows().find(r=>r.data.naam==='Nieuwe klant');assert.ok(client);
 await click({action:'edit',type:'klant',id:'unused'});await submit('edit',{naam:'Gewijzigde naam'});assert.equal(record('unused').data.extra,'behouden');
 await click({action:'new',type:'product',id:''});await submit('edit',{naam:'Bibliotheekkabel',inkoopprijs:'6.5',verkoopprijs:'7.8',prijsbasis:'incl',inkoopbasis:'incl',btw_percentage:'21',eenheid:'m'});assert.ok(rows().find(r=>r.data.naam==='Bibliotheekkabel'));
 await click({action:'new',type:'medewerker',id:''});await submit('edit',{naam:'Nieuwe monteur',arbeidstype:'inhuur',uurtarief:'35',kostentarief:'25',prijsbasis:'incl'});assert.ok(rows().find(r=>r.data.naam==='Nieuwe monteur'));
 await click({action:'new',type:'project',id:''});await submit('edit',{projectnaam:'Nieuwe klus',klant_id:client.legacy_id,datum:'2026-10-31',marge_percentage:'20',prijsbasis:'incl',inkoopbasis:'incl',kostentarief:''});
 const job=rows().find(r=>r.data.projectnaam==='Nieuwe klus');assert.ok(job);assert.equal(job.data.kostentarief,null);
 await click({action:'new',type:'materiaal',id:job.legacy_id});await submit('edit',{naam:'Nieuw materiaal',aantal:'20',inkoopprijs:'6.5',verkoopprijs:'6.5',prijsmodus:'opslag',prijsbasis:'incl',inkoopbasis:'incl',btw_percentage:'21'});
 assert.equal(error.textContent,'');assert.match(app.innerHTML,/156,00/);
 const employee=rows().find(r=>r.data.naam==='Nieuwe monteur');
 await click({action:'new',type:'uur',id:job.legacy_id});await submit('edit',{medewerker_id:employee.legacy_id,datum:'2026-10-31',aantal_uren:'2',uurtarief:'35',kostentarief:'25',arbeidstype:'inhuur',prijsbasis:'incl',btw_percentage:'21'});
 assert.equal(error.textContent,'');assert.match(app.innerHTML,/Nieuwe monteur/);assert.match(app.innerHTML,/50,00/);
});
test('work order completion and reopening do not create paid invoices',async()=>{
 const doc=rows().find(r=>r.data.nummer==='WORK-1');
 await click({action:'opendoc',id:doc.legacy_id});await click({action:'docstatus',id:doc.legacy_id});assert.equal(record(doc.legacy_id).data.status,'Afgerond');
 await click({action:'docstatus',id:doc.legacy_id});assert.equal(record(doc.legacy_id).data.status,'Concept');assert.equal(record(doc.legacy_id).data.betaald_op,null);
});
