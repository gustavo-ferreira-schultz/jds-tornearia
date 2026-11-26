
/* ============================================================
   JDS TORNEARIA — CONFIGURAÇÕES
   ============================================================ */

const CONFIG = {
    whatsapp: "5551999999999",
    instagram: "jdstornearia",
    endereco: "Adicione o endereço da JDS Tornearia",
    intervaloSlides: 6000
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ============================================================
   WHATSAPP
   ============================================================ */

function whatsappLink(message) {
    const number = CONFIG.whatsapp.replace(/\D/g, "");
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}


    // Botão para tirar dúvidas pelo WhatsApp
    const doubtsButton = $("[data-wa-duvidas]");

    if (doubtsButton) {
        doubtsButton.href = whatsappLink(
            "Olá, JDS Tornearia! Estou com algumas dúvidas sobre os serviços de vocês. Poderiam me ajudar?"
        );

        doubtsButton.target = "_blank";
        doubtsButton.rel = "noopener noreferrer";
    }



/* ============================================================
   RODAPÉ E INFORMAÇÕES
   ============================================================ */

function configureFooter() {

    $$("[data-wa]").forEach((button) => {
        button.href = whatsappLink(
            "Olá, JDS Tornearia! Gostaria de pedir um orçamento."
        );

        button.target = "_blank";
        button.rel = "noopener noreferrer";
    });

    const instagram = (CONFIG.instagram || "")
        .replace(/^@/, "")
        .trim();

    const instagramLink = $("[data-ig]");

    if (instagramLink && instagram) {
        instagramLink.href = `https://instagram.com/${instagram}`;
    } else if (instagramLink) {
        instagramLink.hidden = true;
    }

    const address = (CONFIG.endereco || "").trim();

    const addressText = $("[data-endereco]");
    const addressLink = $("[data-mapa]");

    if (addressText) {
        addressText.textContent = address || "Endereço não informado";
    }

    if (
        addressLink &&
        address &&
        !address.toLowerCase().includes("adicione o endereço")
    ) {
        addressLink.href =
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    } else if (addressLink) {
        addressLink.removeAttribute("href");
        addressLink.classList.add("is-unconfigured");
    }


    if ($("#year")) {
        $("#year").textContent = new Date().getFullYear();
    }
}


/* ============================================================
   IMAGENS
   ============================================================ */

function setupImageFallbacks() {

    $$(".hero__slide img, .work-card__image img")
        .forEach((img) => {

            const markMissing = () => {
                img.classList.add("is-missing");
            };

            if (img.complete && img.naturalWidth === 0) {
                markMissing();
            } else {
                img.addEventListener("error", markMissing, {
                    once: true
                });
            }
        });
}


/* ============================================================
   CARROSSEL AUTOMÁTICO
   ============================================================ */

function setupSlider() {

    const hero = $(".hero");
    const slides = $$(".hero__slide");
    const dotsHost = $("#sliderDots");
    const currentLabel = $("#slideCurrent");

    if (!hero || slides.length < 2 || !dotsHost) return;

    let current = 0;
    let timer = null;
    let pointerStart = null;
    let isVisible = true;

    const dots = slides.map((_, index) => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "slider-dot";

        button.setAttribute(
            "aria-label",
            `Mostrar foto ${index + 1}`
        );

        button.addEventListener("click", () => {
            showSlide(index);
        });

        dotsHost.appendChild(button);

        return button;
    });


    function schedule() {

        window.clearTimeout(timer);

        if (reduceMotion || document.hidden || !isVisible) {
            return;
        }

        timer = window.setTimeout(() => {
            showSlide(current + 1);
        }, CONFIG.intervaloSlides);
    }


    function showSlide(index) {

        current = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === current);
        });

        dots.forEach((dot, i) => {

            dot.classList.toggle("is-active", i === current);

            dot.setAttribute(
                "aria-current",
                i === current ? "true" : "false"
            );
        });

        if (currentLabel) {
            currentLabel.textContent =
                String(current + 1).padStart(2, "0");
        }

        schedule();
    }


    /* Deslizar no celular */

    hero.addEventListener("pointerdown", (event) => {

        if (event.target.closest("a, button")) return;

        pointerStart = {
            x: event.clientX,
            y: event.clientY
        };
    });


    hero.addEventListener("pointerup", (event) => {

        if (!pointerStart) return;

        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;

        if (
            Math.abs(dx) > 45 &&
            Math.abs(dx) > Math.abs(dy)
        ) {
            showSlide(current + (dx < 0 ? 1 : -1));
        }

        pointerStart = null;
    });


    hero.addEventListener("pointercancel", () => {
        pointerStart = null;
    });


    /* Efeito do mouse */

    hero.addEventListener("pointermove", (event) => {

        if (event.pointerType !== "mouse") return;

        const rect = hero.getBoundingClientRect();

        hero.style.setProperty(
            "--pointer-x",
            `${event.clientX - rect.left}px`
        );

        hero.style.setProperty(
            "--pointer-y",
            `${event.clientY - rect.top}px`
        );

        hero.classList.add("is-pointer");
    });


    hero.addEventListener("pointerleave", () => {
        hero.classList.remove("is-pointer");
    });


    document.addEventListener("visibilitychange", schedule);


    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(([entry]) => {

            isVisible = entry.isIntersecting;
            schedule();

        }, {
            threshold: 0.12
        });

        observer.observe(hero);
    }

    showSlide(0);
}


