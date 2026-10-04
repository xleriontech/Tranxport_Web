# Tranxport — Contexto del Proyecto

> Archivo de contexto para agentes/IA y desarrolladores. Resume visión, operación actual, reglas técnicas y próximos pasos. Fuente: manual completo del fundador.

## 1. Visión general

**Tranxport** es un servicio de mensajería y domicilios en moto para la provincia de Gualivá/Rionegro: **La Vega, Nocaima, Nimaima, Supatá, San Francisco (Cundinamarca)**.
- Operación: solopreneur con infraestructura profesional.
- Propuesta de valor: "Tu envío, en manos seguras y a tiempo" — trazabilidad, foto de entrega y comprobante digital.
- Estrategia: mensajería (NO mototaxi), clientes B2B (farmacias, ferreterías, restaurantes) + B2C.

## 2. Contacto y operación

- **WhatsApp:** +57 322 255 0163 (`573222550163` en código)
- **Email:** tranxportx@gmail.com
- **Horarios:** Lun–Sáb 7AM–7PM, Dom 8AM–2PM (recargo +20%)
- **Formulario pedidos:** Google Forms (17 campos, link corto `bit.ly/PedidoTranxport` — TODO: pegar URL real)
- **Hoja:** "Tranxport - Pedidos B2B" (Google Sheets = base de datos)

## 3. Módulos

### M1 — Formulario de pedidos (OPERATIVO)
17 campos: nombre comercio, contacto, WhatsApp, tipo cliente, descripción paquete, dirección origen/destino, municipios origen/destino, destinatario, cuándo, fecha programada, tipo servicio, valor mercancía, método pago, observaciones + email auto + multirespuesta.

### M2 — Automatización notificaciones (OPERATIVO, Apps Script v3.0)
- Trigger: `onFormSubmit` → "De la hoja de cálculo" → "Al enviarse el formulario".
- Envía correo detallado + WhatsApp vía CallMeBot al `573222550163`.
- Lee por índice de columna (¡frágil!): [15]=email, [17]=comercio, [18]=descripción, [19]=dir destino, [2]=contacto, [3]=WhatsApp, [4]=tipo cliente, [5]=dir origen, [6]=muni origen, [7]=muni destino, [8]=destinatario, [9]=cuándo, [10]=fecha programada, [11]=tipo servicio, [12]=valor, [13]=método pago, [14]=observaciones.
- **Regla IA:** si se agregan/quitan columnas, actualizar índices. Probar con formulario real.

### M3 — WhatsApp Business (OPERATIVO)
Bienvenida con menú 1-5 + respuestas rápidas: `1/tarifas`, `2/envio`, `3/rastrear`, `4/asesor`, `5/horarios`, `estado` (plantilla TRX-XXX), `formulario`.
Plantilla estado:
```
*ACTUALIZACIÓN DE PEDIDO TRANXPORT*
Hola [Nombre]... 🔢 Código: TRX-XXX 📍 Estado: [...] ⏰ Detalle: [...] 📝 Nota: [...]
```

### M4 — Google Sheets (OPERATIVO)
Cols 0-15 formulario, 16 reservada, 17-19 adicionales, 20=Estado (Pendiente/En ruta/Entregado), 21=Tarifa Cobrada, 22=Método pago, 23=Foto entrega (URL Drive), 24=Código Rastreo (TRX-001...), 25=Notas Entrega.
Flujo diario: revisar nuevos → asignar TRX → Pendiente→En ruta→Entregado → registrar tarifa/pago → subir foto.

### M5 — Rastreo web (EN TRANSICIÓN)
- Google Sites bloquea Apps Script por `X-Frame-Options`.
- **Activo:** Nivel 1 WhatsApp manual.
- **Futuro:** API JSON (Apps Script `doGet?q=`) + página estática en Netlify. Ver `/site/index.html` (fusión model1+model2).
- Contrato API esperado: `GET {API_URL}?q=TRX-001` → `{codigo, cliente, destino, fecha, estado}` o `[{...}]` o `{error}`. Sin headers extra (evitar preflight).

### M6 — Tarifario (DEFINIDO — mostrar en web)
- Casco urbano ≤5kg: $6.000 | Mediano/grande/frágil: $8.000
- **Casco urbano Nocaima: $7.000 (pequeño) / $8.000 (grande)** — única excepción al urbano estándar.
- La Vega ↔ Nocaima/Nimaima: $10.000–$12.000
- Supatá/San Francisco ↔ La Vega/Nocaima: $12.000–$15.000
- Veredas: base + $2.000 / cada 2km
- Recargos: compra por encargo +10% (mín $3.000), espera >10min +$2.000, dom/fest +20%.
- **Distancias por carretera** (`DIST_KM` en `index.html`, calcularruta 2026): Vega–Nocaima 11, Vega–Nimaima 21, Vega–Supatá ~27, Vega–SF 12, Nocaima–Nimaima 10, Nocaima–Supatá ~22*, Nocaima–SF ~18*, Nimaima–Supatá 38, Nimaima–SF 31, Supatá–SF 19 (*estimados, verificar en campo). El cotizador las muestra auto; el usuario solo pone km EXTRA de vereda.

