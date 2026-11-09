from uuid import uuid4

def aplicar(edges, incidente, ident, abrir):
    for trecho in incidente['edges']:
        e = edges[trecho]
        if abrir:
            e['ativos'][ident] = incidente['peso']
        else:
            del e['ativos'][ident]
        e['adicional'] = sum(e['ativos'].values())
        e['total'] = e['base'] + e['adicional']

def registrar(edges, ativos, incidente):
    ident = str(uuid4())
    ativos[ident] = incidente
    aplicar(edges, incidente, ident, True)
    return ident
