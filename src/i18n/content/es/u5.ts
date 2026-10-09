import type { UnitTr } from '../types'

export const u5: UnitTr = {
  title: 'Lanzamiento',
  subtitle: 'Publicamos el proyecto en internet',
  description: 'GitHub, deploy, dominio, analítica y primeros usuarios',
  lessons: {
    'u5-1': {
      title: 'Git y GitHub',
      ex: [
        {
          title: 'Git y GitHub',
          situation: 'Un amigo está seguro de que git y GitHub son lo mismo. ¿Cómo le explicas la diferencia?',
          options: [
            'Git guarda el historial de versiones del proyecto en tu computadora; GitHub es un sitio donde está una copia del repositorio en la nube',
            'Son lo mismo, solo tienen nombres distintos',
            'Git es un modelo de IA para código, y GitHub es su sitio web',
          ],
          explain: 'Git guarda «fotos» del proyecto (commits) y permite volver atrás: para quien hace vibe coding, es su seguro. GitHub (igual que GitLab y Bitbucket) guarda una copia del repositorio en línea, y desde ahí es cómodo hacer el deploy.',
        },
        {
          title: 'Mándalo a GitHub',
          prompt: 'Guarda los cambios y mándalos a GitHub. Ordena los comandos.',
          steps: ['git add .', 'git commit -m "Agrega formulario"', 'git push'],
          explain: 'add elige los cambios, commit guarda una foto con descripción, push manda los commits a GitHub. El primer push suele verse como git push -u origin main. En git no existen los comandos upload ni deploy.',
        },
        {
          title: 'Mensaje de commit',
          prompt: 'Le pides a la IA que escriba el mensaje de commit. ¿Qué petición dio una descripción clara?',
          sides: [
            { prompt: 'Inventa un mensaje de commit.', result: { label: 'Un «update» vacío' } },
            {
              prompt: 'Revisa los cambios (git diff) y escribe un mensaje de commit: una línea, qué cambió y para qué.',
              result: { label: 'Una descripción concreta', lines: { 1: 'a1f3c2e Agrega formulario de solicitud con guardado en Supabase' } },
            },
          ],
          reasons: [
            'La IA recibió los cambios y el formato, por eso la descripción es concreta',
            'Los mensajes de commit en inglés están prohibidos',
            'Un mensaje de commit largo siempre es mejor que uno corto',
            'git log solo acepta mensajes escritos por IA',
          ],
          explain: 'Dentro de un mes, la descripción del commit debe dejar claro qué cambió. Los editores con IA pueden proponer descripciones así por sí mismos cuando ven el diff.',
        },
        {
          title: 'Ya funciona, ¿y ahora?',
          prompt: 'La nueva función ya sirve. La IA tiene prisa por seguir. ¿Tu jugada?',
          chat: [
            { text: '¡El modo oscuro funciona, ya revisé todo!' },
            { text: '¡Súper! Sigamos: ¿agregamos carrito, pagos y perfil?' },
          ],
          options: [
            'Primero hago commit: «Agrega modo oscuro». Después el carrito, una función a la vez.',
            'Hagamos el carrito, los pagos y el perfil de una vez.',
            'Hago commit a fin de mes, cuando todo esté listo.',
            'Primero borremos los commits viejos para que no estorben.',
          ],
          explain: 'Commits frecuentes son muchos puntos de guardado. Si la IA rompe algo, regresas cinco minutos atrás, no una semana.',
        },
        {
          title: 'Push sin commit',
          prompt: 'Modificaste archivos, pero olvidaste git add y git commit. ¿Qué responderá git push?',
          tool: 'Terminal',
          input: 'Ejecuto git push.',
          outcomes: [
            { label: '«Everything up-to-date»: no hay nada que enviar' },
            { label: 'Los cambios se fueron a GitHub' },
            { label: 'Git hizo el commit solo', lines: { 1: '[auto-commit] Cambios guardados' } },
          ],
          explain: 'push envía commits, no archivos. Mientras los cambios no tengan commit, no hay nada que enviar, y el sitio en el hosting tampoco se actualizará.',
        },
      ],
    },
    'u5-2': {
      title: 'Deploy en Vercel',
      ex: [
        {
          title: '¿Qué es un deploy?',
          situation: 'Le mandaste a un amigo el enlace http://localhost:5173 y a él no le abre nada.',
          options: [
            'localhost es tu computadora; para que el sitio abra para todos, hace falta un deploy a un hosting',
            'Tu amigo tiene que instalar el mismo navegador que tú',
            'Hay que reiniciar npm run dev con la opción --share',
          ],
          explain: 'npm run dev ejecuta el proyecto en localhost: solo tú lo ves. El deploy es publicarlo en un servidor: después de eso el proyecto tiene una dirección pública, por ejemplo my-app.vercel.app.',
        },
        {
          title: 'Primer deploy',
          prompt: 'Ordena los pasos del primer deploy en Vercel.',
          steps: ['Sube el proyecto a GitHub', 'Importa el repositorio en Vercel', 'Agrega las variables de entorno', 'Presiona Deploy'],
          extra: ['Manda las claves por el chat'],
          explain: 'Vercel se conecta a GitHub, detecta solo el framework (por ejemplo, Vite) y hace el build del proyecto. Las claves del .env se escriben en la configuración del proyecto: el .env en sí no entra a git.',
        },
        {
          title: 'Commit sin push',
          prompt: 'El proyecto está conectado a Vercel a través de GitHub. Hiciste un commit local, pero no hiciste push. ¿Qué pasará con el sitio?',
          input: 'Abro mi sitio después del commit local.',
          outcomes: [
            { label: 'No cambió nada', ui: { blocks: { 0: { text: 'Versión anterior' }, 1: { text: 'Último deploy: ayer' } } } },
            { label: 'El sitio ya se actualizó', ui: { blocks: { 0: { text: 'Versión nueva' }, 1: { text: 'Deploy: hace un momento' } } } },
            { label: 'Apareció un enlace de vista previa' },
          ],
          explain: 'Vercel solo ve lo que llegó a GitHub: un commit local sin push no publica nada. Un push a main es un nuevo deploy de producción; un push a otras ramas es un deploy de vista previa con su propio enlace.',
        },
        {
          title: 'El deploy nunca termina',
          prompt: 'El deploy en el hosting se queda colgado y no termina. ¿Qué línea del package.json tiene la culpa?',
          explain: 'El hosting ejecuta npm run build, y aquí eso es el servidor de desarrollo, que corre sin fin. Se necesita el comando "vite build": arma el sitio en la carpeta dist y termina.',
        },
        {
          title: 'Build failed',
          prompt: 'El deploy está en rojo, y la IA propone «nada más intentarlo otra vez». ¿Tu jugada?',
          chat: [
            { text: 'En Vercel falló el deploy: «Build failed».' },
            { text: 'Prueba a presionar Redeploy, a veces funciona.' },
          ],
          options: [
            "Aquí está el log del build: «src/App.tsx(12,7): error TS2322: Type 'string' is not assignable to type 'number'». En local, npm run build falla igual. ¿Qué hay que corregir?",
            'Presiono Redeploy hasta tener suerte.',
            'Borro el proyecto en Vercel y lo creo de nuevo.',
            'Desactiva la verificación de tipos para que no estorbe.',
          ],
          explain: 'Los logs del build son la misma consola, solo que en el servidor. Conviene ejecutar npm run build en tu equipo: el error suele repetirse, y con su texto la IA arregla la causa.',
        },
      ],
    },
    'u5-3': {
      title: 'Tu propio dominio',
      ex: [
        {
          title: '¿Qué es un dominio?',
          situation: 'El sitio de la cafetería abre en zerno-coffee-x7k2.vercel.app. Quieres una dirección más corta y más seria.',
          options: [
            'Comprar un dominio (por ejemplo, zerno-coffee.com) y vincularlo al proyecto en el hosting',
            'Cambiarle el nombre a la carpeta del proyecto en tu computadora',
            'Pedirle a la IA que acorte la dirección en el código del sitio',
          ],
          explain: 'Un dominio es una dirección del sitio fácil de entender. Se compra a un registrador (Namecheap, Cloudflare, GoDaddy, etc.) o directamente en Vercel, normalmente por un año, y luego se vincula al hosting.',
        },
        {
          title: '¿Qué registros DNS?',
          prompt: 'La IA recomendó los registros equivocados. Corrígela.',
          chat: [
            { text: 'Compré zerno-coffee.com y agregué el dominio en Vercel. ¿Qué configuro en el registrador?' },
            { text: 'Agrega dos registros MX con el valor vercel.com, para la raíz y para www.' },
          ],
          options: [
            'Los MX son registros para el correo. La raíz zerno-coffee.com necesita un registro A, www necesita un CNAME, y los valores exactos los tomo de la configuración del dominio en Vercel. ¿Correcto?',
            'Ok, agrego los MX.',
            'Borro todos los registros del registrador para que quede limpio.',
            'Compro otro dominio, a lo mejor este está roto.',
          ],
          explain: 'El DNS es la «guía telefónica» de internet. Para el dominio raíz, Vercel pide un registro A; para un subdominio (www), un CNAME, y muestra los valores exactos en la configuración del dominio. La IA puede confundir los tipos de registro: compáralo con las instrucciones del hosting.',
        },
        {
          title: 'El dominio no abre',
          situation: 'Agregaste los registros DNS hace 10 minutos, y el sitio todavía no abre con el dominio.',
          options: [
            'Verificar que los registros coincidan con las instrucciones de Vercel y esperar: la actualización del DNS suele tardar de minutos a un par de horas, a veces hasta 48 horas',
            'Comprar otro dominio',
            'Borrar todos los registros y empezar de cero',
          ],
          explain: 'Los servidores DNS recuerdan los registros viejos por un tiempo. Si todo está bien configurado, solo queda esperar: lo que más tarda (hasta 48 horas) es cambiar los servidores NS.',
        },
        {
          title: 'Tu dominio paso a paso',
          prompt: 'Conecta tu propio dominio a un sitio en Vercel. Arma los pasos.',
          steps: ['Compra un dominio con un registrador', 'Agrégalo en la configuración del proyecto de Vercel', 'Configura los registros DNS en el registrador', 'Espera la verificación y el certificado HTTPS'],
          extra: ['Reescribe el sitio para el dominio nuevo'],
          explain: 'El hosting te indica los registros necesarios, tú los agregas en el registrador, y después de la verificación el dominio funciona, junto con HTTPS gratis. No hace falta reescribir el sitio.',
        },
        {
          title: 'El candado del navegador',
          prompt: 'La IA explica qué es HTTPS. Encuentra la mentira.',
          file: 'Respuesta de la IA',
          code: [
            'Después de conectar el dominio, Vercel emitirá el certificado HTTPS por su cuenta.',
            'Sin HTTPS, el navegador mostrará la advertencia «No seguro».',
            'El certificado cuesta desde 1000 dólares al año y hay que comprarlo aparte.',
            'HTTPS cifra los datos entre el visitante y el sitio.',
          ],
          explain: 'Vercel y Netlify emiten el certificado gratis y automáticamente en cuanto el dominio está conectado. No hace falta pagar miles de dólares por un sitio común.',
        },
      ],
    },
    'u5-4': {
      title: 'Analítica',
      ex: [
        {
          title: 'Qué medir',
          prompt: 'Quieres saber cuánta gente presiona el botón principal. ¿Qué prompt lo logra?',
          sides: [
            { prompt: 'Conecta la analítica.', result: { label: 'Solo vistas de página', ui: { blocks: { 0: { text: 'Analítica' }, 1: { items: [['Visitantes', '1000'], ['Vistas', '2340']] }, 2: { text: 'No medimos el botón' } } } } },
            {
              prompt: 'Conecta la analítica y envía el evento cta_click al presionar «Inscribirme». No envíes datos personales.',
              result: { label: 'Se ve la acción principal', ui: { blocks: { 0: { text: 'Analítica' }, 1: { items: [['Visitantes', '1000'], ['cta_click', '30'], ['Conversión', '3 %']] } } } },
            },
          ],
          reasons: [
            'Dice qué acción contar, así se ve la conversión del botón principal',
            'Sin eventos, la analítica ni siquiera muestra visitantes',
            'La IA rastrea la palabra «Inscribirme» automáticamente',
            'Es más largo',
          ],
          explain: 'Los eventos (events) muestran acciones: clics, registros, pagos. Sin ellos solo se ve cuánta gente llegó, pero no qué hizo. Los datos personales no se mandan a la analítica.',
        },
        {
          title: 'Calcula la conversión',
          prompt: 'De 1000 visitantes, 30 se inscribieron a una clase. ¿Qué mostrará la analítica en la columna «Conversión»?',
          tool: 'Panel de analítica',
          input: 'Abro el reporte de la semana: 1000 visitantes, 30 inscripciones.',
          outcomes: [
            { label: '3 %', ui: { blocks: { 0: { text: 'Conversión: 3 %' }, 1: { text: '30 de 1000' } } } },
            { label: '30 %', ui: { blocks: { 0: { text: 'Conversión: 30 %' }, 1: { text: '30 de 1000' } } } },
            { label: '0,3 %', ui: { blocks: { 0: { text: 'Conversión: 0,3 %' }, 1: { text: '30 de 1000' } } } },
          ],
          explain: 'Conversión = quienes hicieron la acción / todos los visitantes. 30 / 1000 = 3 %. Se compara antes y después de los cambios.',
        },
        {
          title: 'Algo que sobra en la analítica',
          prompt: '¿Qué línea viola la privacidad de los usuarios?',
          explain: 'Las contraseñas y otros datos sensibles no se deben mandar a la analítica. Para contar registros basta con el nombre del evento y el plan.',
        },
        {
          title: '¿Mejoró?',
          prompt: 'Cambiaste el texto del botón principal. La IA está segura del éxito. ¿Tu jugada?',
          chat: [
            { text: 'Cambié el texto del botón de «Enviar» a «Reservar clase de prueba». ¿Mejoró?' },
            { text: 'El texto nuevo suena mucho más convincente, ¡seguro que mejoró!' },
          ],
          options: [
            'Comprobémoslo con números: comparemos la conversión a inscripción de la semana anterior y la siguiente. Y lo más confiable es una prueba A/B.',
            '¡Excelente, te creo!',
            'Les pregunto a mis amigos si les gusta el color.',
            'Lo cambio otra vez, por si acaso.',
          ],
          explain: 'Las decisiones se comprueban con números: la conversión antes y después, con suficientes visitantes. Todavía más confiable es una prueba A/B, en la que la versión vieja y la nueva se muestran al mismo tiempo a personas distintas. La opinión de la IA no son datos.',
        },
        {
          title: '¿Para qué la analítica?',
          situation: 'La landing ya está publicada. Dudas si conectar la analítica: «ya se ve que todo funciona».',
          options: [
            'Conectarla: muestra cuánta gente llega, de dónde y qué hace en el sitio',
            'No hace falta: la analítica solo sirve para que el sitio cargue más rápido',
            'No hace falta: la IA ya sabe qué le gusta a la gente',
          ],
          explain: 'Sin analítica, estás adivinando. Servicios como Plausible, Google Analytics, PostHog o Vercel Analytics muestran el panorama real.',
        },
      ],
    },
    'u5-5': {
      title: 'Primeros usuarios',
      ex: [
        {
          title: '¿Cuándo mostrárselo a la gente?',
          situation: 'Tu app resuelve el problema principal, pero todavía no es perfecta: un par de botones se ven mal y no hay modo oscuro.',
          options: ['Mostrársela ya a los primeros usuarios y juntar opiniones', 'Esperar otro medio año a que todo sea perfecto', 'No mostrársela a nadie'],
          explain: 'Un MVP (Minimum Viable Product) es la versión mínima que ya aporta valor. Con vibe coding se puede armar en un fin de semana, y las opiniones tempranas ahorran meses de trabajo en funciones que nadie necesita.',
        },
        {
          title: 'Dónde conseguir los primeros usuarios',
          prompt: 'La IA dio consejos para encontrar a los primeros usuarios. Un consejo es una señal de alerta.',
          file: 'Respuesta de la IA',
          code: [
            'Empieza por amigos y conocidos de tu público objetivo.',
            'Cuenta del proyecto en chats y comunidades temáticas.',
            'Compra una base de 10 000 emails y haz un envío masivo: es lo más rápido.',
            'Cuando tengas algo que mostrar, lanza el proyecto en Product Hunt.',
          ],
          explain: 'Empieza por personas que tienen el problema que resuelves. Un envío a una base comprada es spam: daña la reputación y viola las reglas y leyes sobre correos masivos.',
        },
        {
          title: 'Duelo de preguntas',
          prompt: 'Le preguntas a un tester por su primera impresión. ¿Qué pregunta dio una respuesta útil?',
          sides: [
            { prompt: 'Te gustó, ¿verdad?', result: { label: 'Un «sí» amable', text: '¡Sí, está genial! 👍' } },
            { prompt: '¿Qué te resultó confuso o incómodo cuando probaste la app por primera vez?', result: { label: 'Algo concreto', text: 'No encontré de inmediato dónde agregar una tarea, y no supe si se guardó: no salió ningún mensaje.' } },
          ],
          reasons: [
            'Una pregunta abierta, sin sugerir la respuesta, saca problemas concretos',
            'Es más larga, por eso se ve más seria',
            'Los testers solo responden con honestidad a preguntas con la palabra «incómodo»',
            'La primera pregunta es demasiado amable',
          ],
          explain: 'Las preguntas abiertas dan respuestas concretas. «Te gustó, ¿verdad?» empuja a un «sí» amable y no dice nada sobre qué corregir.',
        },
        {
          title: 'El ciclo de crecimiento',
          prompt: '¿Cómo trabajar con las opiniones de los usuarios? Arma el ciclo.',
          steps: ['Junta las opiniones', 'Elige el problema principal', 'Corrígelo con la IA', 'Publica la actualización y vuelve a comprobar'],
          extra: ['Agrega diez funciones nuevas de una vez'],
          explain: 'El mismo ciclo que con los prompts: pasos pequeños, comprobando el resultado con personas reales.',
        },
        {
          title: 'Analizar opiniones con IA',
          prompt: 'Tienes 12 opiniones de testers. Pídele a la IA que te ayude a sacar conclusiones, no que te eche flores.',
          base: 'Aquí están las opiniones de los testers. ¿Qué hago?',
          chips: [
            { tag: 'Datos', text: 'Abajo hay 12 opiniones, una por línea.' },
            { tag: 'Tarea', text: 'Agrúpalas por problema y cuenta cuántas veces aparece cada uno.' },
            { tag: 'Formato', text: 'Responde con una tabla: problema, cuántas veces, una cita de ejemplo.' },
            { tag: 'Enfoque', text: 'Propón un solo cambio principal para esta semana.' },
            { tag: 'Tono', text: 'Escribe que todo está excelente, necesito motivación.', trap: 'Así la IA esconderá los problemas. Necesitas conclusiones, no halagos.' },
            { tag: 'Datos', text: 'Inventa otras 20 opiniones para tener más datos.', trap: 'Las opiniones inventadas distorsionan el panorama: tus decisiones serán sobre personas que no existen.' },
          ],
          explain: 'Datos → tarea → formato → enfoque. La IA agrupa y cuenta bien los problemas que se repiten, y un solo cambio principal evita que te disperses.',
        },
      ],
    },
    'u5-6': {
      title: 'Final: el proyecto en línea',
      ex: [
        {
          title: 'El camino del lanzamiento',
          prompt: 'Ordena las etapas del lanzamiento del proyecto.',
          steps: ['Sube el código a GitHub', 'Haz el deploy', 'Conecta el dominio', 'Conecta la analítica', 'Invita a los primeros usuarios'],
          extra: ['Manda spam a una base comprada'],
          explain: 'Guardar el código → publicarlo → darle una dirección clara → conectar la analítica → traer gente y escucharla. La analítica se conecta antes de que lleguen los primeros usuarios; si no, se pierden los primeros datos.',
        },
        {
          title: 'Claves en el hosting',
          prompt: 'El sitio en Vercel no ve la clave de Supabase, aunque en local todo funciona. La IA aconseja…',
          chat: [
            { text: 'En Vercel el sitio no ve VITE_SUPABASE_URL, pero en local todo funciona.' },
            { text: 'Nada más sube el archivo .env a GitHub con un commit: Vercel lo tomará.' },
          ],
          options: [
            'No, el .env no va en git. Agrego las variables en la configuración del proyecto de Vercel (Environment Variables) y hago un deploy nuevo.',
            'Ok, hago commit del .env.',
            'Escribo la clave directo en el código.',
            'Espero, ya funcionará solo.',
          ],
          explain: 'El .env no entra a git, así que el hosting no sabe de él. Las variables se definen en el panel del hosting y solo se aplican a los deploys nuevos.',
        },
        {
          title: 'Un cambio en una rama',
          prompt: 'Hiciste un cambio en la rama feature/menu y le hiciste push a GitHub. ¿Qué hará Vercel?',
          outcomes: [
            { label: 'Un deploy de vista previa con su propio enlace', ui: { blocks: { 2: { text: 'El sitio principal no cambió' } } } },
            { label: 'Actualizará de inmediato el sitio principal', ui: { blocks: { 1: { text: 'vibe-app.vercel.app actualizado' } } } },
            { label: 'Nada: Vercel no ve las ramas', ui: { blocks: { 0: { text: 'Sin deploys' } } } },
          ],
          explain: 'Un push a main actualiza el sitio principal, y un push a otra rama crea un deploy de vista previa con su propio enlace. Así puedes revisar el cambio de la IA antes de que lo vean los usuarios.',
        },
        {
          title: 'Un .gitignore engañoso',
          prompt: 'Después de git push, las claves secretas terminaron en GitHub. ¿Qué línea del .gitignore está mal?',
          code: { 0: '# dependencias', 2: '# build', 4: '# secretos' },
          explain: 'Se ignora la plantilla .env.example, pero el .env real no. Hace falta la línea .env, y .env.example, que no tiene secretos, sí conviene subirlo con commit para que se vea qué variables se necesitan.',
        },
        {
          title: 'Conversión',
          situation: 'Variante A: 1000 visitantes, 30 inscripciones. Variante B: 400 visitantes, 20 inscripciones. ¿Qué variante tiene mayor conversión?',
          options: ['La B: 5 % contra 3 %', 'La A: tiene más inscripciones', 'Es igual'],
          explain: 'La conversión es una proporción, no una cantidad: 20 / 400 = 5 %, 30 / 1000 = 3 %. La A tiene más inscripciones solo porque tiene más visitantes.',
        },
        {
          title: 'No encontraron el botón',
          prompt: 'Tres de cinco testers no encontraron el botón de registro. La IA hizo un cambio: revísalo.',
          request: 'Haz más visible el botón de registro y agrega un evento de clic a la analítica.',
          hunks: [
            { lines: ['-<a className="text-sm text-gray-400">Registro</a>', '+<button className="btn btn-coral">Crear cuenta</button>'] },
            {},
            { harmful: 'El email y el teléfono son datos personales; no se mandan a la analítica. Para contar clics basta con el nombre del evento.' },
          ],
          explain: 'Un botón visible y un evento de clic son justo lo que hace falta para comprobar el arreglo con usuarios nuevos. Pero los datos personales en la analítica son una violación de la privacidad.',
        },
      ],
    },
  },
}
