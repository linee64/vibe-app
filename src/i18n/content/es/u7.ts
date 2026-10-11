import type { UnitTr } from '../types'

export const u7: UnitTr = {
  title: 'App móvil con IA',
  subtitle: 'Tu propia app en el teléfono',
  description: 'Expo y React Native: pantallas, navegación, pruebas en el teléfono y publicación en las tiendas',
  lessons: {
    'u7-1': {
      title: '¿Sitio web o aplicación?',
      ex: [
        {
          title: 'Qué es React Native',
          situation: 'Un amigo dice: “Para hacer una aplicación para iPhone y Android, tendrás que aprender Swift y Kotlin”. La IA propone React Native con Expo. ¿Qué es?',
          options: [
            'Una forma de escribir una sola aplicación en JavaScript/TypeScript y React que funciona tanto en iOS como en Android',
            'Un constructor que convierte cualquier sitio web en aplicación con un solo botón',
            'Un emulador de teléfono para la computadora',
          ],
          explain: 'React Native dibuja elementos de interfaz nativos reales, y el código se escribe en el conocido React. Expo es un conjunto de herramientas a su alrededor: crear el proyecto, ejecutarlo en el teléfono, compilar y publicar. La IA conoce bien este stack.',
        },
        {
          title: 'Primer arranque',
          prompt: 'Ejecuta tu primera aplicación en el teléfono. Arma los pasos.',
          steps: {
            3: 'Escanea el código QR en Expo Go',
          },
          extra: [
            'Compra una cuenta de desarrollador de Apple',
          ],
          explain: 'create-expo-app crea el proyecto, expo start inicia el servidor de desarrollo y muestra el código QR. La aplicación Expo Go en el teléfono abre el proyecto con el código. Una cuenta de pago no es necesaria para esto: solo se necesita para publicar.',
        },
        {
          title: 'Prompt para empezar',
          prompt: 'Le pides al editor con IA que empiece una aplicación móvil para un rastreador de hábitos. ¿Qué prompt es mejor?',
          sides: [
            {
              prompt: 'Haz una aplicación móvil para hábitos.',
              result: {
                label: 'No queda claro en qué ni qué lleva dentro',
                text: 'Aquí tienes una página HTML con divs y CSS. Ábrela en el navegador del teléfono.',
                code: [
                  '<div class="habit">Beber agua</div>',
                ],
              },
            },
            {
              prompt: 'Proyecto en Expo (React Native, TypeScript, expo-router). Pantallas: lista de hábitos con marca de “hecho hoy” y pantalla para agregar. Guarda los datos en el teléfono. Empieza por la lista.',
              result: {
                label: 'Pantalla de Expo y plan',
                text: 'Creé app/index.tsx con la lista en FlatList. Como siguiente paso agregaré la pantalla app/add.tsx.',
              },
            },
          ],
          reasons: [
            'Nombra el stack, las pantallas y el almacenamiento de datos, y pide empezar con un solo paso',
            'La palabra TypeScript hace que cualquier aplicación sea móvil',
            'La IA entiende peor los prompts cortos por los errores de escritura',
            'Tiene el nombre de la carpeta app',
          ],
          explain: '“Aplicación móvil” se puede entender de cualquier forma, hasta como una página web. El stack (Expo + React Native), la lista de pantallas y dónde guardar los datos marcan los límites, y “empieza por la lista” evita que la IA escriba todo de una vez.',
        },
        {
          title: 'Mitos sobre las aplicaciones',
          prompt: 'La IA habla sobre Expo. Encuentra la mentira.',
          file: 'Respuesta de la IA',
          code: [
            'Expo Go permite abrir el proyecto en el teléfono sin compilar en Xcode o Android Studio.',
            'El mismo código se ejecuta en iOS y Android.',
            'Para probar la aplicación en tu teléfono, primero hay que publicarla en el App Store.',
            'Para publicar en las tiendas hará falta una compilación, por ejemplo con EAS Build.',
          ],
          explain: 'Se puede probar de inmediato: con Expo Go o un development build. La publicación solo es necesaria para que otras personas descarguen la aplicación.',
        },
        {
          title: 'Cuándo basta un sitio web',
          situation: 'Necesitas una página con el menú de la cafetería y un botón de “Llamar”. Se actualiza una vez al mes, sin notificaciones ni modo offline.',
          options: [
            'Basta un sitio web responsive: no hay que instalarlo ni pasar revisión en las tiendas',
            'Se necesita una aplicación nativa: los sitios web no se abren en el teléfono',
            'Se necesitan dos aplicaciones: una para iOS y otra para Android',
          ],
          explain: 'Una aplicación se justifica cuando necesitas funciones del teléfono (cámara, notificaciones, offline) o un uso frecuente. Para “ver el menú”, un sitio web es más simple: el enlace se abre de inmediato, sin instalación.',
        },
      ],
    },
    'u7-2': {
      title: 'Pantallas en React Native',
      ex: [
        {
          title: 'Pantalla blanca con error',
          prompt: 'La app se cae con el error “Text strings must be rendered within a <Text> component”. ¿Qué línea tiene la culpa?',
          code: {
            3: '      <Text style={styles.title}>Mis hábitos</Text>',
            4: '      Hoy: 3 de 5',
          },
          explain: 'En React Native el texto solo se puede mostrar dentro de <Text>. La línea “Hoy: 3 de 5” está directamente dentro de <View> — de ahí viene el error. En la web sí se puede, por eso la IA a veces se confunde.',
        },
        {
          title: 'div en la app',
          prompt: 'La IA escribió por costumbre marcado web en una pantalla de Expo. ¿Qué pasará al ejecutarla en el teléfono?',
          input: 'Ejecuto la pantalla en un iPhone.',
          code: {
            1: '  return <div className="card">Hábito</div>',
          },
          outcomes: [
            {
              label: 'Error: div no existe aquí',
            },
            {
              label: 'Todo se renderiza como en un sitio web',
            },
            {
              label: 'Expo reemplaza div por View automáticamente',
            },
          ],
          explain: 'En React Native no hay HTML: en vez de div va View, en vez de p y span va Text, en vez de img va Image, y los estilos se definen con style, no con className. Dile a la IA en el prompt que esto es React Native y no se confundirá.',
        },
        {
          title: 'Lista larga',
          prompt: 'La lista tiene 500 hábitos y va lenta. Le pediste a la IA que la acelere. Revisa los cambios.',
          request: 'La lista de hábitos va lenta. Haz que el scroll sea fluido.',
          hunks: {
            1: {
              harmful: 'La IA “aceleró” la lista simplemente recortándola a 20 elementos. Los demás hábitos desaparecerán para el usuario.',
            },
          },
          explain: 'FlatList solo dibuja las filas visibles, por eso las listas largas se desplazan con fluidez. Recortar los datos no es optimizar, es perder datos.',
        },
        {
          title: 'Pantalla para agregar',
          prompt: 'Pídele a la IA que haga la pantalla para agregar un hábito.',
          base: 'Haz la pantalla para agregar un hábito.',
          chips: [
            {
              tag: 'Stack',
              text: 'Esto es Expo / React Native: componentes View, Text, TextInput, Pressable.',
            },
            {
              tag: 'Campos',
              text: 'Campo de nombre y selección de días de la semana.',
            },
            {
              tag: 'Comportamiento',
              text: 'El botón “Guardar” está inactivo mientras el nombre esté vacío; después de guardar, volver a la lista.',
            },
            {
              tag: 'Teléfono',
              text: 'El teclado no debe tapar el botón.',
            },
            {
              tag: 'Stack',
              text: 'Maqueta en HTML y CSS, luego lo migramos de alguna forma.',
              trap: 'En React Native no hay HTML ni archivos CSS: la “migración” se convertirá en reescribir todo.',
            },
            {
              tag: 'Alcance',
              text: 'De paso haz el inicio de sesión, el perfil y la suscripción de pago.',
              trap: 'Todo de una vez significa mucho código difícil de revisar. Una pantalla a la vez.',
            },
          ],
          explain: 'Stack → campos → comportamiento → particularidades del teléfono. Y una pantalla a la vez: así es fácil revisar el resultado en Expo Go.',
        },
        {
          title: 'Estilos a lo nativo',
          prompt: 'La IA conectó un archivo CSS a la pantalla de Expo. ¿Tu jugada?',
          chat: [
            {
              text: 'Haz una tarjeta de hábito con sombra y esquinas redondeadas.',
            },
            {
              text: '¡Listo! Creé HabitCard.css y lo conecté con import.',
            },
          ],
          options: [
            'Esto es React Native: estilos con StyleSheet.create y la prop style, sin archivos CSS (si el proyecto no tiene NativeWind). Reescribe la tarjeta así: borderRadius 16, sombra y márgenes.',
            'Ok, probablemente funcione.',
            'Entonces agrega también SCSS para mayor seguridad.',
            'Elimina los estilos por completo.',
          ],
          explain: 'En React Native los estilos son objetos de JavaScript (StyleSheet.create, style={…}). Las clases tipo Tailwind solo son posibles con bibliotecas aparte como NativeWind. Si la IA confunde web con móvil, recuérdale el stack.',
        },
      ],
    },
    'u7-3': {
      title: 'Navegación',
      ex: [
        {
          title: 'Cada archivo es una pantalla',
          situation: 'En un proyecto con expo-router hay los archivos app/index.tsx y app/settings.tsx. ¿Cómo abrir la pantalla de ajustes?',
          options: [
            'Ir a la ruta /settings: en expo-router cada archivo en la carpeta app es una pantalla',
            'Registrar la pantalla en el archivo AndroidManifest.xml',
            'De ninguna forma: en la app solo puede haber una pantalla',
          ],
          explain: 'Expo Router usa navegación por archivos, como en los frameworks web: app/settings.tsx → ruta /settings. Puedes ir con <Link href="/settings"> o router.push("/settings").',
        },
        {
          title: 'Pestañas inferiores',
          prompt: 'Haz una barra inferior con las pestañas “Hábitos” y “Estadísticas” en expo-router. Arma los pasos.',
          steps: [
            'Crea la carpeta app/(tabs)',
            'Agrega dentro un _layout.tsx con el componente Tabs',
            'Mueve las pantallas: (tabs)/index.tsx y (tabs)/stats.tsx',
            'Asigna nombres e íconos a las pestañas',
            'Prueba la navegación en el teléfono',
          ],
          extra: [
            'Dibuja las pestañas como una imagen encima de la pantalla',
          ],
          explain: 'La carpeta entre paréntesis es un grupo de rutas: no aparece en la dirección, pero define un _layout común. En él, el componente Tabs dibuja la barra inferior para todas las pantallas del grupo.',
        },
        {
          title: 'Pantalla con parámetro',
          prompt: 'Existe el archivo app/habit/[id].tsx. El usuario tocó el hábito con id 42. ¿Qué recibirá la pantalla?',
          code: {
            1: 'return <Text>Hábito {id}</Text>',
          },
          outcomes: [
            {
              label: 'Pantalla del hábito 42',
              ui: {
                blocks: [
                  {
                    text: 'Hábito 42',
                  },
                ],
              },
            },
            {
              label: 'Error “pantalla no encontrada”',
            },
            {
              label: 'id vacío',
              ui: {
                blocks: [
                  {
                    text: 'Hábito',
                  },
                ],
              },
            },
          ],
          explain: 'Los corchetes en el nombre del archivo son un segmento dinámico. El valor de la dirección llega a useLocalSearchParams. Así una sola pantalla muestra cualquier hábito.',
        },
        {
          title: 'Botón “Atrás”',
          prompt: 'Después de guardar un hábito, la app abre la lista de nuevo — y “Atrás” te lleva otra vez al formulario. ¿Qué le dices a la IA?',
          chat: [
            {
              text: 'Después de guardar presiono “Atrás” y vuelvo a ver el formulario con el campo lleno.',
            },
            {
              text: 'Ahora después de guardar hago router.push("/"). Puedo agregar una animación de transición más bonita.',
            },
          ],
          options: [
            'No hace falta animación. Después de guardar cierra la pantalla del formulario con router.back(), para que la lista no se abra por segunda vez y el formulario no quede en el historial.',
            'Agrega la animación, quizá ayude.',
            'Desactiva el botón “Atrás” en toda la app.',
            'Que el usuario cierre la app por su cuenta.',
          ],
          explain: 'push agrega una nueva pantalla a la pila, por eso el formulario queda debajo. router.back() vuelve a la pantalla anterior —la lista— y el formulario se cierra. Descríbele a la IA el comportamiento esperado de “Atrás”, no solo la apariencia.',
        },
        {
          title: 'Enlace a ninguna parte',
          prompt: 'Pantallas: app/index.tsx, app/stats.tsx y app/habit/[id].tsx. ¿Qué enlace lleva a una pantalla que no existe?',
          code: [
            '<Link href="/stats">Mi estadística</Link>',
            '<Link href="/habit/7">Correr por las mañanas</Link>',
            '<Link href="/settings">Ajustes</Link>',
            '<Link href="/">Inicio</Link>',
          ],
          explain: 'No existe el archivo app/settings.tsx, por eso /settings lleva a la pantalla “no encontrado”. La IA puede referirse a una pantalla que “pensaba” hacer — revisa los enlaces contra la lista de archivos.',
        },
      ],
    },
    'u7-4': {
      title: 'El teléfono en la mano',
      ex: [
        {
          title: 'Debajo del “notch”',
          prompt: 'El título está en la parte más alta de la pantalla sin márgenes. ¿Qué verá el dueño de un iPhone con el recorte de la cámara?',
          input: 'Abro la pantalla con la lista.',
          code: {
            1: '  <Text style={styles.title}>Mis hábitos</Text>',
          },
          outcomes: [
            {
              label: 'El título queda oculto bajo el recorte',
              ui: {
                blocks: [
                  {
                    text: '▬▬ Mis há▬▬▬tos',
                  },
                  {
                    items: [
                      'Tomar agua',
                      'Leer 10 minutos',
                    ],
                  },
                ],
              },
            },
            {
              label: 'Todo bien, iOS mismo mueve el texto',
              ui: {
                blocks: [
                  {
                    text: 'Mis hábitos',
                  },
                  {
                    items: [
                      'Tomar agua',
                      'Leer 10 minutos',
                    ],
                  },
                ],
              },
            },
            {
              label: 'La app no se abrirá',
            },
          ],
          explain: 'La zona segura (safe area) es la parte de la pantalla sin recorte, esquinas redondeadas ni la barra de “inicio”. En Expo se usa react-native-safe-area-context: SafeAreaView o los márgenes de useSafeAreaInsets.',
        },
        {
          title: 'El teclado tapó el botón',
          prompt: 'El tester escribe: “No puedo tocar ‘Guardar’ — el teclado lo tapa”. ¿Tu jugada?',
          chat: [
            {
              text: 'En el teléfono el teclado tapa el botón “Guardar” en la pantalla de agregar.',
            },
            {
              text: 'Se puede hacer el botón más pequeño para que quepa.',
            },
          ],
          options: [
            'El tamaño no ayuda. Envuelve el formulario en KeyboardAvoidingView (o hazlo desplazable) para que con el teclado abierto el botón suba por encima. Lo probaré en iPhone y en Android.',
            'Sí, haz el botón pequeño.',
            'Que el usuario cierre el teclado primero.',
            'Mueve el botón a la parte más alta de la pantalla, arriba del título.',
          ],
          explain: 'El teclado en pantalla ocupa casi la mitad de la pantalla — en el navegador de la computadora no se ve. KeyboardAvoidingView o un formulario desplazable resuelven el problema. El comportamiento en iOS y Android es distinto, así que prueba ambos.',
        },
        {
          title: 'Dónde guardar el token',
          prompt: 'La IA escribió el inicio de sesión de la app. ¿Qué línea guarda el secreto de forma insegura?',
          explain: 'AsyncStorage no está cifrado — es para datos normales (tema, lista de hábitos). Los tokens de inicio de sesión y otros secretos se guardan en expo-secure-store: usa el almacenamiento seguro del sistema (Keychain en iOS, Keystore en Android).',
        },
        {
          title: 'Permiso para la cámara',
          situation: 'Estás agregando una foto a los hábitos. La IA propone pedir acceso a la cámara apenas se abre la app por primera vez.',
          options: [
            'Mejor preguntar en el momento en que la persona toca “Agregar foto” y explicar para qué — así aceptan más seguido',
            'Pedir todos los permisos de una vez al abrir — es más fácil',
            'No preguntar nada — la app obtendrá acceso automáticamente',
          ],
          explain: 'Los permisos se piden en contexto, cuando se entiende el beneficio. Sin pedir acceso no habrá. En iOS además hace falta una explicación de texto (usage description) en la configuración — sin ella la app se cae al pedir el permiso y no pasa la revisión.',
        },
        {
          title: 'Checklist de prueba',
          prompt: 'Antes de darle la app a tus amigos, pruébala en el teléfono. Ordena los pasos.',
          steps: [
            'Abre el proyecto en Expo Go en tu teléfono',
            'Recorre el flujo principal: agrega y marca un hábito',
            'Cierra la app y ábrela de nuevo — ¿los datos siguen ahí?',
            'Activa el modo avión y prueba sin internet',
            'Pídele a un amigo con otro teléfono que la pruebe',
          ],
          extra: [
            'Probar solo en el navegador de la computadora',
          ],
          explain: 'La computadora no muestra el teclado, el recorte, el internet lento ni el “otro” teléfono. El flujo principal, reiniciar, el modo sin conexión y otro dispositivo atrapan la mayoría de los bugs móviles.',
        },
      ],
    },
    'u7-5': {
      title: 'Publicación',
      ex: [
        {
          title: 'Cuánto cuesta la tienda',
          situation: 'Quieres publicar tu app tanto en App Store como en Google Play. ¿Qué tendrás que pagar?',
          options: [
            'Apple Developer Program — $99 al año, Google Play — pago único de $25',
            'Nada: publicar en ambas tiendas es gratis',
            'Unos $1000 por cada versión de la app',
          ],
          explain: 'La cuenta de desarrollador de Apple cuesta $99 al año, Google Play — $25 una sola vez. Además, las tiendas cobran comisión por las ventas y suscripciones dentro de la app.',
        },
        {
          title: 'El camino a App Store',
          prompt: 'Arma el camino de una app hecha con Expo hasta App Store.',
          steps: [
            'Crea una cuenta Apple Developer',
            'Compila la app: eas build --platform ios',
            'Envía la compilación: eas submit',
            'Pruébala con testers usando TestFlight',
            'Completa la página de la app y envíala a revisión',
          ],
          extra: [
            'Envía un .zip con el código al soporte de Apple',
          ],
          explain: 'EAS Build compila la app en la nube (no necesitas una Mac), EAS Submit sube la compilación a App Store Connect. TestFlight reparte la beta a los testers y, tras la revisión de Apple, la app sale a la tienda.',
        },
        {
          title: 'Reglas de Google Play',
          prompt: 'La IA explica cómo publicar en Google Play para una cuenta personal nueva. Encuentra el error.',
          file: 'Respuesta de la IA',
          code: [
            'Primero sube la compilación a una prueba cerrada.',
            'Las cuentas personales nuevas necesitan mínimo 12 testers que participen en la prueba 14 días seguidos.',
            'Después de eso puedes solicitar acceso a producción.',
            'No hace falta buscar testers: basta con pulsar “Publicar” el primer día.',
          ],
          explain: 'Para las cuentas personales creadas después de noviembre de 2023, Google exige una prueba cerrada: mínimo 12 testers participando 14 días seguidos. Solo después puedes pedir el lanzamiento a producción.',
        },
        {
          title: 'Corregir una errata',
          prompt: 'La app ya está en las tiendas y encontraste una errata en el texto de un botón. En el proyecto está configurado EAS Update. ¿Qué pasará después de eas update?',
          input: 'eas update --branch production --message "Corregí la errata"',
          outcomes: [
            {
              label: 'La corrección llegará sin nueva compilación ni revisión',
              text: 'Los usuarios recibirán el JavaScript actualizado en los siguientes arranques de la app.',
            },
            {
              label: 'Hay que pasar otra vez por la revisión de Apple',
              text: 'La actualización estará en la tienda 1–3 días después de la revisión.',
            },
            {
              label: 'Nada: la app publicada no cambia',
              text: 'Cambia el texto en la próxima versión dentro de un año.',
            },
          ],
          explain: 'EAS Update entrega actualizaciones de JavaScript e imágenes “por aire”. Pero si cambia la parte nativa (una nueva librería con código nativo, permisos), hace falta una nueva compilación y revisión.',
        },
        {
          title: 'Página en la tienda',
          prompt: 'Pídele a la IA que te ayude con la descripción de la app para la tienda.',
          base: 'Escribe una descripción de la app.',
          chips: [
            {
              tag: 'Esencia',
              text: 'La app “Hábitos” ayuda a marcar las cosas buenas cada día.',
            },
            {
              tag: 'Audiencia',
              text: 'Para personas ocupadas que quieren empezar con poco.',
            },
            {
              tag: 'Formato',
              text: 'Primera línea — el beneficio en una frase, luego 3 funciones principales en lista.',
            },
            {
              tag: 'Honestidad',
              text: 'Indica que los datos se guardan solo en el teléfono.',
            },
            {
              tag: 'Promoción',
              text: 'Agrega que es la app n.º 1 del mundo y que Apple la elogia.',
              trap: 'Las afirmaciones falsas violan las reglas de las tiendas y pueden causar el rechazo en la revisión.',
            },
            {
              text: 'Repite la palabra “hábitos” 40 veces para el buscador.',
              trap: 'El spam de palabras clave viola las reglas de las tiendas y ahuyenta a la gente.',
            },
          ],
          explain: 'Qué hace → para quién → formato → detalles honestos. Las tiendas revisan las descripciones: las promesas engañosas y el spam de palabras son una causa frecuente de rechazo.',
        },
      ],
    },
    'u7-6': {
      title: 'Cierre: la app',
      ex: [
        {
          title: 'De la idea a la tienda',
          prompt: 'Arma todo el camino de una app móvil.',
          steps: [
            'Describe el stack de IA y las pantallas',
            'Arma la pantalla principal y pruébala en Expo Go',
            'Agrega navegación y almacenamiento de datos',
            'Pruébala en distintos teléfonos',
            'Compílala con EAS y envíala a las tiendas',
          ],
          extra: [
            'Publícala de inmediato, ya la probarás después',
          ],
          explain: 'Pasos pequeños con prueba en el teléfono después de cada uno, igual que con un sitio web. Solo que las pruebas y la publicación toman más tiempo.',
        },
        {
          title: 'Agregamos la cámara',
          prompt: 'La IA agregó fotos a los hábitos. Revisa los cambios.',
          request: 'Agrega la opción de adjuntar una foto a un hábito desde la cámara.',
          hunks: {
            0: {
              lines: [
                '+"plugins": [["expo-image-picker", { "cameraPermission": "Se necesita la cámara para adjuntar una foto al hábito." }]]',
              ],
            },
            2: {
              harmful: 'La IA también pidió ubicación y contactos al iniciar, y para las fotos eso no hace falta. Los permisos de más asustan a la gente y generan preguntas en la revisión.',
            },
          },
          explain: 'Un plugin con una explicación clara y la llamada a la cámara desde un botón es lo que se necesita. Los permisos de más “por si acaso” no: pide solo lo que usas.',
        },
        {
          title: 'En Expo Go no funciona',
          prompt: 'Agregaste una librería con código nativo que no está en Expo Go y la app se cayó. La IA se pierde. ¿Tu jugada?',
          chat: [
            {
              text: 'Después de instalar la librería para Bluetooth, la app se cae al iniciar en Expo Go.',
            },
            {
              text: 'Intenta reinstalar Expo Go.',
            },
          ],
          options: [
            'Expo Go solo incluye un conjunto integrado de módulos nativos. Para una librería nativa externa se necesita un development build: ayúdame a compilarlo con EAS y a ejecutarlo en el teléfono.',
            'Reinstalaré Expo Go un par de veces más.',
            'Borraré node_modules y dejaré de usar el teléfono.',
            'Reescribiré la app en Swift.',
          ],
          explain: 'Expo Go trae integrado un conjunto específico de librerías. Si necesitas tu propio código nativo, se compila un development build: tu propia “versión de Expo Go” con los módulos que necesitas.',
        },
        {
          title: 'La clave en la app',
          prompt: '¿Qué línea revela el secreto a todos los que descarguen la app?',
          explain: 'Las variables con el prefijo EXPO_PUBLIC_ terminan en el código de la app: se pueden sacar del archivo instalado. Las direcciones públicas y la anon key de Supabase (con RLS activado) sí se pueden, la clave secreta de IA no: las solicitudes a la IA pasan por tu servidor.',
        },
        {
          title: 'Rechazo en la revisión',
          situation: 'Apple rechazó la app: “La app solicita acceso a la cámara, pero no explica para qué”.',
          options: [
            'Agregar una explicación clara para la solicitud de cámara en la configuración (usage description), recompilar y enviar de nuevo',
            'Eliminar la app de App Store Connect para siempre',
            'Enviar la misma compilación otra vez, a ver si pasa',
          ],
          explain: 'La revisión no es una sentencia: en el rechazo normalmente se indica el motivo. Corrígelo, si hace falta responde en el Resolution Center y envía una nueva compilación.',
        },
        {
          title: 'Mensaje de error',
          prompt: 'Los hábitos no cargaron: no hay internet. ¿Qué prompt dio una pantalla más humana?',
          sides: [
            {
              prompt: 'Si hay un error, muestra el error.',
              result: {
                label: 'Texto técnico',
              },
            },
            {
              prompt: 'Si no hay red, muestra “Sin internet. Los hábitos están guardados en el teléfono” y un botón “Reintentar”. Los detalles técnicos solo en los logs.',
              result: {
                label: 'Claro y con qué hacer',
                ui: {
                  blocks: [
                    {
                      text: 'Sin internet',
                    },
                    {
                      text: 'Los hábitos están guardados en el teléfono',
                    },
                    {
                      text: 'Reintentar',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'Le dice a la persona qué pasó y qué hacer, y esconde los detalles en los logs',
            'La palabra “internet” es más corta que la palabra “error”',
            'La IA solo agrega botones cuando pides “reintentar”',
            'Los mensajes técnicos están prohibidos por las reglas de las tiendas',
          ],
          explain: 'En el teléfono la red se cae todo el tiempo. Un buen mensaje de error dice qué pasó, qué pasó con los datos y qué hacer después.',
        },
      ],
    },
  },
}
