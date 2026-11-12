const WHATSAPP_NUMBER = "5551995914509";

/**
 * Seleciona um pacote nos cards de preços e rola até o simulador de pedido
 */
function selecionarPacote(tipoPacote) {
  const select = document.getElementById("pacoteSelect");
  if (!select) return;

  select.value = tipoPacote;
  atualizarTotal();

  const orcamentoSection = document.getElementById("orcamento");
  if (orcamentoSection) {
    orcamentoSection.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Marca o adicional de currículo (+R$ 15) e rola até o simulador
 */
function adicionarCurriculo() {
  const checkbox = document.getElementById("checkCurriculo");
  if (checkbox) {
    checkbox.checked = true;
    atualizarTotal();
  }

  const orcamentoSection = document.getElementById("orcamento");
  if (orcamentoSection) {
    orcamentoSection.scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Atualiza o valor total exibido no simulador da página inicial
 */
function atualizarTotal() {
  const select = document.getElementById("pacoteSelect");
  const checkbox = document.getElementById("checkCurriculo");
  const addonContainer = document.getElementById("addonCheckboxContainer");
  const display = document.getElementById("valorTotalDisplay");

  if (!select || !display) return;

  const opcaoSelecionada = select.options[select.selectedIndex];
  let precoBase = parseFloat(opcaoSelecionada.getAttribute("data-preco")) || 0;

  if (select.value === "apenas_curriculo") {
    if (addonContainer) addonContainer.style.display = "none";
    if (checkbox) checkbox.checked = false;
  } else {
    if (addonContainer) addonContainer.style.display = "block";
  }

  let total = precoBase;
  if (checkbox && checkbox.checked && select.value !== "apenas_curriculo") {
    total += 15;
  }

  display.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

/**
 * Abre/fecha o tooltip (?) no card do Portfólio Web (especialmente útil no celular)
 */
function toggleTooltip(event, wrapElement) {
  event.stopPropagation();
  const isAlreadyActive = wrapElement.classList.contains("active");
  document.querySelectorAll(".info-tooltip-wrap.active").forEach((el) => {
    el.classList.remove("active");
  });
  if (!isAlreadyActive) {
    wrapElement.classList.add("active");
  }
}

document.addEventListener("click", () => {
  document.querySelectorAll(".info-tooltip-wrap.active").forEach((el) => {
    el.classList.remove("active");
  });
});

/**
 * Envia os dados do simulador da Landing Page para o WhatsApp do Artur
 */
function enviarPedidoWhatsApp() {
  const nome = (document.getElementById("clienteNome")?.value || "").trim() || "Cliente";
  const profissao = (document.getElementById("clienteProfissao")?.value || "").trim() || "Não informada";
  const selectPacote = document.getElementById("pacoteSelect");
  const objetivo = document.getElementById("objetivoSelect")?.value || "";
  const privacidade = document.getElementById("privacidadeSelect")?.value || "";
  const checkCurriculo = document.getElementById("checkCurriculo")?.checked || false;
  const valorTotal = document.getElementById("valorTotalDisplay")?.textContent || "";

  let nomePacote = "";
  if (selectPacote) {
    nomePacote = selectPacote.options[selectPacote.selectedIndex].text;
  }

  const incluiCurriculoTexto =
    selectPacote?.value === "apenas_curriculo"
      ? "Sim (Apenas Currículo)"
      : checkCurriculo
      ? "Sim (+ R$ 15,00 para até 3 versões de currículo)"
      : "Não por enquanto";

  const mensagem = [
    `Olá Artur! Vi a página da *LinkPort | Impulso Carreira* e gostaria de impulsionar meu perfil profissional!`,
    ``,
    `👤 *Nome:* ${nome}`,
    `⚙️ *Profissão/Cargo:* ${profissao}`,
    `📦 *Pacote Escolhido:* ${nomePacote}`,
    `📄 *Adicional de Currículo (3 versões):* ${incluiCurriculoTexto}`,
    `🎯 *Objetivo Principal:* ${objetivo}`,
    `🔐 *Como prefere fazer o LinkedIn:* ${privacidade}`,
    `💰 *Total Estimado:* ${valorTotal}`,
    ``,
    `Podemos conversar sobre os próximos passos?`
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

/**
 * Reconhecimento de Voz Nativo (Web Speech API) -> Transforma o áudio falado em texto na caixa!
 */
let reconhecimentoAtivo = null;
let botaoAtivo = null;

function iniciarDitadoVoz(btnElement, textareaId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert(
      "Seu navegador atual não suporta transcrição direta de voz. Recomendamos abrir no Google Chrome, Edge ou Safari, ou usar o botão de mandar áudio pelo WhatsApp!"
    );
    return;
  }

  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  // Se clicou no mesmo botão que já está gravando, para a gravação
  if (reconhecimentoAtivo && botaoAtivo === btnElement) {
    reconhecimentoAtivo.stop();
    return;
  }

  // Se havia outro botão gravando, encerra o anterior primeiro
  if (reconhecimentoAtivo) {
    reconhecimentoAtivo.stop();
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.continuous = true;

  reconhecimentoAtivo = recognition;
  botaoAtivo = btnElement;

  btnElement.classList.add("recording");
  btnElement.innerHTML = "🛑 Ouvindo... (Toque p/ Parar)";
  textarea.focus();

  recognition.onresult = (event) => {
    let novoTexto = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        novoTexto += event.results[i][0].transcript.trim() + " ";
      }
    }

    if (novoTexto) {
      const textoAtual = textarea.value.trim();
      textarea.value = textoAtual ? `${textoAtual} ${novoTexto.trim()}` : novoTexto.trim();
      salvarRascunhoBriefing();
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "not-allowed") {
      alert("Permissão de microfone negada. Autorize o uso do microfone no ícone de cadeado da barra de endereço do navegador.");
    }
    resetarBotaoMic();
  };

  recognition.onend = () => {
    resetarBotaoMic();
  };

  recognition.start();
}

function resetarBotaoMic() {
  if (botaoAtivo) {
    botaoAtivo.classList.remove("recording");
    botaoAtivo.innerHTML = "🎙️ Falar Resposta";
  }
  reconhecimentoAtivo = null;
  botaoAtivo = null;
}

/**
 * Salva e restaura rascunho das respostas no navegador do cliente para não perder nada
 */
function salvarRascunhoBriefing() {
  const campos = document.querySelectorAll(".campo-escrita");
  const dados = {};
  campos.forEach((campo) => {
    if (campo.id) {
      dados[campo.id] = campo.value;
    }
  });
  try {
    localStorage.setItem("linkport_briefing_rascunho", JSON.stringify(dados));
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  const campos = document.querySelectorAll(".campo-escrita");
  if (campos.length > 0) {
    try {
      const salvo = JSON.parse(localStorage.getItem("linkport_briefing_rascunho") || "{}");
      campos.forEach((campo) => {
        if (campo.id && salvo[campo.id]) {
          campo.value = salvo[campo.id];
        }
        campo.addEventListener("input", salvarRascunhoBriefing);
      });
    } catch (e) {}
  }
});

/**
 * Página de Briefing: Envia todas as respostas (ditadas por voz ou digitadas) em texto para o WhatsApp
 */
function enviarRespostasEscritas() {
  if (reconhecimentoAtivo) {
    reconhecimentoAtivo.stop();
  }

  const campos = document.querySelectorAll(".campo-escrita");
  const linhas = [
    `Olá Artur! Respondi as perguntas do Briefing da *LinkPort | Impulso Carreira*:`,
    ``
  ];

  let algumaResposta = false;
  campos.forEach((campo) => {
    const valor = campo.value.trim();
    const titulo = campo.getAttribute("data-pergunta");
    if (valor) {
      algumaResposta = true;
      linhas.push(`*${titulo}:*\n${valor}\n`);
    }
  });

  if (!algumaResposta) {
    alert(
      "Você ainda não preencheu nenhuma pergunta. Clique em '🎙️ Falar Resposta' em qualquer pergunta para responder com sua voz (ou digite nas caixas) antes de enviar!"
    );
    return;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(linhas.join("\n"))}`;
  window.open(url, "_blank");
}
