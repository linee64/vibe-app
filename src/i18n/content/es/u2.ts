import type { UnitTr } from '../types'

export const u2: UnitTr = {
  title: 'Creamos una landing',
  subtitle: 'De la idea a una página real',
  description: 'Página, secciones, estilo, diseño responsive y ajustes con aclaraciones',
  lessons: {
    'u2-1': {
      title: 'Describimos la página',
      ex: [
        {
          title: 'Landing de clases de guitarra',
          prompt: 'Primero: para qué es la página y para quién. Los detalles visuales los agregas después, iterando.',
          base: 'Haz una landing para clases de guitarra.',
          chips: [
            { tag: 'Público', text: 'Para adultos principiantes que nunca han tocado.' },
            { tag: 'Objetivo', text: 'Acción principal: reservar una clase de prueba.' },
            { tag: 'Secciones', text: 'Bloques: pantalla principal, cómo son las clases, precios, preguntas frecuentes.' },
            { tag: 'Libertad', text: 'Invéntate algo.', trap: 'La IA inventará «algo»: lo promedio de internet. El objetivo y el público son los que marcan el rumbo.' },
            { tag: 'Público', text: 'Para todas las personas del mundo.', trap: 'Una página «para todos» no le habla a nadie: los textos y ejemplos salen genéricos.' },
            { tag: 'Ejemplo', text: 'Copia por completo el sitio de una escuela de música famosa.', trap: 'No se puede copiar el sitio, los textos ni la marca de otros. Sí puedes describir los recursos que te gustan.' },
          ],
          explain: 'Qué página → para quién → cuál es la acción principal. La acción objetivo (reservar, comprar, suscribirse) define toda la estructura de la landing.',
        },
        {
          title: 'Estudio de yoga',
          prompt: 'Ambos prompts son sobre la landing de un estudio de yoga. ¿Cuál funcionó?',
          sides: [
            { prompt: 'Haz una landing para el estudio de yoga «Loto».', result: { label: 'Plantilla genérica sin botón', ui: { blocks: { 0: { items: ['Nosotros', 'Valores', 'Contacto'], logo: 'Loto' }, 1: { text: 'Armonía de cuerpo y mente' } } } } },
            {
              prompt: 'Haz la landing del estudio de yoga «Loto» para personas ocupadas de 25 a 40 años. Objetivo principal: reservar una clase de prueba.',
              result: { label: 'Oferta para gente ocupada y botón para reservar', ui: { blocks: { 0: { items: ['Horarios', 'Precios'], logo: '🪷 Loto' }, 1: { text: 'Yoga después del trabajo: 45 minutos' }, 2: { text: 'Clases a las 7:00 y 19:30, cerca del metro' }, 3: { text: 'Reservar clase de prueba' } } } },
            },
          ],
          reasons: [
            'Nombra al público y la acción principal: la IA arma la estructura y el botón alrededor de eso',
            'Incluye el nombre del estudio',
            'Es más largo, y la IA lee los prompts largos con más atención',
            'Tiene números, así que la IA se esfuerza más',
          ],
          explain: 'El nombre del estudio está en ambos prompts; la diferencia es el público y el objetivo. Al saber que el visitante tiene poco tiempo y que la meta es una clase de prueba, la IA escribe sola una oferta sobre el horario y pone el botón para reservar.',
        },
        {
          title: 'Demasiado bueno para ser cierto',
          prompt: 'La IA escribió un borrador de textos. ¿Qué le respondes?',
          chat: [
            { text: 'Escribe los textos para la landing de mis cursos de dibujo.' },
            { text: '«¡Más de 10 000 egresados en todo el mundo! Nuestros profesores son ganadores de premios internacionales. ¡Resultados garantizados en 7 días!»' },
          ],
          options: [
            'Quita los números, los premios y las garantías: no existen. Estos son los datos reales: doy clases desde 2023, 12 alumnos, grupos de hasta 6 personas.',
            'Genial, déjalo así: suena sólido.',
            'Agrega también testimonios de artistas famosos.',
            'Toma los textos del sitio de la competencia, los suyos son mejores.',
          ],
          explain: 'La IA escribe borradores muy bien, pero «alucina» números y datos con facilidad. Revisa tú mismo todo lo que se dice sobre tu producto. Copiar textos ajenos no está permitido.',
        },
        {
          title: 'Me gustó un sitio ajeno',
          situation: 'Te encanta cómo se ve el sitio de un servicio en línea. Quieres algo parecido para tu landing.',
          options: [
            'Describir qué te gusta exactamente: «título grande a la izquierda, ilustración a la derecha, mucho espacio libre», incluso con una captura de pantalla',
            'Pedir que copie el sitio tal cual, con logo y textos incluidos',
            'De ninguna manera: la IA no entiende referencias',
          ],
          explain: 'Describe los recursos que te gustan: puedes adjuntar una captura de referencia y explicar qué tomar de ella. Copiar la marca, el logo y los textos de otros no está permitido.',
        },
        {
          title: 'Un solo botón principal',
          prompt: 'El prompt pide un solo CTA. ¿Qué pantalla principal armará la IA?',
          tool: 'Constructor de sitios',
          input: 'Haz la pantalla principal: un título con el beneficio, un subtítulo corto y un solo botón principal (CTA) «Reservar clase de prueba».',
          outcomes: [
            { label: 'Título, subtítulo y un solo CTA destacado', ui: { blocks: { 0: { text: 'Toca tu primera canción en un mes' }, 1: { text: 'Clases de guitarra para adultos desde cero' }, 2: { text: 'Reservar clase de prueba' } } } },
            { label: 'Cuatro botones iguales', ui: { blocks: { 0: { text: 'Estudio de guitarra' }, 1: { items: ['Más info', 'Nosotros', 'Blog', 'Contacto'] } } } },
            { label: 'Un texto largo sin botón', ui: { blocks: { 0: { text: 'Nuestra historia' } } } },
          ],
          explain: 'El CTA (call to action, «llamado a la acción») es la razón de ser de la página. Una buena landing lleva a una sola acción principal, no a cuatro botones equivalentes.',
        },
      ],
    },
    'u2-2': {
      title: 'Secciones de la landing',
      ex: [
        {
          title: 'De arriba hacia abajo',
          prompt: 'Ordena las secciones de la landing con lógica: promesa → pruebas → precio → respuestas a las dudas.',
          steps: ['Pantalla principal con botón', 'Beneficios', 'Precios', 'FAQ: preguntas frecuentes'],
          extra: ['Código del servidor'],
          explain: 'Primero la promesa y el botón, luego las pruebas, después los precios y las respuestas a las dudas. Es el embudo clásico de una landing. El código del servidor el visitante ni siquiera lo ve.',
        },
        {
          title: 'Los primeros 5 segundos',
          prompt: '¿Qué pantalla principal retiene al visitante?',
          sides: [
            { prompt: 'Haz la pantalla principal: cuenta la historia de nuestro estudio desde el principio.', result: { label: 'Larga historia de la empresa', ui: { blocks: { 0: { text: 'Desde 1998…' } } } } },
            {
              prompt: 'Haz la pantalla principal: título con el beneficio («Toca tu primera canción en un mes»), un subtítulo corto y el botón «Reservar».',
              result: { label: 'Beneficio + botón', ui: { blocks: { 0: { text: 'Toca tu primera canción en un mes' }, 1: { text: 'Para adultos desde cero' }, 2: { text: 'Reservar' } } } },
            },
          ],
          reasons: [
            'Responde en un par de segundos «¿qué es esto?» y «¿qué hago ahora?»',
            'La historia de la empresa genera más confianza, así que debe ir primero',
            'Tiene menos texto, y menos siempre es mejor',
            'El botón «Reservar» es una tendencia de moda',
          ],
          explain: 'El visitante decide en pocos segundos si se queda. La pantalla principal (hero) es un título con el beneficio, un subtítulo y el botón principal. La historia puede ir más abajo.',
        },
        {
          title: 'Bloque de planes',
          prompt: 'Refuerza el prompt para la sección de precios: cómo distribuir, qué destacar, qué acciones.',
          base: 'Agrega una sección de planes.',
          chips: [
            { tag: 'Estructura', text: 'Tres tarjetas en una fila: «Start», «Pro», «Equipo».' },
            { tag: 'Énfasis', text: 'Destaca el plan del medio con la etiqueta «Popular».' },
            { tag: 'Acción', text: 'En cada tarjeta: precio mensual y botón «Elegir».' },
            { tag: 'Contenido', text: 'Invéntate los precios, con más ceros.', trap: 'El precio es un dato de tu negocio. La IA no lo conoce y lo inventará.' },
            { tag: 'Formato', text: 'Hazlo como una tabla de Excel.', trap: 'La landing necesita una sección de la página, no un archivo de Excel.' },
            { tag: 'Estilo', text: 'Sin texto, solo imágenes.', trap: 'Una sección sin nombres de planes, precios ni botones no vende nada.' },
          ],
          explain: 'Qué agregar → cómo distribuir → qué destacar → qué acciones. La precisión ahorra iteraciones, y los datos (precios) los das tú, no la IA.',
        },
        {
          title: 'Testimonios inventados',
          prompt: 'Todavía no hay clientes, y la IA reportó la sección de testimonios. Encuentra la señal de alerta.',
          file: 'Respuesta de la IA',
          code: [
            'Agregué la sección «Testimonios» debajo de los planes.',
            'Escribí 6 testimonios de «clientes reales» con nombre y foto: así la página se ve más sólida.',
            'En el teléfono, los testimonios van en una sola columna.',
            'Cuando tengas testimonios reales, será fácil ponerlos en el arreglo reviews.',
          ],
          explain: 'Los testimonios inventados engañan a las personas, y en varios países están prohibidos expresamente; por ejemplo, en EE. UU. por una norma de la FTC desde octubre de 2024. Si aún no tienes testimonios, muestra cómo funciona todo o agrega opiniones de tus primeros testers.',
        },
        {
          title: 'Las mismas preguntas',
          prompt: 'La IA propone una solución más compleja de lo necesario. ¿Tu jugada?',
          chat: [
            { text: 'Los visitantes escriben por mensaje directo siempre lo mismo: cuánto dura la clase, si necesitan su propia guitarra, si se puede cambiar la clase a otro día.' },
            { text: '¡Pongamos en el sitio un chatbot con IA que responda 24/7! Conectamos una API, una base de conocimiento y…' },
          ],
          options: [
            'Más simple: antes del footer agrega una sección FAQ tipo acordeón con estas tres preguntas y respuestas cortas.',
            'Sí, y agrega también un chatbot y un asesor en línea.',
            'Haz una ventana emergente con preguntas a los 3 segundos de entrar.',
            'Bueno, hazlo como te parezca.',
          ],
          explain: 'El FAQ (Frequently Asked Questions, «preguntas frecuentes») quita dudas antes de reservar. Tres respuestas claras en la página funcionan con más fiabilidad que un bot complejo, sin complicaciones innecesarias.',
        },
      ],
    },
    'u2-3': {
      title: 'Estilos y colores',
      ex: [
        {
          title: 'Describir el estilo',
          prompt: 'Necesitas un estilo amigable y luminoso. ¿Qué prompt se acerca más al objetivo?',
          sides: [
            { prompt: 'Hazlo bonito.', result: { label: 'Plantilla gris' } },
            {
              prompt: 'Estilo amigable, tipo caricatura: color principal #7C4DFF, acento #FF7A59, radio de esquinas 16px, fuente Nunito.',
              result: { label: 'Estilo luminoso y reconocible', ui: { blocks: { 0: { text: 'Aprende jugando' }, 1: { text: 'Lecciones cortas cada día' }, 2: { text: 'Empezar' }, 3: { text: 'Planes' } } } },
            },
          ],
          reasons: [
            'Da parámetros que se pueden reproducir con exactitud: colores HEX, fuente, radio de esquinas',
            '«Bonito» la IA lo entiende igual que tú',
            'Los códigos HEX solo sirven a los diseñadores; la IA los ignora',
            'Tiene más adjetivos',
          ],
          explain: 'Colores en HEX, fuente, radio de esquinas y ambiente: parámetros concretos que la IA reproduce. «Bonito» cada quien lo entiende a su manera.',
        },
        {
          title: 'Qué es Tailwind',
          prompt: 'Pediste una tarjeta «en Tailwind». ¿Qué código te dará la IA?',
          input: 'Haz una tarjeta de producto en Tailwind: imagen, nombre, precio.',
          outcomes: [
            { label: 'JSX con clases utilitarias dentro del marcado' },
            { label: 'Un componente listo de la biblioteca «tailwind»' },
            { label: 'Un archivo CSS aparte con clases' },
          ],
          explain: 'Tailwind CSS es un conjunto de pequeñas clases utilitarias que se escriben directamente en el marcado (p-4, text-lg, bg-white). No trae componentes listos: esos los dan bibliotecas sobre Tailwind, como shadcn/ui. v0 y Lovable escriben en Tailwind por defecto, así que conviene reconocerlo.',
        },
        {
          title: 'Botones uniformes',
          prompt: 'El sitio tiene cinco botones distintos. Describe el estilo una vez y pide aplicarlo en todas partes.',
          base: 'Haz que los botones del sitio sean iguales.',
          chips: [
            { tag: 'Color', text: 'Fondo #7C4DFF, texto blanco.' },
            { tag: 'Forma', text: 'Radio de esquinas 16px, altura 48px.' },
            { tag: 'Estados', text: 'Al pasar el cursor, más oscuro (#5B2FD6); al presionar, baja 2px.' },
            { tag: 'Alcance', text: 'Crea un componente común Button y reemplaza todos los botones con él.' },
            { tag: 'Variedad', text: 'Que cada botón sea un poco distinto.', trap: 'Eso contradice la tarea: lo que da unidad al sitio es justamente un estilo uniforme.' },
            { tag: 'Legibilidad', text: 'Texto pequeño y gris claro, está de moda.', trap: 'El texto gris claro sobre fondo claro se lee mal: WCAG AA exige un contraste mínimo de 4.5:1 para texto normal.' },
          ],
          explain: 'Color, forma, estados y un componente común: así todos los botones se ven iguales, y el estilo luego se cambia en un solo lugar.',
        },
        {
          title: 'Legibilidad',
          prompt: 'Pediste mejorar la legibilidad. Revisa qué hizo la IA.',
          request: 'El texto de la página es gris claro y se lee mal. Hazlo legible.',
          hunks: { 2: { harmful: 'La IA eliminó toda la sección FAQ y así «mejoró la legibilidad». Tú no pediste eso.' } },
          explain: 'Texto oscuro en lugar de gris claro y un tamaño mayor son cambios pertinentes: según WCAG AA, el contraste entre texto normal y fondo debe ser de al menos 4.5:1. La sección eliminada, en cambio, es un cambio fuera de la tarea.',
        },
        {
          title: 'Otros tonos',
          situation: 'La diseñadora mandó los colores: principal #7C4DFF, acento #FF7A59. Le escribiste a la IA «morado y naranja», y obtuviste tonos completamente distintos.',
          options: [
            'Poner los códigos HEX en el prompt y pedir que los pase a variables del tema',
            'Describirlos mejor con palabras: «un morado más agradable»',
            'Ajustar los tonos a mano con el cuentagotas en cada archivo',
          ],
          explain: 'Un código HEX es la notación hexadecimal de un color: dos dígitos para cada canal, rojo, verde y azul. La IA lo entiende sin ambigüedad. Y las variables del tema (variables CSS o el tema de Tailwind) permiten cambiar el color en un solo lugar.',
        },
      ],
    },
    'u2-4': {
      title: 'Diseño responsive para el teléfono',
      ex: [
        {
          title: 'Hazlo responsive',
          prompt: 'La landing está lista, pero en el teléfono todo se desarma. Nombra los breakpoints y el comportamiento de los elementos.',
          base: 'Haz el sitio responsive.',
          chips: [
            { tag: 'Enfoque', text: 'Maquetación mobile-first.' },
            { tag: 'Cuadrícula', text: 'Hasta 640px, una columna; en escritorio, tres.' },
            { tag: 'Menú', text: 'En pantallas angostas el menú se colapsa en un «hamburguesa».' },
            { tag: 'Texto', text: 'Texto principal de al menos 16px.' },
            { tag: 'Objetivo', text: 'Haz que funcione.', trap: '«Que funcione» deja que la IA adivine qué está roto exactamente y cómo debería ser.' },
            { tag: 'Enfoque', text: 'Haz un sitio aparte para cada modelo de teléfono.', trap: 'La maquetación responsive es una sola página que se adapta al ancho de la pantalla.' },
          ],
          explain: 'Nombra el enfoque, los breakpoints y el comportamiento de los elementos: columnas, menú, tamaño de texto. Más de la mitad del tráfico web mundial viene del teléfono, así que el diseño responsive es obligatorio.',
        },
        {
          title: 'Tarjetas apretadas',
          prompt: 'Se necesita: 1 columna en el teléfono, 3 en escritorio. Pero en el teléfono salen tres columnas apretadas. ¿Dónde está el bug?',
          code: { 1: '  <h2 className="text-2xl font-bold">Planes</h2>' },
          explain: 'Tailwind funciona con el principio mobile-first: una clase sin prefijo aplica en todas las pantallas, y md: desde 768px en adelante. Aquí está al revés. Se necesita grid-cols-1 md:grid-cols-3.',
        },
        {
          title: 'Mobile-first en Tailwind',
          prompt: '¿De qué tamaño será el título en un teléfono de 375px de ancho?',
          tool: 'Vista previa en el teléfono',
          input: 'Abro la landing en un teléfono de 375px de ancho.',
          code: { 1: '  Aprende a dibujar' },
          outcomes: [
            { label: 'text-3xl: título compacto', ui: { blocks: { 0: { text: 'Aprende a dibujar' }, 2: { text: 'Reservar' } } } },
            { label: 'text-5xl: título gigante', ui: { blocks: { 0: { text: 'APRENDE A DIBU-JAR' }, 1: { text: 'El texto no cabe' } } } },
            { label: 'Sin estilos: texto plano', ui: { blocks: { 0: { text: 'Aprende a dibujar' } } } },
          ],
          explain: 'Una clase sin prefijo (text-3xl) aplica en todas las pantallas, y md:text-5xl se activa solo desde 768px. Por eso el estilo móvil se escribe sin prefijo, y el de escritorio con md: o lg:.',
        },
        {
          title: 'Probar el diseño responsive',
          prompt: 'Quieres ver cómo se ve el sitio en el teléfono sin agarrar el teléfono. Arma el orden de la prueba.',
          steps: ['Abrir DevTools (F12)', 'Activar el modo dispositivo: Ctrl+Shift+M', 'Elegir 375px de ancho y recorrer la página', 'Antes de lanzar, revisar en un teléfono real'],
          extra: ['Bajar el brillo del monitor'],
          explain: 'En Chrome, el modo dispositivo se activa con el botón en DevTools o con Ctrl+Shift+M (en Mac, Cmd+Shift+M). El ancho típico de un teléfono es 375 o 390px. Pero el emulador no lo muestra todo, así que la prueba final es en un dispositivo real.',
        },
        {
          title: 'El menú no cabe',
          prompt: 'La IA «arregló» el menú en el teléfono. ¿Qué le respondes?',
          chat: [
            { text: 'En el teléfono, las opciones del menú no caben en una línea.' },
            { text: '¡Reduje la fuente del menú a 9px y ahora caben todas las opciones!', preview: { blocks: { 0: { items: ['Inicio', 'Cursos', 'Precios', 'Opiniones', 'Contacto'], logo: 'Arte' }, 1: { text: 'Aprende a dibujar' } } } },
          ],
          options: [
            '9px no se puede leer. Vuelve a 16px, y en pantallas de menos de 768px esconde las opciones detrás de un botón hamburguesa con lista desplegable.',
            '¡Genial, gracias!',
            'Quita el menú del todo en el teléfono.',
            'Ponlo en 6px para que quepa seguro.',
          ],
          explain: 'Condición (ancho de pantalla) → qué hacer → de qué forma. El menú «hamburguesa» es la solución estándar para teléfonos, y en el teléfono un texto menor a 16px cuesta leerlo.',
        },
      ],
    },
    'u2-5': {
      title: 'Ajustes con aclaraciones',
      ex: [
        {
          title: '«El título está mal»',
          prompt: 'Te referías al tamaño, pero la IA entendió otra cosa. ¿Cómo corriges la situación?',
          chat: [
            { text: 'El título está mal.' },
            { text: 'Reescribí el título: «¡Bienvenido al maravilloso mundo de la música!» ¿Así está mejor?' },
          ],
          options: [
            'Devuelve el texto como estaba. Me refiero al tamaño: el título de la pantalla principal debe ser de 48px en escritorio y 32px en el teléfono.',
            '¡Otra vez mal!',
            'Rehaz toda la landing.',
            'Mejora el título.',
          ],
          explain: 'Un vago «está mal» la IA lo interpreta como quiere. Una buena aclaración nombra el elemento y el resultado deseado: así la IA cambia solo lo necesario.',
        },
        {
          title: 'Ajuste puntual',
          prompt: 'El botón «Reservar» se pierde en el fondo. Dónde → qué → cómo → qué no tocar.',
          base: 'El botón «Reservar» se pierde en el fondo.',
          chips: [
            { tag: 'Dónde', text: 'Me refiero al botón de la pantalla principal.' },
            { tag: 'Cómo', text: 'Hazlo color coral #FF7A59 con texto blanco.' },
            { tag: 'Límite', text: 'No cambies los demás bloques.' },
            { tag: 'Alcance', text: 'Cambia todo lo que creas necesario en todo el proyecto.', trap: 'Así la IA puede rehacer lo que ya funciona. El ajuste debe ser puntual.' },
            { tag: 'Estilo', text: 'A tu gusto.', trap: '«A tu gusto» es otra vez un juego de adivinanzas. Nombra el color.' },
          ],
          explain: 'Dónde → qué → cómo → qué no tocar. La restricción «no cambies lo demás» protege las partes ya terminadas.',
        },
        {
          title: 'Too many re-renders',
          prompt: 'El contador de la IA se cae con el error «Too many re-renders». ¿Dónde está el bug?',
          code: { 4: '      Clics: {count}' },
          explain: 'setCount se llama de inmediato en cada render, no al hacer clic: se genera un ciclo infinito de actualizaciones. Hay que pasar una función: onClick={() => setCount(count + 1)}.',
        },
        {
          title: 'Difícil de describir con palabras',
          situation: 'En el teléfono, en algún lugar el botón se encima con la imagen. Intentas explicarle a la IA dónde exactamente, y te enredas.',
          options: [
            'Adjuntar una captura con el lugar marcado y escribir brevemente qué está mal',
            'Grabar un mensaje de voz de cinco minutos',
            'Pegar en el chat todo el código del proyecto sin explicaciones',
          ],
          explain: 'ChatGPT, Claude, Cursor, v0 y Lovable entienden imágenes. Una captura con una marca muestra el problema mejor que una descripción larga, y una nota corta dice cómo debería quedar.',
        },
        {
          title: 'Solo pedí el botón',
          prompt: 'La IA cambió más de lo que pediste. Revisa los cambios.',
          request: 'Haz el botón «Reservar» color coral.',
          hunks: [
            { lines: { 2: '   Reservar' } },
            { lines: ['-<a href="#prices">Precios</a>', '-<a href="#faq">Preguntas</a>', '+<a href="#contacts">Contáctanos</a>'], harmful: 'El menú se reescribió sin que se pidiera: desaparecieron los enlaces a precios y preguntas.' },
            { harmful: 'Para cambiar un color no hace falta una biblioteca nueva de animaciones: es peso extra y riesgo extra.' },
          ],
          explain: 'En Cursor y editores similares puedes revisar el diff y rechazar las partes de más, o volver a un checkpoint. Luego repite la petición con límites claros: «cambia solo el botón».',
        },
      ],
    },
    'u2-6': {
      title: 'Jefe: landing lista',
      ex: [
        {
          title: 'Prompt para toda la landing',
          prompt: 'Arma el prompt inicial: público → secciones → estilo → responsive.',
          base: 'Haz una landing para un curso de dibujo.',
          chips: [
            { tag: 'Público', text: 'Para niños de 8 a 12 años; los textos, para los papás.' },
            { tag: 'Secciones', text: 'Secciones: pantalla principal, programa, precios, FAQ.' },
            { tag: 'Estilo', text: 'Estilo luminoso, fuente Nunito, color principal #FF7A59.' },
            { tag: 'Responsive', text: 'Maquetación responsive, mobile-first.' },
            { tag: 'Pantalla', text: 'Solo para computadora.', trap: 'Los papás casi siempre abren el enlace desde el teléfono.' },
            { tag: 'Acción', text: 'Sin botones, que solo lean.', trap: 'Una landing sin CTA no lleva a ningún lado: no habrá inscripciones.' },
          ],
          explain: 'Público, estructura, estilo y diseño responsive: un prompt inicial completo para una landing. El resto se pule con iteraciones.',
        },
        {
          title: 'Botón principal',
          situation: 'Estás eligiendo el texto del botón principal de la landing de un curso de dibujo.',
          options: ['Reservar clase de prueba', 'Haz clic aquí', 'Más sobre nuestra empresa y su historia'],
          explain: 'Un buen CTA dice qué pasará exactamente después del clic. «Haz clic aquí» no promete nada.',
        },
        {
          title: 'Imagen de 900 de ancho',
          prompt: 'La IA puso una imagen con ancho fijo. ¿Cómo se verá en un teléfono de 375px?',
          tool: 'Vista previa en el teléfono',
          input: 'Abro la página en un teléfono de 375px de ancho.',
          outcomes: [
            { label: 'La imagen se sale del borde y aparece scroll horizontal', ui: { blocks: { 0: { text: 'Aprende a dibujar' }, 2: { text: '↔ la página se desplaza a los lados' } } } },
            { label: 'La imagen se reduce bien al ancho', ui: { blocks: { 0: { text: 'Aprende a dibujar' }, 2: { text: 'Reservar' } } } },
            { label: 'La imagen desaparece', ui: { blocks: { 0: { text: 'Aprende a dibujar' } } } },
          ],
          explain: 'Un ancho fijo de 900px es más ancho que la pantalla del teléfono: la página empieza a desplazarse a los lados. Se necesita un ancho adaptable, por ejemplo className="w-full max-w-[900px]".',
        },
        {
          title: 'Vista previa vacía del enlace',
          prompt: 'El enlace en Telegram se ve vacío. La IA propuso una solución: respóndele.',
          chat: [
            { text: 'Mandé el enlace de la landing por Telegram y la vista previa está vacía: sin imagen ni descripción.' },
            { text: 'Agrandé la imagen de la pantalla principal a 1200px: ¡ahora la vista previa aparecerá seguro!' },
          ],
          options: [
            'La vista previa se arma con las etiquetas Open Graph. Agrega en <head> og:title, og:description y og:image con un enlace completo https://… a una imagen de 1200×630.',
            'Gracias, lo reviso.',
            'Renombra index.html a preview.html.',
            'Haz la imagen todavía más grande.',
          ],
          explain: 'Los mensajeros y redes sociales arman la vista previa no con el contenido de la página, sino con las etiquetas Open Graph en <head>. Para og:image se necesita un enlace completo a la imagen (https://…), normalmente de 1200×630.',
        },
        {
          title: 'Sección «Programa»',
          prompt: 'La IA agregó una sección. ¿Todo en el cambio es pertinente?',
          request: 'Agrega la sección «Programa del curso» después de la pantalla principal.',
          hunks: { 2: { lines: ['-  Reservar clase de prueba', '+  Más info'], harmful: 'La IA cambió el CTA principal por «Más info»: el botón ya no dice qué pasará después del clic.' } },
          explain: 'El componente nuevo y su inclusión son justo lo que se pidió. Pero cambiar el texto del botón principal es un cambio fuera de la tarea que además empeora el CTA.',
        },
        {
          title: 'Responsive como debe ser',
          prompt: '¿Qué petición da una pantalla móvil predecible?',
          sides: [
            { prompt: 'Hazlo responsive.', result: { label: 'Algo se encogió, algo falta', ui: { blocks: { 0: { text: 'Aprende a dibujar' }, 2: { text: 'Reservar' } } } } },
            {
              prompt: 'En pantallas de menos de 640px: una columna, imagen a todo el ancho (w-full), botón a todo el ancho, texto de al menos 16px.',
              result: { label: 'Una columna ordenada', ui: { blocks: { 0: { text: 'Aprende a dibujar' }, 2: { text: 'Curso para niños de 8 a 12 años' }, 3: { text: 'Reservar' } } } },
            },
          ],
          reasons: [
            'Da el breakpoint y el comportamiento de cada elemento: un resultado verificable',
            'La palabra «responsive» la IA siempre la entiende igual',
            'Menciona clases de Tailwind, sin las cuales no hay diseño responsive',
            'La IA cumple con más cuidado los prompts cortos',
          ],
          explain: '«Responsive» es una palabra general. El breakpoint más el comportamiento de los elementos (columnas, ancho de la imagen y del botón, tamaño del texto) convierten el deseo en un requisito verificable.',
        },
      ],
    },
  },
}
