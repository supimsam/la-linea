c=open('/home/claude/kitchen_course_demo.html').read()
lib=open('/home/claude/exercise_library_demo.html').read()

lcss=lib[lib.index('  /* word tiles */'):lib.index('  /* bottom bar */')]
assert '  /* bottom action bar */' in c
c=c.replace('  /* bottom action bar */', lcss+'\n  /* bottom action bar */')

lex=lib[lib.index('const EX=['):lib.index('/* ============ hub ============ */')]
lren=lib[lib.index('/* ============ renderers ============ */'):lib.index('setTarget("en");')]
lren=lren.replace('finishBar(','libFinish(').replace('goHub','nextStep').replace('choose(b,()=>','libChoose(b,()=>').replace('let timerId=null;\n','')

es='''check:"Comprobar",next:"Continuar",done:"Listo",correct:"Correcto",incorrect:"Respuesta correcta:",tryAgain:"Intentar de nuevo",
      tap:"Toca las palabras en orden",tapHint:"Toca una palabra colocada para devolverla.",
      ticket:"Lee la comanda",dlg:"Elige tu respuesta",map:"Toca la estación",seqq:"Ordena los pasos",rapid:"Toca la traducción antes de que se acabe el tiempo",dict:"Escucha y escribe",speak:"Di la frase en voz alta",conjq:"Completa la tabla",
      heardNone:"No se detectó voz. Intenta otra vez.",noSR:"Tu navegador no admite reconocimiento de voz. Escribe la frase:",tapMic:"Toca el micrófono y habla",
      rapidDone:(s,t)=>`${s} de ${t} correctas`,time:"Tiempo",scoreL:"Puntos",
      kVocab:"Vocabulario",qPick:"Elige la traducción",'''
en='''check:"Check",next:"Continue",done:"Done",correct:"Correct",incorrect:"Correct answer:",tryAgain:"Try again",
      tap:"Tap the words in order",tapHint:"Tap a placed word to send it back.",
      ticket:"Read the ticket",dlg:"Choose your reply",map:"Tap the station",seqq:"Put the steps in order",rapid:"Tap the translation before time runs out",dict:"Listen and type",speak:"Say the phrase out loud",conjq:"Complete the table",
      heardNone:"No speech detected. Try again.",noSR:"Your browser doesn't support speech recognition. Type the phrase instead:",tapMic:"Tap the mic and speak",
      rapidDone:(s,t)=>`${s} of ${t} correct`,time:"Time",scoreL:"Score",
      kVocab:"Vocabulary",qPick:"Choose the translation",'''
a='       nav:"Mi curso", exercises:"6 ejercicios",'; assert a in c
c=c.replace(a,'       nav:"Mi curso", exercises:"ejercicios",\n      '+es)
a='       nav:"My course", exercises:"6 exercises",'; assert a in c
c=c.replace(a,'       nav:"My course", exercises:"exercises",\n      '+en)
# the course already has check/next/correct/incorrect keys; duplicate keys in object literal are fine in JS (last wins) but keep course "done" meaning. Rename lib done->libDone
c=c.replace('next:"Continuar",done:"Listo",','next:"Continuar",libDone:"Listo",').replace('next:"Continue",done:"Done",','next:"Continue",libDone:"Done",')

catalog=open('/tmp/claude-0/-home-claude/d49c7137-483d-5905-9c73-03ec581a3aa7/scratchpad/catalog.js').read()
a='/* =========================================================\n   STATE'; assert a in c
c=c.replace(a, lex+catalog+a)

i0=c.index('  const u=$("#units"); u.innerHTML="";'); i1=c.index("document.querySelectorAll(\"#langSeg button\")", i0)
c=c[:i0]+'''  const u=$("#units"); u.innerHTML="";
  const check=`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>`;
  t.units.forEach(([name,desc],i)=>{
    const el=document.createElement("section"); el.className="unit";
    const body=CURRICULUM[i].lessons.map((L,j)=>{
      const st=(i===0&&j===0)?"done":(i===0&&j===1)?"cur":"todo";
      const n=(L.steps==="numbers"?7:L.steps.length-1);
      return `<button class="lesson" onclick="startLesson('${L.id}')">
        <span class="st ${st}">${st==="done"?check:""}</span>
        <span><span class="t">${L.id} · ${LESSON_TITLES[native()][L.id]}</span><br><span class="d">${st==="done"?t.done:n+" "+t.exercises}</span></span>
        <span class="go" ${st==="done"?'style="color:var(--ink-3)"':""}>${st==="done"?t.review:t.start} →</span>
      </button>`;}).join("");
    el.innerHTML=`<div class="unit-h"><div class="n">${i+1}</div><div><h2>${name}</h2><p>${desc}</p></div><div class="pct">${i===0?"25%":""}</div></div>${body}`;
    u.appendChild(el);
  });
}
'''+c[i1:]

