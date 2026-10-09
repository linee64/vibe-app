import type { UnitTr } from '../types'

export const u3: UnitTr = {
  title: 'Depuración con IA',
  subtitle: 'Arreglamos bugs junto con la IA',
  description: 'Leemos errores, le damos contexto a la IA y revertimos lo que salió mal',
  lessons: {
    'u3-1': {
      title: 'Leemos el error',
      ex: [
        {
          title: '¿Qué dice el error?',
          situation: 'En la consola: «TypeError: Cannot read properties of undefined (reading \'map\')». ¿Qué significa?',
          options: [
            'El código llamó a .map en una variable que todavía es undefined; por ejemplo, los datos aún no cargan',
            'El navegador se quedó sin memoria',
            'Hackearon el sitio',
          ],
          explain: 'El error lo dice directo: «no puedo leer map de undefined». O sea, el arreglo todavía no existe; muchas veces son datos que se están cargando del servidor.',
        },
        {
          title: '¿Dónde mirar?',
          prompt: 'Aquí está el error completo de la consola. ¿Qué línea te indica dónde buscar el problema en TU código?',
          explain: 'El formato es «archivo:línea:columna»: Products.jsx, línea 4, carácter 16; ahí miras primero. Las líneas de react-dom son el interior de la biblioteca: solo muestran cómo React llegó hasta tu código.',
        },
        {
          title: 'La raíz del problema',
          prompt: 'El error apunta a la línea con items.map, pero la causa está más arriba. ¿En qué línea está la raíz del problema?',
          explain: 'useState() sin valor inicial da undefined, y mientras los datos cargan, items.map falla. La solución es useState([]): una lista vacía mientras esperamos los datos.',
        },
        {
          title: 'Pantalla en blanco',
          prompt: 'La página está en blanco, no se ve nada. Ordena los pasos.',
          steps: ['Abre la consola: F12 → Console', 'Encuentra el primer error en rojo', 'Mira el archivo y la línea que indica', 'Envíale a la IA el error y ese código'],
          extra: ['Presiona Ctrl+U y lee el HTML'],
          explain: 'Una pantalla en blanco casi siempre significa un error de JavaScript, y su texto está en la consola del navegador. El HTML fuente (Ctrl+U) no ayuda aquí: la página la construyen los scripts.',
        },
        {
          title: 'Un paréntesis',
          prompt: 'Al código de la IA le falta un paréntesis. ¿Qué mostrará la consola al ejecutarlo?',
          tool: 'Consola del navegador',
          input: 'Ejecuto la página con este código.',
          code: { 1: "  console.log('Hola'" },
          outcomes: [
            { label: 'SyntaxError: el código rompe las reglas del lenguaje' },
            { label: 'TypeError: la variable es undefined' },
            { label: '404: archivo no encontrado' },
          ],
          explain: 'SyntaxError significa que el código rompe las reglas del lenguaje, y el navegador ni siquiera puede ejecutarlo. Muchas veces el culpable es un solo paréntesis, coma o comilla que falta.',
        },
      ],
    },
    'u3-2': {
      title: 'Error + contexto en el chat',
      ex: [
        {
          title: 'Qué enviarle a la IA',
          prompt: 'El error apunta a TaskList.jsx. ¿Qué petición a un chat normal con IA funcionó mejor?',
          sides: [
            { prompt: 'Aquí está el error, y aquí están los 47 archivos de mi proyecto, uno tras otro. Encuentra qué está mal.', result: { label: 'Consejos generales', text: 'Puede haber varios problemas. Revisa las dependencias, limpia la caché, actualiza las bibliotecas e intenta reiniciar el servidor…' } },
            {
              prompt: 'Aquí está el error con el stack trace y el componente TaskList.jsx al que apunta (línea 8). Explica la causa.',
              result: { label: 'La causa exacta y el arreglo', text: 'En la línea 8, tasks es un objeto, no un arreglo: setTasks(data) guarda ahí toda la respuesta del servidor. Necesitas setTasks(data.items).' },
            },
          ],
          reasons: [
            'Da el texto completo del error y justo el código al que apunta',
            'Mientras menos sabe la IA, menos se equivoca',
            'La IA simplemente no puede leer cuarenta y siete archivos',
            'La palabra «stack trace» activa el modo depuración de la IA',
          ],
          explain: 'El texto completo del error con el stack trace muestra el archivo y la línea, y el fragmento de código correcto le da contexto a la IA sin ruido. Los agentes de IA en el editor pueden abrir los archivos del proyecto por sí mismos, pero una pista precisa también les ahorra tiempo.',
        },
        {
          title: 'Un prompt para depurar',
          prompt: 'La lista de productos no aparece. Dale pistas a la IA y pide un arreglo mínimo.',
          base: 'La lista de productos no aparece.',
          chips: [
            { tag: 'Pista', text: "Error de la consola: TypeError: Cannot read properties of undefined (reading 'map')." },
            { tag: 'Dónde', text: 'Apunta a Products.jsx, línea 4; el código del componente está abajo.' },
            { tag: 'Petición', text: 'Explica la causa y propón un arreglo mínimo.' },
            { tag: 'Alcance', text: 'Reescribe todo desde cero.', trap: 'Reescribir todo esconde la causa y rompe lo que funcionaba. Se necesita un arreglo mínimo.' },
            { tag: 'Énfasis', text: '¡¡¡URGENTE!!!', trap: 'La urgencia no le da información nueva a la IA.' },
            { tag: 'Contexto', text: 'Aquí está la clave secreta de la base, por si la necesitas: sb_secret_…', trap: 'Los secretos nunca se mandan al chat: para depurar no hace falta la clave, y una clave filtrada hay que cambiarla.' },
          ],
          explain: 'El error → dónde está → pedir que lo explique → arreglo mínimo. Así aprendes y no recibes cambios de más.',
        },
        {
          title: 'Qué ocultar',
          prompt: 'Vas a pegar este log en un chat con IA. ¿Qué línea hay que ocultar?',
          explain: 'Antes de enviar logs, reemplaza los secretos y datos personales con marcadores como ***. Deja el texto del error y las líneas del stack trace: se necesitan para depurar.',
        },
        {
          title: 'Manda el stack trace',
          situation: 'La IA te pide: «Por favor, mándame el stack trace completo». ¿Qué le envías?',
          options: [
            'Todo el error en rojo, junto con las líneas «at … (archivo:línea)» que tiene debajo',
            'Solo la primera palabra del error: TypeError',
            'Una captura de toda la página del sitio',
          ],
          explain: 'El stack trace es la lista de llamadas a funciones que llevaron al error, con archivos y números de línea. Es la «ruta» hasta el lugar del error, y se copia completa junto con el error.',
        },
        {
          title: 'La IA pide detalles',
          prompt: 'La IA hizo las preguntas correctas. Respóndele de modo que pueda arreglarlo al primer intento.',
          chat: [
            { text: '¿¿¿Por qué se me rompió todo???' },
            { text: '¡Te ayudo! ¿Qué hiciste, qué esperabas ver y qué ves ahora? ¿Hay algún error en la consola?' },
          ],
          options: [
            'Presiono «Guardar»: espero que la tarea aparezca en la lista, pero no pasa nada. En la consola: «TypeError: tasks.push is not a function». El código del componente está abajo.',
            'Nada más arréglalo, eres una IA.',
            'Se rompió todo, déjalo como estaba.',
            'No sé, revisa tú.',
          ],
          explain: 'Un buen reporte de bug: qué hiciste → qué esperabas → qué obtuviste → el texto del error → el código. Es justo lo que necesita la IA.',
        },
      ],
    },
    'u3-3': {
      title: 'La consola y los logs',
      ex: [
        {
          title: '¿Qué imprimirá console.log?',
          prompt: 'getUsers devuelve dos usuarios: Lucía y Mateo. ¿Qué aparece en la consola?',
          tool: 'Consola del navegador',
          input: 'Ejecuto el código de la IA.',
          outcomes: [
            {},
            { label: "['Lucía', 'Mateo']", lines: ["▸ (2) ['Lucía', 'Mateo']"] },
            {},
          ],
          explain: 'Una función flecha con llaves es el cuerpo de una función, y sin return no devuelve nada. Se necesita u => u.name. console.log es justo lo que ayuda a atrapar rápido estos errores silenciosos.',
        },
        {
          title: 'Siempre «Error»',
          prompt: 'La función que carga un usuario siempre falla con «Error». ¿Dónde está el bug?',
          code: { 2: "  if (!res.ok) throw new Error('Error');" },
          explain: 'fetch devuelve una Promise. Sin await, en res hay una promesa, que no tiene el campo ok. Se necesita: const res = await fetch(...).',
        },
        {
          title: '¿Salió la petición?',
          situation: 'El botón «Enviar» no guarda los datos. ¿Cómo verificas si la petición llegó al servidor?',
          options: [
            'Abrir F12 → Network y ver la petición y su estado (200, 404, 500…)',
            'Abrir la pestaña Elements y revisar si el botón está en la página',
            'Presionar el botón diez veces más',
          ],
          explain: 'En la pestaña Network se ve cada petición: la dirección, el estado y la respuesta del servidor. Un estado 4xx es un error en la petición; 5xx, en el servidor.',
        },
        {
          title: 'Logs en cada paso',
          prompt: 'No queda claro en qué paso falla el proceso de compra. Pídele a la IA que agregue logs.',
          base: 'El proceso de compra falla, no sé dónde.',
          chips: [
            { tag: 'Pasos', text: 'Agrega console.log en cada paso de la compra: carrito, dirección, pago, confirmación.' },
            { tag: 'Datos', text: "En cada log imprime la etiqueta del paso y los datos clave: console.log('paso: dirección', address)." },
            { tag: 'Limpieza', text: 'Cuando encontremos el bug, quita los logs temporales.' },
            { tag: 'Velocidad', text: 'Adivina dónde está el error y arréglalo de una vez.', trap: 'Adivinar es otra vez el ciclo de cambios. Los logs muestran hasta dónde llegó realmente el código.' },
            { tag: 'Limpieza', text: 'Quita todas las validaciones para que no estorben.', trap: 'Las validaciones protegen los datos. Quitarlas creará bugs nuevos.' },
            { tag: 'Datos', text: 'Registra también el número de tarjeta completo.', trap: 'Los datos de pago y personales no van en los logs: los logs los leen muchas personas y se guardan mucho tiempo.' },
          ],
          explain: 'Los logs en cada paso muestran hasta dónde llegó el código, y con ellos la IA encuentra la causa mucho más rápido. Las etiquetas ayudan a no confundir los logs, y después del arreglo se quitan los logs temporales.',
        },
        {
          title: 'No es el botón',
          prompt: 'En la pestaña Network viste que la petición falla en el servidor. Pero la IA se fue contra el botón…',
          chat: [
            { text: 'El botón «Enviar» no guarda la opinión.' },
            { text: 'Seguro el problema es el botón. Reescribí todo el componente Button.' },
          ],
          options: [
            'Alto, no es el botón: en Network, la petición POST /api/feedback devuelve 500 y la respuesta dice «column "email" does not exist». Revisemos la parte del servidor.',
            'Ok, gracias.',
            'Ya que estás, reescribe también el formulario.',
            '¿¿¿Por qué no funciona???',
          ],
          explain: 'El estado 500 es un error del servidor, y el texto de la respuesta da una pista de la causa. Con una pista así, la IA arregla el lugar correcto en vez de reescribir lo que funcionaba.',
        },
      ],
    },
    'u3-4': {
      title: 'Cómo no quedarse en un ciclo',
      ex: [
        {
          title: 'El ciclo de cambios',
          prompt: 'Ya van no sé cuántas veces que escribes «no funciona», y la IA propone casi lo mismo. Rompe el ciclo.',
          chat: [
            { text: 'Sigue sin funcionar.' },
            { text: '¡Perdón! Aquí está la versión corregida:' },
            { text: 'Sigue sin funcionar.' },
            { text: '¡Entendido! Probemos así:' },
          ],
          options: [
            'Alto. No cambies el código. Enumera 3 posibles causas del bug y qué logs ayudarían a comprobar cada una.',
            '¡¡¡Sigue sin funcionar!!!',
            'Inténtalo otra vez, debería salir.',
            'Acepta todos tus cambios y publícalo.',
          ],
          explain: 'Si los arreglos dan vueltas en círculo, cambia de enfoque: «no escribas código, primero explica por qué podría estar pasando esto». Hipótesis más una forma de comprobarlas: ese es el trabajo de un depurador de verdad.',
        },
        {
          title: 'Código obsoleto',
          prompt: 'La IA insiste en escribir código para una versión vieja del router, y falla. ¿Qué petición ayudó?',
          sides: [
            { prompt: 'Arregla el error: «does not provide an export named useHistory».', result: { label: 'Otra vez la API vieja' } },
            {
              prompt: 'En package.json está react-router 7. Aquí está el enlace a la documentación actual. Arregla el error: «does not provide an export named useHistory».',
              result: { label: 'La API actual' },
            },
          ],
          reasons: [
            'La versión exacta y la documentación actual eliminan las adivinanzas',
            'Con un enlace, la IA siempre responde más rápido',
            'React Router no se puede usar con IA sin documentación',
            'Es más largo',
          ],
          explain: 'Los modelos se entrenaron con datos hasta cierta fecha y pueden no conocer los cambios recientes de una API: useHistory se quedó en React Router 5, y en la versión 7 está useNavigate con importación desde react-router. La versión de package.json y un enlace a la documentación resuelven el problema.',
        },
        {
          title: 'Depurar sin ciclos',
          prompt: 'Arma el orden de trabajo con un bug terco.',
          steps: ['Anota los pasos con los que se repite el bug', 'Pídele a la IA hipótesis sin cambiar el código', 'Comprueba las hipótesis con logs', 'Corrige la causa con un cambio mínimo', 'Agrega una prueba para este bug'],
          extra: ['Escribe «no funciona» hasta tener suerte'],
          explain: 'Reproducir → hipótesis → comprobación → arreglo mínimo → prueba. Así arreglas la causa y no los síntomas, y el bug no regresará sin que lo notes.',
        },
        {
          title: 'Demasiadas cosas',
          situation: 'El bug solo aparece en una página grande de 20 componentes, y la IA se enreda en sus suposiciones.',
          options: [
            'Pedirle a la IA que arme un ejemplo mínimo: el código más pequeño donde el error todavía se repite',
            'Mandarle a la IA otros 20 componentes para tener el panorama completo',
            'Borrar la mitad de la página al azar',
          ],
          explain: 'Un ejemplo mínimo reproducible quita todo lo que sobra. Muchas veces la causa se ve sola, y la IA deja de adivinar.',
        },
        {
          title: '¿Lo arregló o lo escondió?',
          prompt: 'La IA reportó que el bug está arreglado y las pruebas están en verde. Revisa el diff.',
          request: 'Arregla el bug: el descuento se aplica dos veces.',
          hunks: [
            {},
            { lines: { 0: "+it('el descuento se aplica una vez', () => {" } },
            {
              lines: ["-it('el envío es gratis desde 5000', () => {", "+it.skip('el envío es gratis desde 5000', () => {"],
              harmful: 'La IA desactivó una prueba ajena que empezó a fallar. O sea, el cambio rompió algo, y a la prueba simplemente la silenciaron.',
            },
          ],
          explain: 'Una prueba fija el comportamiento correcto: una prueba nueva para el bug es excelente. Pero una prueba desactivada (skip) o borrada esconde el problema. Si la IA toca las pruebas, revisa por qué.',
        },
      ],
    },
    'u3-5': {
      title: 'Reversiones y checkpoints',
      ex: [
        {
          title: 'Revisa los cambios',
          prompt: 'El agente de IA terminó su cambio y mostró el diff. Acepta lo útil y rechaza lo peligroso.',
          request: 'Agrega un botón «Eliminar» a la tarea.',
          hunks: [
            { lines: { 1: '+  <button onClick={() => onRemove(task.id)}>Eliminar</button>' } },
            {},
            {
              lines: { 1: "+const key = 'sb_secret_9fK2…' // temporal, para que funcione sí o sí" },
              harmful: 'La IA escribió la clave secreta directo en el código. Terminará en git y en el navegador de cada visitante.',
            },
          ],
          explain: 'El diff muestra qué se agregó y qué se quitó: así se nota si la IA de paso hizo algo que no pediste, o algo peligroso. En git, lo mismo lo muestra git diff.',
        },
        {
          title: 'Un cambio seguro',
          prompt: 'Ordena los pasos para trabajar con la IA de forma segura.',
          steps: ['Haz commit de la versión que funciona', 'Pide el cambio', 'Revisa el resultado', 'Haz commit, o revierte'],
          extra: ['Borra el historial de git'],
          explain: 'El commit antes del cambio es tu seguro. Funciona: nuevo commit; se rompió: vuelves al anterior.',
        },
        {
          title: 'Checkpoints en el editor',
          situation: 'Cursor y Claude Code tienen checkpoints. Un amigo pregunta para qué sirven si ya existe git.',
          options: [
            'Para devolver rápido los archivos al estado anterior a una petición concreta a la IA',
            'Para guardar el proyecto en la nube, como en GitHub',
            'Para que la IA trabaje más rápido',
          ],
          explain: 'Los checkpoints son un «deshacer» rápido para los cambios del agente. Se guardan localmente, aparte de git, y no revierten tus cambios manuales ni los comandos de la terminal; por eso el historial confiable se sigue llevando con commits.',
        },
        {
          title: 'Se rompieron tres pantallas',
          prompt: 'Después de un cambio grande de la IA se rompieron varias pantallas a la vez. ¿Tu jugada?',
          chat: [
            { text: 'Después de tu cambio se rompieron el perfil, el carrito y la búsqueda. Los errores no se entienden.' },
            { text: '¡Arreglémoslas una por una! Empecemos con el perfil: intenta reemplazar la línea 14 por…' },
          ],
          options: [
            'Hagámoslo distinto: yo regreso al último commit que funcionaba, y tú haces este cambio en pasos más pequeños, una pantalla a la vez.',
            'Bueno, arréglalas una por una, tarde lo que tarde.',
            'Publiquemos así y luego lo arreglamos.',
            'Borra esas tres pantallas.',
          ],
          explain: 'Si un cambio rompió muchas cosas, sale más barato revertir y hacerlo con más cuidado que parchar las consecuencias encima.',
        },
        {
          title: 'Una gran reestructuración',
          prompt: 'Hay que pasar el inicio de sesión a una biblioteca nueva. ¿Qué enfoque es más confiable?',
          sides: [
            { prompt: 'Reescribe toda la autenticación con la biblioteca nueva.', result: { label: 'Todo de golpe, y el build falló', lines: { 2: '? último commit: hace 3 días' } } },
            {
              prompt: 'Ya hice commit de la versión que funciona. Pasa el inicio de sesión a la biblioteca nueva en 3 pasos, y después de cada uno detente para que yo lo revise.',
              result: { label: 'Paso a paso', text: 'Paso 1 de 3 listo: conecté la biblioteca y el formulario de inicio de sesión, no toqué nada más. Revisa el inicio de sesión y escribe «sigue».' },
            },
          ],
          reasons: [
            'El seguro del commit y los pasos pequeños: si algo se rompe, es fácil revertir',
            'La IA trabaja mejor cuando la interrumpes seguido',
            'Tres pasos siempre son más rápidos que uno',
            'Es más amable',
          ],
          explain: 'Un commit es una foto del proyecto a la que puedes volver. Los pasos pequeños con revisión muestran exactamente qué paso rompió algo.',
        },
      ],
    },
    'u3-6': {
      title: 'Final de la unidad',
      ex: [
        {
          title: 'El camino de un bug',
          prompt: 'Desde el bug encontrado hasta la versión corregida. Arma el pipeline.',
          steps: ['Reproduce el bug', 'Encuentra el error en la consola', 'Envíale a la IA el error y el código', 'Comprueba el arreglo con los mismos pasos', 'Haz commit'],
          extra: ['Publica de inmediato sin revisar'],
          explain: 'Reproducir → reunir pistas → darle contexto a la IA → comprobar el arreglo con los mismos pasos → guardar. Sin comprobación, «arreglado» son solo palabras.',
        },
        {
          title: 'Borra lo que no es',
          prompt: 'Después de presionar «Eliminar» desaparecen todas las tareas excepto la que querías eliminar. ¿Dónde está el bug?',
          explain: 'filter conserva los elementos para los que la condición es verdadera, así que el código conserva solo la tarea que se iba a eliminar. Se necesita t.id !== id.',
        },
        {
          title: '¿Rojo o amarillo?',
          situation: 'En la consola hay una docena de advertencias amarillas y un error rojo, y el botón no funciona. ¿Por dónde empiezas?',
          options: [
            'Por el error rojo: es el que rompe el funcionamiento, y las advertencias suelen ser solo pistas',
            'Por las advertencias amarillas: son más, así que son más importantes',
            'Limpiar la consola y presionar el botón otra vez',
          ],
          explain: 'Un error rojo (error) significa que el código falló, y una advertencia amarilla (warning), algo sospechoso pero que funciona. Si hay varios errores, empieza por el primero: los demás suelen ser sus consecuencias.',
        },
        {
          title: '«¡Arreglado!»',
          prompt: 'La IA reportó el arreglo. ¿Qué frase no debes creer sin más?',
          file: 'Respuesta de la IA',
          code: [
            'Encontré la causa: en removeTask había ===, y se necesita !==.',
            'Corregí una línea en tasks.js.',
            'Revisé todo: este bug ya nunca volverá a aparecer.',
            'Para asegurarte: agrega tres tareas y elimina la del medio.',
          ],
          explain: 'La IA puede equivocarse sinceramente sobre el resultado, y «nunca volverá a aparecer» es una promesa que nadie puede hacer. La comprobación son los mismos pasos de reproducción; si el bug no se repite, el cambio se puede subir con commit.',
        },
        {
          title: '¿Qué mostrará Network?',
          prompt: 'El frontend y el servidor difieren en una letra. ¿Qué verás en la pestaña Network?',
          input: 'Abro la página de pedidos.',
          code: { 0: '// frontend', 3: '// servidor' },
          outcomes: [
            {},
            { lines: ['GET /api/order   200 OK  (12 pedidos)'] },
            {},
          ],
          explain: '404 significa «no encontrado»: en el servidor no existe la ruta /api/order, solo /api/orders. Para comparar: 200 es éxito, 401 es sesión no iniciada, 403 es sin permisos, 500 es un error del servidor.',
        },
        {
          title: 'El reporte de bug perfecto',
          prompt: 'Arma el reporte: acción → expectativa → realidad → pista.',
          base: 'El botón «Comprar» no funciona.',
          chips: [
            { tag: 'Acción', text: 'Presiono «Comprar» en la página del producto.' },
            { tag: 'Expectativa', text: 'Espero pasar al pago.' },
            { tag: 'Realidad', text: 'Obtengo una pantalla en blanco.' },
            { tag: 'Pista', text: "En la consola: TypeError: Cannot read properties of null (reading 'price'), Cart.jsx:12." },
            { tag: 'Énfasis', text: '¡¡¡Se rompió todo, arréglalo urgente!!!', trap: 'Las emociones no reemplazan los hechos: la IA sigue sin saber qué se rompió.' },
            { tag: 'Alcance', text: 'Reescribe el carrito desde cero.', trap: 'Primero encuentra la causa. Reescribir no garantiza que el bug no regrese.' },
          ],
          explain: 'Acción → expectativa → realidad → error. Un reporte así lo entienden tanto la IA como una persona, y el archivo y la línea de la consola muestran de inmediato dónde mirar.',
        },
      ],
    },
  },
}
