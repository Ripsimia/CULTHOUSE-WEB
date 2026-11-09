/* Ventana con formulario: el botón principal de las páginas de servicios
   («Cuéntanos tu curso», «Cuéntanos tu evento»…) abre este formulario en vez del programa de correo.
   Envío: Web3Forms y FormSubmit a la vez (basta con que llegue uno). Si los dos fallan, aviso con WhatsApp y email ya escritos.
   Al enviarse bien, lleva a gracias.html (que cuenta la conversión de Google Ads). */
(function () {
  if (!window.HTMLDialogElement) return;
  var botones = document.querySelectorAll('a.btn-lleno[href^="mailto:"]');
  if (!botones.length) return;

  var css = document.createElement('style');
  css.textContent =
    '.ventana-form{border:1px solid var(--tinta);background:var(--papel);color:var(--tinta);padding:clamp(22px,4vw,36px);width:min(520px,92vw);max-height:92vh;overflow:auto}' +
    '.ventana-form::backdrop{background:rgba(10,10,9,.6)}' +
    '.ventana-form .cerrar-form{position:absolute;top:10px;right:12px;background:none;border:0;color:var(--tinta);font-size:26px;line-height:1;padding:4px 8px;cursor:pointer}' +
    '.ventana-form .cerrar-form:hover{background:none;color:var(--luz)}' +
    '.ventana-form form{display:grid;gap:10px;margin:0}' +
    '.ventana-form h3{margin:0;font-family:var(--display);font-weight:500;text-transform:uppercase;font-size:clamp(26px,4vw,34px);line-height:1;padding-right:34px}' +
    '.ventana-form .sub{margin:0 0 6px;font-size:14px;color:var(--gris)}' +
    '.ventana-form input,.ventana-form textarea{width:100%;font:inherit;font-size:15px;color:var(--tinta);background:var(--tarjeta);border:1px solid var(--linea);padding:12px 14px;border-radius:0;resize:vertical;box-sizing:border-box}' +
    '.ventana-form input:focus,.ventana-form textarea:focus{border-color:var(--tinta);outline:none}' +
    '.ventana-form button[type=submit]{font:inherit;font-weight:500;font-size:15px;background:var(--tinta);color:var(--papel);border:0;padding:14px;cursor:pointer}' +
    '.ventana-form button[type=submit]:hover{background:var(--luz);color:#161512}' +
    '.ventana-form .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}' +
    '.ventana-form .acepto{margin:2px 0 0;font-size:12px;color:var(--gris)}' +
    '.ventana-form .acepto a{color:inherit}' +
    '.ventana-form .aviso-form{display:grid;gap:10px;padding:14px;border:1px solid var(--tinta)}' +
    '.ventana-form .aviso-form[hidden]{display:none}' +
    '.ventana-form .aviso-form p{margin:0;font-size:14px}';
  document.head.appendChild(css);

  var d = document.createElement('dialog');
  d.className = 'ventana-form';
  d.setAttribute('aria-labelledby', 'vf-titulo');
  d.innerHTML =
    '<button type="button" class="cerrar-form" aria-label="Cerrar">×</button>' +
    '<form id="vf-form" novalidate>' +
      '<h3 id="vf-titulo">Cuéntanos tu proyecto</h3>' +
      '<p class="sub">Te respondemos el mismo día.</p>' +
      '<input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">' +
      '<label for="vf-nombre" class="sr">Nombre</label>' +
      '<input id="vf-nombre" name="nombre" placeholder="Nombre" autocomplete="name" required>' +
      '<label for="vf-contacto" class="sr">Email o teléfono</label>' +
      '<input id="vf-contacto" name="contacto" placeholder="Email o teléfono" required>' +
      '<label for="vf-msg" class="sr">Mensaje</label>' +
      '<textarea id="vf-msg" name="mensaje" rows="4" placeholder="Qué necesitas, para cuándo" required></textarea>' +
      '<button type="submit" id="vf-enviar">Enviar mensaje</button>' +
      '<p class="acepto">Al enviar, aceptas la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</p>' +
      '<div class="aviso-form" id="vf-aviso" hidden>' +
        '<p>No hemos podido enviar el formulario. A veces algunas conexiones bloquean el servicio de envío durante un rato.</p>' +
        '<a class="btn btn-lleno" id="vf-wa" href="https://wa.me/34651129062" target="_blank" rel="noopener">Enviarlo por WhatsApp</a>' +
        '<p>O mándalo por email a <a id="vf-mail" href="mailto:hey@culthouse.art">hey@culthouse.art</a></p>' +
      '</div>' +
    '</form>';
  document.body.appendChild(d);

  var titulo = d.querySelector('#vf-titulo'), form = d.querySelector('#vf-form');
  var servicio = (document.title || '').split('|')[0].trim();

  // Captura: se adelanta al contador de clics en email, para no contar como contacto algo que aún no lo es
  window.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.btn-lleno[href^="mailto:"]');
    if (!a || d.contains(a)) return;
    e.preventDefault(); e.stopPropagation();
    titulo.textContent = (a.textContent || 'Cuéntanos tu proyecto').trim();
    d.showModal();
    setTimeout(function () { d.querySelector('#vf-nombre').focus(); }, 50);
    if (window.clarity) window.clarity('event', 'formulario_abierto');
  }, true);

  d.addEventListener('click', function (e) {
    if (e.target === d || e.target.closest('.cerrar-form')) d.close();
  });

  var W3K = '4a0cc235-3262-4246-9ce2-845c9b6b265b';
  var envia = function (url, body) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
    return fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' }, body: body, keepalive: true, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { clearTimeout(t); return r.ok && String(j.success) === 'true'; }); })
      .catch(function () { clearTimeout(t); return false; });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    var fd = new FormData(form);
    if (fd.get('_honey')) return;
    var btn = d.querySelector('#vf-enviar'), aviso = d.querySelector('#vf-aviso');
    var asunto = 'Nuevo mensaje desde la web: ' + servicio;
    var texto = 'Hola, soy ' + (fd.get('nombre') || '') + ' (' + (fd.get('contacto') || '') + '). ' + (fd.get('mensaje') || '');
    d.querySelector('#vf-wa').href = 'https://wa.me/34651129062?text=' + encodeURIComponent(texto);
    d.querySelector('#vf-mail').href = 'mailto:hey@culthouse.art?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(texto);
    btn.disabled = true; btn.textContent = 'Enviando…'; aviso.hidden = true;

    var w3 = new FormData();
    w3.append('access_key', W3K);
    w3.append('subject', asunto);
    w3.append('from_name', 'Web CULTHOUSE');
    w3.append('Nombre', fd.get('nombre') || ''); w3.append('Contacto', fd.get('contacto') || ''); w3.append('Mensaje', fd.get('mensaje') || '');
    w3.append('Página', location.href);

    var fs = new FormData();
    fs.append('_subject', asunto); fs.append('_template', 'table'); fs.append('_cc', 'sima@culthouse.art');
    fs.append('nombre', fd.get('nombre') || ''); fs.append('contacto', fd.get('contacto') || ''); fs.append('mensaje', fd.get('mensaje') || '');
    fs.append('pagina', location.href);

    // Basta con que llegue uno: en cuanto uno responde bien, seguimos (keepalive deja terminar al otro)
    var unoBasta = function (ps) { return new Promise(function (res) { var n = ps.length; ps.forEach(function (p) { p.then(function (ok) { if (ok) res(true); else if (--n === 0) res(false); }); }); }); };
    unoBasta([envia('https://api.web3forms.com/submit', w3), envia('https://formsubmit.co/ajax/hey@culthouse.art', fs)])
      .then(function (ok) {
        if (ok) { if (window.clarity) window.clarity('event', 'formulario_enviado'); location.href = 'gracias.html'; return; }
        if (window.clarity) window.clarity('event', 'formulario_error');
        btn.disabled = false; btn.textContent = 'Enviar mensaje'; aviso.hidden = false;
      });
  });
})();