i0=c.index('function startLesson(){'); i1=c.index('function goHome(){')
c=c[:i0]+'''function startLesson(id){
  currentLesson=id;
  const L=CURRICULUM.flatMap(u=>u.lessons).find(l=>l.id===id);
  if(L.steps==="numbers"){
    const pick=()=>Math.floor(Math.random()*10);
    steps=[{type:"learn"},{type:"plates",n:pick()},{type:"listen",n:pick()},{type:"match"},{type:"type",n:pick()},{type:"sentence",n:pick()},{type:"plates",n:pick()},{type:"summary"}];
  } else steps=L.steps.map(s=>({...s}));
  idx=0; results=[];
  $("#landing").classList.add("hide"); $("#home").classList.add("hide"); $("#lesson").classList.remove("hide"); document.body.classList.add("in-lesson");
  window.scrollTo(0,0);
  render();
}
'''+c[i1:]

a='''  if(s.type==="learn"){
    sc.innerHTML=`<div class="kicker">${t.kLearn}</div><div class="q">${t.qLearn}</div>'''; assert a in c
c=c.replace(a,'''  if(s.type==="vocab"){
    const V=VOCAB[s.set][L];
    sc.innerHTML=`<div class="kicker">${t.kVocab}</div><div class="q">${LESSON_TITLES[O][currentLesson]}</div>
      <div class="vocab" id="vcard"></div>
      <div class="grid3">${V.map((w,i)=>`<button class="chip" onclick="showVocab('${s.set}',${i})"><b>${w[0]}</b><span>${w[1]}</span></button>`).join("")}</div>`;
    showVocab(s.set,0);
    setBar("", "", "", t.practice+" →", ()=>advance(null));
  }

  if(s.type==="pick"){
    const V=VOCAB[s.set][L]; const k=Math.floor(Math.random()*V.length); s.n=k;
    const set=new Set([k]); while(set.size<4)set.add(Math.floor(Math.random()*V.length));
    const opts=shuffle([...set]);
    sc.innerHTML=`<div class="kicker">${t.kVocab}</div><div class="q">${t.qPick}</div>
      <div class="vocab" style="padding:18px 22px"><div class="word" style="font-size:28px">${V[k][1]}</div></div>
      <div class="opts two">${opts.map((j,i)=>`<button class="opt" data-k="${j}" onclick="choose(${j},this)"><span class="k">${i+1}</span>${V[j][0]}</button>`).join("")}</div>`;
    setBar("", "", "", t.check, ()=>grade(picked===k, V[k][0], V[k][1])); disablePrimary();
  }

  if(s.type==="lib"){
    const e=EX.find(x=>x.id===s.id);
    R[s.id](s.data?s.data[L]:e.data[L], t, sc);
  }

'''+a)

a='function showWord(i){'; assert a in c
c=c.replace(a,'''function showVocab(set,i){
  const V=VOCAB[set][target][i];
  $("#vcard").innerHTML=`<div class="word" style="font-size:32px">${V[0]}<button class="play" data-say="${V[0]}" onclick="speak(this.dataset.say)">${SPK}</button></div><div class="tr">${V[1]}</div><div class="ex"><b>${V[2]}</b><span>${V[3]}</span></div>`;
  speak(V[0]);
}
'''+a)

a='<h2>${t.sumTitle}</h2><p>${t.sumSub}</p>'; assert a in c
c=c.replace(a,'<h2>${t.sumTitle}</h2><p>${LESSON_TITLES[native()][currentLesson]}</p>')

glue='''
/* ---------- library glue ---------- */
const libChoose=(el,cb)=>{document.querySelectorAll(".opt").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");cb();};
let timerId=null;
function libFinish(ok,t,word,sub){
  $("#primary").classList.remove("hide");
  results.push({ok, word:word||"", other:sub||""});
  setBar(ok?"ok":"err", ok?t.correct:`${t.incorrect} ${word}`, sub||"", t.next, nextStep);
}
function nextStep(){ if(timerId){clearInterval(timerId);timerId=null;} idx++; render(); window.scrollTo(0,0); }
'''
a='/* keyboard shortcuts 1-4 on choice screens */'; assert a in c
c=c.replace(a, glue+lren+a)

a='  const sc=$("#screen"); sc.className="screen"; void sc.offsetWidth; // restart anim'; assert a in c
c=c.replace(a, a+'\n  $("#primary").classList.remove("hide"); if(timerId){clearInterval(timerId);timerId=null;}')
a='function goHome(){ $("#landing")'; assert a in c
c=c.replace(a,'function goHome(){ if(timerId){clearInterval(timerId);timerId=null;} $("#landing")')
a='${missed.length?missed.map(m=>`<div class="miss"><span>${t.missed}</span><b>${m.word} · ${m.other}</b></div>`).join("")'; assert a in c
c=c.replace(a,'${missed.length?missed.map(m=>`<div class="miss"><span>${t.missed}</span><b>${[m.word,m.other].filter(Boolean).join(" · ")||"—"}</b></div>`).join("")')
# dialogue's own done label used t.done (lib) -> now libDone; and in course dialogue final should continue to next step
c=c.replace('last?t.done:t.next, last?nextStep:','t.next, last?nextStep:')
# lib speak() signature same; lib uses $("#primary") hide on self-grading -> ok
open('/home/claude/kitchen_course_demo.html','w').write(c)
print("merged")
