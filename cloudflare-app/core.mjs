export const money = n => new Intl.NumberFormat('nl-NL', {style:'currency', currency:'EUR'}).format(n || 0);
export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
export const data = r => r?.data || {};
export const idOf = r => r?.legacy_id || data(r).id || r?.id;
export const isArchived = r => data(r).archived===true || data(r).archived==='true';
export const projectIdOf = r => r?.project_legacy_id || data(r).project_id;
export function normalizedTemplate(value={}) {
  return {...value,titel:value.titel || value.title || 'Factuur'};
}
export function laborName(d,records=[]) {
  const employee=records.find(r=>r.record_type==='medewerker' && String(idOf(r))===String(d.medewerker_id));
  return ['Arbeid',data(employee).naam,d.omschrijving].filter(Boolean).join(' — ');
}
// Legacy receipts are authoritative stored documents, not a fresh calculation.
export function storedReceipt(r) {
  const d=data(r);
  const amount=k=>d[k] === undefined || d[k] === null || d[k] === '' ? null : number(d[k],k);
  return {id:idOf(r),date:d.datum || '',customer:d.klant_naam || '',project:d.project_naam || '',
    subtotal:amount('subtotaal'),tax:amount('btw_bedrag'),total:amount('totaal'),status:d.status || '',
    includesHours:d.include_uren===true || d.include_uren==='true'};
}
export function storedProjectLines(project, records, includeHours=true) {
  const p=data(project);
  const current=calculation(project,records);
  return records.filter(r=>!isArchived(r) && projectIdOf(r)===idOf(project) &&
    (r.record_type==='materiaal' || (includeHours && r.record_type==='uur'))).map(r=>{
    const d=data(r),material=r.record_type==='materiaal';
    const resolved=current.lines.find(l=>l.sourceId===r.id);
    const qty=number(material?d.aantal:d.aantal_uren),price=resolved?(resolved.basis==='incl'?resolved.price:resolved.price*(1+resolved.vat/100)):number(material?d.verkoopprijs:d.uurtarief);
    return {id:r.id,name:material?d.naam:laborName(d,records),
      qty,price,amount:resolved?.gross??round(qty*price),basis:resolved?'incl':d.prijsbasis || (material?p.materiaalprijsbasis:p.uurprijsbasis) || p.prijsbasis || '',
      kind:r.record_type,vat:d.btw_percentage ?? null};
  });
}
export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function number(value, label='Getal') {
  if(typeof value!=='number' && (typeof value!=='string' || !value.trim())) throw Error(`${label}: vul een geldig getal in.`);
  const n = typeof value === 'number' ? value : Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || value === '' || value == null) throw Error(`${label}: vul een geldig positief getal of nul in.`);
  return n;
}
export function priceLine({name, qty, price, vat, basis, cost=0}) {
  qty = number(qty,'Aantal'); price = number(price,'Prijs'); vat = number(vat,'Btw');
  if (![0,9,21].includes(vat)) throw Error('Kies 0, 9 of 21% btw.');
  if (!['incl','excl'].includes(basis)) throw Error('Leg eerst vast of de historische prijzen inclusief of exclusief btw zijn.');
  const net = round(qty * price / (basis === 'incl' ? 1 + vat / 100 : 1));
  const tax = basis === 'incl' ? round(round(qty * price)-net) : round(net * vat / 100);
  return {name, qty, price, vat, basis, net, tax, gross:round(net+tax), cost:round(cost)};
}
export function calculation(project, records) {
  const p = data(project), id = idOf(project);
  const linked = records.filter(r => !isArchived(r) && projectIdOf(r) === id);
  const lines=[], unresolved=[];
  for (const r of linked.filter(r => ['materiaal','uur'].includes(r.record_type))) {
    try {
    const d=data(r), mat=r.record_type==='materiaal';
    const basis=d.prijsbasis || (mat?p.materiaalprijsbasis:p.uurprijsbasis) || p.prijsbasis;
    const labor=d.arbeidstype || p.arbeidstype;
    if (!mat && !['eigen','inhuur'].includes(labor)) { unresolved.push(r); continue; }
    if (!mat && labor==='inhuur' && d.kostentarief==null && p.kostentarief==null) { unresolved.push(r); continue; }
    if (!['incl','excl'].includes(basis)) { unresolved.push(r); continue; }
    const qty=number(mat?d.aantal:d.aantal_uren);
    if(qty<=0) throw Error('Aantal of uren moet groter zijn dan nul.');
    const vat=d.btw_percentage ?? 21;
    const buy=mat?number(d.inkoopprijs ?? 0):number(d.kostentarief ?? p.kostentarief ?? 0);
    const costBasis=mat?(d.inkoopbasis || p.inkoopbasis):'excl';
    if (mat && !['incl','excl'].includes(costBasis)) { unresolved.push(r); continue; }
    const sale=mat && d.prijsmodus==='opslag'
      ? round(buy/(costBasis==='incl'?1+number(vat)/100:1)*(1+number(p.marge_percentage ?? 20)/100)*(basis==='incl'?1+number(vat)/100:1))
      : number(mat?d.verkoopprijs:d.uurtarief);
    const cost=mat?qty*buy/(costBasis==='incl'?1+number(vat)/100:1):(labor==='eigen'?0:qty*buy);
    lines.push({...priceLine({name:mat?d.naam:laborName(d,records),qty,price:sale,vat,basis,cost}),sourceId:r.id,kind:r.record_type});
    } catch(error) { unresolved.push({...r,issue:error.message}); }
  }
  const sum=k=>round(lines.reduce((a,l)=>a+l[k],0));
  const net=sum('net'),cost=sum('cost');
  return {lines,unresolved,net,tax:sum('tax'),gross:sum('gross'),cost,result:round(net-cost)};
}
export function snapshot(project, records, customer, template, meta) {
  const includeHours=meta.include_uren!==false && meta.include_uren!=='false';
  const c=calculation(project, includeHours?records:records.filter(r=>r.record_type!=='uur'));
  if(c.unresolved.length) throw Error('Stel de prijsbasis voor alle historische regels vast voordat je een document opslaat.');
  if(!c.lines.length) throw Error('Voeg eerst materialen of uren toe.');
  if(!meta.nummer?.trim()) throw Error('Vul een documentnummer in.');
  const validDate=s=>typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10)===s;
  if(!validDate(meta.datum) || !validDate(meta.vervaldatum) || meta.vervaldatum < meta.datum) throw Error('Controleer documentdatum en vervaldatum.');
  if(!data(customer).naam) throw Error('Koppel eerst een klant aan de klus.');
  // Copy only customer-facing amounts. Purchase prices and margin never enter a document.
  return JSON.parse(JSON.stringify({...meta, project_id:idOf(project), klant:data(customer), projectnaam:data(project).projectnaam,
    sjabloon:normalizedTemplate(template),include_uren:includeHours, lines:c.lines.map(({cost,sourceId,...l})=>l), net:c.net,tax:c.tax,gross:c.gross,status:'Concept',schema_version:1}));
}

