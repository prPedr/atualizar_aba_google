// Elementos da interface
const intervaloInput = document.getElementById('intervalo-troca');
const atrasoInput = document.getElementById('atraso-ativacao');
const btnIniciarParar = document.getElementById('btn-iniciar-parar');
const statusText = document.querySelector('#status span');

function atualizarUI(estado) {
    const estaHabilitado = estado && estado.habilitado;

    if (estaHabilitado) {
        statusText.textContent = 'Rodando';
        statusText.className = 'iniciado';
        btnIniciarParar.textContent = 'Parar';
        btnIniciarParar.className = 'iniciado';
        intervaloInput.disabled = true;
        atrasoInput.disabled = true;
    } else {
        statusText.textContent = 'Parado';
        statusText.className = 'parado';
        btnIniciarParar.textContent = 'Iniciar';
        btnIniciarParar.className = 'parado';
        intervaloInput.disabled = false;
        atrasoInput.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.sync.get(['intervalo', 'atraso']);
    if (data.intervalo) intervaloInput.value = data.intervalo;
    if (data.atraso) atrasoInput.value = data.atraso;

    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Erro de comunicação:', chrome.runtime.lastError.message);
            atualizarUI({ habilitado: false });
            return;
        }

        atualizarUI(response);
    });
});

btnIniciarParar.addEventListener('click', async () => {
    btnIniciarParar.disabled = true;

    const intervalo = parseInt(intervaloInput.value, 10);
    const atraso = parseInt(atrasoInput.value, 10);

    await chrome.storage.sync.set({ intervalo, atraso });

    chrome.runtime.sendMessage({ action: 'toggle' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Erro de comunicação:', chrome.runtime.lastError.message);
            atualizarUI({ habilitado: false });
        } else {
            atualizarUI(response);
        }
        btnIniciarParar.disabled = false;
    });
});