const WEBCAL_URL = "webcal://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";
const HTTPS_URL = "https://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";

const boton = document.getElementById("subscribeBtn");
const ua = navigator.userAgent.toLowerCase();

if (/iphone|ipad|ipod/.test(ua)) {
    boton.textContent = "🍎 Añadir al Calendario";
} else if (/android/.test(ua)) {
    boton.textContent = "🤖 Añadir al calendario";
} else {
    boton.textContent = "💻 Suscribirse al calendario";
}

boton.href = WEBCAL_URL;

async function cargarCalendario() {

    try {

        const respuesta = await fetch(HTTPS_URL + "?v=" + Date.now());

        const ics = await respuesta.text();

        const eventos = ics.split("BEGIN:VEVENT");

        const ahora = new Date();

        let proximo = null;

        eventos.forEach(evento => {

            const resumen = evento.match(/SUMMARY:(.+)/);

            const fecha = evento.match(/DTSTART[^:]*:(\d{8}T\d{6}|\d{8})/);

            if (!resumen || !fecha) return;

            const valor = fecha[1];

            let partido;

            if (valor.length === 8) {

                partido = new Date(
                    Number(valor.slice(0,4)),
                    Number(valor.slice(4,6))-1,
                    Number(valor.slice(6,8))
                );

            } else {

                partido = new Date(
                    Number(valor.slice(0,4)),
                    Number(valor.slice(4,6))-1,
                    Number(valor.slice(6,8)),
                    Number(valor.slice(9,11)),
                    Number(valor.slice(11,13))
                );

            }

            if (partido > ahora) {

                if (!proximo || partido < proximo.fecha) {

                    proximo = {

                        fecha: partido,

                        titulo: resumen[1].trim()

                    };

                }

            }

        });

        const caja = document.getElementById("nextMatch");

        if (!proximo) {

            caja.innerHTML = "No hay partidos programados.";

            return;

        }

        const diferencia = proximo.fecha - ahora;

        const dias = Math.floor(diferencia / 86400000);

        const horas = Math.floor((diferencia % 86400000) / 3600000);

        caja.innerHTML = `
            <strong>${proximo.titulo}</strong><br><br>

            📅 ${proximo.fecha.toLocaleDateString("es-ES",{
                weekday:"long",
                day:"numeric",
                month:"long"
            })}<br>

            🕒 ${proximo.fecha.toLocaleTimeString("es-ES",{
                hour:"2-digit",
                minute:"2-digit"
            })}<br><br>

            ⏳ Faltan ${dias} días y ${horas} horas
        `;

    }

    catch(e){

        document.getElementById("nextMatch").innerHTML =
        "⚠️ Error al cargar el calendario.";

        console.error(e);

    }

}

cargarCalendario();
