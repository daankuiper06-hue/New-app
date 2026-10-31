import test from 'node:test';
import assert from 'node:assert/strict';
const listeners={};
const app={innerHTML:'',addEventListener:(name,fn)=>{listeners[name]=fn}};
const toast={style:{}};
globalThis.document={querySelector:s=>s==='#app'?app:s==='#toast'?toast:null};
globalThis.location={search:'?demo=1'};
globalThis.window={};
const record=(record_type,id,data,pid=null)=>({record_type,id,legacy_id:id,data,project_legacy_id:pid});
const fixtures=[record('project','p',{projectnaam:'Legacy project'}),record('materiaal','m',{naam:'Oud materiaal',aantal:1,verkoopprijs:100,inkoopprijs:50},'p'),record('uur','h',{aantal_uren:1,uurtarief:25},'p'),record('kwitantie','k',{project_id:'p',klant_naam:'Klant',project_naam:'Legacy project',totaal:'121',subtotaal:'121',btw_bedrag:'0',include_uren:'false',datum:'2026-01-01'},'p')];
globalThis.localStorage={getItem:()=>JSON.stringify(fixtures)};
await import('../cloudflare-app/app.mjs');
const click=async dataset=>listeners.click({target:{closest:()=>({dataset})}});
test('unknown historical result is never shown as zero',async()=>{
 assert.match(app.innerHTML,/Niet vastgesteld/);
 assert.match(app.innerHTML,/Opgeslagen kwitantie/);
 assert.match(app.innerHTML,/121,00/);
});
test('historical receipt opens saved amounts without recalculating tax',async()=>{
 await click({action:'legacydoc',id:'k'});
 assert.match(app.innerHTML,/Historische kwitantie/);
 assert.match(app.innerHTML,/Opgeslagen btw-bedrag/);
 assert.match(app.innerHTML,/121,00/);
 assert.doesNotMatch(app.innerHTML,/Markeer als verstuurd/);
});
test('editing historical material does not silently select exclusive VAT',async()=>{
 await click({action:'edit',type:'materiaal',id:'m'});
 for(const name of ['prijsbasis','inkoopbasis']){
   const select=app.innerHTML.match(new RegExp(`<select[^>]+name="${name}"[^>]*>([\\s\\S]*?)</select>`))[1];
   assert.match(select,/<option value="" selected>/);
 }
});
test('editing historical hours preserves unknown labor classification',async()=>{
 await click({action:'edit',type:'uur',id:'h'});
 const select=app.innerHTML.match(/<select[^>]+name="arbeidstype"[^>]*>([\s\S]*?)<\/select>/)[1];
 assert.match(select,/<option value="" selected>/);
});
