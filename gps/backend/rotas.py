from collections import defaultdict
from heapq import heappop, heappush

def calcular(edges, origem, destino):
    vizinhos = defaultdict(list)
    for ident, e in edges.items():
        if e['oneway'] != '-1':
            vizinhos[e['u']].append((e['v'], ident))
        if e['oneway'] not in ('yes', '1', 'true'):
            vizinhos[e['v']].append((e['u'], ident))
    custos = {origem: 0}
    anterior = {}
    fila = [(0, origem)]
    while fila:
        custo, atual = heappop(fila)
        if custo != custos[atual]:
            continue
        if atual == destino:
            break
        for proximo, ident in vizinhos[atual]:
            novo = custo + edges[ident]['total']
            if novo < custos.get(proximo, float('inf')):
                custos[proximo] = novo
                anterior[proximo] = (atual, ident)
                heappush(fila, (novo, proximo))
    if destino not in custos:
        return None
    nodes, caminho = [destino], []
    while nodes[-1] != origem:
        pai, trecho = anterior[nodes[-1]]
        nodes.append(pai)
        caminho.append(trecho)
    return dict(nodes=nodes[::-1], edges=caminho[::-1], custo=round(custos[destino], 2))
