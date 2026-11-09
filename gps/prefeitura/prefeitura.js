const $ = id => document.getElementById(id);
let mapa;
async function api(url, options) {
  const r = await fetch(url, options);
  if (!r.ok) throw Error('Não foi possível concluir. Atualize a página e tente novamente.');
  return r.json();
}
function descrever(e) {
  function cruzamento(id) {
    const nomes = mapa.nodes[id].name.split(' × ').filter(nome => nome !== e.name);
    return nomes.join(' / ') || mapa.nodes[id].point.map(n => n.toFixed(5)).join(', ');
  }
  return cruzamento(e.u) + ' até ' + cruzamento(e.v);
}
function trechos() {
  $('trecho').replaceChildren();
  for (const [id,e] of Object.entries(mapa.edges)) {
    if (e.name === $('rua').value) $('trecho').add(new Option(descrever(e), id));
  }
}
async function atualizar() {
  const itens = await api('/api/incidentes');
  const cards = itens.map(item => {
    const card = document.createElement('article');
    card.dataset.tone = ['Acidente', 'Alagamento'].includes(item.tipo) ? 'danger' : 'attention';
    const titulo = document.createElement('strong');
    titulo.textContent = item.tipo;
    const local = document.createElement('p');
    local.textContent = item.edges.map(id => {
      const e = mapa.edges[id];
      return e.name + ' · ' + descrever(e);
    }).join(' / ');
    const fim = document.createElement('button');
    fim.textContent = 'Encerrar';
    fim.onclick = async () => {
      fim.disabled = true;
      try {
        await api('/api/incidentes/' + item.id, {method:'DELETE'});
        $('mensagem').textContent = 'Ocorrência encerrada.';
        await atualizar();
      } catch (e) { $('mensagem').textContent = e.message; fim.disabled = false; }
    };
    card.append(titulo, local, fim);
    return card;
  });
  $('lista').replaceChildren(...(cards.length ? cards : ['Nenhuma ocorrência ativa.']));
}
$('cadastro').onsubmit = async evento => {
  evento.preventDefault();
  $('salvar').disabled = true;
  try {
    await api('/api/incidentes', {method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({edges:[$('trecho').value],tipo:$('tipo').value,peso:Number($('peso').value)})});
    $('mensagem').textContent = 'Ocorrência registrada em ' + $('rua').value + '.';
    await atualizar();
  } catch (e) { $('mensagem').textContent = e.message; }
  finally { $('salvar').disabled = false; }
};
try {
  mapa = await api('/api/mapa');
  const nomes = [...new Set(Object.values(mapa.edges).map(e => e.name))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  nomes.forEach(nome => $('rua').add(new Option(nome,nome)));
  const demo = '115881239-6';
  $('rua').value = mapa.edges[demo].name;
  trechos();
  $('trecho').value = demo;
  $('rua').onchange = trechos;
  await atualizar();
  $('salvar').disabled = false;
  window.addEventListener('focus', () => atualizar().catch(e => $('mensagem').textContent = e.message));
} catch (e) { $('mensagem').textContent = e.message; }
