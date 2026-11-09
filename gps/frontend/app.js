import {montar,desenhar} from './mapa.js';
const $=id=>document.getElementById(id);
let grafo, rota, pedido=0, eventos=[], pendentes=0;
function verificar(e){
  if(!rota || e.revisao<=rota.revisao)return;
  const trecho=e.edges.find(id=>rota.edges.includes(id));
  if(!trecho)return;
  $('motivo').textContent=e.tipo+' ('+e.estado+') em '+grafo.edges[trecho].name+'. Deseja calcular o trajeto novamente?';
  const livre = rota.edges.every(id => Object.keys(grafo.edges[id].ativos).length === 0);
  let tom = 'attention';
  if (e.estado === 'encerrado' && livre) tom = 'clear';
  else if (['Acidente', 'Alagamento'].includes(e.tipo)) tom = 'danger';
  $('aviso').dataset.tone = tom;
  $('aviso').hidden=false;
}
async function calcular(origem,destino){
  const numero=++pedido;
  pendentes++;
  try{
    const res=await fetch('/api/rota',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origem,destino})});
    const dados=await res.json();
    if(numero!==pedido)return;
    if(!res.ok)throw Error(typeof dados.detail==='string'?dados.detail:'Confira os pontos selecionados.');
    rota=dados; desenhar(grafo,rota); $('aviso').hidden=true;
    $('status').textContent='Rota ativa · '+rota.edges.length+' trechos · '+Math.round(rota.edges.reduce((s,k)=>s+grafo.edges[k].length_m,0))+' m';
    eventos.forEach(verificar);
  }catch(e){if(numero===pedido)$('status').textContent=e.message;}
  finally{if(--pendentes===0)eventos=[];}
}
function conectar(){
  const ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');
  ws.onmessage=async({data})=>{
    const e=JSON.parse(data);
    if(e.estado==='conectado'){
      $('live').textContent='Alertas ligados';
      if(rota){
        const anterior=grafo;
        try{
          const novo=await (await fetch('/api/mapa')).json();
          const alteradas=Object.keys(novo.edges).filter(k=>JSON.stringify(novo.edges[k].ativos)!==JSON.stringify(anterior.edges[k].ativos));
          grafo=novo;
          verificar({edges:alteradas,revisao:novo.revisao,tipo:'Situação atualizada',estado:'reconexão'});
        }catch{$('live').textContent='Falha ao sincronizar';}
      }
      return;
    }
    for(const id of e.edges){
      const ativos=grafo.edges[id].ativos;
      if(e.estado==='encerrado')delete ativos[e.id];else ativos[e.id]=e.peso;
    }
    if(pendentes)eventos.push(e);
    verificar(e);
  };
  ws.onclose=()=>{$('live').textContent='Reconectando…';setTimeout(conectar,1500);};
}
async function iniciar(){
  grafo=await (await fetch('/api/mapa')).json();
  montar(grafo);
  const pontos=Object.entries(grafo.nodes).filter(([,n])=>n.name.includes(' × ')).sort((a,b)=>a[1].name.localeCompare(b[1].name,'pt-BR'));
  for(const campo of ['origem','destino']){
    for(const [id,n] of pontos)$(campo).add(new Option(n.name,id));
  }
  $('origem').value='1910177018';$('destino').value='1597582452';
  document.querySelector('form').onsubmit=e=>{e.preventDefault();calcular($('origem').value,$('destino').value);};
  $('recalcular').onclick=()=>calcular(rota.nodes[0],rota.nodes.at(-1));
  $('manter').onclick=()=>{$('aviso').hidden=true;$('status').textContent='Rota atual mantida.';};
  conectar();
}
iniciar().catch(()=>{$('status').textContent='Não foi possível carregar o mapa. Recarregue a página.';});
