/**
 * TRANXPORT - Script completo (notificaciones + API rastreo + pedidos web)
 * Versión: 4.1 - Octubre 2026 (pedido web guarda WhatsApp de quien recibe en [8])
 *
 * INSTALACIÓN:
 * 1. Pega todo este archivo en Extensiones → Apps Script (reemplaza lo anterior).
 * 2. Pon tu API_KEY de CallMeBot donde se indica.
 * 3. Trigger: Activadores → onFormSubmit → "De la hoja de cálculo" → "Al enviarse el formulario".
 * 4. Implementar → Gestionar implementación → Versión NUEVA → App web → Ejecutar como: Yo → Acceso: Cualquier persona.
 *
 * ENDPOINTS (misma URL /exec):
 * - GET  ?q=TRX-001   → {codigo, cliente, destino, fecha, estado} (rastreador)
 * - POST (formulario) → crea la fila del pedido + notifica (sección Cotizar del sitio)
 */

var EMAIL_TRANXPORT = "tranxportx@gmail.com";
var PHONE_TRANXPORT = "573222550163";
var CALLMEBOT_KEY = "TU_API_KEY_CALLMEBOT"; // ← pon tu apikey aquí

/* ================= NOTIFICACIONES (compartido) ================= */

function notificarPedido(o) {
  var cuerpo = ""
    + "🏍️ <b>NUEVO PEDIDO TRANXPORT" + (o.canal === "Web" ? " (WEB)" : "") + "</b>"
    + (o.codigo ? "<br>🔢 <b>Código:</b> " + o.codigo : "")
    + "<br><br><b>CLIENTE</b>"
    + "<br>• Comercio: " + o.comercio
    + "<br>• Contacto: " + o.contacto
    + "<br>• WhatsApp: " + o.whatsapp
    + "<br>• Tipo: " + o.tipo
    + "<br>• Email: " + o.email
    + "<br><br><b>DESCRIPCIÓN DEL PAQUETE</b>"
    + "<br>• " + o.descripcion
    + "<br><br><b>📍 RUTA</b>"
    + "<br>• Origen: " + o.dirOrigen + ", " + o.muniOrigen
    + "<br>• Destino: " + o.dirDestino + ", " + o.muniDestino
    + "<br>• Destinatario: " + o.destinatario
    + "<br><br><b>LOGÍSTICA</b>"
    + "<br>• Cuándo: " + o.cuando
    + "<br>• Fecha programada: " + o.fecha
    + "<br>• Tipo de servicio: " + o.servicio
    + "<br>• Valor mercancía: " + o.valor
    + (o.tarifa ? "<br>• Tarifa estimada web: $" + o.tarifa : "")
    + "<br><br><b>💰 PAGO</b>"
    + "<br>• Método: " + o.pago
    + "<br><br><b>📝 OBSERVACIONES:</b><br>" + o.obs
    + "<br><br><i>— Tranxport | Mensajería y Domicilios | +57 322 255 0163</i>";

  MailApp.sendEmail(EMAIL_TRANXPORT, "🏍️ Nuevo Pedido Tranxport - " + o.comercio, "", { htmlBody: cuerpo });
  Logger.log("✅ Correo enviado a " + EMAIL_TRANXPORT);

  var msg = "🏍️ *NUEVO PEDIDO TRANXPORT" + (o.canal === "Web" ? " (WEB)*" : "*") + "\n\n"
    + (o.codigo ? "🔢 *Código:* " + o.codigo + "\n" : "")
    + "🏪 *Comercio:* " + o.comercio + "\n"
    + "📞 *Contacto:* " + o.contacto + "\n"
    + "📱 *WhatsApp:* " + o.whatsapp + "\n"
    + "📦 *Paquete:* " + o.descripcion + "\n"
    + "📍 *Ruta:* " + o.muniOrigen + " → " + o.muniDestino + "\n"
    + "🏠 *Destino:* " + o.dirDestino + "\n"
    + "⏰ *Cuándo:* " + o.cuando + "\n"
    + "🛵 *Servicio:* " + o.servicio + "\n"
    + "💰 *Pago:* " + o.pago
    + (o.tarifa ? "\n💵 *Estimado:* $" + o.tarifa : "");

  try {
    UrlFetchApp.fetch("https://api.callmebot.com/whatsapp.php?phone=" + PHONE_TRANXPORT
      + "&text=" + encodeURIComponent(msg) + "&apikey=" + CALLMEBOT_KEY);
    Logger.log("✅ WhatsApp enviado");
  } catch (error) {
    Logger.log("❌ Error WhatsApp: " + error.toString());
  }
}

/* ================= TRIGGER FORMULARIO ================= */

function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data;
  if (!e || !e.range) {
    Logger.log("⚠️ Ejecución manual - usando última fila con datos como prueba");
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) { Logger.log("❌ Sin datos para probar"); return; }
    data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("📋 Probando con fila " + lastRow + " (" + data.length + " columnas)");
  } else {
    var row = e.range.getRow();
    data = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("📋 Leyendo fila " + row + " con " + data.length + " columnas");
  }

  notificarPedido({
    canal: "Forms",
    email:        data[15] || "No especificado",
    comercio:     data[17] || "No especificado",
    descripcion:  data[18] || "No especificado",
    dirDestino:   data[19] || "No especificado",
    contacto:     data[2]  || "No especificado",
    whatsapp:     data[3]  || "No especificado",
    tipo:         data[4]  || "No especificado",
    dirOrigen:    data[5]  || "No especificado",
    muniOrigen:   data[6]  || "No especificado",
    muniDestino:  data[7]  || "No especificado",
    destinatario: data[8]  || "No especificado",
    cuando:       data[9]  || "No especificado",
    fecha:        data[10] || "No especificada",
    servicio:     data[11] || "No especificado",
    valor:        data[12] || "No especificado",
    pago:         data[13] || "No especificado",
    obs:          data[14] || "Sin observaciones",
    codigo:       data[24] || "",
    tarifa:       data[21] || ""
  });
}

