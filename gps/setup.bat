@echo off
setlocal
title GPS Municipal de Aracatuba
pushd "%~dp0" || goto falha
if not exist "backend\requirements.txt" goto pasta
set "PYGPS=.venv\Scripts\python.exe"
if exist "%PYGPS%" goto preparar
py -3 -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
if not errorlevel 1 (
    py -3 -m venv .venv
) else (
    python -c "import sys; sys.exit(sys.version_info < (3,10))" >nul 2>&1
    if errorlevel 1 goto semp
    python -m venv .venv
)
if errorlevel 1 goto falha
:preparar
"%PYGPS%" -c "import backend.main, uvicorn, websockets" >nul 2>&1
if not errorlevel 1 goto iniciar
echo Instalando as dependencias do GPS...
"%PYGPS%" -m pip install -r backend\requirements.txt
if errorlevel 1 goto falha
:iniciar
echo Abrindo o GPS. Para encerrar, pressione Ctrl+C nesta janela.
"%PYGPS%" iniciar_local.py
if errorlevel 1 goto falha
popd
exit /b 0
:semp
echo Instale o Python 3.10 ou mais recente para Windows e tente novamente.
goto falha
:pasta
echo Extraia o ZIP inteiro e abra este arquivo dentro da pasta gps.
:falha
echo Nao foi possivel iniciar o GPS. Confira a mensagem acima.
pause
exit /b 1
