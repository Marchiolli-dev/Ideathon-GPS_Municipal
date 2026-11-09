const map = L.map('map',{zoomControl:false});
L.control.zoom({position:'bottomleft'}).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
const overlay=L.layerGroup().addTo(map);
export function montar(g){
  for(const e of Object.values(g.edges)){
    L.polyline(e.geometry,{color:'#8D9DA3',weight:3,opacity:.65}).bindTooltip(e.name).addTo(map);
  }
  map.fitBounds(Object.values(g.nodes).map(n=>n.point));
}
export function desenhar(g,r){
  overlay.clearLayers();
  const pontos=[];
  r.edges.forEach((id,i)=>{
    const e=g.edges[id];
    pontos.push(...(e.u===r.nodes[i]?e.geometry:[...e.geometry].reverse()));
  });
  L.polyline(pontos,{color:'#FFFFFF',weight:9}).addTo(overlay);
  L.polyline(pontos,{color:'#2878C7',weight:5}).addTo(overlay);
  for(const [i,label] of [[0,'A'],[r.nodes.length-1,'B']]){
    L.marker(g.nodes[r.nodes[i]].point,{icon:L.divIcon({className:'pin',html:label,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(overlay);
  }
  map.fitBounds(pontos,{paddingTopLeft:[32,32],paddingBottomRight:[innerWidth>=760?375:32,32],maxZoom:17});
}
