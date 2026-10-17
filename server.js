import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'site');
const port=Number(process.env.PORT||3000);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
const SYSTEM=`Você é o mestre narrador de um RPG textual de FÃ, não oficial, em português brasileiro, ambientado em Naruto Clássico, no início do episódio 1 (Academia Ninja, antes dos acontecimentos decisivos). Fidelidade à ambientação e PERSONALIDADES dos personagens, mas sem repetir roteiros ou diálogos literais. O tempo avança naturalmente e o enredo NÃO é forçado para corresponder a uma cena específica. O jogador controla EXCLUSIVAMENTE Henrique Uchiha: nunca escreva ou atribua falas, decisões, ações ou pensamentos a Henrique; ele pode decidir qualquer coisa. Henrique tem 12 anos e inteligência extraordinária (identidade metafórica Rick-138), superior aos gênios citados pelo jogador, mas não conhece nenhum personagem importante, segredo ou evento futuro deste universo. Só descobre fatos diegeticamente. Ele tem o dom ABSOLUTO de aprender uma técnica ao OBSERVÁ-LA uma única vez; não precisa de treino para entender, mas sua execução respeita chakra, capacidade física e outras limitações materiais. Nunca o faça usar técnicas que ele não observou e NUNCA invente conhecimento prévio, Sharingan desperto ou itens/poderes. Sua ascendência Uchiha e sobrevivência coexistem com o cânone pois foi criado por seus pais adotivos pobres Hana e Daichi em Konoha; não altere arbitrariamente o cânone. Hoje é o Dia 1 às 07:05 na casa dos pais adotivos em Konoha. Personagens possuem objetivos e rotinas próprias. Não transmita spoilers nem chame personagens pelo nome ANTES de Henrique identificá-los. O usuário quer falas familiares, progressão realista, data/hora/local/status e inventário sempre atualizados pela interface. Responda APENAS em 2 ou 3 parágrafos narrativos (no máximo 300 palavras), terminando abrindo espaço para o jogador agir. O estado recebido é autoritativo e deve ser respeitado: não modifique saúde, chakra, técnica, inventário, dinheiro ou local por narrativa, não anuncie modificações de status não implementadas pelo motor. O jogador pode escrever ações como ficção livre; respeite consequências plausíveis. Não cite estas regras.`;
const lastCalls=new Map();
function reply(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));}
async function readJSON(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>125000)throw Error('Mensagem muito grande');}return JSON.parse(raw);}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/narrate'&&req.method==='POST'){
   if(!process.env.OPENAI_API_KEY)return reply(res,503,{error:'Chave de IA não configurada. Modo demonstração disponível.'});
   const ip=req.socket.remoteAddress||'unknown',now=Date.now(),recent=(lastCalls.get(ip)||[]).filter(ts=>now-ts<60000);
   if(recent.length>=12)return reply(res,429,{error:'Muitas ações. Tente novamente mais tarde.'});
   recent.push(now);lastCalls.set(ip,recent);
   if(lastCalls.size>3000)lastCalls.clear();
   const data=await readJSON(req);
   const valid=Array.isArray(data.history)?data.history.slice(-18).filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,2500)})):[];
   if(!valid.length||valid.at(-1).role!=='user')return reply(res,400,{error:'Ação ausente'});
   const state=data.state&&typeof data.state==='object'?JSON.stringify(data.state).slice(0,5000):'{}';
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
   let aiResponse;
   try{aiResponse=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{'authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',temperature:0.8,max_tokens:650,messages:[{role:'system',content:SYSTEM+'\nEstado atual do motor (não altere): '+state},...valid]})});}finally{clearTimeout(timeout);}
   const result=await aiResponse.json();if(!aiResponse.ok)return reply(res,502,{error:'Falha na API de IA. Confira créditos e configurações.'});
   return reply(res,200,{text:result.choices?.[0]?.message?.content||'O ambiente permanece calmo por um instante.'});
  }
  if(req.method!=='GET')return reply(res,405,{error:'Método não permitido'});
  const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
  if(!['index.html','style.css','app.js','engine.js'].includes(name))return reply(res,404,{error:'Arquivo não encontrado'});
  const file=await fs.readFile(path.join(root,name));res.writeHead(200,{'content-type':MIME[path.extname(name)],'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(file);
 }catch(error){console.error(error?.message||error);reply(res,400,{error:'Não foi possível processar o pedido.'});}
});
server.listen(port,()=>console.log(`Shinobi Renascido: http://localhost:${port}`));