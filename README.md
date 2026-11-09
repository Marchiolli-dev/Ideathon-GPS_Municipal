# Ideathon
## Semana SEMATEC da FATEC (2026) - Projeto em Grupo - GPS Municipal

### SOBRE O PROJETO

O GPS Municipal tem como objeto ser um sistema de GPS centralizado na prefeitura de cada município, permitindo maior controle e personalização nas rotas dado as circunstâncias da cidade como alagamentos, acidentes, obras e serviços, transito lento, engarrafamento e afins.

### ORGANIZAÇÃO DO SISTEMA

O Sistema será separado entre **Client** e **Server**.

O **Server** terá como função:

 * Permitir que a prefeitura registre incidentes que possam interferir no fluxo de trânsito habitual.
 * Montar rotas para percorrer a cidade, levando em consideração todos os incidentes e alterações no trânsito cadastrados.
 * Emitir alertas aos **Client**s sobre novos incidentes registrados.

O **Client** terá como função:

 * Requisitar rotas.
 * Receber os alertas do **Server**.
 * Avaliar se novos incidentes afetam rotas já estabelecidas, oferecendo a opção de pedir para recalcular a rota.

### Requisitos

  Python 3.10 ou superior e acesso à internet. As dependências estão em "gps\backend\requirements.txt" e podem ser baixadas e instaladas utilizando o próprio Python.

### Como Rodar

#### Método Automático
  
  Rode o arquivo "*gps\setup.bat*" como administrador
  
#### Método Manual

 É recomendado a utilização de um ambiente virtual para o projeto!

 Após baixar o projeto:

  * Extraia o arquivo "GPS_Municipal_Aracatuba.zip".

  * Abra o Prompt de Comando e acesse a pasta "gps".

  * Instale as depencências dentro de "backend\requirements.txt"
    * Utilize o comando "*.venv\Scripts\python.exe -m pip install -r backend\requirements.txt*" para instalar as dependências. É necessário conexão com a internet, e é recomendado a utilização de um ambiente virtual.


  * Inicie o programa com "*.venv\Scripts\python.exe iniciar_local.py*"
    * O programa por padrão tenta utilizar os seguintes endereços:
        * GPS: http://127.0.0.1:8000
        * Prefeitura: http://127.0.0.1:8001
    * Caso uma porta esteja ocupada, o programa buscará outra porta! O endereço escolhido sempre será mostrado na tela do terminal.

  * Mantenha o terminal aberto para manter o servidor ativo.

  * Precione "*CTRL + C*" para encerrar o servidor. Os incidentes são guardados em memória e perdidos quando o servidor é encerrado.

  * Execute "*.venv\Scripts\python.exe iniciar_local.py*" sempre que quiser iniciar novamente a aplicação.
