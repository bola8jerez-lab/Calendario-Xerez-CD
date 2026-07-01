const WEBCAL_URL = "webcal://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";
const ICS_URL = "https://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";

const boton = document.getElementById("subscribeBtn");
const nextMatch = document.getElementById("nextMatch");

// ---------- BOTÓN ----------

boton.href = WEBCAL_URL;
boton.innerHTML = "📅 Añadir al calendario";

// ---------- CALENDARIO ----------

async function cargarCalendario() {

    nextMatch.innerHTML = "🔄 Buscando próximo partido...";

    try {

        const respuesta = await fetch(ICS_URL + "?t=" + Date.now());

        const texto = await respuesta.text();

        const jcal = ICAL.parse(texto);

        const comp = new ICAL.Component(jcal);

        const eventos = comp.getAllSubcomponents("vevent");

        const ahora = new Date();

        let proximo = null;

        eventos.forEach(ev => {

            const evento = new ICAL.Event(ev);

            const inicio = evento.startDate.toJSDate();

            if (inicio <= ahora) return;

            if (!proximo || inicio < proximo.fecha) {

                proximo = {

                    titulo: evento.summary,

                    fecha: inicio,

                    lugar: evento.location || ""

                };

            }

        });

        if (!proximo) {

            nextMatch.innerHTML =
                "📅 El calendario todavía no contiene partidos futuros.";

            return;

        }

        const diferencia = proximo.fecha - ahora;

        const dias = Math.floor(diferencia / 86400000);

        const horas = Math.floor((diferencia % 86400000) / 3600000);

        nextMatch.innerHTML = `

            <strong>${proximo.titulo}</strong>

            <br><br>

            📅 ${proximo.fecha.toLocaleDateString("es-ES",{

                weekday:"long",

                day:"numeric",

                month:"long"

            })}

            <br>

            🕒 ${proximo.fecha.toLocaleTimeString("es-ES",{

                hour:"2-digit",

                minute:"2-digit"

            })}

            ${proximo.lugar ? `<br>📍 ${proximo.lugar}` : ""}

            <br><br>

            ⏳ Faltan <strong>${dias}</strong> días y <strong>${horas}</strong> horas

        `;

    }

    catch(error){

        console.error(error);

        nextMatch.innerHTML =
        "⚠️ No se pudo leer el calendario.";

    }

}

cargarCalendario();