### M7 — Marca
Nombre Tranxport, slogan citado, azul `#1a3a52`, ámbar `#f39c12`, fondo `#f4f4f4`. Logo T blanca sobre azul. Equipamiento: chaleco, caja rígida, casco cerrado.
- **Logo real:** `SitesModels/TranxportLogo.eps` (Illustrator, no usable en web) → extraído a `site/logo-color.png` (azul/transparente, fondos claros: footer) y `site/logo-blanco.png` (blanco/transparente, fondos oscuros: header, CTA) con `SitesModels/extraer-logo.py`. Favicon: X del logo en azul navy redondeado (`site/favicon.ico/.png`, `apple-touch-icon.png`, generados con `SitesModels/crear-favicon.py`). Wordmark "TRANXPORT" con X bicolor; tagline del arte ("ENTREGA DE PAQUETES | LOGISTICA GLOBAL") no se usa (el slogan oficial es el citado arriba).

### M8 — Presencia digital (PARCIAL)
✅ WA Business, formulario, notificaciones. ⬜ Google Business, Facebook, Instagram, Linktree, tarjetas QR.

## 4. Reglas para la IA / desarrollo web

1. Un solo archivo `index.html` (Tailwind CDN + Lucide + CSS propio). Funcionar con `API_URL` demo y real.
2. No inventar datos reales cuando `API_URL` está configurada; solo demo si es placeholder.
3. Búsqueda: por código exacto (TRX-001, insensible a mayúsculas) O por nombre/cliente/destino (insensible a tildes). Soportar `?q=` deep-link para WhatsApp.
4. Estados canónicos: Pendiente (ámbar), En ruta (azul), Entregado (verde). Aclarar "no es GPS en vivo, lo actualiza el mensajero".
5. WhatsApp links: `https://wa.me/573222550163?text=...` con `encodeURIComponent`.
6. Municipios válidos: La Vega, Nocaima, Nimaima, Supatá, San Francisco. Mapa esquemático (no a escala).
7. Accesibilidad: `aria-live`, foco visible, `prefers-reduced-motion`, `noscript`, print limpio.
8. No romper: trigger Apps Script, índices de columnas, formato TRX-XXX, pesos COP.

## 5. Sitio fusionado (`/site/`)

- `index.html` (público): rastreador + tarifas + **cotizador con pedido web** + cobertura con mapa reactivo por estado + pasos + FAQ + CTA. Sin zona técnica.
- `tecnico.html` (privado, NO enlazado desde el público): guía fundador (Code.gs + Netlify) tras puerta con contraseña (SHA-256 en `PASS_HASH`, sesión en `sessionStorage`, `noindex`). No es seguridad real contra quien lea el fuente — no guardar secretos ahí.

### M9 — Pedido web (OPERATIVO, verificado punta a punta con TRX-006)
- Sección `#cotizar`: calculadora en vivo (base por ruta + vereda + encargo + espera + dom/fest) + formulario que hace POST (iframe oculto) al `/exec` (`doPost`).
- `doPost` agrega la fila en el orden 0-25 del formulario, asigna **TRX auto** (siguiente consecutivo de col 24), pone Estado=Pendiente y reutiliza `notificarPedido` (correo + WhatsApp). El WhatsApp de quien recibe (`telDest`, opcional) se guarda junto al destinatario en col 8.
- Tras enviar, el sitio consulta `?q={folio}` (doGet también matchea WhatsApp y notas [25]) y muestra el código TRX al cliente.
- **Nota:** `bit.ly/PedidoTranxport` devuelve 404 (no existe); el pedido web lo reemplaza. Si se crea el corto, úsese solo como alternativa al formulario clásico.
Fusión de `SitesModels/tranxport-order-model1` (lógica robusta: multi-resultado, normalización con tildes, mapa SVG interactivo, manejo CORS/offline detallado, SEO+JSON-LD) + `tranxport-order-model2` (marketing completo: header sticky, hero, stats, pasos, cobertura cards, FAQ, CTA, toast, share API).
Agregado desde manual: sección Tarifas + Horarios + CTA cotizar.

## 6. Próximos pasos

- **Ya:** 10 comercios B2B, 3 envíos prueba, comprobante digital Canva.
- **2 sem:** Google Business, FB/IG, grupos locales, tarjetas QR al formulario.
- **1-3 meses:** evaluar rastreo web Netlify, ManyChat botones, base clientes recurrentes, optimizador rutas.
- **Checklist:** ver manual original (10/15 completados).

## 7. Config a reemplazar al publicar

- `API_URL` = `https://script.google.com/macros/s/AKfycbzTPyJJYUM2XLayoyB-Y8hEf-GR78Q6xoUYmKYd1xFU2grcjYXfTTr8_CMWXpB2iqUr7g/exec` (✅ operativa con `doPost` v4.0; la anterior `...3PJgosGg` quedó sin `doPost`).
- `WHATSAPP_NUMBER = "573222550163"`.
- Formulario real, OG image propia, Netlify Drop con `index.html`.
