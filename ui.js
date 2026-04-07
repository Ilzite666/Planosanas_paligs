let db = null;

const ui = {
    init(data) {
        db = data;
        const lastTab = localStorage.getItem('activeTab') || 'vizuals';
        this.setActiveTab(lastTab);
    },

    getMacibuGads() {
        const d = new Date();
        const year = d.getFullYear();
        return d.getMonth() >= 8 ? `${year}./${year + 1}.m.g.` : `${year - 1}./${year}.m.g.`;
    },

    setActiveTab(tabId) {
        localStorage.setItem('activeTab', tabId);
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`tab-${tabId}`);
        if(btn) btn.classList.add('active');
        
        if(tabId === 'stem') this.renderStemForm();
        else if(tabId === 'parbaudes') this.renderParbaudesForm();
        else if(tabId === 'kopskats') this.renderKopskats();
        else if(tabId === 'iestatijumi') this.renderIestatijumi();
        else this.renderVizuālaisGrafiks();
    },

    renderPrintHeader(title1, title2 = "Rīgas Pārdaugavas pamatskola") {
        return `
            <div class="print-header">
                <h2>${title1}</h2>
                <h3>${title2}</h3>
                <h3>${this.getMacibuGads()}</h3>
            </div>`;
    },

    renderFilters(type) {
        const klaseF = localStorage.getItem('filterKlase') || 'Visas';
        const personaF = localStorage.getItem('filterPersona') || 'Visi';
        const modeKey = type === 'parbaudes' ? 'pdMode' : 'kopskatsMode';
        const mode = localStorage.getItem(modeKey) || 'month';
        const personals = [...new Set([...db.mainigie.slice(1).map(r => r[0]), ...db.mainigie.slice(1).map(r => r[1])])].filter(v => v).sort();
        const klases = db.mainigie.slice(1).map(r => r[2]).filter(v => v);

        return `
            <div class="nav-bar">
                <div class="nav-group">
                    <select onchange="ui.filterBy('filterKlase', this.value)">
                        <option value="Visas">Visas klases</option>
                        ${klases.map(k => `<option ${k===klaseF?'selected':''}>${k}</option>`).join('')}
                    </select>
                    <select onchange="ui.filterBy('filterPersona', this.value)">
                        <option value="Visi">Viss personāls/Skolotāji</option>
                        ${personals.map(p => `<option ${p===personaF?'selected':''}>${p}</option>`).join('')}
                    </select>
                    ${(type === 'parbaudes' || type === 'kopskats') ? `
                        <button class="tab-btn ${mode==='month'?'active-mode':''}" onclick="ui.setMode('${modeKey}', 'month')">Mēnesis</button>
                        <button class="tab-btn ${mode==='week'?'active-mode':''}" onclick="ui.setMode('${modeKey}', 'week')">Nedēļa</button>
                    ` : ''}
                </div>
                <button class="btn-save" style="background:var(--gold-accent)" onclick="window.print()">🖨️ DRUKĀT</button>
            </div>`;
    },

    setMode(key, mode) { localStorage.setItem(key, mode); this.setActiveTab(localStorage.getItem('activeTab')); },

    renderVizuālaisGrafiks() {
        const m = db.mainigie.slice(1);
        const stundas = m.map(r => r[7]).filter(v => v); 
        let html = `<div class="pults"><h3>👥 Piešķirt Atbalsta Personu</h3><div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
            <select id="in-diena"><option>Pirmdiena</option><option>Otrdiena</option><option>Trešdiena</option><option>Ceturtdiena</option><option>Piektdiena</option></select>
            <select id="in-stunda">${stundas.map(s => `<option>${s}</option>`).join('')}</select>
            <select id="in-paligs">${m.map(r => r[1]).filter(v => v).map(p => `<option>${p}</option>`).join('')}</select>
            <select id="in-klase">${m.map(r => r[2]).filter(v => v).map(k => `<option>${k}</option>`).join('')}</select>
            <select id="in-disciplina">${m.map(r => r[4]).filter(v => v).map(d => `<option>${d}</option>`).join('')}</select>
            <select id="in-kab">${m.map(r => r[5]).filter(v => v).map(k => `<option>${k}</option>`).join('')}</select>
            <button class="btn-save" onclick="ui.submitPaligs()">SAGLABĀT</button></div></div>
            <div class="paliga-card">
                ${this.renderPrintHeader("“ATBALSTS IZGLĪTOJAMO INDIVIDUĀLO KOMPETENČU ATTĪSTĪBAI”", "Pedagogu palīgu nodarbību grafiks")}
                <h3 class="no-print">Skolotāju palīgu grafiks</h3>
                ${this.renderFilters('vizuals')}
                <div class="grid-table-container"><table class="grid-table"><thead><tr><th class="stunda-col">St.</th>${["Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena"].map(d => `<th>${d}</th>`).join('')}</tr></thead><tbody>`;
        stundas.forEach(s => {
            html += `<tr><td class="stunda-col">${s}</td>`;
            ["Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena"].forEach(d => {
                html += `<td>${this.getFilteredContent('paligi', d, s, '')}</td>`;
            });
            html += `</tr>`;
        });
        document.getElementById('app-content').innerHTML = html + `</tbody></table></div></div>`;
    },

    renderStemForm() {
        const m = db.mainigie.slice(1);
        const klaseF = localStorage.getItem('filterKlase') || 'Visas';
        const personaF = localStorage.getItem('filterPersona') || 'Visi';
        
        let html = `<div class="pults"><h3>🚀 Reģistrēt STEM / Ekskursiju</h3><div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
            <select id="st-klase">${m.map(r => r[2]).filter(v => v).map(k => `<option>${k}</option>`).join('')}</select>
            <select id="st-skolotajs">${m.map(r => r[0]).filter(v => v).map(s => `<option>${s}</option>`).join('')}</select>
            <input id="st-pasakums" placeholder="Nosaukums"><input type="date" id="st-datums"><input id="st-vieta" placeholder="Vieta"><button class="btn-save" onclick="ui.submitStem()">PIEVIENOT</button></div></div>
            <div class="paliga-card">
                ${this.renderPrintHeader("“STEM un pilsoniskās līdzdalības norises plašākai izglītības pieredzei un karjeras izvēlei”")}
                <h3 class="no-print">STEM un ārpussskolas pasākumu plāns</h3>
                ${this.renderFilters('stem')}
                <div class="grid-table-container">
                    <table class="grid-table">
                        <thead>
                            <tr>
                                <th style="width:50px;">Nr.p.k.</th>
                                <th style="width:80px;">Klase</th>
                                <th style="width:150px;">Skolotājs (-i)</th>
                                <th>Pasākums</th>
                                <th style="width:120px;">Datums</th>
                                <th style="width:150px;">Vieta</th>
                            </tr>
                        </thead>
                        <tbody>`;

        let filteredItems = db.stem.slice(1).filter(r => {
            if (klaseF !== 'Visas' && r[0] !== klaseF) return false;
            if (personaF !== 'Visi' && r[1] !== personaF) return false;
            return true;
        }).sort((a,b) => new Date(a[3]) - new Date(b[3]));

        filteredItems.forEach((x, i) => {
            html += `<tr>
                <td style="text-align:center;">${i+1}.</td>
                <td>${x[0]}</td>
                <td>${x[1]}</td>
                <td><b>${x[2]}</b><button class="delete-btn no-print" onclick="ui.deleteItem('delete_stem', ${db.stem.indexOf(x)+1})">×</button></td>
                <td>${x[3] ? x[3].toString().split('T')[0] : ''}</td>
                <td>${x[4]}</td>
            </tr>`;
        });

        document.getElementById('app-content').innerHTML = html + `</tbody></table></div></div>`;
    },

    renderParbaudesForm() {
        const m = db.mainigie.slice(1);
        const mode = localStorage.getItem('pdMode') || 'month';
        const klaseF = localStorage.getItem('filterKlase') || 'Visas';
        let html = `<div class="pults"><h3>📝 Jauns Pārbaudes Darbs</h3><div style="display:flex; gap:10px; flex-wrap:wrap;"><input type="date" id="pd-datums"><select id="pd-stunda">${m.map(r => r[7]).filter(v => v).map(s => `<option>${s}</option>`).join('')}</select><select id="pd-klase">${m.map(r => r[2]).filter(v => v).map(k => `<option>${k}</option>`).join('')}</select><select id="pd-prieksmets">${m.map(r => r[3]).filter(v => v).map(p => `<option>${p}</option>`).join('')}</select><button class="btn-save" onclick="ui.submitParbaude()">PIEVIENOT</button></div></div>
        <div class="paliga-card">
            ${this.renderPrintHeader("PĀRBAUDES DARBU GRAFIKS")}
            <h3 class="no-print">Pārbaudes darbu plāns</h3>
            ${this.renderFilters('parbaudes')}`;
        if (mode === 'month') {
            let pdE = db.parbaudes.slice(1).filter(r => klaseF === 'Visas' || r[3] === klaseF).map(r => ({ date: r[0].toString().split('T')[0], title: r[3], info: `${r[4]} (${r[2]})`, color: '#e67e22' }));
            html += this.renderMonthGrid(pdE);
        } else html += this.renderNedelasTabula('parbaudes');
        document.getElementById('app-content').innerHTML = html + `</div>`;
    },

    renderKopskats() {
        const mode = localStorage.getItem('kopskatsMode') || 'month';
        const klaseF = localStorage.getItem('filterKlase') || 'Visas';
        const personaF = localStorage.getItem('filterPersona') || 'Visi';
        let html = `<div class="paliga-card">
            ${this.renderPrintHeader("MĀCĪBU UN AUDZINĀŠANAS DARBA PLĀNS")}
            <h3 class="no-print">Kopējais pārskats</h3>
            ${this.renderFilters('kopskats')}`;
        if (mode === 'month') {
            let allE = [];
            db.parbaudes.slice(1).filter(r => klaseF === 'Visas' || r[3] === klaseF).forEach(r => allE.push({ date: r[0].toString().split('T')[0], title: r[3], info: `PD: ${r[4]}`, color: '#e67e22' }));
            db.stem.slice(1).filter(r => (klaseF === 'Visas' || r[0] === klaseF) && (personaF === 'Visi' || r[1] === personaF)).forEach(r => allE.push({ date: r[3].toString().split('T')[0], title: r[2], info: `${r[0]} (${r[4]})`, color: '#27ae60' }));
            html += this.renderMonthGrid(allE);
        } else html += this.renderNedelasTabula('kopskats');
        document.getElementById('app-content').innerHTML = html + `</div>`;
    },

    renderMonthGrid(events) {
        let viewDate = localStorage.getItem('viewDate') ? new Date(localStorage.getItem('viewDate')) : new Date();
        const year = viewDate.getFullYear(), month = viewDate.getMonth();
        const monthNames = ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"];
        let html = `<div class="nav-bar no-print"><div class="nav-group"><button class="tab-btn" onclick="ui.changeMonth(-1)">◀</button><h3 style="margin:0 15px;">${monthNames[month]} ${year}</h3><button class="tab-btn" onclick="ui.changeMonth(1)">▶</button></div></div>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:5px; background:#eee; border:1px solid #eee;">
            ${["Pr","Ot","Tr","Ce","Pk","Se","Sv"].map(d => `<div style="text-align:center; font-weight:bold; padding:10px; background:var(--primary-blue); color:white;">${d}</div>`).join('')}`;
        const firstDay = new Date(year, month, 1).getDay();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;
        html += Array(startOffset).fill('<div style="background:#f9f9f9; min-height:100px;"></div>').join('');
        for(let d=1; d<=new Date(year, month+1, 0).getDate(); d++) {
            const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const dienaVards = ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"][new Date(ds).getDay()];
            const dayEvents = events.filter(e => e.date === ds || e.day === dienaVards);
            html += `<div style="min-height:100px; background:white; padding:5px; border:1px solid #eee; overflow-y:auto;"><span style="font-size:0.8rem; color:#999; font-weight:bold;">${d}</span>
                ${dayEvents.map(e => `<div style="font-size:0.65rem; background:${e.color}; color:white; padding:2px 4px; margin-top:2px; border-radius:3px; line-height:1.1;"><b>${e.title}</b><br>${e.info}</div>`).join('')}
            </div>`;
        }
        return html + `</div>`;
    },

    renderNedelasTabula(type) {
        const viewDate = localStorage.getItem('viewDate') ? new Date(localStorage.getItem('viewDate')) : new Date();
        const dayOfWeek = viewDate.getDay(); 
        const diff = viewDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        const monday = new Date(viewDate.setDate(diff));
        const stundas = db.mainigie.slice(1).map(r => r[7]).filter(v => v);
        const dienuVardi = ["Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena"];
        let html = `<div class="nav-bar no-print"><button class="tab-btn" onclick="ui.changeWeek(-7)">◀ Iepriekšējā nedēļa</button><button class="tab-btn" onclick="ui.changeWeek(7)">Nākamā nedēļa ▶</button></div>
        <div class="grid-table-container"><table class="grid-table"><thead><tr><th class="stunda-col">St.</th>`;
        dienuVardi.forEach((d, i) => {
            const current = new Date(monday); current.setDate(monday.getDate() + i);
            html += `<th>${d}<br><small>${current.getDate()}.${String(current.getMonth()+1).padStart(2,'0')}.</small></th>`;
        });
        html += `</tr></thead><tbody>`;
        stundas.forEach(s => {
            html += `<tr><td class="stunda-col">${s}</td>`;
            dienuVardi.forEach((d, i) => {
                const current = new Date(monday); current.setDate(monday.getDate() + i);
                const ds = `${current.getFullYear()}-${String(current.getMonth()+1).padStart(2,'0')}-${String(current.getDate()).padStart(2,'0')}`;
                html += `<td>${this.getFilteredContent(type, d, s, ds)}</td>`;
            });
            html += `</tr>`;
        });
        return html + `</tbody></table></div>`;
    },

    getFilteredContent(type, diena, stunda, datums) {
        const klaseF = localStorage.getItem('filterKlase') || 'Visas';
        const personaF = localStorage.getItem('filterPersona') || 'Visi';
        let res = '';
        if (type === 'paligi' || type === 'kopskats') {
            let p = db.paligi.slice(1).filter(r => r[0] === diena && String(r[1]) === String(stunda));
            if(klaseF !== 'Visas') p = p.filter(r => r[3] === klaseF);
            if(personaF !== 'Visi') p = p.filter(r => r[2] === personaF);
            res += p.map(x => `<div class="cell-item"><b>${x[2]}</b>${x[4] ? x[4] + ' - ' : ''}${x[3]} (${x[5]})<button class="delete-btn no-print" onclick="ui.deleteItem('delete_paligs', ${db.paligi.indexOf(x)+1})">×</button></div>`).join('');
        }
        if (type === 'parbaudes' || type === 'kopskats') {
            let pd = db.parbaudes.slice(1).filter(r => r[0].toString().includes(datums) && String(r[2]) === String(stunda));
            if(klaseF !== 'Visas') pd = pd.filter(r => r[3] === klaseF);
            res += pd.map(x => `<div class="cell-item" style="border-left-color:#e67e22"><b>${x[3]}</b>PD: ${x[4]}<button class="delete-btn no-print" onclick="ui.deleteItem('delete_parbaude', ${db.parbaudes.indexOf(x)+1})">×</button></div>`).join('');
        }
        return res;
    },

    renderIestatijumi() {
        const cats = [{idx:0, n:"Skolotāji"}, {idx:1, n:"Palīgi"}, {idx:2, n:"Klases"}, {idx:3, n:"Priekšmeti"}, {idx:4, n:"Disciplīnas"}, {idx:5, n:"Kabineti"}, {idx:7, n:"Stundu laiki"}];
        let html = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:20px; padding:20px;">`;
        cats.forEach(c => {
            html += `<div class="iestatijumi-card"><h4>${c.n}</h4>
                <input type="text" id="iest-in-${c.idx}" oninput="ui.checkIestInput(${c.idx})" placeholder="Meklēt vai pievienot jaunu..." style="width:100%;">
                <div id="ctrl-${c.idx}" style="margin-top:10px; min-height:40px;"></div>
            </div>`;
        });
        document.getElementById('app-content').innerHTML = html + `</div>`;
    },

    checkIestInput(col) {
        const val = document.getElementById(`iest-in-${col}`).value.trim();
        const ctrl = document.getElementById(`ctrl-${col}`);
        if (!val) { ctrl.innerHTML = ''; return; }
        const match = db.mainigie.slice(1).find(r => r[col] && r[col].toString().toLowerCase() === val.toLowerCase());
        if (match) ctrl.innerHTML = `
            <button class="btn-save" style="background:var(--gold-accent); margin-right:5px;" onclick="ui.updateMainigais(${col}, ${db.mainigie.indexOf(match)+1}, prompt('Ievadiet jauno vērtību:', '${match[col]}'))">LABOT IERAKSTU</button>
            <button class="delete-btn" onclick="ui.deleteMainigais(${col}, ${db.mainigie.indexOf(match)+1})">DZĒST NO SARAKSTA</button>`;
        else ctrl.innerHTML = `<button class="btn-save" onclick="ui.addMainigais(${col}, '${val}')">PIEVIENOT SARAKSTAM</button>`;
    },

    filterBy(key, val) { localStorage.setItem(key, val); this.setActiveTab(localStorage.getItem('activeTab')); },
    changeMonth(dir) { let d = localStorage.getItem('viewDate') ? new Date(localStorage.getItem('viewDate')) : new Date(); d.setMonth(d.getMonth() + dir); localStorage.setItem('viewDate', d.toISOString()); this.setActiveTab(localStorage.getItem('activeTab')); },
    changeWeek(days) { let d = localStorage.getItem('viewDate') ? new Date(localStorage.getItem('viewDate')) : new Date(); d.setDate(d.getDate() + days); localStorage.setItem('viewDate', d.toISOString()); this.setActiveTab(localStorage.getItem('activeTab')); },
    updateMainigais(col, row, val) { if(val) api.saveData({action: 'update_mainigie', col, row, val}, 'ui.afterSave'); },
    addMainigais(col, val) { api.saveData({action: 'add_mainigais', col, val}, 'ui.afterSave'); },
    deleteMainigais(col, row) { if(confirm("Vai tiešām vēlaties dzēst šo ierakstu?")) api.saveData({action: 'update_mainigie', col, row, val: 'DELETE_ROW'}, 'ui.afterSave'); },
    submitPaligs() { api.saveData({ action: 'save_paligs', diena: document.getElementById('in-diena').value, stunda: document.getElementById('in-stunda').value, paligs: document.getElementById('in-paligs').value, klase: document.getElementById('in-klase').value, disciplina: document.getElementById('in-disciplina').value, kabinets: document.getElementById('in-kab').value }, 'ui.afterSave'); },
    submitStem() { api.saveData({ action: 'save_stem', klase: document.getElementById('st-klase').value, skolotajs: document.getElementById('st-skolotajs').value, pasakums: document.getElementById('st-pasakums').value, datums: document.getElementById('st-datums').value, vieta: document.getElementById('st-vieta').value }, 'ui.afterSave'); },
    submitParbaude() { const dt = document.getElementById('pd-datums').value; if(!dt) return alert("Lūdzu, aizpildiet visus obligātos laukus!"); const dateObj = new Date(dt); const dV = ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"]; api.saveData({ action: 'save_parbaude', datums: dt, diena: dV[dateObj.getDay()], stunda: document.getElementById('pd-stunda').value, klase: document.getElementById('pd-klase').value, prieksmets: document.getElementById('pd-prieksmets').value }, 'ui.afterSave'); },
    deleteItem(action, row) { if(confirm("Vai tiešām vēlaties dzēst šo ierakstu?")) api.saveData({action, row}, 'ui.afterSave'); },
    afterSave() { location.reload(); }
};

api.fetchData('ui.init');