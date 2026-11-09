import asyncio
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field
from .grafo import carregar
from .incidentes import aplicar, registrar
from .rotas import calcular

app = FastAPI(title='GPS Municipal', docs_url=None, redoc_url=None, openapi_url=None)
admin = FastAPI(title='Prefeitura local', docs_url=None, redoc_url=None, openapi_url=None)
admin.add_middleware(TrustedHostMiddleware, allowed_hosts=['127.0.0.1', 'localhost'])

@admin.middleware('http')
async def restringir_administracao(request, call_next):
    if not request.client or request.client.host not in ('127.0.0.1', '::1'):
        return JSONResponse({'detail': 'Acesso apenas pelo computador local.'}, status_code=403)
    if request.method not in ('GET', 'HEAD'):
        origem = request.headers.get('origin')
        esperada = str(request.base_url).rstrip('/')
        if origem != esperada or request.headers.get('sec-fetch-site') == 'cross-site':
            return JSONResponse({'detail': 'Origem não autorizada.'}, status_code=403)
    response = await call_next(request)
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Cache-Control'] = 'no-store'
    return response

mapa = carregar()
edges = mapa['edges']
ativos = {}
clientes = set()
revisao = 0
lock = asyncio.Lock()

class Pedido(BaseModel):
    origem: str
    destino: str

class Incidente(BaseModel):
    tipo: Literal['Trânsito lento','Engarrafamento','Acidente','Alagamento','Obras','Outro']
    edges: list[str] = Field(min_length=1)
    peso: float = Field(gt=0, le=86400)

@admin.get('/api/mapa')
@app.get('/api/mapa')
async def obter_mapa():
    return {**mapa, 'revisao': revisao}

@app.post('/api/rota')
async def rota(p: Pedido):
    if p.origem not in mapa['nodes'] or p.destino not in mapa['nodes'] or p.origem == p.destino:
        raise HTTPException(422, 'Escolha dois cruzamentos diferentes.')
    resultado = calcular(edges, p.origem, p.destino)
    if resultado is None:
        raise HTTPException(404, 'Sem caminho neste recorte. Escolha outro destino.')
    return {**resultado, 'revisao': revisao}

async def avisar(ident, dados, estado):
    global revisao
    revisao += 1
    aviso = dict(id=ident, estado=estado, revisao=revisao, **dados)
    async def enviar(ws):
        try:
            await asyncio.wait_for(ws.send_json(aviso), timeout=2)
        except Exception:
            clientes.discard(ws)
    await asyncio.gather(*(enviar(ws) for ws in list(clientes)))

@admin.get('/api/incidentes')
async def listar():
    return [{'id': ident, **dados} for ident, dados in ativos.items()]

@admin.post('/api/incidentes', status_code=201)
async def abrir(p: Incidente):
    dados = p.model_dump()
    dados['edges'] = list(dict.fromkeys(p.edges))
    if any(k not in edges for k in dados['edges']):
        raise HTTPException(422, 'Trecho desconhecido.')
    async with lock:
        ident = registrar(edges, ativos, dados)
        await avisar(ident, dados, 'registrado')
    return {'id': ident}

@admin.delete('/api/incidentes/{ident}')
async def encerrar(ident: str):
    async with lock:
        if ident not in ativos:
            raise HTTPException(404, 'Incidente não está ativo.')
        dados = ativos.pop(ident)
        aplicar(edges, dados, ident, False)
        await avisar(ident, dados, 'encerrado')
    return {'id': ident}

@app.websocket('/ws')
async def conectar(ws: WebSocket):
    await ws.accept()
    async with lock:
        await ws.send_json({'estado':'conectado', 'revisao':revisao})
        clientes.add(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        clientes.discard(ws)

app.mount('/', StaticFiles(directory=Path(__file__).resolve().parents[1]/'frontend', html=True))

admin.mount('/', StaticFiles(directory=Path(__file__).resolve().parents[1]/'prefeitura', html=True))
