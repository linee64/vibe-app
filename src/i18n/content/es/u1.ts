import type { UnitTr } from '../types'

export const u1: UnitTr = {
  title: 'Tu primer prompt',
  subtitle: 'Aprende a darle tareas claras a la IA',
  description: 'Qué es el vibe coding y de qué se compone un buen prompt',
  lessons: {
    'u1-1': {
      title: 'Qué es el vibe coding',
      ex: [
        {
          title: '¿Qué es el vibe coding?',
          situation: 'Un amigo te pregunta: “Todo el mundo habla del vibe coding. ¿Qué es eso?” ¿Cómo lo explicas en una frase?',
          options: [
            'Describes la tarea con palabras, la IA escribe el código, y tú revisas el resultado y la guías',
            'La IA inventa sola la idea del producto y lo lanza sin intervención humana',
            'Un nuevo lenguaje de programación en el que se escriben las redes neuronales',
          ],
          explain: 'El término “vibe coding” lo acuñó Andrej Karpathy en febrero de 2025: describes la tarea con palabras y la IA escribe el código. Karpathy bromeaba con que puedes “olvidarte de que el código existe”, pero en un proyecto real revisar el resultado sigue siendo tu trabajo.',
        },
        {
          title: '¿Quién ve tus archivos?',
          prompt: 'Abriste un chat de IA normal en el navegador y le escribiste esto. ¿Qué es lo más probable que responda?',
          tool: 'Chat de IA en el navegador',
          input: 'Corrige el color del botón “Comprar” en mi proyecto.',
          outcomes: [
            { label: 'Te pide el código: no ve el proyecto', text: 'No puedo ver los archivos de tu proyecto. Envíame el código del botón y te digo qué cambiar; tú lo pegas.' },
            { label: 'Abre Button.tsx y guarda el cambio por su cuenta', text: '¡Listo! Abrí src/components/Button.tsx y cambié el color a coral. Cambios guardados.' },
            { label: 'Despliega el sitio actualizado', text: 'Actualicé el color y publiqué una nueva versión del sitio. ¡Revisa tu enlace!' },
          ],
          explain: 'Un chat en el navegador solo ve lo que pegas en él. Los editores con IA y los agentes sí pueden editar archivos directamente en tu proyecto: Cursor, Claude Code en la terminal y otros parecidos. Y v0, Lovable y Bolt construyen la app en su propia nube, directamente en su sitio.',
        },
        {
          title: 'El ciclo del vibe coding',
          prompt: 'Ordena los pasos para trabajar con IA. Sobra una tarjeta.',
          steps: ['Describe la tarea con palabras', 'La IA escribe el código', 'Ejecútalo y revísalo tú', 'Indica qué corregir'],
          extra: ['Publícalo enseguida sin abrirlo'],
          explain: 'El vibe coding es un ciclo: prompt → resultado → revisión → ajuste. Se repite hasta que el resultado te convence. Publicar algo sin revisar es pasarles los bugs a tus usuarios.',
        },
        {
          title: '¿En qué no puedes confiar?',
          prompt: 'La IA terminó un formulario de inicio de sesión y te dio su reporte. Encuentra la frase en la que no puedes confiar.',
          file: 'Respuesta de la IA',
          code: [
            '¡Listo! Hice un formulario de inicio de sesión con campos de email y contraseña.',
            'El código está totalmente probado y funciona al 100 %: no hace falta revisarlo.',
            'Los errores aparecen debajo de los campos; la lógica está en LoginForm.tsx.',
            'Si quieres, agrego un enlace “¿Olvidaste tu contraseña?”.',
          ],
          explain: 'La IA se equivoca con tono seguro y puede creer sinceramente que todo funciona. Tu papel es el de cliente y tester: ejecútalo, haz clic, prueba una contraseña incorrecta. En proyectos de práctica basta con probar a mano; en proyectos serios, además, conviene que personas revisen el código.',
        },
        {
          title: 'Tu primer prompt',
          prompt: 'Dos prompts para la misma app. ¿Cuál funcionó mejor?',
          sides: [
            {
              prompt: 'Haz un temporizador Pomodoro web: un botón grande de “Iniciar”, cuenta regresiva de 25 minutos y un sonido al final.',
              result: { label: 'Temporizador Pomodoro', ui: { blocks: { 1: { text: 'Sesión de enfoque' }, 2: { text: '▶ Iniciar' }, 3: { text: '🔔 Sonará una alerta al final' } } } },
            },
            { prompt: 'Haz una app.', result: { label: 'Plantilla genérica' } },
          ],
          reasons: [
            'Describe exactamente qué debe salir: propósito, elementos y comportamiento',
            'Es más largo, y la IA siempre responde mejor a los prompts largos',
            'No incluye la palabra “app”, y a la IA no le gusta',
            'Es más amable, así que la IA se esfuerza más',
          ],
          explain: 'Con “haz una app”, la IA te da el promedio de internet. El propósito, los elementos clave y el comportamiento eliminan las suposiciones: la clave es la precisión, no la longitud.',
        },
      ],
    },
    'u1-2': {
      title: 'El contexto lo es todo',
      ex: [
        {
          title: 'Mejora el prompt de la cafetería',
          prompt: 'Con este prompt, la IA te dará una plantilla sin personalidad. Agrega lo que necesita saber y esquiva las trampas.',
          base: 'Haz un sitio web para una cafetería.',
          chips: [
            { tag: 'Contexto', text: 'Cafetería Zerno junto a la universidad; sus clientes son estudiantes y freelancers.' },
            { tag: 'Stack', text: 'Una sola página en React + Tailwind.' },
            { tag: 'Estructura', text: 'Secciones: menú con precios, horario, mapa y un botón “Reservar mesa”.' },
            { tag: 'Estilo', text: 'Colores cálidos: café #6B4226 y coral #FF7A59, fuente Nunito.' },
            { tag: 'Estilo', text: 'Hazlo bonito y moderno.', trap: 'Cada quien entiende “bonito” a su manera: la IA elegirá una plantilla al azar. Los colores y la fuente sí son concretos.' },
            { tag: 'Énfasis', text: '¡¡¡URGENTE!!! ¡¡¡DE ESTO DEPENDE MI TRABAJO!!!', trap: 'Las mayúsculas y la presión no agregan información. La IA necesita contexto, no emociones.' },
            { tag: 'Ejemplo', text: 'Hazlo idéntico al de Starbucks.', trap: 'No puedes copiar la marca de otros, y “como el suyo” sin detalles la IA lo interpretará a su manera. Mejor describe los recursos que te gustan.' },
          ],
          explain: 'Un buen prompt indica el contexto, el stack, la estructura y el estilo. Cuanto menos tenga que adivinar la IA, más se parecerá el resultado a lo que imaginaste.',
        },
        {
          title: 'La página “Nosotros”',
          prompt: 'Los dos prompts piden lo mismo. ¿Por qué los resultados son tan distintos?',
          sides: [
            {
              prompt: 'Tengo el sitio de una panadería en React; nuestros clientes son familias con niños. Haz la página “Nosotros” con el mismo estilo que la de inicio.',
              result: { label: 'Una página cálida para familias', ui: { blocks: { 0: { items: ['Menú', 'Nosotros', 'Pedidos'], logo: '🥐 Pyshka' }, 1: { text: 'Horneamos para toda la familia desde 2019' }, 2: { label: 'foto de la panadería' }, 3: { text: 'Rincón infantil, cacao y panes con menos azúcar.' } } } },
            },
            { prompt: 'Haz la página “Nosotros”.', result: { label: 'Plantilla genérica' } },
          ],
          reasons: [
            'Tiene contexto: qué proyecto es, para quién y con qué estilo',
            'Es más largo, y más palabras siempre dan un mejor resultado',
            'Menciona React: sin el nombre del stack, la IA no puede escribir páginas',
            'Es más amable',
          ],
          explain: 'Imagina a un recién llegado listo en tu equipo: no conoce tu proyecto. El público, el stack, el código existente y el estilo son el contexto. La longitud por sí sola no ayuda: lo que importa es qué le contaste.',
        },
        {
          title: '¿Para quién es la app?',
          prompt: 'El prompt dice para quién es el producto. ¿Qué es lo más probable que arme la IA?',
          tool: 'Creador de apps',
          input: 'Haz una lista de pendientes para mis papás, que ya son mayores: botones grandes, palabras sencillas, sin ajustes.',
          outcomes: [
            { label: 'Botones grandes y palabras sencillas', ui: { blocks: { 0: { text: 'Mis pendientes' }, 1: { items: ['☐ Tomar las pastillas', '☐ Llamar al nieto'] }, 2: { text: '＋ Agregar pendiente' } } } },
            { label: 'Una interfaz densa con filtros y etiquetas', ui: { blocks: { 0: { items: ['Filtros', 'Etiquetas', '⚙'] }, 2: { text: 'Ajustes · Integraciones · API' } } } },
            { label: 'Un panel oscuro para desarrolladores' },
          ],
          explain: 'Cuando queda claro para quién es el producto, la IA toma decisiones por su cuenta: tamaño de letra, tono del texto, cantidad de funciones. “Para mis papás mayores” le dice más que una lista de diez requisitos de diseño.',
        },
        {
          title: 'La IA completó los huecos',
          prompt: 'Pediste un botón de pago sin detalles, y la IA rellenó los huecos por su cuenta. ¿Qué respondes?',
          chat: [
            { text: 'Agrega un botón de pago.' },
            { text: '¡Listo! Agregué un botón “Pagar” y conecté PayPal con una suscripción de $9.99 al mes 💳' },
          ],
          options: [
            'No: es un pago único con Stripe Checkout. El botón lleva a la página de pago de Stripe y, después de pagar, a /thanks. Quita la suscripción y PayPal.',
            'Haz el botón más grande y de color coral.',
            'No es eso, rehazlo.',
            'Hazlo como en las grandes tiendas en línea.',
          ],
          explain: 'Un pago puede ser único o una suscripción, con un widget o con la página del proveedor. Qué servicio se usa y qué pasa después del pago definen todo el código. “No es eso” obliga a la IA a adivinar otra vez, y el color del botón se puede ajustar después.',
        },
        {
          title: 'Un chat nuevo es una hoja en blanco',
          situation: 'Abres un chat nuevo y escribes “agrega un carrito”. La IA te manda código en Vue, aunque tu proyecto es React + Supabase.',
          options: [
            'Darle contexto: el stack, la estructura del proyecto, lo que ya está hecho, y volver a pedirlo',
            'Escribir “no, así no” y esperar a que la IA adivine',
            'Reescribir el proyecto en Vue, ya que la IA así lo decidió',
          ],
          explain: 'Un chat nuevo no recuerda las conversaciones anteriores sobre el proyecto. En los editores con IA puedes fijar el contexto con archivos de reglas, por ejemplo .cursor/rules o AGENTS.md en Cursor y CLAUDE.md en Claude Code; pero en un chat normal tienes que describir tú el stack y la tarea.',
        },
      ],
    },
    'u1-3': {
      title: 'Rol y formato de respuesta',
      ex: [
        {
          title: 'Revisión antes del lanzamiento',
          prompt: 'Quieres conocer los puntos débiles de tu app antes de lanzarla. ¿Qué prompt ganó?',
          sides: [
            { prompt: 'Revisa mi app de notas.', result: { label: 'Cumplidos', text: '¡Se ve genial! El código está ordenado y la estructura es clara 👍 Ya puedes lanzarla.' } },
            {
              prompt: 'Eres un tester estricto. Encuentra 5 escenarios en los que mi app de notas podría fallar. Responde con una lista numerada.',
              result: { label: 'Lista de riesgos', text: '1. Se guarda una nota vacía.\n2. Un texto muy largo rompe el diseño.\n3. Un doble clic crea un duplicado.\n4. Sin internet, la nota se pierde.\n5. Los emojis en el título rompen la búsqueda.' },
            },
          ],
          reasons: [
            'El rol pone a la IA a buscar problemas, y el formato hace que la respuesta sea fácil de revisar',
            'El rol le da a la IA acceso a conocimientos de testers que de otro modo no tendría',
            'La IA siempre responde con una lista si el prompt tiene más de una línea',
            'La palabra “estricto” hace que la IA trabaje más tiempo',
          ],
          explain: 'El rol define el enfoque y el tono: un “tester” busca casos límite; un “diseñador”, espaciados y contraste. El rol no agrega conocimientos nuevos, así que igual describe explícitamente la tarea y el formato de respuesta.',
        },
        {
          title: 'El formato importa',
          prompt: 'El prompt define el formato de respuesta. ¿Qué enviará la IA?',
          input: 'Dame 5 ideas de nombre para una app de seguimiento de hábitos. En lista numerada, una por línea, sin explicaciones.',
          outcomes: [
            { label: 'Exactamente 5 líneas en lista', text: '1. Habitín\n2. Paso a paso\n3. Cada día\n4. Chispa\n5. Ritmo' },
            { label: 'Un ensayo sobre la importancia del nombre', text: 'El nombre es la cara del producto. Debe ser corto, fácil de recordar y reflejar la esencia. Por ejemplo, se puede jugar con la idea de la constancia, o bien…' },
            { label: 'Una tabla con análisis', text: '| Nombre | Pros | Contras |\n| Habitín | pegadizo | largo |\n| Ritmo | corto | ocupado |' },
          ],
          explain: 'El formato de respuesta es parte del prompt. Una lista, una tabla, “solo código”, “máximo 3 oraciones”: la IA sigue esas indicaciones con facilidad si las dices directamente.',
        },
        {
          title: 'Solo el código, por favor',
          prompt: 'Cada vez, la IA escribe un rollo de explicaciones, pero tú necesitas un archivo listo. Mejora el prompt.',
          base: 'Haz un componente de formulario de inicio de sesión.',
          chips: [
            { tag: 'Rol', text: 'Eres un desarrollador React con experiencia.' },
            { tag: 'Detalles', text: 'Campos de email y contraseña; muestra los errores debajo de los campos.' },
            { tag: 'Formato', text: 'Responde solo con el código completo de LoginForm.tsx, sin explicaciones.' },
            { tag: 'Restricción', text: 'Sin librerías de terceros.' },
            { tag: 'Formato', text: 'Escribe más corto.', trap: '“Más corto” se puede entender de cualquier forma: ¿código más corto? ¿explicaciones más cortas? Nombra el formato directamente: “solo el código del archivo”.' },
            { tag: 'Tono', text: '¡¿Cuántas veces te lo tengo que explicar?!', trap: 'Las emociones no ayudan: la IA responde a instrucciones concretas, no a la irritación.' },
            { tag: 'Rol', text: 'Eres el mejor programador del mundo, un genio.', trap: 'Los halagos no aclaran nada. El rol funciona cuando define un punto de vista: “desarrollador React”, “tester”.' },
          ],
          explain: 'Rol, detalles, restricciones y un formato de respuesta explícito (“solo el código completo del archivo, sin explicaciones”), y la IA te manda justo lo que puedes pegar en tu proyecto.',
        },
        {
          title: 'Un rollo en vez de una respuesta',
          prompt: 'La IA respondió con un texto largo, pero necesitas comparar las opciones rápido. ¿Tu jugada?',
          chat: [
            { text: 'Compara Vercel, Netlify y GitHub Pages para mi landing page.' },
            { text: '¡Excelente pregunta! Vercel es una plataforma creada por el equipo de Next.js que ofrece… Netlify, por su parte, apareció antes y es conocida por… En cuanto a GitHub Pages, es un servicio… (6 párrafos más)' },
          ],
          options: [
            'Ponlo en una tabla: columnas “plan gratis”, “facilidad”, “para qué sirve”. Sin introducciones.',
            'Muy largo.',
            '¡Otra vez escribiste un rollo, ya basta!',
            '¿Y cuál es mejor?',
          ],
          explain: 'Cuando pides un formato concreto, como una tabla con las columnas que necesitas, la respuesta se compara al instante. “Muy largo” no dice cómo debería ser la respuesta.',
        },
        {
          title: 'Explícalo más simple',
          situation: 'Le pediste a la IA que explicara qué hace un fragmento de código, y te llenó de términos: “closure”, “memoización”, “efecto secundario”.',
          options: [
            'Definir rol y público: “Explícalo como un mentor a un principiante, sin tecnicismos, en 3 oraciones”',
            'Escribir “explícalo bien”',
            'Aprenderte primero todos los términos y luego volver a preguntar',
          ],
          explain: 'Para quién es la respuesta y qué tan extensa debe ser también es parte del prompt. “Mentor para principiante, 3 oraciones, sin tecnicismos” le da a la IA un marco claro; “bien”, no.',
        },
      ],
    },
    'u1-4': {
      title: 'Restricciones y criterios',
      ex: [
        {
          title: 'Modo oscuro sin sorpresas',
          prompt: 'Agrega restricciones y un criterio de “listo” para que la IA no remodele todo el proyecto.',
          base: 'Agrega modo oscuro.',
          chips: [
            { tag: 'Contexto', text: 'El proyecto usa React + Tailwind.' },
            { tag: 'Restricción', text: 'No cambies el marcado de los componentes y no toques App.tsx.' },
            { tag: 'Criterio', text: 'Está listo cuando el interruptor del encabezado cambia el tema y la elección se mantiene al recargar.' },
            { tag: 'Formato', text: 'Muestra solo los archivos modificados.' },
            { tag: 'Libertad', text: 'De paso, puedes mejorar todo el proyecto.', trap: 'Es una invitación a reescribirlo todo. Las restricciones existen justamente para que la IA no toque el código que funciona.' },
            { tag: 'Criterio', text: 'Hazlo bien.', trap: '“Bien” no se puede verificar. Un criterio de “listo” es algo que puedes comprobar a mano.' },
            { tag: 'Énfasis', text: '¡NI SE TE OCURRA EQUIVOCARTE!', trap: 'Las amenazas y las mayúsculas no agregan precisión.' },
          ],
          explain: 'Las restricciones acotan el margen de improvisación de la IA (qué stack, qué no tocar), y el criterio de “listo” dice cómo comprobar el resultado. Juntos protegen el código que funciona.',
        },
        {
          title: 'Cambiar el color de un botón',
          prompt: 'Tienes que cambiar el color de un botón en un proyecto grande. ¿Qué prompt es más seguro?',
          sides: [
            { prompt: 'Mejora el botón y, de paso, todo el proyecto.', result: { label: 'Remodelación en 14 archivos', lines: ['✎ Archivos modificados: 14', '✎ Nueva estructura de carpetas', '✎ 6 librerías actualizadas', '✗ npm run build: 3 errors'] } },
            { prompt: 'Cambia el color del botón “Comprar” a #FF7A59. No toques el resto del código.', result: { label: 'Una línea en un archivo', lines: { 3: '>Comprar</button>' } } },
          ],
          reasons: [
            'Una tarea precisa más una restricción: la IA cambia una línea en vez de remodelar',
            'La libertad siempre da mejor resultado, pero este prompt es más corto',
            'Sin un código HEX la IA no puede cambiar colores',
            'Los prompts cortos siempre son más seguros que los largos',
          ],
          explain: 'Una tarea precisa y la restricción “no toques lo demás”, y la IA no se mete donde no le pediste. “Mejóralo todo” invita a cambios en decenas de archivos que luego cuesta revisar.',
        },
        {
          title: 'Límites para la IA',
          prompt: 'El prompt tiene tres restricciones. ¿Qué es lo más probable que haga el agente de IA?',
          tool: 'Editor con IA',
          input: 'Haz un formulario de contacto. Restricciones: sin librerías de terceros, solo los campos “nombre” y “email”, no toques App.tsx.',
          outcomes: [
            { label: 'Un componente aparte, App.tsx intacto', text: 'Creé ContactForm.tsx: campos “nombre” y “email”, validación con React puro. No cambié App.tsx; agrega tú el formulario: <ContactForm />.' },
            { label: 'Instaló librerías y reescribió App.tsx', text: 'Instalé react-hook-form y yup, agregué los campos “teléfono” y “dirección” y reescribí App.tsx para el nuevo formulario.' },
          ],
          explain: 'Las restricciones son límites: qué librerías se permiten, qué campos se necesitan, qué archivos no se tocan. Cuanto más claros los límites, menos sorpresas en el diff.',
        },
        {
          title: '“Ahora todo se guarda”',
          prompt: 'La IA asegura que la tarea está resuelta. ¿Cómo haces que el resultado se pueda verificar?',
          chat: [
            { text: 'Haz que las tareas se guarden.' },
            { text: '¡Listo! Ahora todo se guarda 👍' },
          ],
          options: [
            'Criterio: las tareas siguen ahí después de recargar la página y de cerrar la pestaña. ¿Dónde se guardan y cómo lo compruebo?',
            '¡Gracias, te creo!',
            '¿Seguro, seguro?',
            'Haz que se guarde todavía mejor.',
          ],
          explain: 'Un criterio de “listo” es algo que puedes comprobar a mano: “después de recargar, las tareas siguen ahí”. Que la IA vuelva a decir “sí, estoy seguro” no demuestra nada.',
        },
        {
          title: 'Solo pedí el color',
          prompt: 'La IA terminó el cambio. Acepta lo que pediste y rechaza lo que sobra.',
          request: 'Cambia el color del botón “Comprar” a coral #FF7A59. No toques nada más.',
          hunks: {
            2: {
              lines: { 1: '-  <a href="/catalog">Catálogo</a>', 2: '-  <a href="/delivery">Envíos</a>', 3: '+  <a href="/">Inicio</a>' },
              harmful: 'Solo pediste el color del botón, pero la IA reescribió el menú y borró los enlaces al catálogo y a envíos.',
            },
          },
          explain: 'El color al pasar el cursor es parte del mismo botón: ese cambio tiene sentido. Un menú reescrito es un cambio fuera de la tarea. Revisar el diff antes de aceptar un cambio atrapa esos “ya que estaba”.',
        },
      ],
    },
    'u1-5': {
      title: 'Iterar en vez de empezar de cero',
      ex: [
        {
          title: 'Tarjetas apretadas',
          prompt: 'El resultado casi está, pero las tarjetas de productos quedaron pegadas. ¿Cómo lo precisas?',
          chat: [
            { text: 'Haz un catálogo: tarjetas de producto con foto, nombre y precio.' },
            { text: 'Listo, aquí está el catálogo:', preview: { blocks: { 0: { text: 'Catálogo' }, 1: { items: ['Taza $6', 'Termo $15', 'Té $4'] } } } },
          ],
          options: [
            'Aumenta el espacio entre tarjetas a 24px y el relleno interno de cada tarjeta a 16px. No cambies nada más.',
            'No es eso, rehazlo.',
            'Hazlo todo de nuevo, pero mejor.',
            'Las tarjetas se ven como raras.',
          ],
          explain: 'Un buen ajuste dice qué está mal y cómo debería quedar. “No es eso” obliga a la IA a adivinar otra vez, y puede romper lo que ya funcionaba.',
        },
        {
          title: 'El formulario mudo',
          prompt: 'El formulario funciona, pero después de enviarlo no se ve nada. Esquema: qué funciona → qué está mal → qué hacer.',
          chat: [
            { text: 'Haz un formulario de reserva: nombre y teléfono.' },
            { text: '¡Listo! El formulario envía los datos al servidor.', preview: { blocks: { 0: { label: 'Nombre', value: 'Aida' }, 1: { label: 'Teléfono', value: '+52 55 …' }, 2: { text: 'Reservar' } } } },
          ],
          options: [
            'El formulario se envía, pero la persona no ve ningún resultado. Después de enviarlo, muestra “¡Gracias, te llamamos pronto!” y limpia los campos.',
            '¿¿¿Por qué no pasa nada???',
            'Borra el formulario, no funciona.',
            'Empieza el proyecto de nuevo.',
          ],
          explain: 'Qué funciona → qué está mal → qué debería pasar. Un ajuste así conserva lo hecho y agrega lo que falta.',
        },
        {
          title: 'Pasos pequeños',
          prompt: 'Tienes que cambiar la fuente, agregar un menú, conectar pagos y el modo oscuro. Arma el ritmo de trabajo para un cambio.',
          steps: ['Pide un solo cambio', 'Revisa el resultado en el navegador', 'Guarda una versión que funcione (commit)', 'Pasa al siguiente cambio'],
          extra: ['Pide los cuatro cambios en un solo mensaje'],
          explain: 'Los pasos pequeños son fáciles de revisar y de revertir. Si pides todo de una vez y algo se rompe, será difícil saber qué fue exactamente.',
        },
        {
          title: 'La IA empezó a olvidar',
          situation: 'La conversación con la IA se volvió muy larga: se confunde y olvida acuerdos de hace una hora.',
          options: [
            'Abrir un chat nuevo y describir brevemente el proyecto, su estado actual y la tarea',
            'Seguir en el mismo chat y escribir “otra vez se te olvidó” cada vez',
            'Cambiar a otra IA y decirle “continúa” sin explicar nada',
          ],
          explain: 'La IA tiene una “ventana de contexto” limitada: en una conversación larga, los detalles del principio se pierden o se resumen. Un chat nuevo con un resumen breve le devuelve todo lo importante; otra IA sin explicaciones no sabe nada del proyecto.',
        },
        {
          title: '¿Corregir o empezar de nuevo?',
          prompt: 'La landing page está casi lista, pero el título quedó pequeño. ¿Qué petición es mejor?',
          sides: [
            {
              prompt: 'Hazlo todo de nuevo, pero mejor.',
              result: { label: 'Un sitio nuevo… y pérdidas', ui: { blocks: { 0: { text: 'Un diseño totalmente distinto' }, 2: { text: 'Desaparecieron: el formulario de reserva y tus textos' } } } },
            },
            {
              prompt: 'Deja todo como está; solo haz el título de la sección principal más grande (48px) y centrado.',
              result: { label: 'Lo mismo, con un título más grande', ui: { blocks: { 0: { text: 'Clases de guitarra para adultos' }, 1: { text: 'Tu primera canción en un mes' }, 2: { text: 'Inscribirme' } } } },
            },
          ],
          reasons: [
            'Conserva lo que ya está hecho y cambia un punto concreto',
            'Empezar de nuevo siempre sale más barato que corregir',
            'Es más corto que el primero',
            'La IA entiende “mejor” exactamente igual que tú',
          ],
          explain: 'El vibe coding es un ciclo: prompt → resultado → ajuste. Los cambios pequeños y precisos funcionan mejor que “reescríbelo todo”: al reescribir se pierde lo que ya estaba bien.',
        },
      ],
    },
    'u1-6': {
      title: 'Examen final de la unidad',
      ex: [
        {
          title: 'Calculadora de propinas',
          prompt: 'Necesitas una calculadora de propinas. ¿Qué prompt ganó?',
          sides: [
            { prompt: 'calculadora', result: { label: 'Una calculadora común' } },
            {
              prompt: 'Haz una calculadora de propinas web: un campo para el total de la cuenta, botones de 10/15/20 % y el total en letra grande. Una sola página, sin registro.',
              result: { label: 'Calculadora de propinas', ui: { blocks: { 0: { label: 'Total de la cuenta', value: '$120' }, 2: { text: 'Total: $138' } } } },
            },
          ],
          reasons: [
            'Objetivo, contenido de la interfaz y restricciones: la IA no tiene que adivinar',
            'Tiene números, y a la IA le encantan los números',
            'Empieza con mayúscula',
            'La IA entiende un prompt corto como “haz lo que quieras”, y eso solo a veces es malo',
          ],
          explain: 'Objetivo, contenido de la interfaz y restricciones en un solo prompt. Con la palabra “calculadora” sola, la IA hizo, honestamente, la calculadora más común.',
        },
        {
          title: 'Primero el plan, luego el código',
          prompt: 'La tarea es grande: un área de cuenta de usuario. Mejora el prompt para que la IA no se lance a escribir cientos de líneas.',
          base: 'Agrega un área de cuenta de usuario a la app.',
          chips: [
            { tag: 'Preguntas', text: 'Antes de escribir código, hazme preguntas para aclarar.' },
            { tag: 'Plan', text: 'Luego propón un plan paso a paso.' },
            { tag: 'Alto', text: 'Empieza a escribir código solo después de que te diga “ok”.' },
            { tag: 'Velocidad', text: 'No hagas preguntas, escribe todo el código de una vez.', trap: 'Así la IA escribe cientos de líneas según sus suposiciones, y los malentendidos salen a la luz demasiado tarde.' },
            { tag: 'Ejemplo', text: 'Hazlo como en los grandes servicios.', trap: '“Como en los grandes servicios” son cientos de soluciones distintas. Sin detalles, la IA elegirá al azar.' },
          ],
          explain: 'Un plan antes del código detecta malentendidos antes de que la IA escriba cientos de líneas equivocadas. Cursor y Claude Code tienen un modo de planificación para esto: Plan Mode.',
        },
        {
          title: 'El carrito suma NaN',
          prompt: 'La IA escribió una función que suma el carrito, pero devuelve NaN. Toca la línea con el bug.',
          explain: 'La condición “i <= prices.length” se sale del arreglo: el último prices[i] es undefined y la suma se convierte en NaN. Debe ser “<”.',
        },
        {
          title: 'Una función que no existe',
          prompt: 'La IA explica su cambio. Una frase es inventada. Encuéntrala.',
          file: 'Respuesta de la IA',
          code: [
            '¡Listo! Los precios en las tarjetas ahora se formatean con separador de miles: $12,000.',
            'Usé la función integrada del navegador formatPrice(), que está disponible en todos lados.',
            'La llamada está en ProductCard.jsx, en la línea del precio.',
            'Si hace falta, agrego el símbolo de la moneda en los ajustes.',
          ],
          explain: 'Los navegadores no tienen una función integrada formatPrice(): a veces la IA “inventa” funciones con total seguridad. Para formatear números existe Intl.NumberFormat. Estas alucinaciones aparecen en la primera ejecución: “formatPrice is not defined”.',
        },
        {
          title: 'Un solo cambio preciso',
          prompt: 'El resultado está casi listo; solo falta corregir el título. ¿Qué escribes?',
          chat: [
            { text: 'Haz la sección principal para un curso de inglés.' },
            { text: 'Listo:', preview: { blocks: { 0: { text: 'Inglés en 3 meses' }, 2: { text: 'Inscribirme' } } } },
          ],
          options: [
            'Haz el título grande (40px), en negritas y centrado. No toques nada más.',
            'Rehazlo todo.',
            'El título está mal.',
            'Haz diez versiones y yo elijo.',
          ],
          explain: 'Iterar con pasos pequeños y precisos es la habilidad clave de quien hace vibe coding: qué elemento → cómo debe quedar → qué no tocar.',
        },
        {
          title: 'Una tabla, por favor',
          prompt: '¿Qué enviará la IA con esta petición?',
          input: 'Compara Vercel, Netlify y GitHub Pages en una tabla: columnas “plan gratis”, “facilidad”, “para qué sirve”.',
          outcomes: [
            { label: 'Una tabla con tres columnas', text: '| Servicio | Gratis | Facilidad | Para qué |\n| Vercel | sí | alta | React, Next.js |\n| Netlify | sí | alta | estáticos, formularios |\n| GitHub Pages | sí | media | sitios estáticos |' },
            { label: 'Una historia sobre el hosting', text: 'El hosting de sitios web ha recorrido un largo camino: en los años 90, los sitios se alojaban en servidores propios…' },
          ],
          explain: 'Cuando pides una tabla con columnas concretas, la respuesta se compara al instante. El formato es tan parte de la tarea como la pregunta misma.',
        },
      ],
    },
  },
}
