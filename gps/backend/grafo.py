import json
from pathlib import Path

def carregar():
    mapa = json.loads((Path(__file__).parent / 'dados/mapa.json').read_text(encoding='utf8'))
    for trecho in mapa['edges'].values():
        trecho.update(ativos={}, adicional=0, total=trecho['base'])
    return mapa
