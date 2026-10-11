import type { UnitTr } from '../types'

export const u6: UnitTr = {
  title: 'Diseño y UI con IA',
  subtitle: 'Interfaces bonitas y fáciles de usar',
  description: 'Prompts para la interfaz, componentes, sistema de diseño, diseño responsive y accesibilidad',
  lessons: {
    'u6-1': {
      title: 'Prompt para la interfaz',
      ex: [
        {
          title: 'Pantalla de estadísticas',
          prompt: 'Necesitas una pantalla de estadísticas para una app de entrenamiento. ¿Qué prompt dio una interfaz clara?',
          sides: [
            {
              prompt: 'Haz un dashboard bonito y moderno.',
              result: {
                label: 'Seis gráficos que no dicen nada',
                ui: {
                  blocks: {
                    2: {
                      text: '¿Qué es lo principal aquí?',
                    },
                  },
                },
              },
            },
            {
              prompt: 'Pantalla “Mi semana” para principiantes en fitness. Lo principal es cuántos entrenamientos se hicieron del plan, grande arriba. Abajo, un gráfico por días y un botón “Empezar entrenamiento”.',
              result: {
                label: 'Lo principal arriba, un solo botón',
                ui: {
                  blocks: [
                    {
                      text: '3 de 4 entrenamientos',
                    },
                    {
                      text: 'Falta uno para la meta de la semana',
                    },
                    {
                      label: 'gráfico por días',
                    },
                    {
                      text: 'Empezar entrenamiento',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'Define la jerarquía: qué es principal, qué es secundario y qué acción esperamos',
            'Incluye la palabra “semana”, y a la IA le gustan los plazos concretos',
            '“Bonito” y “moderno” la IA no los entiende en absoluto',
            'Es más largo, así que la IA se esforzó más',
          ],
          explain: 'La interfaz es una jerarquía: qué debe ver primero el usuario y qué debe hacer. “Bonito” no define ni lo uno ni lo otro, por eso la IA dibuja una plantilla “como todas”.',
        },
        {
          title: 'Tarjeta de receta',
          prompt: 'Mejora el prompt para la pantalla de una receta en una app de cocina.',
          base: 'Haz una pantalla de receta.',
          chips: [
            {
              tag: 'Estructura',
              text: 'Arriba la foto y el nombre, abajo el tiempo de cocción y las porciones, luego los ingredientes y los pasos.',
            },
            {
              tag: 'Contexto',
              text: 'La persona cocina con el teléfono en la cocina: tiene las manos ocupadas, el texto debe leerse de lejos.',
            },
            {
              tag: 'Estados',
              text: 'Marca los pasos completados con una palomita; si la foto no cargó, muestra una imagen de relleno.',
            },
            {
              tag: 'Estilo',
              text: 'Colores cálidos, letra grande, mucho espacio.',
            },
            {
              tag: 'Referencia',
              text: 'Copia el diseño de un sitio de cocina famoso tal cual.',
              trap: 'No se puede copiar el diseño ni la marca de otro. Describe los recursos que te gustan: fotos grandes, pasos con números.',
            },
            {
              tag: 'Estilo',
              text: 'Usa todos los colores del arcoíris para que se vea llamativo.',
              trap: 'Muchos colores sin sistema son ruido. Llamativo ≠ claro: elige un color principal y uno de acento.',
            },
          ],
          explain: 'Estructura → contexto de uso → estados → estilo. Dónde y cómo la persona usa la pantalla suele ser más importante que los colores: en la cocina se necesita letra grande y pocos botones pequeños.',
        },
        {
          title: 'Mejor verlo una vez',
          situation: 'Dibujaste un boceto de la pantalla en papel, pero describir con palabras la ubicación de los bloques es difícil. El editor con IA puede recibir imágenes.',
          options: [
            'Tomarle una foto al boceto, adjuntarla al prompt y describir lo que importa: “el botón principal va abajo, a todo lo ancho”',
            'Describir todo con palabras, la IA no entiende las imágenes de todos modos',
            'Pedirle a la IA que adivine el diseño sin pistas',
          ],
          explain: 'Los modelos actuales (ChatGPT, Claude, Gemini) y editores como Cursor, v0 y Lovable aceptan imágenes: una captura de pantalla o un boceto a mano transmite el diseño más rápido que las palabras. Pero igual explica lo principal con palabras: la IA puede entender la imagen a su manera.',
        },
        {
          title: 'Lista vacía',
          prompt: 'Pediste: “Haz una pantalla de lista de compras”. El usuario la abre por primera vez: la lista está vacía. ¿Qué verá probablemente?',
          tool: 'Vista previa',
          input: 'Haz una pantalla de lista de compras.',
          outcomes: [
            {
              label: 'Pantalla blanca vacía',
              ui: {
                blocks: [
                  {
                    text: 'Compras',
                  },
                  {
                    text: '(vacío)',
                  },
                ],
              },
            },
            {
              label: 'Mensaje amigable y botón',
              ui: {
                blocks: {
                  0: {
                    text: 'Compras',
                  },
                  2: {
                    text: 'La lista está vacía: agrega el primer producto',
                  },
                  3: {
                    text: '+ Agregar',
                  },
                },
              },
            },
            {
              label: 'Error de carga',
              ui: {
                blocks: [
                  {
                    text: 'Compras',
                  },
                  {
                    text: 'Error: lista no encontrada',
                  },
                ],
              },
            },
          ],
          explain: 'La IA normalmente dibuja el “camino feliz”: la pantalla con datos. El estado vacío, la carga y el error hay que pedirlos explícitamente: “si la lista está vacía, muestra un mensaje y un botón para agregar”.',
        },
        {
          title: 'Degradado morado',
          prompt: 'La IA hizo un landing page, pero se ve como miles de otros. ¿Tu jugada?',
          chat: [
            {
              text: 'Haz un landing page para mi panadería.',
            },
            {
              text: '¡Listo! Degradado morado, tarjetas de vidrio y el título “Revolutionize your bakery”.',
            },
          ],
          options: [
            'La panadería es familiar y acogedora: tonos beige cálidos, fotos de panadería, letra con serifas en los títulos, textos en español. Aquí hay un sitio que me gusta por su ambiente: [enlace]. No lo copies, toma la sensación.',
            'Hazlo más bonito.',
            'Cambia el morado por verde.',
            'Agrega más animaciones para que se vea moderno.',
          ],
          explain: 'Sin indicaciones, la IA produce un estilo “promedio”. Ayudan las palabras sobre el ambiente, los colores, las letras y las referencias: la IA toma de ahí el ambiente, no copia el sitio de otro.',
        },
      ],
    },
    'u6-2': {
      title: 'Componentes',
      ex: [
        {
          title: 'Para qué sirven los componentes',
          situation: 'En el sitio hay 12 botones «Comprar» idénticos, y la IA puso los estilos en cada uno. Ahora hay que hacerlos todos azules.',
          options: [
            'Pedirle a la IA que mueva el botón a un componente Button y lo use en todas partes — así el color se cambia en un solo lugar',
            'Pedirle a la IA que cambie el color en 12 lugares — así es más confiable',
            'Dejarlo como está: los componentes solo son para empresas grandes',
          ],
          explain: 'Un componente es una pieza reutilizable de la interfaz (botón, tarjeta, encabezado). Un cambio en un solo lugar actualiza todas las copias, y la IA no va a «olvidar» una de las doce.',
        },
        {
          title: 'Página dividida en componentes',
          prompt: 'La página del catálogo creció hasta 600 líneas. Divídela en componentes junto con la IA — paso a paso.',
          steps: [
            'Pídele a la IA que enumere los bloques repetidos',
            'Extrae el primer componente — la tarjeta de producto',
            'Reemplaza las copias de la tarjeta por el componente',
            'Revisa en la vista previa que todo se vea como antes',
            'Pasa al siguiente bloque',
          ],
          extra: [
            'Pide que reescriba toda la página de una sola vez',
          ],
          explain: 'Una refactorización grande es mejor hacerla componente por componente y revisar el resultado después de cada paso. «Rehaz todo de una vez» es la receta para un diseño roto que después es difícil de encontrar.',
        },
        {
          title: 'Botón poco versátil',
          prompt: 'El componente Button se usa en todo el sitio. ¿Qué línea impide reutilizarlo?',
          code: {
            4: '      Comprar',
          },
          explain: 'El texto «Comprar» está fijado dentro — este componente ya no puede ser un botón «Cancelar» o «Entrar». El contenido debe llegar desde afuera mediante children.',
        },
        {
          title: 'Componente de tarjeta',
          prompt: 'Le pediste a la IA que moviera la tarjeta de producto a un componente. Revisa los cambios.',
          request: 'Mueve la tarjeta de producto a un componente ProductCard y úsalo en el catálogo.',
          hunks: {
            2: {
              harmful: 'La IA también reescribió los estilos globales — eso cambia tamaños y márgenes en todo el sitio. No se lo pediste.',
            },
          },
          explain: 'El componente en sí y el reemplazo de las copias es exactamente lo que pediste. Pero el cambio del CSS global rompe el diseño en todas partes; si la IA toca archivos compartidos, pregúntale para qué.',
        },
        {
          title: 'Prompt para un componente',
          prompt: 'Pídele a la IA que haga un componente de notificación (toast) que sirva en toda la aplicación.',
          base: 'Haz una notificación emergente.',
          chips: [
            {
              tag: 'Variantes',
              text: 'Tres variantes: éxito, error, advertencia.',
            },
            {
              tag: 'Parámetros',
              text: 'El texto y la variante se pasan como parámetros (props).',
            },
            {
              tag: 'Comportamiento',
              text: 'Desaparece a los 4 segundos, tiene botón de cerrar.',
            },
            {
              tag: 'Stack',
              text: 'React + Tailwind, como en el resto del proyecto.',
            },
            {
              tag: 'Texto',
              text: 'Adentro escribe siempre «¡Guardado!».',
              trap: 'El texto fijado hace que el componente sea de un solo uso — debe llegar como parámetro.',
            },
            {
              tag: 'Velocidad',
              text: 'Copia los estilos de todas las páginas donde haya notificaciones.',
              trap: 'Así se arma un revoltijo de estilos distintos. El componente debe definir una sola apariencia común.',
            },
          ],
          explain: 'Un buen componente: qué cambia (parámetros), qué variantes tiene, cómo se comporta. Así se puede insertar en cualquier lugar de la aplicación.',
        },
      ],
    },
    'u6-3': {
      title: 'Sistema de diseño',
      ex: [
        {
          title: 'Cinco tonos de azul',
          prompt: 'Pasaste una semana pidiéndole a la IA que agregara pantallas sin mencionar ni una vez los colores del proyecto. ¿Qué es lo más probable que haya en el código?',
          tool: 'Editor con IA',
          input: 'Buscar en el proyecto: ¿qué colores azules se usan?',
          outcomes: [
            {
              label: 'Muchos azules diferentes',
            },
            {
              label: 'Un solo color del tema',
              lines: [
                'var(--color-primary)  — en todas partes',
              ],
            },
            {
              label: 'No hay azul en absoluto',
              lines: [
                'no se encontró nada',
              ],
            },
          ],
          explain: 'Cada nuevo prompt es una nueva decisión de la IA “a ojo”. Sin reglas comunes, los tonos y los espaciados se dispersan. Se soluciona con un sistema de diseño: los colores y tamaños se definen una vez y se hace referencia a ellos.',
        },
        {
          title: 'Qué son los tokens',
          situation: 'En la guía de la plantilla dice: “No uses colores directamente, toma los tokens de diseño”. ¿Qué significa?',
          options: [
            'Los colores, tamaños de fuente y espaciados se definen una vez bajo nombres (primary, space-4), y los componentes hacen referencia a esos nombres',
            'Los tokens son los límites de pago de la IA, hay que economizarlos',
            'Son contraseñas que protegen el diseño de copias',
          ],
          explain: 'Los tokens de diseño son valores con nombre: --color-primary, --radius-lg, escala de espaciados. En Tailwind es el tema del proyecto, en CSS son variables. Cambiaste un token y cambió todo el sitio. (No los confundas con los tokens de IA, que son unidades de texto).',
        },
        {
          title: 'Un color ajeno',
          prompt: 'En el proyecto hay un tema con colores. ¿Qué línea lo rompe?',
          explain: '#6a5acd es un “casi violeta” que no es del tema. La IA agrega decenas de estos detalles y la interfaz empieza a verse descuidada. Se necesita var(--color-primary) o un nuevo token en el tema.',
        },
        {
          title: 'Espaciados a ojo',
          prompt: 'La IA puso espaciados de 13px, 17px y 22px. ¿Qué respondes?',
          chat: [
            {
              text: 'Agrega tarjetas de planes debajo del título.',
            },
            {
              text: '¡Listo!',
            },
          ],
          options: [
            'Usa la escala de espaciados del proyecto: 4, 8, 12, 16, 24, 32 px (en Tailwind es p-4, gap-6, etc.). Reescribe estos valores según la escala y de ahora en adelante toma solo de ella.',
            'Haz los espaciados aún más grandes para que se vea más aireado.',
            'No importa, nadie lo notará a ojo.',
            'Quita los espaciados por completo.',
          ],
          explain: 'La escala de espaciados (normalmente múltiplos de 4 u 8) hace que la interfaz se vea ordenada. Si le pides explícitamente a la IA “toma solo de la escala”, dejará de inventar números al azar.',
        },
        {
          title: 'Reglas para la IA',
          prompt: 'Quieres que el editor con IA respete el estilo del proyecto en cada nueva pantalla. ¿Qué enfoque es más confiable?',
          sides: [
            {
              prompt: 'Cada vez al final del prompt: “y hazlo en nuestro estilo”.',
              result: {
                label: 'Estilo “de memoria”',
                text: 'Lo hice en tu estilo: botones azules, esquinas redondeadas de 6px.',
              },
            },
            {
              prompt: 'Describir una vez el sistema de diseño en un archivo de reglas del proyecto (colores, fuentes, espaciados, componentes listos) — el editor lo mezcla con las solicitudes.',
              result: {
                label: 'Estilo desde las reglas',
                text: 'Uso Button y Card de src/components, los colores son del tema, los espaciados según la escala.',
              },
            },
          ],
          reasons: [
            'La IA no recuerda los chats anteriores; las reglas del proyecto las recibe con cada solicitud',
            'Los archivos de reglas la IA los lee más rápido que el texto del prompt',
            'La IA no entiende la palabra “estilo”',
            'La segunda opción es más larga',
          ],
          explain: 'El modelo no recuerda “cómo se hace aquí”. Los archivos de reglas (por ejemplo, .cursor/rules en Cursor o AGENTS.md) el editor los agrega a las solicitudes, y así se respetan los colores, componentes y espaciados sin recordatorios.',
        },
      ],
    },
    'u6-4': {
      title: 'Diseño responsive',
      ex: [
        {
          title: 'Tres columnas en el teléfono',
          prompt: 'Las tarjetas de precios están maquetadas así. ¿Qué verá una persona en un teléfono de 375px de ancho?',
          tool: 'Vista previa',
          input: 'Abro la página de precios en el teléfono.',
          outcomes: [
            {
              label: 'Tres columnas angostas y apretadas',
              ui: {
                blocks: [
                  {
                    items: [
                      'Bá…',
                      'Es…',
                      'Pro…',
                    ],
                  },
                  {
                    text: 'El texto no cabe',
                  },
                ],
              },
            },
            {
              label: 'Tarjetas una debajo de otra',
              ui: {
                blocks: [
                  {
                    items: [
                      'Básico',
                      'Estándar',
                      'Pro',
                    ],
                  },
                ],
              },
            },
            {
              label: 'Desplazamiento horizontal',
              ui: {
                blocks: [
                  {
                    items: [
                      'Básico →',
                    ],
                  },
                  {
                    text: 'Desliza hacia un lado',
                  },
                ],
              },
            },
          ],
          explain: 'grid-cols-3 sin prefijos se aplica en cualquier ancho. Necesitas un enfoque móvil: grid-cols-1 por defecto y md:grid-cols-3 para pantallas anchas.',
        },
        {
          situation: 'En Tailwind ves las clases text-base md:text-lg. ¿Cómo funciona esto?',
          options: [
            'text-base — para todas las pantallas, y desde el ancho md (768px) y más — text-lg',
            'text-lg — solo en teléfonos',
            'md significa “medium” — tamaño de fuente mediano en cualquier pantalla',
          ],
          explain: 'En Tailwind los estilos sin prefijo son para todas las pantallas, y sm: (640px), md: (768px), lg: (1024px) se activan desde ese ancho y más. Por eso se maqueta del teléfono a la computadora (mobile-first).',
        },
        {
          title: 'La página se va hacia un lado',
          prompt: 'En el teléfono la página se puede desplazar hacia un lado y todo “flota”. ¿Qué línea tiene la culpa?',
          explain: 'El ancho fijo de 900px no cabe en el teléfono y estira la página. Necesitas valores flexibles: width: 100% y max-width: 900px.',
        },
        {
          title: 'Arreglamos el diseño responsive',
          prompt: 'Le pediste a la IA arreglar el encabezado en el teléfono. Acepta lo útil, rechaza lo peligroso.',
          request: 'En el teléfono el menú del encabezado no cabe. Haz un botón de hamburguesa.',
          hunks: {
            0: {
              lines: {
                2: '+<button className="md:hidden" aria-label="Abrir menú">☰</button>',
              },
            },
            1: {
              harmful: 'Sin width=device-width el teléfono muestra una “copia reducida del escritorio” — todo se verá diminuto. Esto no es diseño responsive, sino desactivarlo.',
            },
          },
          explain: 'Ocultar el menú en una pantalla angosta y mostrar la hamburguesa es una solución normal. Pero reemplazar el viewport rompe el diseño responsive por completo: el teléfono deja de ajustar la escala.',
        },
        {
          title: 'Prueba en el teléfono',
          prompt: 'La IA dijo “el diseño responsive está listo”. Compruébalo paso a paso.',
          steps: [
            'Abre el modo dispositivo en DevTools (F12)',
            'Recorre la página en un ancho de 375px',
            'Busca desplazamiento horizontal y texto diminuto',
            'Descríbele a la IA qué está mal, con una captura de pantalla',
            'Pruébalo en un teléfono real',
          ],
          extra: [
            'Créerle a la IA sin verificar',
          ],
          explain: 'El modo dispositivo en DevTools (Ctrl+Shift+M en Chrome) muestra rápido una pantalla angosta, pero un teléfono real detecta lo que el emulador no ve: el tamaño del dedo, el teclado, el “notch”.',
        },
      ],
    },
    'u6-5': {
      title: 'Accesibilidad',
      ex: [
        {
          title: 'Gris claro sobre blanco',
          prompt: 'El diseñador de IA eligió para el texto #C8C8C8 sobre fondo blanco. ¿Qué dirá la verificación de contraste?',
          tool: 'Verificación de contraste',
          input: 'Texto #C8C8C8 sobre fondo #FFFFFF, tamaño normal de 16px.',
          outcomes: [
            {
              label: 'No pasa: el contraste es de aproximadamente 1,7 : 1',
              ui: {
                blocks: {
                  1: {
                    text: 'Se necesita un mínimo de 4,5 : 1 (WCAG AA)',
                  },
                },
              },
            },
            {
              label: 'Pasa: el texto claro es más fácil de leer',
              ui: {
                blocks: {
                  1: {
                    text: 'Buen contraste',
                  },
                },
              },
            },
            {
              label: 'No hace falta verificar: es solo gris',
              ui: {
                blocks: {
                  1: {
                    text: 'El contraste solo importa para los botones',
                  },
                },
              },
            },
          ],
          explain: 'Según WCAG (nivel AA), el texto normal necesita un contraste de al menos 4,5 : 1, y el texto grande, 3 : 1. El gris pálido sobre blanco se lee mal bajo el sol y para las personas con baja visión. Puedes verificarlo en DevTools o en cualquier verificador de contraste en línea.',
        },
        {
          title: 'Botón invisible',
          prompt: 'Una persona usa el sitio con el teclado (Tab y Enter). ¿En qué línea el botón “desaparece” para ella?',
          code: {
            1: '  <img src={photo} alt="Capuchino en una taza blanca" />',
            2: '  <h3>Capuchino</h3>',
            3: '  <div className="btn" onClick={addToCart}>Añadir al carrito</div>',
          },
          explain: 'Un div con onClick no recibe el foco del teclado ni se anuncia como botón por el lector de pantalla. Para las acciones se necesita un <button> de verdad: funciona con Tab, Enter y espacio desde el primer momento.',
        },
        {
          title: 'Consejo sobre formularios',
          prompt: 'La IA explica cómo hacer un formulario accesible. Encuentra el consejo dañino.',
          file: 'Respuesta de la IA',
          code: [
            'Cada campo debe tener una etiqueta <label> asociada al campo.',
            'Escribe el error como texto junto al campo, no solo con un borde rojo.',
            'La etiqueta se puede quitar: el placeholder dentro del campo la reemplaza por completo.',
            'El orden de los campos al navegar con Tab debe coincidir con el orden en pantalla.',
          ],
          explain: 'El placeholder desaparece en cuanto empiezas a escribir, a menudo es pálido y no siempre lo leen los lectores de pantalla. La etiqueta (label) siempre es necesaria, y el placeholder es solo un ejemplo de entrada.',
        },
        {
          title: 'Formulario accesible',
          prompt: 'Pídele a la IA que haga de una vez un formulario de cita cómodo para todos.',
          base: 'Haz un formulario de cita.',
          chips: [
            {
              tag: 'Etiquetas',
              text: 'Cada campo tiene una etiqueta visible (label).',
            },
            {
              tag: 'Errores',
              text: 'Los errores van como texto debajo del campo, no solo con color.',
            },
            {
              tag: 'Teclado',
              text: 'El formulario funciona por completo con el teclado y el foco se ve.',
            },
            {
              tag: 'Contraste',
              text: 'El contraste del texto no es menor a 4,5 : 1.',
            },
            {
              tag: 'Estilo',
              text: 'Quita el contorno del foco: es feo.',
              trap: 'Sin un foco visible, la persona que usa el teclado no sabe dónde está. El contorno se puede recolorear, pero no eliminar.',
            },
            {
              tag: 'Minimalismo',
              text: 'No hacen falta etiquetas, basta con el placeholder.',
              trap: 'El placeholder desaparece al escribir y se lee mal. La etiqueta siempre es necesaria.',
            },
          ],
          explain: 'La accesibilidad no es una función aparte, sino un requisito del prompt desde el principio: etiquetas, errores claros, teclado, contraste. Rehacerlo después sale más caro.',
        },
        {
          title: 'Descripción de la imagen',
          situation: 'En la página principal hay una foto: un barista vierte latte art con forma de corazón. La IA puso alt="image1.jpg". ¿Qué es mejor?',
          options: [
            'alt="Barista dibuja un corazón en el latte" — describir brevemente lo que hay en la foto',
            'Dejar alt="image1.jpg" — lo importante es que el atributo esté',
            'alt="imagen imagen foto café cafetería mejor café" — para los buscadores',
          ],
          explain: 'El alt lo leen los lectores de pantalla y se muestra si la foto no carga. Se necesita una descripción breve del significado. Para las imágenes puramente decorativas se pone alt="" vacío: así el lector las omite.',
        },
      ],
    },
    'u6-6': {
      title: 'Cierre: interfaz',
      ex: [
        {
          title: 'De la idea al pantalla lista',
          prompt: 'Arma el orden de trabajo para una nueva pantalla con IA.',
          steps: [
            'Describe qué es lo principal en la pantalla y para quién',
            'Muestra un boceto o referencia',
            'Pide que la arme con componentes y tokens del proyecto',
            'Revisa el estado vacío y los errores',
            'Revisa el teléfono y la accesibilidad',
          ],
          extra: [
            'Pide “que quede bonito”',
          ],
          explain: 'Jerarquía y objetivo → ejemplo visual → sistema de diseño → todos los estados → responsive y accesibilidad. Así la pantalla queda bonita y cómoda.',
        },
        {
          title: 'Botón de eliminar',
          prompt: 'En una app de notas se necesita un botón de eliminar. ¿Qué prompt protege contra toques accidentales?',
          sides: [
            {
              prompt: 'Agrega un botón para eliminar la nota.',
              result: {
                label: 'Elimina de inmediato',
                ui: {
                  blocks: {
                    1: {
                      text: 'Nota eliminada para siempre',
                    },
                  },
                },
              },
            },
            {
              prompt: 'Agrega un botón para eliminar la nota: rojo, con la etiqueta “Eliminar”. Después de tocar, muestra “Nota eliminada” y un botón “Deshacer” durante 5 segundos.',
              result: {
                label: 'Se puede deshacer',
                ui: {
                  blocks: [
                    {
                      text: 'Eliminar',
                    },
                    {
                      text: 'Nota eliminada · Deshacer',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'Describe el comportamiento después de tocar, con opción de deshacer el error',
            'El color rojo por sí solo protege de errores',
            'La etiqueta “Eliminar” es más larga que un ícono',
            'La IA entiende mejor los prompts con números',
          ],
          explain: 'Una buena interfaz perdona errores: deshacer o confirmar para acciones peligrosas. La IA no lo piensa por sí sola: hay que describir el comportamiento.',
        },
        {
          title: 'Feedback con captura de pantalla',
          prompt: 'Revisaste la pantalla en el teléfono y encontraste problemas. ¿Cómo se lo dices a la IA?',
          chat: [
            {
              text: 'Aquí está la pantalla de perfil.',
            },
            {
              text: '¡Se ve genial! ¿Cambiamos algo?',
            },
          ],
          options: [
            'Adjunto una captura desde el teléfono: 1) el nombre se corta a la derecha, 2) el botón “Salir” está pegado al borde y el dedo falla, 3) el texto gris se ve mal. Corrige estos tres puntos, no toques lo demás.',
            'Todo está mal, rehazlo.',
            'Hazlo al estilo Apple.',
            'Reescribe la pantalla desde cero con otro framework.',
          ],
          explain: 'Captura + lista numerada + límite (“no toques lo demás”) es el mejor formato para pedir cambios. La IA corrige puntualmente y no rompe lo que ya funciona.',
        },
        {
          title: 'Se perdió el foco',
          prompt: 'Después de los “retoques” de la IA, con el teclado ya no se entiende dónde está el foco. Encuentra la línea.',
          explain: 'outline: none quita el indicador de foco de todos los elementos. Si no te gusta el contorno, reemplázalo por el tuyo (por ejemplo, focus-visible:ring en Tailwind), pero no lo elimines.',
        },
        {
          title: 'Punto débil',
          situation: 'En el teléfono, los botones “Sí” y “No” están pegados, con 24px de alto. La gente falla seguido.',
          options: [
            'Aumentar los botones a 44–48px de alto y agregar espacio entre ellos',
            'Hacer la fuente más gruesa',
            'Intercambiar los colores de los botones',
          ],
          explain: 'El dedo no es un cursor de mouse. Apple recomienda para zonas táctiles mínimo 44×44 pt, Google (Material) 48×48 dp. Botones pequeños y pegados son un error frecuente del maquetado con IA.',
        },
        {
          title: 'Tema sin tokens',
          prompt: 'Pides agregar un tema oscuro en un proyecto donde todos los colores están escritos directamente en los componentes. ¿Qué es lo más probable que pase?',
          tool: 'Editor con IA',
          input: 'Agrega un tema oscuro.',
          outcomes: [
            {
              label: 'Cien cambios puntuales y lugares olvidados',
              text: 'Modifiqué 46 archivos. En algunos lugares el texto blanco pudo quedar sobre fondo blanco: revisa las páginas de pago y de perfil.',
            },
            {
              label: 'Un solo cambio en el tema',
              text: 'Agregué valores oscuros para los tokens --color-bg y --color-text. ¡Listo!',
            },
            {
              label: 'Rechazo: los temas oscuros son imposibles',
              text: 'En React no se puede hacer un tema oscuro.',
            },
          ],
          explain: 'Con tokens, el tema oscuro es un segundo conjunto de valores para los mismos nombres. Sin ellos, la IA corrige cada color a mano y siempre se le escapa algo.',
        },
      ],
    },
  },
}
