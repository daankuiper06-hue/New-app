export const money = n => new Intl.NumberFormat('nl-NL', {style:'currency', currency:'EUR'}).format(n || 0);
export const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
export const data = r => r?.data || {};
export const idOf = r => r?.legacy_id || data(r).id || r?.id;
export const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function number(value, label='Getal') {
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
  const linked = records.filter(r => !data(r).archived && (r.project_legacy_id || data(r).project_id) === id);
  const lines=[], unresolved=[];
  for (const r of linked.filter(r => ['materiaal','uur'].includes(r.record_type))) {
    const d=data(r), mat=r.record_type==='materiaal';
    const basis=d.prijsbasis || p.prijsbasis;
    if (!mat && !['eigen','inhuur'].includes(d.arbeidstype)) { unresolved.push(r); continue; }
    if (!['incl','excl'].includes(basis)) { unresolved.push(r); continue; }
    const qty=number(mat?d.aantal:d.aantal_uren);
    const vat=d.btw_percentage ?? 21;
    const buy=mat?number(d.inkoopprijs ?? 0):number(d.kostentarief ?? 0);
    const costBasis=mat?(d.inkoopbasis || p.inkoopbasis):'excl';
    if (mat && !['incl','excl'].includes(costBasis)) { unresolved.push(r); continue; }
    const sale=mat && d.prijsmodus==='opslag'
      ? round(buy/(costBasis==='incl'?1+number(vat)/100:1)*(1+number(p.marge_percentage ?? 20)/100)*(basis==='incl'?1+number(vat)/100:1))
      : number(mat?d.verkoopprijs:d.uurtarief);
    const cost=mat?qty*buy/(costBasis==='incl'?1+number(vat)/100:1):(d.arbeidstype==='eigen'?0:qty*buy);
    lines.push({...priceLine({name:mat?d.naam:('Arbeid — '+(d.omschrijving || 'werkzaamheden')),qty,price:sale,vat,basis,cost}),sourceId:r.id,kind:r.record_type});
  }
  const sum=k=>round(lines.reduce((a,l)=>a+l[k],0));
  const net=sum('net'),cost=sum('cost');
  return {lines,unresolved,net,tax:sum('tax'),gross:sum('gross'),cost,result:round(net-cost)};
}
export function snapshot(project, records, customer, template, meta) {
  const c=calculation(project, records);
  if(c.unresolved.length) throw Error('Stel de prijsbasis voor alle historische regels vast voordat je een document opslaat.');
  if(!c.lines.length) throw Error('Voeg eerst materialen of uren toe.');
  if(!meta.nummer?.trim()) throw Error('Vul een documentnummer in.');
  if(!meta.datum || !meta.vervaldatum || meta.vervaldatum < meta.datum) throw Error('Controleer documentdatum en vervaldatum.');
  if(!data(customer).naam) throw Error('Koppel eerst een klant aan de klus.');
  // Copy only customer-facing amounts. Purchase prices and margin never enter a document.
  return JSON.parse(JSON.stringify({...meta, project_id:idOf(project), klant:data(customer), projectnaam:data(project).projectnaam,
    sjabloon:template, lines:c.lines.map(({cost,sourceId,...l})=>l), net:c.net,tax:c.tax,gross:c.gross,status:'Concept',schema_version:1}));
}
