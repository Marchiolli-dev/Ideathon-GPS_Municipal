import asyncio
import socket
import webbrowser
from contextlib import ExitStack

import uvicorn
from backend.main import app, admin


def reservar(porta):
    canal = socket.socket()
    try:
        canal.bind(("127.0.0.1", porta))
    except OSError:
        canal.bind(("127.0.0.1", 0))
    return canal


async def abrir_paginas(servidores, urls):
    while not all(s.started for s in servidores):
        if any(s.should_exit for s in servidores):
            return
        await asyncio.sleep(0.1)
    for url in urls:
        webbrowser.open(url)


async def iniciar():
    with ExitStack() as contexto:
        canais = [contexto.enter_context(reservar(p)) for p in (8000, 8001)]
        urls = [f"http://127.0.0.1:{s.getsockname()[1]}" for s in canais]
        servidores = [
            uvicorn.Server(uvicorn.Config(aplicacao, host="127.0.0.1",
                port=canal.getsockname()[1], proxy_headers=False))
            for aplicacao, canal in zip((app, admin), canais)
        ]
        print(f"GPS: {urls[0]}\nPrefeitura local: {urls[1]}", flush=True)
        await asyncio.gather(
            *(s.serve(sockets=[c]) for s, c in zip(servidores, canais)),
            abrir_paginas(servidores, urls),
        )


if __name__ == "__main__":
    try:
        asyncio.run(iniciar())
    except KeyboardInterrupt:
        pass
