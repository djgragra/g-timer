# Manual de G-Timer

G-Timer es un **temporizador de grabación por bloques para radio**. Construyes tus programas como una lista de bloques con tiempo, los grabas con una cuenta atrás 3·2·1, ves los excesos a medida que ocurren y exportas un informe al terminar. Es una aplicación web (PWA) gratuita de OnAir Garage que funciona sin conexión después de la primera visita.

## Abrir e instalar

Abre G-Timer en `https://onairgarage.com/apps/g-timer/` (la página de la herramienta es `https://onairgarage.com/tools/g-timer/`). Para usarlo no se instala nada, y después de la primera visita sigue funcionando en la sala de control sin conexión. También puedes instalarlo como app:

- **Chrome, Edge y Android**: pulsa el botón *Instalar app* (aparece cuando el navegador lo admite).
- **iPhone y iPad (Safari)**: toca el icono Compartir y elige «Añadir a pantalla de inicio».

La app se abre siempre en inglés. Cambia el idioma desde la cabecera (English, Italiano, Español): la elección se recuerda en el dispositivo.

## Los dos modos

Arriba eliges el modo:

- **Libre**: una cuenta atrás rápida con preajustes (1, 2, 3, 5, 10, 15 minutos) o cualquier valor mm:ss que escribas en los campos MIN y SEG.
- **Programa**: un programa hecho de bloques, cada uno con su duración prevista. Elige un programa guardado de la lista; el panel *Bloques* del lateral muestra todos sus bloques.

## Grabar

1. Pulsa **▶ Iniciar**. Con la opción **Pre-roll 3·2·1** activada (la predeterminada), tres pasos de un segundo cuentan hacia atrás antes de que empiece la toma, con pitidos opcionales (*Sonido*, tecla `S`).
2. Mientras grabas, la pantalla muestra el tiempo que queda. Se pone **amarilla en el último minuto** y **roja en los últimos 10 segundos**; por debajo de cero parpadea en rojo y cuenta el **exceso** (EXCESO).
3. **⏸ Pausa** detiene el reloj. En pausa puedes corregir el tiempo restante (±10 s, ±60 s, o escribe un valor como `mm:ss`; un número solo son minutos).
4. **⏭ Fin de bloque** cierra el bloque y pasa al siguiente. **↻ Repetir** graba de nuevo el mismo bloque; **◀ Atrás** vuelve al bloque anterior; **↺ Reiniciar** borra la toma actual.
5. Al terminar el último bloque, la pantalla dice FIN DEL PROGRAMA y se abre el informe.

Teclas: ESPACIO inicia y pausa, `N` termina el bloque, `R` reinicia, `F` pantalla completa, `S` sonido.

- **Cronometraje dinámico (DIN)**: con *DIN* activado, el desvío de cada bloque pasa al siguiente, de modo que el programa termina igualmente a tiempo: el objetivo del bloque *i* es su tiempo previsto menos la suma de (real − previsto) de los bloques anteriores. El panel marca los objetivos recalculados.
- **Varias tomas**: graba un bloque en varias tomas; las tomas se suman.
- **Grabación no lineal**: haz clic en cualquier bloque del panel lateral para saltar a él. *↺ Restaurar* en el panel devuelve las duraciones guardadas.

## Programas y logo

*Gestionar programas* abre la lista de tus programas: **+ Nuevo** para crear uno, y para cada programa *Cargar*, *Editar*, *Duplicar* y *Eliminar*. Los programas se pueden importar (**⤓ Importar**) y exportar (**⤒ Exportar**) como archivos JSON. En el editor das un nombre al programa, añades bloques (**+ Añadir bloque**) con una etiqueta y un tiempo previsto, y pulsas **💾 Guardar**. Un archivo de programas conserva solo los programas con un nombre y al menos un bloque de más de 0 segundos.

*Logo de la emisora* (cabecera) sube tu logo (PNG, JPG o SVG); se guarda solo en tu navegador.

## El informe

Al terminar un programa, o con **📋 Informe**, el informe de grabación enumera para cada bloque el tiempo **previsto**, el tiempo **real** y la **diferencia**, y después el total previsto, el total grabado y el **desvío final** (la suma de real − previsto en todos los bloques). **⧉ Copiar** lo pone en el portapapeles y **⤒ Exportar .txt** lo guarda como archivo de texto.

## Privacidad

Todos los datos permanecen en tu navegador: programas, logo y ajustes no se envían a ninguna parte. La ventana *Acerca de* muestra la versión, la licencia y una pequeña tarjeta de propina con la hucha del sitio y un botón que abre en una pestaña nueva la página de apoyo de onairgarage.com en tu idioma; es el único sitio, y dentro de la app no se pide nunca nada.

## Actualizaciones

Cuando hay una versión nueva lista, un aviso dice «Hay una nueva versión de G-Timer lista.» con *⟳ Recargar*. Ignorarlo deja simplemente en marcha la versión actual.

## Límites

- La resolución de la pantalla es de un segundo. Algunos navegadores no cuentan el tiempo que un equipo pasa suspendido.
- **Mantén la pestaña visible y el equipo despierto** durante una grabación: los navegadores pueden ralentizar la pantalla en las pestañas ocultas (el tiempo transcurrido se sigue calculando con el reloj cuando la pestaña vuelve).
- G-Timer no es un instrumento certificado; mide con el reloj propio del navegador.

## Solución de problemas

| Problema | Qué hacer |
|---|---|
| No aparece el botón *Instalar app* | Puede que el navegador no lo ofrezca: en iPhone y iPad usa Compartir → Añadir a pantalla de inicio. |
| No se puede guardar el logo | El almacenamiento del navegador está lleno o desactivado: libera espacio o actívalo para este sitio. |
| Un archivo de programas no se acepta | Debe ser un archivo JSON exportado por G-Timer, con un nombre y al menos un bloque de más de 0 segundos. |
| El reloj parece lento en una pestaña en segundo plano | Trae la pestaña al frente: el tiempo mostrado se pone al día con el reloj. |

## Contactos

Graziano Melzi · OnAir Garage — `https://onairgarage.com` — `hello@onairgarage.com`. Página de la herramienta: `https://onairgarage.com/tools/g-timer/`. Código fuente y versiones: `https://github.com/djgragra/g-timer`. Licencia: MIT © 2026 Graziano Melzi.