/* ================= PEDIDOS DESDE LA WEB (doPost) ================= */

function siguienteCodigo(sheet) {
  var vals = sheet.getRange(2, 25, Math.max(1, sheet.getLastRow() - 1), 1).getValues();
  var max = 0;
  for (var i = 0; i < vals.length; i++) {
    var m = String(vals[i][0] || "").match(/^TRX-(\d+)$/i);
    if (m && +m[1] > max) max = +m[1];
  }
  var n = max + 1;
  return "TRX-" + ("00" + n).slice(-3);
}

function fechaCelda(s) {
  var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : String(s || "").trim();
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var get = function (k) { return (p[k] != null ? String(p[k]) : "").trim(); };
    var contacto = get("contacto"), whatsapp = get("whatsapp"),
        dirO = get("dirO"), dirD = get("dirD"), desc = get("desc");
    if (!contacto || !whatsapp || !dirO || !dirD || !desc) {
      return json({ ok: false, error: "Faltan campos obligatorios" });
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var codigo = siguienteCodigo(sheet);
    var comercio = get("comercio") || contacto;
    var folio = get("folio");
    var telDest = get("telDest");
    var quienRecibe = get("destinatario") + (telDest ? " — " + telDest : "");
    // Orden de columnas 0-25 (igual que el formulario):
    // 0 fecha/hora, 2 contacto, 3 whatsapp, 4 tipo, 5 dir origen, 6 muni origen,
    // 7 muni destino, 8 destinatario, 9 cuándo, 10 fecha, 11 servicio, 12 valor,
    // 13 pago, 14 obs, 15 email, 17 comercio, 18 descripción, 19 dir destino,
    // 20 estado, 21 tarifa, 24 código, 25 notas. (1,16,22,23 reservadas)
    sheet.appendRow([
      new Date(), "", contacto, whatsapp, "Web",
      dirO, get("muniO"), get("muniD"), quienRecibe,
      get("cuando") || "Hoy mismo", fechaCelda(get("fecha")),
      get("servicio") || "Mensajería web", get("valor"),
      get("pago"), get("obs"), get("email"),
      "", comercio, desc, dirD,
      "Pendiente", get("tarifa"), "", "", codigo,
      folio ? ("Pedido web " + folio) : "Pedido web"
    ]);
    Logger.log("✅ Pedido web guardado con " + codigo);
    notificarPedido({
      canal: "Web", codigo: codigo, tarifa: get("tarifa"),
      email: get("email") || "No especificado", comercio: comercio,
      descripcion: desc, dirDestino: dirD, contacto: contacto,
      whatsapp: whatsapp, tipo: "Web", dirOrigen: dirO,
      muniOrigen: get("muniO") || "No especificado",
      muniDestino: get("muniD") || "No especificado",
      destinatario: quienRecibe || "No especificado",
      cuando: get("cuando") || "Hoy mismo",
      fecha: get("fecha") || "Hoy", servicio: get("servicio") || "Mensajería web",
      valor: get("valor") || "No especificado", pago: get("pago") || "No especificado",
      obs: (get("obs") || "Sin observaciones") + (folio ? " [" + folio + "]" : "")
    });
    return json({ ok: true, codigo: codigo });
  } catch (err) {
    Logger.log("❌ Error doPost: " + err.toString());
    return json({ ok: false, error: String(err) });
  }
}

/* ================= RASTREADOR (doGet) ================= */

function doGet(e) {
  var q = (e && e.parameter && e.parameter.q ? e.parameter.q : "").toString().trim().toLowerCase();
  var qd = q.replace(/\D/g, "");
  var esFolio = q.indexOf("web-") === 0;
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var rows = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var codigo = String(r[24] || "").trim();
    var cliente = String(r[17] || r[2] || "").trim();
    var muni = String(r[7] || "").trim();
    var dir = String(r[19] || "").trim();
    var destino = muni + (muni && dir ? " — " + dir : dir);
    var wa = String(r[3] || "").replace(/\D/g, "");
    var notas = String(r[25] || "");
    var f = r[10] || r[0] || "";
    var d = (f instanceof Date) ? f : new Date(f);
    var fecha = (!isNaN(d.getTime()))
      ? ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear()
      : String(f).trim();
    var estado = String(r[20] || "").trim();
    if (!codigo && !cliente) continue;
    if (!q || codigo.toLowerCase() === q ||
        cliente.toLowerCase().indexOf(q) !== -1 ||
        destino.toLowerCase().indexOf(q) !== -1 ||
        (qd.length >= 7 && !esFolio && wa && wa.indexOf(qd) !== -1) ||
        (q.length >= 5 && notas.toLowerCase().indexOf(q) !== -1)) {
      out.push({ codigo: codigo, cliente: cliente, destino: destino, fecha: fecha, estado: estado });
    }
  }
  var res = out.length === 1 ? out[0] : out.length > 1 ? out : { error: "Pedido no encontrado" };
  return json(res);
}
