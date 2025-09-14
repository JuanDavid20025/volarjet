(function(){
  const fmtCOP = new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 });

  function $(s, p=document){ return p.querySelector(s); }
  function $all(s, p=document){ return [...p.querySelectorAll(s)]; }
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }

  // Reglas de demo (puedes cambiarlas para la evidencia):
  // - Cambio fecha/hora: si es fin de semana = 60k; entre semana = 30k; si la nueva fecha es <= 7 días desde hoy = 90k
  function cargoCambioFecha(fechaStr){
    if (!fechaStr) return 0;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const sel = new Date(fechaStr + 'T00:00:00');
    const diffDias = Math.ceil((sel - hoy) / (1000*60*60*24));
    const esFinde = [0,6].includes(sel.getDay());
    if (diffDias <= 7) return 90000;
    return esFinde ? 60000 : 30000;
  }

  // - Cambio de asiento: std=0, ventana/pasillo=15k, salida=40k
  const cargoAsiento = { std:0, ventana:15000, pasillo:15000, salida:40000 };

  ready(() => {
    const form = $('#formModificar');
    const radios = $all('input[name="tipo"]', form);
    const sfFecha = $('#sf-fecha');
    const sfAsiento = $('#sf-asiento');
    const sfContacto = $('#sf-contacto');

    const vjCargo = $('#vjCargo');
    const vjMsg = $('#vjMsg');

    const nvFecha = $('#nvFecha');
    const nvHora = $('#nvHora');
    const btnDisp = $('#btnDisponibilidad');
    const msjDisp = $('#msjDisponibilidad');

    const prefAsiento = $('#prefAsiento');
    const seatMap = $('#seatMap');
    const msjAsiento = $('#msjAsiento');

    // Mostrar/ocultar subformularios
    function showSubform(tipo){
      sfFecha.hidden   = tipo !== 'fecha';
      sfAsiento.hidden = tipo !== 'asiento';
      sfContacto.hidden= tipo !== 'contacto';
      vjMsg.textContent = '';
      msjDisp.textContent = '';
      msjAsiento.textContent = '';
      actualizarCargo();
    }

    radios.forEach(r => r.addEventListener('change', () => showSubform(r.value)));

    const filas = 8, cols = 6; // columnas A-F
    const letras = ['A','B','C','D','E','F'];
    let asientoSeleccionado = null;

    function renderSeatMap(){
      seatMap.innerHTML = '';
      for (let f=1; f<=filas; f++){
        for (let c=0; c<cols; c++){
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'vj-seat';
          btn.textContent = f + letras[c];
          const disabled = (f===2 && (c===2||c===3)) || (f===5 && c===0);
          if (disabled) btn.disabled = true;

          btn.addEventListener('click', () => {
            $all('.vj-seat.selected', seatMap).forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            asientoSeleccionado = btn.textContent;
            msjAsiento.textContent = 'Asiento seleccionado: ' + asientoSeleccionado;
            msjAsiento.className = 'vj-msg success';
            actualizarCargo();
          });

          seatMap.appendChild(btn);
        }
      }
    }
    renderSeatMap();
    btnDisp.addEventListener('click', () => {
      if (!nvFecha.value || !nvHora.value){
        msjDisp.textContent = 'Selecciona fecha y hora.';
        msjDisp.className = 'vj-msg error';
        return;
      }
      // Simulación simple
      const cargo = cargoCambioFecha(nvFecha.value);
      msjDisp.textContent = 'Hay disponibilidad en la fecha/horario elegido.';
      msjDisp.className = 'vj-msg success';
      vjCargo.textContent = fmtCOP.format(cargo);
    });

    // Cambios que afectan cargo
    [nvFecha, nvHora].forEach(inp => inp.addEventListener('change', actualizarCargo));
    prefAsiento.addEventListener('change', actualizarCargo);

    function actualizarCargo(){
      const tipo = (radios.find(r => r.checked) || {}).value;
      let cargo = 0;

      if (tipo === 'fecha'){
        cargo = cargoCambioFecha(nvFecha.value || '');
      } else if (tipo === 'asiento'){
        cargo = cargoAsiento[prefAsiento.value] || 0;
        // si eligió salida de emergencia, requerir asiento marcado en filas 1–2 (demo)
        if (prefAsiento.value === 'salida' && asientoSeleccionado && !/^2[ABCDEF]$/.test(asientoSeleccionado)){
          msjAsiento.textContent = 'Para salida de emergencia, selecciona fila 2.';
          msjAsiento.className = 'vj-msg error';
        }
      } else if (tipo === 'contacto'){
        cargo = 0;
      }
      vjCargo.textContent = fmtCOP.format(cargo);
      return cargo;
    }

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const tipo = (radios.find(r => r.checked) || {}).value;
      if (!tipo){
        vjMsg.textContent = 'Selecciona un tipo de modificación.';
        vjMsg.className = 'vj-msg error';
        return;
      }

      if (tipo === 'fecha'){
        if (!nvFecha.value || !nvHora.value){
          vjMsg.textContent = 'Completa fecha y hora.';
          vjMsg.className = 'vj-msg error';
          return;
        }
      } else if (tipo === 'asiento'){
        if (!asientoSeleccionado){
          vjMsg.textContent = 'Selecciona un asiento.';
          vjMsg.className = 'vj-msg error';
          return;
        }
      } else if (tipo === 'contacto'){
        const email = $('#ctEmail').value.trim();
        const tel = $('#ctTelefono').value.trim();
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isEmail || !tel){
          vjMsg.textContent = 'Verifica correo y teléfono.';
          vjMsg.className = 'vj-msg error';
          return;
        }
      }

      const cargo = actualizarCargo();
      vjMsg.textContent = 'Modificación registrada. Posible cargo: ' + fmtCOP.format(cargo);
      vjMsg.className = 'vj-msg success';

    });
  });
})();
