const playerBtn = document.getElementById('btn-player-view');
const hostBtn = document.getElementById('btn-host-view');
const logoutBtn = document.getElementById('btn-logout');

const playerSection = document.getElementById('player-section');
const loginSection = document.getElementById('login-section');
const hostSection = document.getElementById('host-section');
const payModal = document.getElementById('payment-modal');
const closePayModal = document.getElementById('close-pay-modal');

const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const tournamentForm = document.getElementById('tournament-form');
const paymentVerifyForm = document.getElementById('payment-verify-form');
const dynamicQrImg = document.getElementById('dynamic-qr');

const MASTER_PASSWORD = "admin123"; 
let isAdminAuthenticated = false;
let activeTargetMatch = null;

let tournaments = [
  { id: 1, title: "Custom Squad Clash (Bermuda)", fee: 50, slots: 48, roomId: "7654110", roomPass: "9988" }
];

playerBtn.addEventListener('click', () => {
    playerBtn.classList.add('active'); hostBtn.classList.remove('active');
    playerSection.classList.remove('hidden'); loginSection.classList.add('hidden'); hostSection.classList.add('hidden');
});

hostBtn.addEventListener('click', () => {
    playerBtn.classList.remove('active'); hostBtn.classList.add('active');
    playerSection.classList.add('hidden');
    if (isAdminAuthenticated) hostSection.classList.remove('hidden');
    else loginSection.classList.remove('hidden');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (document.getElementById('admin-password').value === MASTER_PASSWORD) {
        isAdminAuthenticated = true; loginError.style.display = 'none';
        loginSection.classList.add('hidden'); hostSection.classList.remove('hidden');
        loginForm.reset();
    } else { loginError.style.display = 'block'; }
});

logoutBtn.addEventListener('click', () => {
    isAdminAuthenticated = false; hostSection.classList.add('hidden'); loginSection.classList.remove('hidden');
});

tournamentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    tournaments.push({
        id: Date.now(),
        title: document.getElementById('game-title').value,
        fee: parseFloat(document.getElementById('entry-fee').value),
        slots: parseInt(document.getElementById('slots').value),
        roomId: document.getElementById('room-id').value,
        roomPass: document.getElementById('room-pass').value
    });
    updateAppRealms();
    tournamentForm.reset();
});

window.triggerPaymentFlow = function(id) {
    activeTargetMatch = tournaments.find(m => m.id === id);
    if (!activeTargetMatch) return;

    const upiLink = `upi://pay?pa=9819909265@fam&pn=GamerHub&am=${activeTargetMatch.fee}&cu=INR`;
    dynamicQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
    
    payModal.classList.remove('hidden');
};

closePayModal.addEventListener('click', () => payModal.classList.add('hidden'));

paymentVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    payModal.classList.add('hidden');
    
    alert(`Payment Submitted!\n\nRoom Details Unlocked:\nRoom ID: ${activeTargetMatch.roomId}\nRoom Password: ${activeTargetMatch.roomPass}\n\nClick the Orange launch button to open Free Fire and paste the information.`);
    
    const targetedJoinCardBtn = document.getElementById(`join-btn-${activeTargetMatch.id}`);
    if (targetedJoinCardBtn) {
        targetedJoinCardBtn.innerText = "Room Credentials Unlocked ✔";
        targetedJoinCardBtn.style.background = "#2ed573";
        targetedJoinCardBtn.disabled = true;
        
        const actionCardContextContainer = targetedJoinCardBtn.parentElement;
        const appLauncherDirectLinkButton = document.createElement('button');
        appLauncherDirectLinkButton.className = "join-btn launch-btn";
        appLauncherDirectLinkButton.innerText = "Launch Free Fire App 🎮";
        
        appLauncherDirectLinkButton.onclick = function() {
            navigator.clipboard.writeText(`ID: ${activeTargetMatch.roomId} Pass: ${activeTargetMatch.roomPass}`);
            alert("Room Credentials copied to clipboard! Opening Free Fire...");
            window.location.href = "intent://#Intent;scheme=android-app;package=com.dts.freefireth;end";
        };
        actionCardContextContainer.appendChild(appLauncherDirectLinkButton);
    }
    paymentVerifyForm.reset();
});

function updateAppRealms() {
    const hostContainer = document.getElementById('matches-container');
    const playerGrid = document.getElementById('player-matches-grid');
    
    if (!hostContainer || !playerGrid) return;
    
    hostContainer.innerHTML = '';
    playerGrid.innerHTML = '';
    let totalCollected = 0;

    tournaments.forEach(match => {
        const totalPool = match.fee * match.slots;
        totalCollected += totalPool;

        const row = document.createElement('div');
        row.className = 'match-row';
        row.innerHTML = `
            <div>
                <strong>${match.title}</strong>
                <small style="display:block; color:#a4b0be; margin-top:2px;">ID: ${match.roomId} | Fee: ₹${match.fee}</small>
            </div>
            <span class="badge" style="background:#ff475722; color:#ff4757; font-weight:bold; padding:4px 8px; border-radius:4px;">Active</span>
        `;
        hostContainer.appendChild(row);

        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <div>
                <h3 style="margin:0 0 10px 0;">${match.title}</h3>
                <div class="card-meta">
                    <span>Entry Fee: ₹${match.fee}</span>
                    <span>Slots: ${match.slots} Max</span>
                </div>
            </div>
            <button class="join-btn" id="join-btn-${match.id}" onclick="triggerPaymentFlow(${match.id})">Pay Entry Fee & Register</button>
        `;
        playerGrid.appendChild(card);
    });

    document.getElementById('active-count').innerText = tournaments.length;
    document.getElementById('total-collected').innerText = `₹${totalCollected.toLocaleString('en-IN')}`;
    document.getElementById('total-commission').innerText = `₹${(totalCollected * 0.10).toLocaleString('en-IN')}`;
}

updateAppRealms();
