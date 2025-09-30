let habilitado = false;
let intervaloId = null;

async function iniciarTrocaAutomatica() {
    const data = await chrome.storage.sync.get({ intervalo: 25, atraso: 20 });
    const intervaloMs = data.intervalo * 1000;
    const atrasoMs = data.atraso * 1000;

    if (intervaloId) clearInterval(intervaloId);

    intervaloId = setInterval(async () => {
        const abas = await chrome.tabs.query({ currentWindow: true });
        if (abas.length <= 1) return;

        const abaAtiva = abas.find(a => a.active);
        if (!abaAtiva) return;

        const indiceAtual = abas.findIndex(a => a.id === abaAtiva.id);
        const proximoIndice = (indiceAtual + 1) % abas.length;
        const proximaAba = abas[proximoIndice];

        try {
            await chrome.tabs.reload(proximaAba.id);
        } catch (error) {
            console.log(`Não foi possível recarregar a aba ${proximaAba.id}. Pode ser uma página protegida.`);
            return;
        }

        setTimeout(async () => {
            try {
                await chrome.tabs.update(proximaAba.id, { active: true });
            } catch (error) {
                console.log(`Não foi possível ativar a aba ${proximaAba.id}.`);
            }
        }, atrasoMs);

    }, intervaloMs);
}

function pararTrocaAutomatica() {
    if (intervaloId) {
        clearInterval(intervaloId);
        intervaloId = null;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        habilitado = !habilitado;
        if (habilitado) {
            iniciarTrocaAutomatica();
            chrome.action.setBadgeText({ text: 'ON' });
            chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
        } else {
            pararTrocaAutomatica();
            chrome.action.setBadgeText({ text: '' });
        }
        sendResponse({ habilitado });
    } else if (request.action === 'getStatus') {
        sendResponse({ habilitado });
    }

    return true; 
});