import {SAVE_KEY,INITIAL,isValidSave,applyDemoAction,publicState} from './engine.js';

const $=id=>document.getElementById(id);
const chat=$('chat');
const messages=$('messages');
const actionBox=$('action');
const sendButton=$('send');
let state;
try { const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); state=isValidSave(saved)?saved:INITIAL(); }
catch { state=INITIAL(); }
let busy=false;
let aiAvailable=false;
let firstPaint=true;
const fmt=n=>String(n).padStart(2,'0');
const clock=()=>`${fmt(state.hour)}:${fmt(state.minute)}`;
const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{/* Pode haver bloqueio de armazenamento privado */}};

function elt(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function createMessage(message){
  const row=elt('article','message '+message.role);
  if(message.role==='assistant')row.append(elt('span','narrator-avatar','忍'));
  const box=elt('div','message-content');
  if(message.role==='assistant')box.append(elt('div','speaker','Narrador'));
  const content=elt('div','content');
  for(const paragraph of String(message.content).split(/\n\s*\n/).filter(Boolean))content.append(elt('p','paragraph',paragraph.trim()));
  box.append(content);
  if(message.clock)box.append(elt('div','time',message.clock));
  row.append(box);
  return row;
}
function scrollBottom(smooth=false){requestAnimationFrame(()=>chat.scrollTo({top:chat.scrollHeight,behavior:smooth?'smooth':'instant'}));}
function setMode(enabled){
  aiAvailable=enabled;
  $('mode').textContent=enabled?'IA ativa':'Demo';
  $('mode').classList.toggle('ai',enabled);
  $('mode-description').textContent=enabled?'O narrador usa uma API de IA configurada no servidor. Os status continuam controlados pelas regras do jogo.':'Modo demonstração: respostas guiadas por regras locais. Para conversas livres como no ChatGPT, é necessário conectar uma API de IA com backend seguro.';
  $('dialog-copy').textContent=enabled?'A IA narradora está conectada ao servidor. Suas ações são enviadas para a API e as regras do jogo mantêm os recursos e o inventário.':'Este site está em modo demonstração. Você pode escrever qualquer ação, mas a história ainda usa respostas programadas. Uma IA real precisa de um servidor seguro e de uma chave de API, que não deve ser publicada no GitHub.';
}
function render(){
  $('meta').textContent=`Konoha · Dia ${state.day} · ${clock()} · ${state.location.split('•')[0].trim()}`;
  const stats=[['Saúde',`${state.hp}/100`],['Chakra',`${state.chakra}/${state.chakraMax}`],['Energia',`${state.stamina}/100`],['Ryō',String(state.ryo)],['Dia',String(state.day)],['Local',state.location]];
  $('stats').replaceChildren(...stats.map(([label,value])=>{const e=elt('div','stat');e.append(elt('span','',label),elt('b','',value));return e;}));
  for(const [id,data] of [['techniques',state.techniques],['inventory',state.inventory]]){
    $(id).replaceChildren(...(data.length?data:['Nenhum ainda']).map(value=>elt('span','tag'+(data.length?'':' empty'),value)));
  }
  // O narrador aparece em primeiro plano imediatamente: sem banner nem espaços vazios.
  messages.replaceChildren(...state.history.slice(-100).map(createMessage));
  $('suggestions').classList.toggle('is-hidden',state.history.some(m=>m.role==='user'));
  save();scrollBottom(!firstPaint);firstPaint=false;
}
function showPending(on){$('typing').hidden=!on;scrollBottom();}
function resizeComposer(){actionBox.style.height='auto';actionBox.style.height=Math.min(actionBox.scrollHeight,148)+'px';sendButton.disabled=busy||!actionBox.value.trim();}
function openPanel(on){
  $('panel').classList.toggle('open',on);$('panel').setAttribute('aria-hidden',String(!on));$('panel').inert=!on;
  $('scrim').hidden=!on;$('menu').setAttribute('aria-expanded',String(on));
  if(on)$('close-panel').focus();else $('menu').focus();
}
async function requestNarration(){
  // GitHub Pages é hospedagem estática: sem backend, não existe /api/narrate.
  if(location.hostname.endsWith('.github.io')||location.protocol==='file:')return null;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),22000);
  try{
    const res=await fetch('./api/narrate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state:publicState(state),history:state.history.slice(-18)}),signal:controller.signal});
    if(!res.ok)return null;
    const body=await res.json();return typeof body.text==='string'&&body.text.trim()?body.text.slice(0,5000):null;
  }catch{return null;}finally{clearTimeout(timer);}
}
async function send(value){
  const input=String(value||'').trim();if(busy||!input)return;
  busy=true;actionBox.value='';resizeComposer();document.querySelectorAll('[data-action]').forEach(b=>b.disabled=true);
  state.history.push({role:'user',content:input,clock:clock()});
  const demo=applyDemoAction(state,input);
  render();showPending(true);
  let text=null;
  try{
    // Delay visual breve apenas para modo demonstração. Não é geração de IA.
    const [response]=await Promise.all([requestNarration(),new Promise(resolve=>setTimeout(resolve,320))]);
    text=response;
  }catch{/* fallback a seguir */}
  state.history.push({role:'assistant',content:text||demo.text,clock:clock()});
  setMode(Boolean(text));showPending(false);busy=false;
  document.querySelectorAll('[data-action]').forEach(b=>b.disabled=false);
  render();resizeComposer();
}
$('composer').addEventListener('submit',event=>{event.preventDefault();send(actionBox.value);});
actionBox.addEventListener('input',resizeComposer);
actionBox.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();send(actionBox.value);}});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.action)));
$('menu').addEventListener('click',()=>openPanel(true));
$('close-panel').addEventListener('click',()=>openPanel(false));
$('scrim').addEventListener('click',()=>openPanel(false));
$('reset').addEventListener('click',()=>{
 if(busy)return;
 if(!confirm('Recomeçar o episódio 1? O progresso salvo neste navegador será substituído.'))return;
 state=INITIAL();setMode(false);openPanel(false);render();actionBox.value='';resizeComposer();
});
$('mode').addEventListener('click',()=>{$('mode-dialog').hidden=false;$('close-dialog').focus();});
$('close-dialog').addEventListener('click',()=>{$('mode-dialog').hidden=true;$('mode').focus();});
$('mode-dialog').addEventListener('click',event=>{if(event.target===$('mode-dialog'))$('close-dialog').click();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('mode-dialog').hidden=true;if($('panel').classList.contains('open'))openPanel(false);}});
window.addEventListener('pageshow',()=>scrollBottom());
setMode(false);render();resizeComposer();