/* ============================================================
   ANIMAÇÕES AO ROLAR A PÁGINA
   ============================================================ */

function setupReveal() {

    const elements = $$(".reveal");

    if (
        reduceMotion ||
        !("IntersectionObserver" in window)
    ) {
        elements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const observer = new IntersectionObserver((entries) => {

        entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");

            observer.unobserve(entry.target);
        });

    }, {
        threshold: 0.13
    });

    elements.forEach((element) => {
        observer.observe(element);
    });
}


/* ============================================================
   FORMULÁRIO DE ORÇAMENTO
   ============================================================ */

function setupQuoteForm() {

    const form = $("#quoteForm");
    const fileInput = $("#arquivo");
    const dropArea = $("#fileDrop");
    const selectedBox = $("#fileSelected");
    const fileName = $("#fileName");
    const fileType = $("#fileType");
    const feedback = $("#formFeedback");

    if (!form || !fileInput || !feedback) return;

    let selectedFile = null;


    function setFeedback(message, isError = false) {

        feedback.textContent = message;

        feedback.classList.toggle("is-error", isError);
    }


    function clearFile() {

        selectedFile = null;
        fileInput.value = "";

        if (selectedBox) {
            selectedBox.hidden = true;
        }

        setFeedback(
            "Ao continuar, o WhatsApp será aberto com os dados do seu pedido."
        );
    }


    function useFile(file) {

        if (!file) return;

        const validType = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ].includes(file.type);

        if (!validType) {

            clearFile();

            setFeedback(
                "Formato não aceito. Escolha JPG, PNG, WEBP ou PDF.",
                true
            );

            return;
        }

        if (file.size > MAX_FILE_SIZE) {

            clearFile();

            setFeedback(
                "O arquivo ultrapassa 10 MB. Escolha um arquivo menor.",
                true
            );

            return;
        }

        selectedFile = file;

        if (fileName) fileName.textContent = file.name;

        if (fileType) {
            fileType.textContent =
                file.type === "application/pdf" ? "PDF" : "IMG";
        }

        if (selectedBox) {
            selectedBox.hidden = false;
        }

        setFeedback(
            "Arquivo selecionado. Ele poderá ser compartilhado junto com o pedido em aparelhos compatíveis."
        );
    }


    fileInput.addEventListener("change", () => {

        useFile(
            fileInput.files && fileInput.files[0]
        );
    });


    const removeFile = $("#removeFile");

    if (removeFile) {
        removeFile.addEventListener("click", clearFile);
    }


    if (dropArea) {

        ["dragenter", "dragover"].forEach((eventName) => {

            dropArea.addEventListener(eventName, (event) => {

                event.preventDefault();

                dropArea.classList.add("is-dragging");
            });
        });


        ["dragleave", "drop"].forEach((eventName) => {

            dropArea.addEventListener(eventName, (event) => {

                event.preventDefault();

                dropArea.classList.remove("is-dragging");
            });
        });


        dropArea.addEventListener("drop", (event) => {

            const file =
                event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files[0];

            if (!file) return;

            try {
                fileInput.files = event.dataTransfer.files;
            } catch (_) {}

            useFile(file);
        });
    }


    /* Enviar orçamento */

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = $("#nome")?.value.trim() || "";
        const phone = $("#telefone")?.value.trim() || "";

        if (!name) {

            setFeedback(
                "Informe seu nome para continuar.",
                true
            );

            $("#nome")?.focus();

            return;
        }


        if (!phone) {

            setFeedback(
                "Informe seu telefone para que a JDS possa retornar.",
                true
            );

            $("#telefone")?.focus();

            return;
        }


        const details =
            $("#detalhes")?.value.trim() || "";

        const service =
            $("#servico")?.value || "Não informado";

        const quantity =
            $("#quantidade")?.value.trim() || "";

        const material =
            $("#material")?.value || "";


        const messageLines = [

            "Olá, JDS Tornearia! Gostaria de solicitar um orçamento.",

            "",

            `Nome: ${name}`,

            `Telefone: ${phone}`,

            `Serviço: ${service}`

        ];


        if (quantity) {
            messageLines.push(`Quantidade: ${quantity}`);
        }

        if (material) {
            messageLines.push(`Material: ${material}`);
        }

        if (details) {
            messageLines.push(`Detalhes: ${details}`);
        }

        if (selectedFile) {
            messageLines.push(
                `Arquivo selecionado: ${selectedFile.name}`
            );
        }

        messageLines.push(
            "",
            "Pode avaliar meu pedido, por favor?"
        );


        const message = messageLines.join("\n");


        /* Compartilhamento de arquivo em aparelhos compatíveis */

        if (
            selectedFile &&
            navigator.share &&
            navigator.canShare
        ) {

            try {

                const shareData = {

                    title: "Orçamento — JDS Tornearia",

                    text: message,

                    files: [selectedFile]
                };


                if (navigator.canShare({
                    files: [selectedFile]
                })) {

                    setFeedback(
                        "Escolha o WhatsApp na lista de compartilhamento para enviar seu pedido e o arquivo."
                    );

                    await navigator.share(shareData);

                    return;
                }

            } catch (error) {

                if (error && error.name === "AbortError") {

                    setFeedback(
                        "Compartilhamento cancelado. Você pode tentar novamente."
                    );

                    return;
                }
            }
        }


        /* Abrir WhatsApp */

        const url = whatsappLink(message);

        const opened = window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

        if (!opened) {
            window.location.href = url;
        }


        if (selectedFile) {

            setFeedback(
                `O WhatsApp foi aberto. Para enviar ${selectedFile.name}, toque no clipe ou no + da conversa e selecione o arquivo.`
            );

        } else {

            setFeedback(
                "Pedido preparado. Confira os dados e toque em enviar dentro do WhatsApp."
            );
        }

    });
}




/* ============================================================
   BOTÃO FLUTUANTE — some ao chegar ao orçamento e rodapé
   ============================================================ */
function setupFloatingQuote() {
    const floatingButton = $(".floating-quote");
    const quoteSection = $("#orcamento");
    const footer = $(".footer");

    if (!floatingButton || !("IntersectionObserver" in window)) return;

    const visibleBottomSections = new Set();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) visibleBottomSections.add(entry.target);
            else visibleBottomSections.delete(entry.target);
        });
        floatingButton.classList.toggle("is-hidden", visibleBottomSections.size > 0);
    }, { threshold: 0.08 });

    if (quoteSection) observer.observe(quoteSection);
    if (footer) observer.observe(footer);
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

configureFooter();

setupFloatingQuote();

setupImageFallbacks();

setupSlider();

setupReveal();

setupQuoteForm();
