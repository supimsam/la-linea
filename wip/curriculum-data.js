
/* =========================================================
   CURRICULUM — every lesson is a sequence of steps
   ========================================================= */
const VOCAB={
  greet:{en:[["Hello","Hola","Hello, chef.","Hola, chef."],["Good morning","Buenos días","Good morning, everyone.","Buenos días a todos."],["How are you?","¿Cómo estás?","How are you today?","¿Cómo estás hoy?"],["My name is…","Me llamo…","My name is Luis.","Me llamo Luis."],["Nice to meet you","Mucho gusto","Nice to meet you, Maria.","Mucho gusto, María."],["Thank you","Gracias","Thank you for the help.","Gracias por la ayuda."],["See you tomorrow","Hasta mañana","See you tomorrow at four.","Hasta mañana a las cuatro."],["Excuse me","Perdón","Excuse me, coming through.","Perdón, voy pasando."]],
         es:[["Hola","Hello","Hola, chef.","Hello, chef."],["Buenos días","Good morning","Buenos días a todos.","Good morning, everyone."],["¿Cómo estás?","How are you?","¿Cómo estás hoy?","How are you today?"],["Me llamo…","My name is…","Me llamo Luis.","My name is Luis."],["Mucho gusto","Nice to meet you","Mucho gusto, María.","Nice to meet you, Maria."],["Gracias","Thank you","Gracias por la ayuda.","Thank you for the help."],["Hasta mañana","See you tomorrow","Hasta mañana a las cuatro.","See you tomorrow at four."],["Perdón","Excuse me","Perdón, voy pasando.","Excuse me, coming through."]]},
  days:{en:[["Monday","lunes","I work Monday.","Trabajo el lunes."],["Tuesday","martes","Tuesday is prep day.","El martes es día de prep."],["Wednesday","miércoles","Delivery comes Wednesday.","La entrega llega el miércoles."],["Thursday","jueves","Thursday is slow.","El jueves es tranquilo."],["Friday","viernes","Friday is busy.","El viernes es pesado."],["Saturday","sábado","Saturday, double shift.","El sábado, turno doble."],["Sunday","domingo","Sunday is brunch.","El domingo es brunch."],["Today","hoy","Today I open.","Hoy abro yo."],["Tomorrow","mañana","Tomorrow I'm off.","Mañana descanso."]],
        es:[["lunes","Monday","Trabajo el lunes.","I work Monday."],["martes","Tuesday","El martes es día de prep.","Tuesday is prep day."],["miércoles","Wednesday","La entrega llega el miércoles.","Delivery comes Wednesday."],["jueves","Thursday","El jueves es tranquilo.","Thursday is slow."],["viernes","Friday","El viernes es pesado.","Friday is busy."],["sábado","Saturday","El sábado, turno doble.","Saturday, double shift."],["domingo","Sunday","El domingo es brunch.","Sunday is brunch."],["hoy","Today","Hoy abro yo.","Today I open."],["mañana","Tomorrow","Mañana descanso.","Tomorrow I'm off."]]}
};
const CURRICULUM=[
  {lessons:[
    {id:"1.1", steps:[{type:"vocab",set:"greet"},{type:"pick",set:"greet"},{type:"pick",set:"greet"},{type:"lib",id:"order",data:{en:{sentence:"Nice to meet you, chef.",trans:"Mucho gusto, chef.",extra:["morning","thank"]},es:{sentence:"Mucho gusto, chef.",trans:"Nice to meet you, chef.",extra:["hola","gracias"]}}},{type:"lib",id:"dict",data:{en:{text:"Good morning, everyone.",trans:"Buenos días a todos."},es:{text:"Buenos días a todos.",trans:"Good morning, everyone."}}},{type:"summary"}]},
    {id:"1.2", steps:"numbers"},
    {id:"1.3", steps:[{type:"vocab",set:"days"},{type:"pick",set:"days"},{type:"pick",set:"days"},{type:"lib",id:"dict",data:{en:{text:"I work Friday and Saturday.",trans:"Trabajo el viernes y el sábado."},es:{text:"Trabajo el viernes y el sábado.",trans:"I work Friday and Saturday."}}},{type:"pick",set:"days"},{type:"summary"}]},
    {id:"1.4", steps:[{type:"lib",id:"rapid"},{type:"lib",id:"map"},{type:"lib",id:"dict",data:{en:{text:"Behind you, hot pan.",trans:"Detrás de ti, sartén caliente."},es:{text:"Detrás de ti, sartén caliente.",trans:"Behind you, hot pan."}}},{type:"summary"}]}
  ]},
  {lessons:[{id:"2.1", steps:[{type:"lib",id:"conj"},{type:"lib",id:"dict"},{type:"lib",id:"order",data:{en:{sentence:"We need more plates.",trans:"Necesitamos más platos.",extra:["want","have"]},es:{sentence:"Necesitamos más platos.",trans:"We need more plates.",extra:["queremos","tenemos"]}}},{type:"summary"}]}]},
  {lessons:[{id:"3.1", steps:[{type:"lib",id:"order"},{type:"lib",id:"speak"},{type:"lib",id:"dict",data:{en:{text:"Where is the sauce?",trans:"¿Dónde está la salsa?"},es:{text:"¿Dónde está la salsa?",trans:"Where is the sauce?"}}},{type:"summary"}]}]},
  {lessons:[{id:"4.1", steps:[{type:"lib",id:"seq"},{type:"lib",id:"order",data:{en:{sentence:"First heat the pan, then add the oil.",trans:"Primero calienta la sartén, luego agrega el aceite.",extra:["finally","now"]},es:{sentence:"Primero calienta la sartén, luego agrega el aceite.",trans:"First heat the pan, then add the oil.",extra:["por último","ahora"]}}},{type:"summary"}]}]},
  {lessons:[{id:"5.1", steps:[{type:"lib",id:"ticket"},{type:"lib",id:"dialogue"},{type:"summary"}]}]},
  {lessons:[{id:"6.1", steps:[{type:"pick",set:"greet"},{type:"plates",n:4},{type:"lib",id:"rapid"},{type:"lib",id:"conj"},{type:"lib",id:"dialogue"},{type:"summary"}]}]}
];
const LESSON_TITLES={
  es:{"1.1":"Saludos y presentaciones","1.2":"Números del 1 al 10","1.3":"Días y horarios","1.4":"Frases de supervivencia","2.1":"Necesitar y querer","3.1":"Pedir y ubicar","4.1":"Primero, luego, después","5.1":"La comanda y el chef","6.1":"Evaluación de la unidad"},
  en:{"1.1":"Greetings & introductions","1.2":"Numbers 1–10","1.3":"Days & schedules","1.4":"Survival phrases","2.1":"Need and want","3.1":"Asking and locating","4.1":"First, then, next","5.1":"The ticket and the chef","6.1":"Unit assessment"}
};
let currentLesson="1.2";

