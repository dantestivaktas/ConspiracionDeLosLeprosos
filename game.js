/* ============================================
   1321: El Juicio de la Razón
   Medieval Visual Novel — Game Logic
   ============================================ */

// ---- Game State ----
const state = {
  interrogated: new Set(),
  testimonies: [],
  currentDialogue: null,
  selectedVariants: {},  // tracks which variant was chosen for each character
  typewriterGen: 0,      // generation counter to cancel stale typewriters
};

// ---- Utility: pick a random element ----
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- Character Data with Multiple Variants ----
// Each character has multiple possible testimony sets.
// One is chosen at random when the game starts.
const characterTemplates = {
  villager: {
    id: 'villager',
    name: 'Marguerite Duval',
    role: 'Aldeana del pueblo de Carcassonne',
    portrait: 'assets/villager_portrait.png',
    tag: 'superstition',
    tagLabel: 'Superstición',
    variants: [
      {
        testimony: 'Marguerite asegura haber visto a los leprosos merodear junto al pozo del pueblo al anochecer. Relaciona la enfermedad de varios niños con su presencia, sin aportar prueba alguna más allá de la coincidencia temporal y los rumores de los vecinos.',
        dialogue: [
          '¡Los vi, señor! Con mis propios ojos... los leprosos rondaban el pozo al caer la noche. Eran sombras arrastrándose como ratas.',
          'Desde entonces, tres niños del barrio enfermaron del estómago. Fiebres, vómitos... ¿Qué más prueba necesitáis? El agua los está matando.',
          'Todo el mundo lo sabe: ellos quieren lo que tenemos. Si no pueden vivir como nosotros, nos arrastrarán a todos a la tumba. Es odio, señor, odio puro.',
          'Mi vecina Jeanne dice que su primo, en Toulouse, vio a uno echando polvos verdes en el agua. ¡Polvos del mismísimo demonio! ¿Vais a esperar a que nos pase lo mismo aquí?',
          'Hacedme caso, señor investigador. Si no actuamos pronto, todos estaremos muertos antes de que acabe el verano. Quemadlos a todos y salvad al pueblo.',
        ],
      },
      {
        testimony: 'La aldeana relata que el ganado empezó a morir tras beber del río que pasa cerca de la leprosería. Cita confesiones arrancadas bajo tortura en otros pueblos como "prueba" de una conspiración organizada por los leprosos de toda Francia.',
        dialogue: [
          'Primero fueron las cabras de mi esposo, señor. Bebieron del río que baja desde la leprosería y a los tres días estaban muertas. Hinchadas como odres.',
          'Luego enfermó el viejo Pierre, que siempre bebe del mismo arroyo. ¿Coincidencia? No soy tonta, señor, aunque sea campesina.',
          'En Périgueux ya confesaron. Los torturaron, sí, pero ¿por qué confesarían si no fuera verdad? Nadie confiesa una mentira bajo el dolor.',
          'Dicen que los judíos les dieron los venenos. Una conspiración, señor, una conspiración contra todo el reino cristiano. Desde Navarra hasta Provenza.',
          'Mi madre murió de fiebres el invierno pasado. Ahora sé por qué. El agua ya llevaba meses envenenada. ¡Actuad de una vez o cargaréis con nuestras muertes!',
        ],
      },
      {
        testimony: 'Marguerite describe un sueño que interpreta como una visión divina: un ángel le advirtió que los impuros contaminan las fuentes. Mezcla superstición religiosa con rumores que escuchó en el mercado, presentándolo todo como verdad incuestionable.',
        dialogue: [
          'Escuchadme bien, señor, porque lo que os digo no es invención mía. Lo soñé. Un ángel con espada de fuego me mostró los pozos del pueblo teñidos de negro.',
          'Me dijo: "Los impuros envenenan la tierra de los justos." Y al despertar, supe que hablaba de los leprosos. ¿Quién más podría ser?',
          'En el mercado, el carnicero y la panadera dicen lo mismo. El agua sabe rara desde hace semanas. Amarga, como si le hubieran echado hiel de toro.',
          'Mi hija pequeña tiene llagas en la boca desde que bebió del pozo de la plaza. ¡Llagas, señor! ¿No es eso lo que les pasa a ellos? Nos están contagiando a propósito.',
          'Dios me puso este sueño en la cabeza por algo. No podéis ignorar una señal divina. Si no los detenéis, seréis cómplice ante los ojos del Señor.',
        ],
      },
      {
        testimony: 'La aldeana narra cómo un grupo de vecinos encontró hierbas sospechosas cerca del pozo y las atribuyó a los leprosos. Afirma que el párroco del pueblo ha confirmado que se trata de brujería. Todo su relato se basa en interpretaciones erróneas y el testimonio de terceros.',
        dialogue: [
          'Hace dos semanas, el hijo del herrero encontró unas hierbas extrañas junto al brocal del pozo. Atadas con un cordel negro, señor. Un cordel negro.',
          'Se las llevamos al padre Étienne y las examinó con cuidado. Dijo que eran hierbas de bruja, usadas para maldecir el agua. Se persignó tres veces.',
          'Todo el mundo sabe que los leprosos conocen hierbas que los sanos ignoramos. En su leprosería cultivan plantas raras. ¿Para qué, si no es para envenenar?',
          'Desde que encontramos esas hierbas, yo hiervo el agua antes de beberla, pero mis vecinos no. Y son los que más enferman. ¿Eso no os dice nada?',
          'No necesito saber leer para ver lo evidente, señor. El mal viene de la leprosería. Toda mujer del pueblo lo siente en los huesos. Proteged a nuestros hijos.',
        ],
      },
    ],
  },
  monk: {
    id: 'monk',
    name: 'Fray Bernard de Montpellier',
    role: 'Monje franciscano y estudioso',
    portrait: 'assets/monk_portrait.png',
    tag: 'rational',
    tagLabel: 'Duda racional',
    variants: [
      {
        testimony: 'Fray Bernard, estudioso de Galeno y Avicena, argumenta que la lepra es una enfermedad de la piel que avanza lentamente y no puede transmitirse a través del agua. Señala que las fiebres estomacales son comunes cada verano por el calor, y que condenar sin pruebas sería una injusticia imperdonable.',
        dialogue: [
          'He dedicado veinte años al estudio de los textos de Galeno y Avicena. La lepra, señor mío, no envenena pozos. Es una enfermedad de la carne, no del agua.',
          'Es un mal que consume la piel lentamente durante años, no un veneno que mata en días. Confundís dolencias completamente distintas. Es como culpar al viento de un terremoto.',
          'Los niños enfermaron, sí. Pero el calor del verano pudre las aguas estancadas sin necesidad de conspiraciones. Ocurre cada año en todas las villas de Occitania.',
          'Observad la lógica: si los leprosos quisieran envenenar los pozos, ¿no beberían ellos mismos de esa agua? ¿Por qué envenenar su propia fuente de vida? Es absurdo.',
          'Os lo suplico: no dejéis que el miedo sustituya al pensamiento. La Historia juzgará con dureza a quienes condenen sin pruebas. Sed el hombre racional que este siglo necesita.',
        ],
      },
      {
        testimony: 'El monje analiza las "confesiones" obtenidas en otros pueblos y demuestra que fueron arrancadas bajo tortura. Explica que cualquier persona confiesa lo que sus torturadores quieren oír para que cese el dolor. Cita precedentes de acusaciones falsas similares contra judíos y templarios.',
        dialogue: [
          'Me dicen que en Périgueux y en Chinon los leprosos "confesaron." Permitidme una pregunta, señor: ¿habéis visto alguna vez lo que hace el potro de tortura a un cuerpo humano?',
          'Bajo tormento, un hombre confesará haber volado sobre las murallas de Jerusalén si con ello cesan las tenazas al rojo. La tortura no produce verdad, produce obediencia.',
          'Recordad a los Templarios. Hace apenas diez años, confesaron adorar a Baphomet y escupir sobre la cruz. ¿Lo creéis cierto? Eran caballeros de Cristo, señor. Confesaron por miedo.',
          'He leído todas las actas que han llegado a nuestro monasterio. Las confesiones son idénticas, palabra por palabra, de pueblo en pueblo. ¿No os resulta sospechoso? Les dictan lo que deben decir.',
          'La razón nos dice que una conspiración de miles de enfermos aislados en leproserías separadas por cientos de leguas es una imposibilidad logística. ¿Cómo se coordinaron, si no pueden ni salir de sus muros?',
        ],
      },
      {
        testimony: 'Fray Bernard presenta un argumento científico: ha examinado personalmente el agua de tres pozos del pueblo y no ha encontrado alteración alguna. Explica que las fiebres coinciden con un lote de grano en mal estado llegado del norte, no con ningún envenenamiento.',
        dialogue: [
          'Antes de venir ante vos, hice algo que nadie en este pueblo ha tenido la sensatez de hacer: examiné el agua. Cogí muestras de tres pozos diferentes.',
          'La hice hervir, la observé, la dejé reposar. Es agua limpia, señor. Cristalina como la de cualquier verano. No hay turbidez, no hay olor extraño, no hay residuo alguno.',
          'Sin embargo, descubrí algo interesante en el granero del mercado. Hace un mes llegó un cargamento de trigo del norte. Parte de ese grano estaba ennegrecido por el cornezuelo.',
          'El cornezuelo es un hongo, señor, no una maldición. Produce fiebres, calambres y delirios en quien come pan hecho con grano infectado. Los síntomas coinciden exactamente con lo que describen los aldeanos.',
          'La causa del mal está en el pan, no en el agua. Y los leprosos no comen nuestro pan, pues reciben las sobras por separado. Son, irónicamente, los únicos que no pueden estar enfermos por esta causa.',
        ],
      },
      {
        testimony: 'El monje plantea un razonamiento filosófico: si la razón de Dios creó un mundo ordenado, entonces las enfermedades tienen causas naturales que se pueden investigar. Acusar sin evidencia no es justicia, es barbarie disfrazada de piedad. Pide al investigador que confíe en la lógica, no en el pánico.',
        dialogue: [
          'Permitidme, señor, apelar no a la medicina sino a la filosofía. Si Dios creó un mundo racional, entonces cada efecto tiene una causa natural que la mente humana puede descubrir.',
          'Buscar culpables antes de buscar causas es invertir el orden de la Creación. Es como construir el tejado antes que los cimientos: la casa entera se derrumba.',
          'He hablado con el guardián de la leprosería. Los enfermos están tras muros de piedra, con una sola puerta vigilada día y noche. No hay registros de ninguna fuga en dos años.',
          'Los aldeanos dicen "todo el mundo lo sabe." Pero ¿qué es ese "saber"? No es conocimiento, es eco. Un rumor repetido mil veces no se convierte en verdad, solo en un rumor más fuerte.',
          'Santo Tomás de Aquino escribió que la razón es el instrumento que Dios nos dio para distinguir lo verdadero de lo falso. Usadla, señor. Es vuestra obligación moral.',
        ],
      },
    ],
  },
  leper: {
    id: 'leper',
    name: 'Jean le Malade',
    role: 'Enfermo de lepra, recluido en la leprosería',
    portrait: 'assets/leper_portrait.png',
    tag: 'truth',
    tagLabel: 'Verdad oculta',
    variants: [
      {
        testimony: 'Jean describe su encierro de tres años en la leprosería de Saint-Lazare: vigilado constantemente, sin acceso libre a ningún pozo. Explica que beben de un arroyo distinto al del pueblo. Era panadero antes de enfermar. Suplica justicia basada en hechos, no en miedo.',
        dialogue: [
          'Señor... os lo ruego, miradme a los ojos. ¿Veis en ellos la maldad que me atribuyen? Soy un hombre enfermo, no un asesino.',
          'Llevo tres años encerrado en la leprosería de Saint-Lazare. Nos sacan una vez por semana para lavarnos, siempre vigilados por dos guardias armados. ¿Cuándo habría podido acercarme a un pozo?',
          'Nos alimentan con las sobras del mercado. El agua que bebemos viene de un arroyo distinto, alejado del pueblo. No tenemos acceso a vuestras fuentes. Ni siquiera conocemos el camino.',
          'Antes de enfermar, yo era panadero. Tenía esposa e hijos. Esta enfermedad me lo quitó todo: mi oficio, mi familia, mi nombre. Pero no me quitó el alma ni la decencia.',
          'Si nos matan, señor, que al menos sea con la verdad en la mano y no con mentiras nacidas del miedo. Es lo único que os pido. Dad a un hombre moribundo el consuelo de la justicia.',
        ],
      },
      {
        testimony: 'Jean revela que algunos leprosos fueron torturados para arrancarles confesiones falsas. Su compañero Étienne confesó lo que le dictaron para que dejaran de quemarlo con hierros. Jean muestra las marcas en sus propias manos como prueba de los interrogatorios brutales.',
        dialogue: [
          'Os contaré lo que nadie se atreve a decir, señor. A mi compañero Étienne lo sacaron de la leprosería hace dos semanas. Lo devolvieron tres días después, destrozado.',
          'Le quemaron las plantas de los pies con hierros al rojo. Le arrancaron dos uñas con tenazas. Y entonces, solo entonces, "confesó" que habíamos envenenado el pozo de la plaza.',
          'Étienne no sabe ni dónde está el pozo de la plaza. Lleva en la leprosería desde que tenía catorce años. Nunca ha salido de aquellos muros. Confesó lo que le dictaron para que el dolor cesara.',
          'A mí también me interrogaron. Vedlo vos mismo... estas marcas en mis muñecas no son de la lepra, señor. Son de las cuerdas del potro. Me ataron durante horas.',
          'No confesé porque no tengo nada que confesar. Pero si vuelven a llevarme al calabozo, confieso que soy el rey de Francia si con ello dejan de torturarme. ¿Entendéis ahora el valor de esas confesiones?',
        ],
      },
      {
        testimony: 'Jean explica la rutina diaria de la leprosería con detalle preciso: horarios, vigilancia, muros. Demuestra que la logística de una conspiración es imposible dadas sus condiciones de encierro. Ruega al investigador que visite la leprosería y lo compruebe con sus propios ojos.',
        dialogue: [
          'Dejadme describiros un día en mi vida, señor, para que juzguéis si es la vida de un conspirador. Nos despiertan al amanecer con una campana. No podemos salir de nuestras celdas hasta que el guardián abre.',
          'Desayunamos en el patio, siempre vigilados. Después, rezo. Después, trabajo: trenzamos cuerdas y cosemos sacos para pagar nuestro sustento. Todo dentro de los muros.',
          'La puerta principal tiene dos cerrojos y un guardián armado permanente. El muro tiene tres metros de alto y vidrios rotos arriba. Yo apenas puedo caminar con mis piernas llagadas. ¿Cómo iba a saltar un muro?',
          'No he visto el exterior de estos muros en tres años, señor. No sé qué aspecto tiene la plaza del pueblo. No sé dónde están vuestros pozos. Me acusan de envenenar algo que ni siquiera podría encontrar.',
          'Os pido una sola cosa: venid a la leprosería. Vedla con vuestros propios ojos. Comprobad las cerraduras, los muros, los guardias. Después decidid si un hombre que no puede ni andar pudo cruzar un pueblo entero de noche para envenenar un pozo.',
        ],
      },
      {
        testimony: 'Jean narra su historia personal: era carpintero, padre de tres hijos, respetado en su comunidad. La lepra lo alejó de todo. Explica que los leprosos se cuidan entre sí porque nadie más lo hace, y que lo último que desean es causar más sufrimiento en un mundo que ya los ha olvidado.',
        dialogue: [
          'Mi nombre es Jean, señor. Jean Carpentier, aunque ya nadie me llama así. Ahora soy "le Malade." El enfermo. Como si la enfermedad fuera todo lo que soy.',
          'Fui carpintero durante quince años. Construí mesas, puertas, cunas para recién nacidos. Mis manos que ahora veis vendadas tallaron la puerta de la iglesia de Saint-Martin. Preguntad al párroco si mentís.',
          'Tengo tres hijos que ya no me reconocen. Mi esposa me visita una vez al año, desde lejos, sin poder tocarme. ¿Creéis que un hombre que ha perdido todo eso tiene energías para conspirar contra nadie?',
          'En la leprosería nos cuidamos los unos a los otros. Cuando a Mathilde se le caen los dedos, yo le cambio las vendas. Cuando yo no puedo levantarme, el viejo Arnaud me trae agua. Eso es lo que hacemos: sobrevivir juntos.',
          'No tenemos odio, señor. Solo tenemos dolor. Y lo último que un hombre que sufre desea es causar más sufrimiento. Os lo juro por lo único que me queda: mi palabra de hombre honrado.',
        ],
      },
    ],
  },
};

