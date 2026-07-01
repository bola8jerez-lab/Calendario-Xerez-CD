const ICS_URL = "https://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";
const WEBCAL_URL = "webcal://bola8jerez-lab.github.io/Calendario-Xerez-CD/calendario.ics";

const boton = document.getElementById("subscribeBtn");
const nextMatch = document.getElementById("nextMatch");

boton.href = WEBCAL_URL;

async function cargarCalendario() {

    nextMatch.innerHTML = "🔄 Cargando calendario...";

    try {

        const respuesta = await fetch(ICS_URL + "?t=" + Date.now());

        if (!respuesta.ok) {
            throw new Error("No se pudo descargar el calendario.");
        }

        const texto = await respuesta.text();

        const eventos = [];

        const bloques = texto.split("BEGIN:VEVENT");

        for (let i = 1; i < bloques.length; i++) {

            const bloque = bloques[i];

            const resumen = obtenerCampo(bloque, "SUMMARY");
            const fecha = obtenerCampo(bloque, "DTSTART;VALUE=DATE") ||
                          obtenerCampo(bloque, "DTSTART");
            const lugar = obtenerCampo(bloque, "LOCATION");

            if (!fecha) continue;

            eventos.push({
                resumen,
                fecha,
                lugar
            });

        }

        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        let proximo = null;

        eventos.forEach(evento => {

            const fecha = convertirFecha(evento.fecha);

            if (!fecha) return;

            if (fecha < hoy) return;

            if (!proximo || fecha < proximo.fecha) {

                proximo = {

                    titulo: evento.resumen,
                    fecha: fecha,
                    lugar: evento.lugar || "Por confirmar"

                };

            }

        });

        if (!proximo) {

            nextMatch.innerHTML =
                "No hay partidos pendientes.";

            return;

        }

        const diferencia = proximo.fecha - hoy;

        const dias = Math.floor(diferencia / 86400000);

        nextMatch.innerHTML = `
            <strong>${proximo.titulo}</strong>

            <br><br>

            📅 ${proximo.fecha.toLocaleDateString("es-ES",{
                weekday:"long",
                day:"numeric",
                month:"long",
                year:"numeric"
            })}

            <br>

            📍 ${proximo.lugar}

            <br><br>

            ⏳ Faltan <strong>${dias}</strong> días
        `;

    }

    catch(error){

        console.error(error);

        nextMatch.innerHTML = `
        <strong>Error</strong><br><br>
        ${error.message}
        `;

    }

}

function obtenerCampo(texto, campo){

    const lineas = texto.split(/\r?\n/);

    for(const linea of lineas){

        if(linea.startsWith(campo + ":")){

            return linea.substring(campo.length + 1).trim();

        }

    }

    return "";

}

function convertirFecha(valor){

    if(!valor) return null;

    const limpia = valor.replace(/T.*/,"");

    if(limpia.length < 8) return null;

    return new Date(

        parseInt(limpia.substring(0,4)),
        parseInt(limpia.substring(4,6))-1,
        parseInt(limpia.substring(6,8))

    );

}

cargarCalendario();
