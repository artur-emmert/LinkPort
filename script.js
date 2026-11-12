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

  // Se o cliente escolheu "apenas_curriculo", esconde o checkbox duplicado
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
 * Página de Briefing: Abre o WhatsApp para o cliente mandar áudio de um bloco específico
 */
function mandarAudioBloco(numeroBloco, tituloBloco) {
  const mensagem = `Olá Artur! Estou na página de perguntas da *LinkPort* e vou te mandar um *ÁUDIO* respondendo a *Parte ${numeroBloco} (${tituloBloco})*! 🎙️`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

/**
 * Página de Briefing: Alterna a exibição dos campos opcionais de escrita
 */
let modoEscritaAtivo = false;
function alternarModoEscrita() {
  modoEscritaAtivo = !modoEscritaAtivo;
  const campos = document.querySelectorAll(".campo-escrita");
  const btnToggle = document.getElementById("btnToggleEscrita");
  const btnEnviarEscrito = document.getElementById("btnEnviarEscrito");

  campos.forEach((campo) => {
    campo.style.display = modoEscritaAtivo ? "block" : "none";
  });

  if (btnToggle) {
    btnToggle.innerHTML = modoEscritaAtivo
      ? "🎙️ Ocultar Caixas de Texto (Prefiro Responder por Áudio)"
      : "✍️ Mostrar Caixas para Responder por Escrito";
  }

  if (btnEnviarEscrito) {
    btnEnviarEscrito.style.display = modoEscritaAtivo ? "inline-flex" : "none";
  }
}

/**
 * Página de Briefing: Envia as respostas digitadas para o WhatsApp do Artur
 */
function enviarRespostasEscritas() {
  const campos = document.querySelectorAll(".campo-escrita");
  const linhas = [
    `Olá Artur! Respondi as perguntas do Briefing da *LinkPort | Impulso Carreira* por escrito:`,
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
    alert("Você ainda não digitou nenhuma resposta nas caixas de texto. Se preferir, clique no botão verde ao lado para me responder tudo por ÁUDIO no WhatsApp!");
    return;
  }

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(linhas.join("\n"))}`;
  window.open(url, "_blank");
}