// ---- Active character instances (selected randomly each game) ----
let characters = {};

function selectRandomVariants() {
  characters = {};
  for (const [key, template] of Object.entries(characterTemplates)) {
    const variant = pickRandom(template.variants);
    characters[key] = {
      id: template.id,
      name: template.name,
      role: template.role,
      portrait: template.portrait,
      tag: template.tag,
      tagLabel: template.tagLabel,
      testimony: variant.testimony,
      dialogue: variant.dialogue,
    };
    state.selectedVariants[key] = template.variants.indexOf(variant);
  }
}

// ---- DOM References ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  selectRandomVariants();
  createEmbers();
  setupEventListeners();
});

// ---- Ember Particles on Title ----
function createEmbers() {
  const titleScreen = $('#title-screen');
  if (!titleScreen) return;
  for (let i = 0; i < 20; i++) {
    const ember = document.createElement('div');
    ember.className = 'ember';
    ember.style.left = Math.random() * 100 + '%';
    ember.style.bottom = '10%';
    ember.style.animationDelay = Math.random() * 4 + 's';
    ember.style.animationDuration = 2 + Math.random() * 3 + 's';
    titleScreen.appendChild(ember);
  }
}

// ---- Event Listeners ----
function setupEventListeners() {
  // Start button
  $('#btn-start')?.addEventListener('click', startGame);

  // Character cards
  $$('.character-card').forEach((card) => {
    card.addEventListener('click', () => {
      const charId = card.dataset.character;
      if (!state.interrogated.has(charId)) {
        interrogate(charId);
      }
    });
  });

  // Close dialogue
  $('#btn-close-dialogue')?.addEventListener('click', closeDialogue);

  // Verdict button
  $('#btn-verdict')?.addEventListener('click', openVerdictModal);

  // Verdict choices
  $('#btn-guilty')?.addEventListener('click', () => showEnding('defeat'));
  $('#btn-innocent')?.addEventListener('click', () => showEnding('victory'));
}

