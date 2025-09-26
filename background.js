let habilitado = false;
let intervaloId = null;
let ultimaAbaId = null;

chrome.action.onClicked.addListener(() => {
  habilitado = !habilitado;

  if (habilitado) {
    iniciarTrocaAutomatica();
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });
  } else {
    pararTrocaAutomatica();
    chrome.action.setBadgeText({ text: "" });
  }
});

function iniciarTrocaAutomatica() {
  intervaloId = setInterval(async () => {
    const abas = await chrome.tabs.query({ currentWindow: true });
    if (abas.length <= 1) return;

    const abaAtiva = abas.find(a => a.active);
    if (!abaAtiva) return;

    const indiceAtual = abas.findIndex(a => a.id === abaAtiva.id);
    const proximoIndice = (indiceAtual + 1) % abas.length;
    const proximaAba = abas[proximoIndice];

    recarregarPagina(proximaAba.id);

    setTimeout(async () => {
      await chrome.tabs.update(proximaAba.id, { active: true });
      ultimaAbaId = proximaAba.id;
    }, 20000);
  }, 25000);
}

function pararTrocaAutomatica() {
  if (intervaloId) {
    clearInterval(intervaloId);
    intervaloId = null;
  }
}

chrome.tabs.onActivated.addListener((infoAtivacao) => {
  if (habilitado && ultimaAbaId !== infoAtivacao.tabId) {
    setTimeout(() => {
      recarregarPagina(infoAtivacao.tabId);
      ultimaAbaId = infoAtivacao.tabId;
    }, 300);
  }
});

function recarregarPagina(abaId) {
  chrome.tabs.reload(abaId);
}