// Regras do jogo: estado autoritativo separado do texto narrativo.
export const SAVE_KEY = 'shinobi-renascido-save-v2';
export const START_SCENE = `Konoha. Início da manhã. A luz entra pelas frestas da janela de uma casa pequena, numa rua afastada do centro da Vila da Folha. O cheiro de arroz recém-cozido ocupa a cozinha.\n\nSeu pai adotivo, Daichi, remenda uma sandália de trabalho na mesa. Sua mãe adotiva, Hana, divide a comida em três tigelas. O dinheiro da semana é pouco, e a inscrição na Academia Ninja é assunto frequente. Os dois criaram Henrique desde pequeno, mas há perguntas sobre sua origem Uchiha que ainda não sabem responder.\n\nHana pousa uma tigela e olha em sua direção. “Henrique, você queria conversar com a gente antes de sair?” Daichi interrompe o trabalho para ouvir.\n\nO que você faz ou diz?`;
export const INITIAL = () => ({
  schema: 2,
  hero: {name: 'Henrique Uchiha', alias:'Rick-138', age:12, clan:'Uchiha', intellect:'Excepcional', special:'Aprende técnicas após observá-las uma vez', origin:'Criado por pais adotivos humildes em Konoha'},
  day:1, hour:7, minute:5, location:'Casa da família • Konoha', locationKey:'home',
  hp:100, chakra:45, chakraMax:45, stamina:90, ryo:12,
  inventory:['Caderno usado da Academia', 'Bolsa de tecido'],
  techniques:[], acquaintances:[], observations:[], flags:{},
  history:[{role:'assistant',content:START_SCENE, clock:'07:05'}]
});
const match=(text,regex)=>regex.test(text);
const clock=s=>String(s.hour).padStart(2,'0')+':'+String(s.minute).padStart(2,'0');
export function advance(state, minutes){
  let total=state.hour*60+state.minute+minutes;
  state.day+=Math.floor(total/1440);
  total=((total%1440)+1440)%1440;
  state.hour=Math.floor(total/60);state.minute=total%60;
}
export function isValidSave(s){return Boolean(s && s.schema===2 && Array.isArray(s.history) && s.hero?.name==='Henrique Uchiha' && Array.isArray(s.techniques) && Array.isArray(s.inventory) && typeof s.hour==='number' && typeof s.ryo==='number');}
const known=(state,name)=>state.techniques.some(x=>x===name);
function learn(state,name){if(known(state,name))return false;state.techniques.push(name);return true;}
export function applyDemoAction(s,input){
 const action=input.toLocaleLowerCase('pt-BR');
 let text='';let minutes=3;
 const parents=match(action,/pais|mãe|mae|pai|hana|daichi|fam[íi]lia|conversar/);
 const aboutAcademy=match(action,/academia|aula|treinamento|professor|iruka|ninja/);
 const look=match(action,/observ|espi|olh|assisti|prestar aten|repar|examinar/);
 const use=match(action,/execut|realiz|tentar|pratic|usar|fazer|conjur|bunshin|clones?/);
 const goAcademy=match(action,/academia|escola|sal(a|ão) de aula|professor/)&&match(action,/ir |vou |sair|caminh|entr|cheg|seguir|dirig|rumo|at[eé] a/);
 const goHome=match(action,/voltar( para)? casa|retorn(ar|o)?( para)? casa|ir para casa|vou para casa|entr(ar|o)? em casa|voltar ao lar/);
 const sleep=match(action,/dormir|adormec|deitar para dormir/);
 const eat=match(action,/comer|aliment|caf[eé]|arroz|refei[çc]/);
 const timeAtStart=clock(s);
 if(sleep){minutes=480; s.stamina=Math.min(100,s.stamina+35);s.chakra=Math.min(s.chakraMax,s.chakra+15); text='O descanso ocupa várias horas. Quando a casa volta a se movimentar, sons familiares atravessam as paredes finas. Lá fora, Konoha continua sua rotina. Nada além do que você realmente fez foi decidido por você.';}
 else if(goHome){s.locationKey='home';s.location='Casa da família • Konoha';minutes=15;text='A porta da casa simples está entreaberta. O cheiro de comida caseira e o som de ferramentas vêm de dentro. Hana e Daichi seguem suas tarefas; existe espaço para uma conversa, se você quiser iniciá-la.';}
 else if(goAcademy){s.locationKey='academy';s.location='Academia Ninja • Konoha';minutes=18;s.stamina=Math.max(0,s.stamina-3);text='Os caminhos de Konoha conduzem a um prédio movimentado. Crianças da sua idade circulam perto da Academia Ninja; algumas usam bandanas de suas famílias, outras carregam cadernos gastos. Pela porta aberta vem a voz de um instrutor organizando os alunos. Você ainda não conhece os nomes de quase ninguém ali.';}
 else if(s.locationKey==='home' && parents && aboutAcademy){text='Daichi apoia a sandália sobre a mesa. “A Academia é a chance de você construir seu futuro. Mas não precisa provar nada hoje.” Hana completa: “A gente juntou o que deu para seus materiais. E quero saber como você se sente com isso.” Ambos aguardam sua resposta sem escolher por você.';}
 else if(s.locationKey==='home' && parents){text='Hana afasta a panela do fogo e se vira para ouvir. “Pode falar, Henrique.” Daichi deixa as ferramentas de lado, curioso. A preocupação com as contas é visível, mas os dois prestam atenção ao que você tem para dizer.';}
 else if(s.locationKey==='home' && look){text='O quarto tem paredes gastas, uma cama estreita e poucos objetos. Na cozinha, Hana separa o arroz enquanto Daichi examina a sola da sandália. Pela janela passam moradores indo trabalhar; bem longe, o rosto esculpido dos Hokages domina a encosta da vila. Há muita coisa que você ainda não entende sobre este lugar.';}
 else if(s.locationKey==='home' && eat){minutes=12;s.stamina=Math.min(100,s.stamina+5);text='Hana oferece uma porção modesta do café da manhã. Daichi faz as contas em silêncio, depois deixa escapar um sorriso discreto ao comentar que espera encontrar trabalho até o fim do dia.';}
 else if(s.locationKey==='academy' && look && (aboutAcademy || match(action,/jutsu|t[eé]cnica|clone|bunshin|instrutor|aluno/))){
   const first=learn(s,'Bunshin no Jutsu');s.flags.sawBunshin=true;
   text='Perto da sala, um instrutor demonstra uma técnica básica: ele concentra chakra, faz uma sequência de selos e uma cópia ilusória surge ao lado dele. A demonstração dura poucos segundos. Sua mente extraordinária registra o fluxo de chakra, os movimentos e a ordem exata. '+(first?'Você aprendeu **Bunshin no Jutsu** apenas observando uma vez.':'Você reconhece a mesma técnica que já havia registrado.')+' Ainda será preciso gastar chakra para executá-la. O instrutor continua a aula, sem perceber o alcance da sua compreensão.';
 }
 else if(s.locationKey==='academy' && use && match(action,/bunshin|clone|c[oó]pia/)){
   minutes=5;
   if(!known(s,'Bunshin no Jutsu')) text='Você ainda não observou uma demonstração completa dessa técnica. Mesmo com seu raciocínio excepcional, falta a informação visual necessária para reconstruí-la com precisão. Você pode procurar uma aula ou alguém que a execute.';
   else if(s.chakra<7)text='Você conhece os selos e a forma correta de executar o jutsu, mas seu chakra atual não é suficiente. O limite físico permanece real.';
   else{s.chakra-=7;s.stamina=Math.max(0,s.stamina-2);text='Os selos são reproduzidos com uma precisão inesperada. Seu chakra se organiza como na demonstração observada, e uma cópia ilusória toma forma por alguns instantes. A técnica funciona. Dois alunos próximos interrompem a conversa, surpresos com a facilidade do movimento.';}
 }
 else if(s.locationKey==='academy' && match(action,/naruto|sasuke|sakura|iruka|mizuki/)){
    text='Há muitos estudantes e instrutores no local, mas você ainda não possui familiaridade pessoal com esse nome. Pode observar, se aproximar ou perguntar a alguém para descobrir quem é quem — sem que isso obrigue Henrique a dizer ou fazer algo.';
 }
 else if(s.locationKey==='academy' && look){text='Os alunos conversam em pequenos grupos. Um garoto de cabelo claro chama bastante atenção pelo barulho no corredor; um instrutor tenta manter a turma organizada. Os acontecimentos seguem o ritmo do dia, mas você não conhece a história dessas pessoas.';}
 else if(s.locationKey==='academy' && parents){text='Seus pais não estão aqui neste momento. Ao redor, você encontra estudantes, instrutores e visitantes. Para conversar com Hana ou Daichi, seria necessário voltar para casa ou procurá-los.';}
 else if(match(action,/invent[áa]rio|mochila|bolsa/)){text='Você verifica seus pertences: '+s.inventory.join(', ')+'. Não aparece nenhum objeto novo sem que tenha sido encontrado, recebido ou comprado.';}
 else if(match(action,/comprar|vender|dinheiro|ryo/)){text='A vila possui lojas e pequenas bancas, mas nenhuma compra ou venda é concluída automaticamente. Você tem '+s.ryo+' ryō. Descreva com quem pretende negociar e o que deseja obter.';}
 else if(match(action,/sair|explor|rua|passear|caminhar/)){s.locationKey='street';s.location='Ruas de Konoha';minutes=12;text='As ruas da Vila da Folha estão movimentadas. Lojas simples abrem suas portas, mensageiros passam depressa e famílias seguem seus afazeres. Ao fundo, você vê a encosta com os rostos dos Hokages. Pode escolher um destino ou alguém com quem conversar.';}
 else if(s.locationKey==='street' && aboutAcademy){text='O caminho até a Academia Ninja está sinalizado por placas de madeira. Crianças passam apressadas, mas ninguém parece especialmente interessado na sua presença. Você pode seguir até lá quando quiser.';}
 else{text='O ambiente reage à sua iniciativa sem escolher novas ações por você. '+(s.locationKey==='home'?'Hana e Daichi seguem suas tarefas domésticas enquanto o dia avança.':s.locationKey==='academy'?'Os alunos continuam sua rotina na Academia, e os instrutores organizam as atividades.':'Os moradores continuam trabalhando e conversando nas ruas de Konoha.')+' (Narrador demonstrativo: conecte uma API de IA no servidor para respostas livres e detalhadas.)';}
 advance(s,minutes);
 return {text:text.replaceAll('**',''),minutes,clock:clock(s),previousClock:timeAtStart};
}
export function publicState(s){const {history,...data}=s;return data;}