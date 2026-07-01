const WEBCAL_URL = "webcal://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";
const HTTPS_URL = "https://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";

const boton = document.getElementById("subscribeBtn");
const ua = navigator.userAgent.toLowerCase();

// Detectar dispositivo
if (/iphone|ipad|ipod/.test(ua)) {
    boton.textContent = "🍎 Añadir al Calendario";
    boton.href = WEBCAL_URL;
} else if (/android/.test(ua)) {
    boton.textContent = "🤖 Añadir al calendario";
    boton.href = WEBCAL_URL;
} else {
    boton.textContent = "💻 Suscribirse al calendario";
    boton.href = WEBCAL_URL;
}

// Leer el calendario
async function cargarProximoPartido() {
    try {
        const respuesta = await fetch(HTTPS_URL);
        const texto = await respuesta.text();

        const eventos = texto.split("BEGIN:VEVENT");
        const ahora = new Date();

        let siguiente = null;

        eventos.forEach(evento => {

            const fecha = evento.match(/DTSTART.*:(\d{8}T\d{6}Z?|\d{8})/);
            const resumen = evento.match(/SUMMARY:(.+)/);

            if (!fecha || !resumen) return;

            const valor = fecha[1];

            let partido;

            if (valor.length === 8) {

                partido = new Date(
                    valor.substring(0,4),
                    valor.substring(4,6)-1,
                    valor.substring(6,8)
                );

            } else {

                partido = new Date(
                    valor.substring(0,4),
                    valor.substring(4,6)-1,
                    valor.substring(6,8),
                    valor.substring(9,11),
                    valor.substring(11,13)
                );

            }

            if (partido > ahora) {

                if (!siguiente || partido < siguiente.fecha) {

                    siguiente = {
                        fecha: partido,
                        titulo: resumen[1].trim()
                    };

                }

            }

        });

        const caja = document.getElementById("nextMatch");

        if (!siguiente) {

            caja.innerHTML = "No hay partidos próximos.";

            return;

        }

        const dias = Math.ceil(
            (siguiente.fecha - ahora) /
            (1000 * 60 * 60 * 24)
        );

        caja.innerHTML = `
            <strong>${siguiente.titulo}</strong><br><br>

            📅 ${siguiente.fecha.toLocaleDateString("es-ES",{
                weekday:"long",
                day:"numeric",
                month:"long"
            })}<br>

            🕒 ${siguiente.fecha.toLocaleTimeString("es-ES",{
                hour:"2-digit",
                minute:"2-digit"
            })}<br><br>

            ⏳ Faltan <strong>${dias}</strong> días
        `;

    } catch (e) {

        document.getElementById("nextMatch").innerHTML =
        "⚠️ No se pudo leer el calendario.";

        console.error(e);

    }
}

cargarProximoPartido();
