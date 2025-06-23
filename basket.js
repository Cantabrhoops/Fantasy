// basket.js
(async function(){
  // —————— CONFIGURACIÓN ——————
  const COMP_ID = 1410;     // tu competición
  const PA_LIGA = 75;       // media de puntos encajados/juego
  const α = 0.8, β = 3;      // fórmula créditos

  // —————— FUNCIONES DE CÁLCULO ——————
  function calcEFF(p){
    const FGM = p.t2conv + p.t3conv;
    const FGA = p.t2int  + p.t3int;
    return p.puntos 
         - (FGA - FGM) 
         - (p.tlint - p.tlconv) 
         - p.faltas 
         + 0.1 * p.min;
  }
  function calcCredits(eff, paRival){
    const FD = PA_LIGA / paRival;
    const adj = eff * FD;
    return Math.min(15, Math.max(5, Math.round(α * adj + β)));
  }

  // —————— 1) Obtenemos los IDs de los partidos ——————
  let resp = await fetch(`https://www.fecanbaloncesto.com/competicion/?id=${COMP_ID}`);
  let txt  = await resp.text();
  let doc  = new DOMParser().parseFromString(txt, 'text/html');
  let ids  = Array.from(doc.querySelectorAll('a.estadisticas'))
                  .map(a => a.dataset.idpartido);

  // —————— 2) Creamos la tabla ——————
  const table = document.getElementById('tabla');
  for(let pid of ids){
    let data = await fetch(
      `https://www.fecanbaloncesto.com/services/estadisticas_partido.php?idPartido=${pid}`
    ).then(r=>r.json());

    // para cada equipo (local/visitante)…
    for(let side of ['local','visitante']){
      const paRival = side==='local' 
        ? data.marcadorVisitante 
        : data.marcadorLocal;

      for(let p of data[side]){
        const eff = calcEFF(p);
        const cred= calcCredits(eff, paRival);
        table.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${p.nombre}</td>
            <td>${p.min}</td>
            <td>${p.puntos}</td>
            <td>${cred}</td>
          </tr>`);
      }
    }
  }
})();