export function estimateCalculation(estimate, project, records) {
  const d=data(estimate),pid=idOf(project) || 'estimate';
  const job={...project,legacy_id:pid,data:{...data(project),marge_percentage:d.marge_percentage ?? data(project).marge_percentage ?? 20}};
  const lines=Array.isArray(d.regels)?d.regels.map((line,i)=>({id:line.id || `estimate-${i}`,record_type:line.kind || 'materiaal',project_legacy_id:pid,data:line}))
    :records.filter(r=>['materiaal','uur'].includes(r.record_type) && data(r).calculatie_id===idOf(estimate)).map(r=>({...r,id:idOf(r),project_legacy_id:pid}));
  return calculation(job,[...records.filter(r=>r.record_type==='medewerker'),...lines]);
}

export function yearReport(records,year) {
  const months=Array.from({length:12},()=>({gross:0,net:0,cost:0,result:0,projects:0,unresolved:0}));
  for(const project of records.filter(r=>r.record_type==='project' && !isArchived(r))) {
    const date=data(project).datum || '';
    if(date.slice(0,4)!==String(year)) continue;
    const month=Number(date.slice(5,7))-1;
    if(month<0 || month>11) continue;
    const item=months[month],c=calculation(project,records);item.projects++;
    if(c.unresolved.length){item.unresolved++;continue;}
    for(const k of ['gross','net','cost','result'])item[k]=round(item[k]+c[k]);
  }
  const total=months.reduce((a,m)=>{for(const k in a)a[k]=round(a[k]+m[k]);return a;},{gross:0,net:0,cost:0,result:0,projects:0,unresolved:0});
  return {months,total};
}
