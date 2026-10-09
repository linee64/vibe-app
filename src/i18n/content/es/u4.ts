import type { UnitTr } from '../types'

export const u4: UnitTr = {
  title: 'Datos y backend',
  subtitle: 'Base de datos, inicio de sesión y secretos',
  description: 'Bases de datos, tablas, inicio de sesión, claves de API y formularios',
  lessons: {
    'u4-1': {
      title: 'Qué es una base de datos',
      ex: [
        {
          title: 'Laptop → teléfono',
          prompt: 'Las tareas se guardan en localStorage. Un usuario las agregó en su laptop y abrió la app en el teléfono. ¿Qué verá?',
          tool: 'App en el teléfono',
          input: 'Abro la lista de pendientes en el teléfono.',
          outcomes: [
            { label: 'Una lista vacía', ui: { blocks: { 0: { text: 'Mis tareas' }, 1: { text: 'Aún no hay tareas' }, 2: { text: '＋ Agregar' } } } },
            { label: 'Todas las tareas de la laptop', ui: { blocks: { 0: { text: 'Mis tareas' }, 1: { items: ['☐ Comprar leche', '☐ Entregar el informe', '☐ Llamar a mamá'] } } } },
            { label: 'Un error de sincronización', ui: { blocks: { 0: { text: 'Mis tareas' } } } },
          ],
          explain: 'localStorage vive dentro de un solo navegador en un solo dispositivo, así que el teléfono no ve las tareas de la laptop. El almacenamiento compartido para todos los dispositivos es una base de datos en un servidor.',
        },
        {
          title: 'El camino de los datos',
          prompt: '¿Qué pasa cuando un usuario guarda una nota? Ordénalo.',
          steps: ['El usuario presiona «Guardar»', 'El frontend envía una petición', 'El backend verifica los permisos', 'La base de datos guarda la nota'],
          extra: ['La nota se guarda en cookies'],
          explain: 'El frontend es lo que ve el usuario; el backend es la «cocina» que verifica el acceso y guarda los datos. En la base no se escribe «a la suerte»: primero la petición pasa una verificación de permisos; en Supabase eso suelen hacerlo las políticas RLS directamente en la base.',
        },
        {
          title: '¿Dónde guardar los pedidos?',
          situation: 'Estás haciendo una tienda en línea. ¿Dónde guardas los pedidos de los clientes?',
          options: ['En una base de datos en el servidor', 'En el localStorage del navegador del cliente', 'En las cookies del navegador del cliente'],
          explain: 'localStorage y las cookies viven en el navegador del cliente: la tienda no los ve, y el cliente puede borrarlos o alterarlos. Los pedidos se guardan en el servidor, en una base de datos.',
        },
        {
          title: 'Guardar notas',
          prompt: 'Las notas deben estar disponibles desde cualquier dispositivo. ¿Qué prompt lo logra?',
          sides: [
            { prompt: 'Haz que las notas se guarden.', result: { label: 'Guardado en el navegador' } },
            {
              prompt: 'Guarda las notas en Supabase, en la tabla notes, para que después de iniciar sesión estén disponibles desde cualquier dispositivo.',
              result: { label: 'Guardado en la base de datos' },
            },
          ],
          reasons: [
            'Dice dónde guardar y para qué: en el servidor, compartidas entre todos los dispositivos',
            'Supabase es más rápido que localStorage',
            'localStorage está prohibido en los navegadores nuevos',
            'Tiene la palabra «tabla»',
          ],
          explain: 'Ante «que se guarde», la IA elige con toda honestidad lo más simple: localStorage. Si importa que los datos estén en todos los dispositivos, hay que decirlo: entonces se necesita una base de datos en un servidor.',
        },
        {
          title: 'Qué es Supabase',
          prompt: 'La IA explica qué es Supabase. Una frase es falsa: encuéntrala.',
          file: 'Respuesta de la IA',
          code: [
            'Supabase es un backend listo: base de datos Postgres, inicio de sesión de usuarios y almacenamiento de archivos.',
            'Sobre él está construido Lovable Cloud, el backend predeterminado de Lovable.',
            'En el fondo, Supabase es un hosting para el frontend; se usa en lugar de Vercel.',
            'Bolt y otros constructores con IA pueden conectar tu proyecto de Supabase.',
          ],
          explain: 'Supabase (igual que Firebase) te evita escribir un servidor desde cero: base de datos, inicio de sesión, archivos. El sitio en sí normalmente se publica en un hosting como Vercel o Netlify: son roles distintos.',
        },
      ],
    },
    'u4-2': {
      title: 'Tablas como en Supabase',
      ex: [
        {
          title: 'Filas y columnas',
          prompt: 'La tabla tasks tiene las columnas id, title, done. Un usuario agregó dos tareas. ¿Cómo se ve la tabla?',
          input: 'Abro la tabla tasks.',
          outcomes: [
            { label: 'Una tarea, una fila', lines: { 1: '1  | Comprar leche  | false', 2: '2  | Llamar a mamá  | true' } },
            { label: 'Todas las tareas en una fila', lines: { 1: '1  | Comprar leche, Llamar a mamá  | false' } },
            { label: 'Cada tarea es una columna nueva', lines: { 0: 'Comprar leche | Llamar a mamá' } },
          ],
          explain: 'Una tabla se parece a una hoja de Excel: las columnas son campos (qué guardamos), las filas son registros (tareas concretas). Cada fila tiene su propio id: la clave primaria.',
        },
        {
          title: 'Una tabla para notas',
          prompt: 'Nombre → columnas → relación con el usuario → regla de acceso. Mejora el prompt.',
          base: 'Crea una tabla para notas.',
          chips: [
            { tag: 'Dónde', text: 'En Supabase, la tabla notes.' },
            { tag: 'Columnas', text: 'Columnas: id (clave primaria), user_id, text, created_at (timestamptz).' },
            { tag: 'Relación', text: 'user_id hace referencia al usuario de auth.users.' },
            { tag: 'Acceso', text: 'Activa RLS: cada quien ve y modifica solo sus propias notas.' },
            { tag: 'Acceso', text: 'Que todos vean todo, es más fácil.', trap: 'Las notas son personales. Sin reglas de acceso, cualquiera con la clave pública leerá los registros ajenos.' },
            { tag: 'Estructura', text: 'No hace falta clave primaria.', trap: 'La clave primaria identifica una fila de forma única: con ella se encuentra, actualiza y elimina un registro concreto.' },
          ],
          explain: 'Nombre de la tabla → columnas con tipos → relación con el usuario → regla de acceso. Con un prompt así, la IA generará tanto el SQL como las políticas de seguridad.',
        },
        {
          title: 'Tareas ajenas',
          prompt: 'La consulta debería mostrar solo las tareas del usuario actual, pero muestra las de todos. ¿Dónde está el bug?',
          code: { 0: '-- tareas del usuario actual' },
          explain: 'La condición user_id = user_id compara la columna consigo misma y siempre es verdadera. Hay que comparar con el id del usuario actual; en Supabase es auth.uid(), normalmente dentro de una política RLS.',
        },
        {
          title: 'Tipo de columna',
          situation: 'Estás agregando a la tabla el campo done: «hecho / no hecho». ¿Qué tipo eliges?',
          options: ['boolean (true/false)', 'text (cadena)', 'timestamptz (fecha y hora)'],
          explain: 'Cada columna tiene un tipo: text para cadenas, int8 para números, boolean para sí/no, timestamptz para fecha y hora con zona horaria (así crea Supabase created_at por defecto).',
        },
        {
          title: 'Una migración de la IA',
          prompt: 'La IA preparó una migración SQL. Acepta lo seguro y rechaza lo peligroso.',
          request: 'Agrega a la tabla tasks la columna priority (prioridad de 0 a 3).',
          hunks: {
            1: { harmful: 'La IA vuelve a crear la tabla: se borrarán todas las tareas de los usuarios.' },
            2: { harmful: 'Desactivar RLS expone las tareas de todos los usuarios a cualquiera que tenga la clave pública.' },
          },
          explain: 'Una columna se agrega con un solo comando alter table, sin perder datos. drop table borra todo, y RLS desactivado quita la protección. Lee el SQL de la IA con especial cuidado: trabaja con datos reales.',
        },
      ],
    },
    'u4-3': {
      title: 'Inicio de sesión y registro',
      ex: [
        {
          title: 'Cómo hacer el inicio de sesión',
          prompt: 'Se necesita inicio de sesión con email y contraseña. ¿Qué prompt es más seguro?',
          sides: [
            { prompt: 'Haz el registro: guarda el email y la contraseña en la tabla users.', result: { label: 'Una tabla casera con contraseñas' } },
            {
              prompt: 'Conecta Supabase Auth: inicio de sesión con email y con Google, una página «¿Olvidaste tu contraseña?» y redirección al panel después de entrar.',
              result: { label: 'Autenticación lista', lines: { 3: '// Supabase Auth guarda la contraseña como hash' } },
            },
          ],
          reasons: [
            'La autenticación lista guarda las contraseñas como hash y ya trae recuperación e inicio con Google',
            'Una tabla users propia funciona más lento',
            'Supabase Auth no necesita internet',
            'Tiene más funciones, y más siempre es mejor',
          ],
          explain: 'Un inicio de sesión hecho a mano es una fuente frecuente de agujeros de seguridad. Los servicios listos ya guardan las contraseñas como hash, recuperan el acceso y permiten entrar con Google.',
        },
        {
          title: 'Una línea peligrosa',
          prompt: 'La IA escribió el registro con su propia tabla users. ¿Qué línea es peligrosa?',
          explain: 'La contraseña se guarda como texto plano: si la base se filtra, todos la verán. Las contraseñas solo se guardan como hash (Argon2id, bcrypt), y es mejor dejarle eso a una autenticación lista.',
        },
        {
          title: 'Una tabla sin protección',
          prompt: 'La IA creó una tabla con una consulta SQL y está muy contenta. ¿Qué le respondes?',
          chat: [
            { text: 'Crea una tabla notes para notas personales.' },
            { text: '¡Listo! Ejecuté este SQL:' },
          ],
          options: [
            'La tabla se creó con una consulta SQL: activa RLS en ella y agrega una política para que cada quien vea solo sus notas ((select auth.uid()) = user_id).',
            '¡Excelente, la conecto a la app!',
            'Haz la tabla pública para que funcione sí o sí.',
            'Agrega otras cinco tablas por si acaso.',
          ],
          explain: 'Una tabla sin RLS en el esquema public la puede leer y modificar cualquiera que tenga la clave pública. Desde el Table Editor, RLS se activa solo; en las tablas creadas con una consulta SQL, hay que activarlo a mano.',
        },
        {
          title: '¿Autenticación o autorización?',
          situation: 'En la documentación aparecen dos palabras: autenticación y autorización. ¿En qué se diferencian?',
          options: [
            'Autenticación es quién eres (inicio de sesión); autorización es qué puedes hacer (permisos)',
            'Son lo mismo',
            'Autorización es el registro; autenticación es cerrar sesión',
          ],
          explain: 'Primero el sistema reconoce al usuario (inicio de sesión) y luego decide a qué tiene acceso (por ejemplo, solo a sus propias notas).',
        },
        {
          title: 'El flujo de inicio de sesión',
          prompt: '¿Qué pasa cuando alguien inicia sesión en una app con Supabase Auth? Arma los pasos.',
          steps: ['El usuario escribe su email y contraseña', 'Supabase Auth verifica los datos', 'La app recibe una sesión', 'Redirección al panel personal'],
          extra: ['La contraseña se guarda en localStorage'],
          explain: 'La contraseña la verifica el servicio de autenticación, y la app recibe una sesión (un token) con la que reconoce al usuario. La contraseña en sí no se guarda en el navegador.',
        },
      ],
    },
    'u4-4': {
      title: 'Claves y secretos',
      ex: [
        {
          title: 'Una clave en el frontend',
          prompt: 'La IA puso la clave secreta del sistema de pagos en el código del frontend. ¿Qué verá cualquier visitante en DevTools?',
          input: 'Abro el código fuente del sitio en el navegador.',
          outcomes: [
            { label: 'La clave completa, en texto plano' },
            { label: 'Asteriscos en lugar de la clave' },
            { label: 'Nada: el código está minificado, la clave no se encuentra', lines: { 1: '(archivo cifrado)' } },
          ],
          explain: 'Todo lo que llega al frontend lo ve cualquier visitante: minificar el código no esconde las claves. Los secretos viven solo en el servidor, en variables de entorno, y los archivos .env se agregan a .gitignore.',
        },
        {
          title: 'El prefijo VITE_',
          prompt: 'Un proyecto con Vite. ¿Qué línea del .env expondrá un secreto a todos los visitantes del sitio?',
          code: { 0: '# configuración pública', 3: '# secretos' },
          explain: 'Vite incrusta las variables con el prefijo VITE_ en el código del sitio, y cualquiera puede verlas. Para eso está pensada la clave pública de Supabase, pero la clave secreta de Stripe debe vivir solo en el servidor y sin el prefijo VITE_.',
        },
        {
          title: 'Antes de publicar',
          prompt: 'La IA prepara el proyecto para subirlo a GitHub. Un cambio es peligroso.',
          request: 'Prepara el proyecto para publicarlo en GitHub.',
          hunks: [
            { lines: { 0: '+# Notas Vibe', 1: '+Para ejecutar: npm install && npm run dev' } },
            { lines: { 3: '+# .env ya no hace falta ignorarlo' }, harmful: 'La IA quitó .env de .gitignore: en el próximo commit las claves se irán a GitHub.' },
            {},
          ],
          explain: '.gitignore enumera los archivos que git no rastrea: el .env con claves debe estar ahí (la plantilla de Vite por defecto solo ignora *.local, así que revisa tú la línea .env). En cambio, .env.example con los nombres de las variables y sin valores sí conviene subirlo con commit.',
        },
        {
          title: 'Se filtró la clave',
          prompt: 'La IA te tranquiliza. ¿Tiene razón?',
          chat: [
            { text: 'Sin querer pegué una clave secreta en una publicación pública de un foro. Ya borré la publicación.' },
            { text: '¡Qué bueno que la borraste! Ya todo está bien 👍' },
          ],
          options: [
            'Borrarla no basta: pudieron copiar la clave. Dime cómo revocarla en el panel del servicio, generar una nueva y actualizarla en el servidor.',
            '¡Uf, me salvé!',
            'Entonces haré privado el foro.',
            'Le cambio el nombre a la variable en el código y listo.',
          ],
          explain: 'Los bots encuentran claves filtradas en minutos. Una clave filtrada se considera comprometida: revócala (revoke) y reemplázala por una nueva.',
        },
        {
          title: 'Claves de Supabase',
          situation: 'Supabase tiene una clave pública (publishable, antes anon) y una secreta (secret, antes service_role). ¿Cuál se puede usar en el frontend?',
          options: ['Solo la pública, y solo con RLS activado', 'La secreta: es más poderosa', 'Las dos, no hay diferencia'],
          explain: 'La clave pública (sb_publishable_…) la ve todo el mundo, por eso el acceso lo limitan las políticas RLS. La secreta (sb_secret_…) se salta RLS y solo va en el servidor; Supabase está retirando las antiguas claves anon y service_role.',
        },
        {
          title: 'Un prompt seguro',
          prompt: 'Necesitas ayuda para conectar los pagos. La IA en sí no necesita la clave.',
          base: 'Ayúdame a conectar Stripe.',
          chips: [
            { tag: 'Dónde está la clave', text: 'Voy a leer la clave de process.env.STRIPE_SECRET_KEY en el servidor.' },
            { tag: 'Qué', text: 'Necesito un pago único con Stripe Checkout.' },
            { tag: 'Formato', text: 'Muestra el código del servidor y qué agregar al frontend.' },
            { tag: 'Contexto', text: 'Aquí está mi clave sk_live_51H…, ponla en el código.', trap: 'Un secreto en el código lo ve cualquiera con acceso al repositorio o al sitio.' },
            { tag: 'Contexto', text: 'Aquí está mi clave sk_live_51H…, nada más ponla en el .env.', trap: 'Un secreto pegado en el chat ya salió de tu computadora, aunque después termine en el .env.' },
          ],
          explain: 'La IA no necesita la clave en sí: basta con el nombre de la variable de entorno. Así el código sale correcto y el secreto no se filtra a ningún lado.',
        },
      ],
    },
    'u4-5': {
      title: 'Un formulario que guarda',
      ex: [
        {
          title: 'Formulario de solicitud',
          prompt: 'Campos → validación → dónde guardar → qué ve el usuario. Mejora el prompt.',
          base: 'Haz un formulario de solicitud.',
          chips: [
            { tag: 'Campos', text: 'Campos: nombre y teléfono.' },
            { tag: 'Validación', text: 'Verifica que los campos estén llenos antes de enviar.' },
            { tag: 'Dónde', text: 'Guarda la solicitud en la tabla leads de Supabase.' },
            { tag: 'Respuesta', text: 'Después de enviar, muestra «¡Gracias!» y limpia los campos.' },
            { tag: 'Velocidad', text: 'No valides los campos, así es más rápido.', trap: 'Sin validación, a la base llegarán solicitudes vacías y basura.' },
            { tag: 'Dónde', text: 'Muestra la solicitud en un alert en lugar de guardarla.', trap: 'Un alert no guarda nada: la solicitud desaparece en cuanto la persona cierra la ventana.' },
          ],
          explain: 'Campos → validación → dónde guardar → qué ve el usuario. Sin el último paso, la gente no sabe si su solicitud se envió.',
        },
        {
          title: '«¡Gracias!», pero la tabla está vacía',
          prompt: 'El formulario muestra «¡Gracias!», pero la tabla está vacía. ¿Dónde está el bug?',
          code: { 4: "  setStatus('¡Gracias!');" },
          explain: 'Falta await: la consulta de supabase-js solo se envía con await (o .then), por eso la fila no se guarda y error está vacío. Se necesita: const { error } = await supabase…',
        },
        {
          title: 'Doble clic',
          prompt: 'El botón «Enviar» no se bloquea mientras dura la petición. El usuario lo presionó dos veces rápido. ¿Qué quedará en la tabla?',
          input: 'Reviso la tabla leads después del doble clic.',
          outcomes: [
            { label: 'Dos solicitudes iguales', lines: { 1: '41 | Lucía | +52 55 5555 0102', 2: '42 | Lucía | +52 55 5555 0102' } },
            { label: 'Una solicitud', lines: { 1: '41 | Lucía | +52 55 5555 0102' } },
            { label: 'Un error y ninguna solicitud' },
          ],
          explain: 'Cada clic envía una petición aparte: salen duplicados. La técnica estándar es un estado de carga (loading): el botón queda inactivo y muestra «Enviando…» hasta que el servidor responde.',
        },
        {
          title: 'Validación del email',
          prompt: 'La IA agregó validación del email. ¿Todo en el cambio tiene sentido?',
          request: 'Agrega validación del email al formulario de opiniones.',
          hunks: [
            { lines: { 1: "+  return setError('Revisa tu email')" } },
            { harmful: 'La IA quitó la validación del servidor porque «ahora valida el formulario». La validación del navegador es fácil de saltarse: la del servidor no se debe quitar.' },
            {},
          ],
          explain: 'La validación en el frontend es para comodidad del usuario. La protección está en el servidor: código del servidor, restricciones de columnas, políticas RLS. Tienen que funcionar juntas.',
        },
        {
          title: 'Se fue el internet',
          prompt: 'La IA agregó el manejo de errores a su manera. ¿Cómo lo mejoras?',
          chat: [
            { text: 'Si se va el internet, la solicitud se pierde sin avisar.' },
            { text: 'Agregué que se muestre el error:' },
          ],
          options: [
            'Muestra un texto claro: «No se pudo enviar. Revisa tu conexión a internet e inténtalo de nuevo», y no borres los datos que ya se escribieron.',
            'Ok, así lo dejamos.',
            'Entonces mejor no mostrar nada.',
            'Muestra el error en inglés técnico, se ve más profesional.',
          ],
          explain: 'Un stack trace técnico no le dice nada al usuario. Un mensaje humano más los datos conservados, y la persona simplemente presionará «Enviar» otra vez.',
        },
      ],
    },
    'u4-6': {
      title: 'El cofre del backend',
      ex: [
        {
          title: 'RLS activado, pero no hay datos',
          prompt: 'RLS está activado en la tabla reviews, pero no hay políticas. ¿Qué devolverá una petición desde el navegador con la clave pública?',
          tool: 'Consola del navegador',
          input: 'Pido las opiniones desde la app.',
          outcomes: [
            { label: 'Una lista vacía sin error' },
            { label: 'Todas las filas de la tabla' },
            { label: 'El error «tabla eliminada»' },
          ],
          explain: 'RLS activado sin políticas cierra todo: una causa frecuente de «desaparecieron los datos». En el editor SQL las filas sí se ven (funciona como propietario), pero la app necesita una política, por ejemplo de lectura para todos.',
        },
        {
          title: 'Un esquema seguro',
          prompt: 'Ordena los pasos para conectar la base de datos a la app. Una tarjeta es peligrosa.',
          steps: ['Crea la tabla', 'Activa RLS', 'Agrega políticas de acceso', 'Conecta la clave pública en el frontend'],
          extra: ['Pon la clave secreta en el código'],
          explain: 'Primero la protección, después la conexión. La clave secreta (secret o la antigua service_role) nunca llega al frontend.',
        },
        {
          title: 'Leemos una política RLS',
          prompt: 'En notes hay tres notas: dos son de Aida y una de Timur. Aida inicia sesión y pide todas las notas. ¿Cuántas filas recibirá?',
          tool: 'Política RLS',
          input: 'Aida inicia sesión y ejecuta select * from notes.',
          code: { 0: 'create policy "Notas propias" on notes' },
          outcomes: [
            { label: '2 filas: solo las suyas', lines: { 1: '1  | aida    | Plan de la semana', 2: '3  | aida    | Ideas para la landing' } },
            { label: '3 filas: todas las notas', lines: { 1: '1  | aida    | Plan de la semana', 2: '2  | timur   | Compras', 3: '3  | aida    | Ideas para la landing' } },
            { label: '0 filas', lines: ['(vacío)'] },
          ],
          explain: 'auth.uid() devuelve el id de quien hace la petición, y la política funciona como un WHERE invisible: cada quien ve solo sus filas. Si el usuario no inició sesión, auth.uid() devuelve null y no habrá filas.',
        },
        {
          title: 'Saltándose RLS',
          prompt: '¿Qué línea abre el acceso a todos los datos saltándose RLS?',
          explain: 'Con el prefijo VITE_, la clave terminará en el código del sitio, y la clave secreta (sb_secret_…, igual que la antigua service_role) se salta RLS. En el frontend solo va la clave pública: publishable o la antigua anon.',
        },
        {
          title: '¿Dónde guardar imágenes?',
          situation: 'Los usuarios suben avatares. ¿Cuál es la forma correcta de guardarlos?',
          options: [
            'Los archivos en un almacenamiento (por ejemplo, Supabase Storage), y en la tabla la ruta al archivo',
            'Directo en la tabla, convirtiendo la imagen en una cadena base64 larga',
            'En el localStorage del navegador del usuario',
          ],
          explain: 'Las tablas están pensadas para cadenas y números, y para los archivos existe el almacenamiento. El acceso a los archivos en Supabase Storage también se configura con políticas, como RLS en las tablas.',
        },
        {
          title: 'Lo borré en el siguiente commit',
          prompt: 'La IA cree que el problema está resuelto. Respóndele.',
          chat: [
            { text: 'Subí con commit un .env con una clave a un repositorio público, y en el siguiente commit borré el archivo.' },
            { text: '¡Excelente, el archivo ya no está en el repositorio: problema resuelto!' },
          ],
          options: [
            'No: la clave sigue en el historial de git. Ayúdame a revocarla en el panel del servicio y a generar una nueva; el historial lo limpiamos después.',
            'Hago privado el repositorio y listo.',
            '¡Gracias, qué alivio!',
            'Ya que estás, borra también el README.',
          ],
          explain: 'Un archivo borrado se queda en el historial de commits, y los bots escanean GitHub todo el tiempo. Una clave filtrada se considera comprometida: reemplázala; limpiar el historial no sustituye el reemplazo.',
        },
      ],
    },
  },
}