// ---- Start Game ----
function startGame() {
  const titleScreen = $('#title-screen');
  titleScreen.classList.add('fade-out');
  setTimeout(() => {
    titleScreen.classList.add('hidden');
    const gameScreen = $('#game-screen');
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('fade-in');
  }, 500);
}

// ---- Interrogation ----
function interrogate(charId) {
  const character = characters[charId];
  if (!character) return;

  // Mark as interrogated
  state.interrogated.add(charId);
  state.testimonies.push(character);

  // Update card state
  const card = $(`.character-card[data-character="${charId}"]`);
  if (card) card.classList.add('interrogated');

  // Show dialogue
  showDialogue(character);

  // Add testimony to panel
  addTestimony(character);

  // Update progress dots
  updateProgress();

  // Check if all interrogated
  if (state.interrogated.size === 3) {
    enableVerdict();
  }
}

// ---- Dialogue System ----
function showDialogue(character) {
  // Cancel any running typewriter by incrementing the generation
  state.typewriterGen++;

  const box = $('#dialogue-box');
  box.classList.remove('hidden', 'fade-out');
  box.classList.add('slide-up');

  // Set portrait
  const portrait = box.querySelector('.dialogue-portrait');
  portrait.src = character.portrait;
  portrait.alt = character.name;

  // Set name
  box.querySelector('.dialogue-name').textContent = character.name;

  // Typewriter dialogue
  const textEl = box.querySelector('.dialogue-text');
  textEl.innerHTML = '';

  const fullText = character.dialogue.join('\n\n');
  typeWriter(textEl, fullText, 0, state.typewriterGen);

  state.currentDialogue = character.id;

  // Scroll to dialogue
  setTimeout(() => {
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function typeWriter(element, text, index, gen) {
  // If a newer typewriter has started, stop this one
  if (gen !== state.typewriterGen) return;

  if (index === 0) {
    element.innerHTML = '<span class="quote-mark">"</span>';
  }

  if (index < text.length) {
    const char = text[index];
    if (char === '\n') {
      element.innerHTML += '<br>';
    } else {
      element.innerHTML += char;
    }
    const speed = char === '.' || char === ',' || char === '?' || char === '!' ? 60 : 18;
    setTimeout(() => typeWriter(element, text, index + 1, gen), speed);
  } else {
    element.innerHTML += '<span class="quote-mark">"</span>';
  }
}

function closeDialogue() {
  const box = $('#dialogue-box');
  box.classList.add('fade-out');
  setTimeout(() => {
    box.classList.add('hidden');
    box.classList.remove('fade-out', 'slide-up');
  }, 400);
}

// ---- Deduction Panel ----
function addTestimony(character) {
  const list = $('#testimony-list');

  // Remove empty state
  const emptyState = list.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  const entry = document.createElement('div');
  entry.className = 'testimony-entry';
  entry.innerHTML = `
    <div class="entry-label">${character.name}</div>
    <div class="entry-text">${character.testimony}</div>
    <span class="entry-tag tag-${character.tag}">${character.tagLabel}</span>
  `;
  list.appendChild(entry);

  // Scroll panel to new entry
  setTimeout(() => {
    entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
}

// ---- Progress Dots ----
function updateProgress() {
  const dots = $$('.progress-dot');
  const count = state.interrogated.size;
  dots.forEach((dot, i) => {
    if (i < count) dot.classList.add('filled');
  });

  const label = $('.progress-label');
  if (label) {
    label.textContent = `${count}/3 testimonios`;
  }
}

// ---- Verdict System ----
function enableVerdict() {
  const btn = $('#btn-verdict');
  if (btn) {
    btn.disabled = false;
    btn.textContent = '⚖ Emitir Veredicto ante el Rey';
  }
}

function openVerdictModal() {
  const modal = $('#verdict-modal');
  modal.classList.remove('hidden');
  modal.classList.add('fade-in');
}

// ---- Endings ----
function showEnding(type) {
  // Hide modal
  $('#verdict-modal').classList.add('hidden');
  $('#game-screen').classList.add('hidden');

  const ending = $('#ending-screen');
  ending.classList.remove('hidden', 'defeat', 'victory');
  ending.classList.add(type);

  const content = ending.querySelector('.ending-content');

  if (type === 'defeat') {
    content.innerHTML = `
      <span class="ending-banner">Fin del Juego</span>
      <span class="ending-icon">⚰️</span>
      <h2 class="ending-title">Derrota</h2>
      <p class="ending-subtitle">La razón fue silenciada por el miedo</p>
      <div class="ending-divider"></div>
      <div class="ending-text">
        <p>Habéis decidido culpar a los leprosos basándoos en rumores y supersticiones, ignorando la lógica y las evidencias.</p>
        <br>
        <p>El Rey Felipe V, amparado por vuestro veredicto, ordena el encarcelamiento masivo. Lo que sigue es una de las páginas más oscuras de la historia de Francia: cientos de enfermos inocentes son quemados vivos o encerrados hasta morir. El pueblo, enardecido por el odio, se suma a la masacre.</p>
        <br>
        <p>Los pozos nunca estuvieron envenenados. Los niños enfermaron por agua estancada en verano. La "conspiración" fue un mito nacido del miedo, la ignorancia y el prejuicio contra los más vulnerables.</p>
        <br>
        <p><strong>Lección filosófica:</strong> El racionalismo nos enseña que la verdad se alcanza mediante la razón y el análisis, no a través del miedo colectivo. Cuando abandonamos el pensamiento crítico, nos convertimos en cómplices de la injusticia.</p>
      </div>
      <div class="ending-quote">
        "No hay peor tiranía que la que se ejerce a la sombra de las leyes y con los colores de la justicia."
        <cite>— Montesquieu</cite>
      </div>
      <button id="btn-restart">↻ Volver a Investigar</button>
    `;
  } else {
    content.innerHTML = `
      <span class="ending-banner">Fin del Juego</span>
      <span class="ending-icon">🕊️</span>
      <h2 class="ending-title">Victoria</h2>
      <p class="ending-subtitle">La razón triunfa sobre la ignorancia</p>
      <div class="ending-divider"></div>
      <div class="ending-text">
        <p>Habéis examinado cada testimonio con rigor intelectual. La aldeana habló desde el miedo, el monje aportó conocimiento médico, y el enfermo demostró la imposibilidad física de la conspiración.</p>
        <br>
        <p>Ante el Rey, presentáis vuestras conclusiones: no existe ninguna conspiración. Los leprosos, recluidos y vigilados, no podían acceder a los pozos. Las enfermedades del pueblo tienen causas naturales. Todo fue una histeria colectiva alimentada por rumores infundados.</p>
        <br>
        <p>Vuestro veredicto racional salva cientos de vidas inocentes y sienta un precedente: la justicia debe basarse en la razón y la evidencia, no en el miedo y la superstición.</p>
        <br>
        <p><strong>Lección filosófica:</strong> El racionalismo, como corriente del pensamiento, nos recuerda que la verdad no se encuentra en los rumores ni en las emociones descontroladas, sino en el ejercicio disciplinado de la razón. Habéis demostrado que el pensamiento racional es la mayor defensa de la dignidad humana.</p>
      </div>
      <div class="ending-quote">
        "Pienso, luego existo — y al pensar, protejo la existencia de los demás."
        <cite>— Inspirado en René Descartes</cite>
      </div>
      <button id="btn-restart">↻ Volver a Jugar</button>
    `;
  }

  ending.classList.add('fade-in');

  // Attach restart handler
  content.querySelector('#btn-restart')?.addEventListener('click', restartGame);
}

// ---- Restart ----
function restartGame() {
  // Reset state
  state.interrogated.clear();
  state.testimonies = [];
  state.currentDialogue = null;
  state.selectedVariants = {};

  // Select new random variants for the next playthrough
  selectRandomVariants();

  // Hide ending
  $('#ending-screen').classList.add('hidden');
  $('#ending-screen').classList.remove('defeat', 'victory', 'fade-in');

  // Reset cards
  $$('.character-card').forEach((card) => card.classList.remove('interrogated'));

  // Reset progress
  $$('.progress-dot').forEach((dot) => dot.classList.remove('filled'));
  const label = $('.progress-label');
  if (label) label.textContent = '0/3 testimonios';

  // Reset testimony list
  const list = $('#testimony-list');
  list.innerHTML = '<div class="empty-state">Los testimonios recopilados aparecerán aquí conforme interroguéis a los sospechosos...</div>';

  // Reset verdict button
  const btn = $('#btn-verdict');
  btn.disabled = true;
  btn.textContent = '🔒 Interroga a los tres testigos';

  // Hide dialogue
  const box = $('#dialogue-box');
  box.classList.add('hidden');
  box.classList.remove('fade-out', 'slide-up');

  // Hide verdict modal
  $('#verdict-modal').classList.add('hidden');

  // Show title screen
  const titleScreen = $('#title-screen');
  titleScreen.classList.remove('hidden', 'fade-out');
  titleScreen.classList.add('fade-in');

  // Hide game screen
  $('#game-screen').classList.add('hidden');
  $('#game-screen').classList.remove('fade-in');
}
