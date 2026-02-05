const State = {
    ip: 80, // Ideological Purity
    wa: 20, // Western Acceptance
    ep: 10, // Electoral Power
    eraIndex: 0,
    eventIndex: 0,
    gameOver: false
};

const Engine = {
    init() {
        this.renderStats();
        this.loadEvent();
    },

    renderStats() {
        // Clamp values
        State.ip = Math.max(0, Math.min(100, State.ip));
        State.wa = Math.max(0, Math.min(100, State.wa));
        State.ep = Math.max(0, Math.min(100, State.ep));

        document.getElementById('meter-ip').style.width = State.ip + '%';
        document.getElementById('meter-wa').style.width = State.wa + '%';
        document.getElementById('meter-ep').style.width = State.ep + '%';
        
        // Update Portrait based on Era
        const era = GameData.eras[State.eraIndex];
        if (era) {
            document.getElementById('leader-visual').innerText = era.leaderVisual;
            document.getElementById('era-label').innerText = era.name;
        }

        this.checkEndings();
    },

    loadEvent() {
        const era = GameData.eras[State.eraIndex];
        
        // Check for Era completion
        if (State.eventIndex >= era.events.length) {
            this.nextEra();
            return;
        }

        const event = era.events[State.eventIndex];
        
        // Render Text
        document.getElementById('event-title').innerText = `ফাইল #${State.eraIndex+1}-${State.eventIndex+1}`;
        document.getElementById('event-text').innerText = event.text;

        // Render Options
        const btnA = document.getElementById('btn-opt-a');
        const btnB = document.getElementById('btn-opt-b');

        btnA.querySelector('.btn-text').innerText = event.options[0].text;
        document.getElementById('tip-opt-a').innerText = event.options[0].preview;
        btnA.onclick = () => this.makeChoice(0);

        btnB.querySelector('.btn-text').innerText = event.options[1].text;
        document.getElementById('tip-opt-b').innerText = event.options[1].preview;
        btnB.onclick = () => this.makeChoice(1);
    },

    makeChoice(optionIndex) {
        const era = GameData.eras[State.eraIndex];
        const event = era.events[State.eventIndex];
        const choice = event.options[optionIndex];

        // Apply effects
        State.ip += choice.effect.ip || 0;
        State.wa += choice.effect.wa || 0;
        State.ep += choice.effect.ep || 0;

        // Next event
        State.eventIndex++;
        this.renderStats();
        
        if (!State.gameOver) {
            this.loadEvent();
        }
    },

    nextEra() {
        State.eraIndex++;
        State.eventIndex = 0;
        
        if (State.eraIndex >= GameData.eras.length) {
            this.triggerEnding("ইতিহাসের সমাপ্তি", "আপনি যুগের পর যুগ টিকে ছিলেন। কিন্তু শেষ পর্যন্ত আপনি যা হয়েছেন, তা কি আজও সেই দল?");
            return;
        }

        // Use custom modal instead of alert
        this.showModal(`প্রবেশ করছেন: ${GameData.eras[State.eraIndex].name}`, GameData.eras[State.eraIndex].desc, () => {
            this.renderStats();
            this.loadEvent();
        });
    },

    checkEndings() {
        if (State.gameOver) return;

        // Failure Conditions
        if (State.ip <= 0) {
            this.triggerEnding("ভাঙ্গন (The Schism)", "আপনার মূল সমর্থকরা আপনাকে ত্যাগ করেছে। আপনি এখন শুধুই একটি খোলস।");
        }
        else if (State.wa <= 0 && State.ep < 50) {
            this.triggerEnding("জঙ্গি তালিকাভুক্ত", "বিশ্ব আপনাকে শত্রু ঘোষণা করেছে। নিষেধাজ্ঞায় দল চূর্ণবিচূর্ণ।");
        }
        else if (State.ep <= 0 && State.eraIndex > 0) {
            this.triggerEnding("অপ্রাসঙ্গিক", "আপনার কোনো আসন নেই, কোনো কণ্ঠ নেই, এবং কোনো ভবিষ্যৎ নেই।");
        }
        
        // Complex Endings (Triggered by high stats in wrong combos)
        else if (State.wa > 90 && State.ip < 20) {
            this.triggerEnding("নীরব ক্যু (Silent Coup)", "পশ্চিমারা আপনাকে এতটাই পছন্দ করেছে যে সেনাবাহিনী ভাবল তারা আপনার চেয়ে ভালো সেবা দিতে পারবে। আপনাকে লন্ডনে অবসরে পাঠানো হয়েছে।");
        }
        else if (State.ep > 90 && State.ip < 30) {
            this.triggerEnding("স্বৈরাচার (The Tyrant)", "আপনার নিরঙ্কুশ ক্ষমতা আছে, কিন্তু আপনার কোনো বিশ্বাস নেই। আপনি শুধুই আরেকজন স্বৈরাচার।");
        }
    },

    triggerEnding(title, desc) {
        State.gameOver = true;
        const screen = document.getElementById('end-screen');
        document.getElementById('end-title').innerText = title;
        document.getElementById('end-desc').innerText = desc;
        screen.classList.remove('hidden');
    },

    showModal(title, body, callback) {
        const modal = document.getElementById('custom-modal');
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerText = body;
        
        const btn = document.getElementById('modal-btn');
        // Cloning button to remove old event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = () => {
             modal.classList.add('hidden');
             if (callback) callback();
        };

        modal.classList.remove('hidden');
    }
};

// Start
Engine.init();
