const botao = document.querySelector('.abrir-acessibilidade');
const painel = document.getElementById('acessibilidade');
const tamanho = document.getElementById('tamanho-texto');
const contraste = document.getElementById('alto-contraste');
let preferencias = {tamanho:'normal', contraste:false};
try {
  const salvas = JSON.parse(localStorage.getItem('gps-acessibilidade'));
  if (salvas) preferencias = {
    tamanho: ['normal','grande','maior'].includes(salvas.tamanho) ? salvas.tamanho : 'normal',
    contraste: salvas.contraste === true
  };
} catch {}
function aplicar() {
  document.body.dataset.texto = preferencias.tamanho;
  document.body.classList.toggle('alto-contraste', preferencias.contraste);
  tamanho.value = preferencias.tamanho;
  contraste.checked = preferencias.contraste;
  try { localStorage.setItem('gps-acessibilidade', JSON.stringify(preferencias)); } catch {}
  window.dispatchEvent(new Event('resize'));
}
botao.addEventListener('click', () => {
  painel.showModal();
  botao.setAttribute('aria-expanded','true');
});
painel.addEventListener('close', () => {
  botao.setAttribute('aria-expanded','false');
  botao.focus();
});
tamanho.addEventListener('change', () => { preferencias.tamanho = tamanho.value; aplicar(); });
contraste.addEventListener('change', () => { preferencias.contraste = contraste.checked; aplicar(); });
document.getElementById('restaurar-acessibilidade').addEventListener('click', () => {
  preferencias = {tamanho:'normal', contraste:false};
  aplicar();
});
aplicar();
