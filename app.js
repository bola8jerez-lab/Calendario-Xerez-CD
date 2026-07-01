const ICS_URL = "https://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";
const WEBCAL_URL = "webcal://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";

document.getElementById("subscribeBtn").href = WEBCAL_URL;

const nextMatch = document.getElementById("nextMatch");

async function cargarCalendario() {
    try {

        nextMatch.innerHTML = "🔄 Cargando calendario...";

        const respuesta = await fetch(ICS_URL + "?t=" + Date.now());

        if (!respuesta.ok) {
            throw new Error("HTTP " + respuesta.status);
        }

        const texto = await respuesta.text();

        console.log(texto.substring(0,200));

        if (typeof ICAL === "undefined") {
            throw new Error("La librería ICAL no se ha cargado.");
        }

        const jcal = ICAL.parse(texto);
        const comp = new ICAL.Component(jcal);
        const eventos = comp.getAllSubcomponents("vevent");

        const ahora = new Date();
        let siguiente = null;

        eventos.forEach(ev => {

            const e = new ICAL.Event(ev);
            const fecha = e.startDate.toJSDate();

            if (fecha < ahora) return;

            if (!siguiente || fecha < siguiente.fecha) {

                siguiente = {
                    titulo: e.summary,
                    fecha: fecha,
                    lugar: e.location || "Por confirmar"
                };

            }

        });

        if (!siguiente) {

            nextMatch.innerHTML =
                "No hay partidos futuros.";

            return;
        }

        nextMatch.innerHTML = `
            <strong>${siguiente.titulo}</strong><br><br>
            📅 ${siguiente.fecha.toLocaleDateString("es-ES")}<br>
            📍 ${siguiente.lugar}
        `;

    } catch (e) {

        console.error(e);

        nextMatch.innerHTML = `
        <strong>ERROR</strong><br><br>
        ${e.message}
        `;

    }
}

cargarCalendario();
