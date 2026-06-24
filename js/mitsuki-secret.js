        // =====================================================
        // EL BOTÓN PROHIBIDO DE MITSUKI — Mini Novela Visual / Easter Egg
        // Requiere que lobby-logic.js (showToast) se cargue ANTES que este archivo.
        // =====================================================

        const MITSUKI_SHARE_URL = "https://cheatguysinfinity.netlify.app/";
        const MITSUKI_SHARE_TEXT = "¡Rompí la página de CheatGuys! por andar de curioso. Escanea el código o entra al arcade aquí: " + MITSUKI_SHARE_URL;

        let mitsukiPaso = 0;

        const mitsukiDialogo = [
            { img: "assets/pestana-1-mitsuki.webp", texto: "¡Te dije que no lo presionaras, niño baboso!" },
            { img: "assets/pestana-2-mitsuki.webp", texto: "Bueno, ya que estás aquí puedes compartir la página para que más personas lo vean, así tu curiosidad sirve de algo..." }
        ];

        // PASO 0 -> Abre la interfaz y arranca el diálogo desde el principio
        function iniciarSecuenciaMitsuki() {
            mitsukiPaso = 0;
            prepararBotonesCompartirMitsuki();
            mostrarPasoMitsuki();
            document.getElementById('mitsukiOverlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            if (typeof setFloatingUiHidden === 'function') setFloatingUiHidden(true);
        }

        function mostrarPasoMitsuki() {
            const paso = mitsukiDialogo[mitsukiPaso];
            const esUltimaPestana = mitsukiPaso === mitsukiDialogo.length - 1;

            document.getElementById('mitsukiIllustration').src = paso.img;
            document.getElementById('mitsukiText').textContent = paso.texto;
            document.getElementById('mitsukiStepCounter').textContent = "TAB " + String(mitsukiPaso + 1).padStart(2, '0') + "/02";
            document.getElementById('mitsukiShareButtons').style.display = esUltimaPestana ? 'flex' : 'none';
        }

        // Boton CONTINUAR -> avanza el guion o cierra al terminar la segunda pestana
        function avanzarMitsuki() {
            mitsukiPaso++;
            if (mitsukiPaso < mitsukiDialogo.length) {
                mostrarPasoMitsuki();
            } else {
                cerrarMitsuki();
            }
        }

        // Prepara los links para que aparezcan dentro de la segunda pestana
        function prepararBotonesCompartirMitsuki() {
            const textoCodificado = encodeURIComponent(MITSUKI_SHARE_TEXT);
            const urlCodificada = encodeURIComponent(MITSUKI_SHARE_URL);

            document.getElementById('mitsukiShareWA').href = "https://api.whatsapp.com/send?text=" + textoCodificado;
            document.getElementById('mitsukiShareFB').href = "https://www.facebook.com/sharer/sharer.php?u=" + urlCodificada + "&quote=" + textoCodificado;
            document.getElementById('mitsukiShareX').href = "https://twitter.com/intent/tweet?text=" + textoCodificado;
            document.getElementById('mitsukiShareDC').href = "https://discord.com/channels/@me";
        }

        // Discord no tiene un link de compartir universal: se abre Discord y se copia el texto.
        function compartirEnDiscord(event) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(MITSUKI_SHARE_TEXT)
                    .then(() => showToast('¡Copiado para Discord! Pégalo en tu chat.'))
                    .catch(() => copiarParaDiscordFallback());
            } else {
                copiarParaDiscordFallback();
            }
        }

        // Fallback para navegadores/contextos sin Clipboard API (ej. http sin SSL)
        function copiarParaDiscordFallback() {
            const textarea = document.createElement('textarea');
            textarea.value = MITSUKI_SHARE_TEXT;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('¡Copiado para Discord! Pégalo en tu chat.');
            } catch (err) {
                showToast('No se pudo copiar. Intenta manualmente.');
            }
            document.body.removeChild(textarea);
        }

        document.addEventListener('DOMContentLoaded', () => {
            const discordShare = document.getElementById('mitsukiShareDC');
            if (discordShare) {
                discordShare.addEventListener('click', compartirEnDiscord);
            }
        });

        function cerrarMitsuki(e) {
            if (e && e.target.id !== 'mitsukiOverlay') return;
            document.getElementById('mitsukiOverlay').style.display = 'none';
            document.body.style.overflow = 'auto';
            if (typeof actualizarUiFlotantePorOverlays === 'function') actualizarUiFlotantePorOverlays();
        }
