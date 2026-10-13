// SISTLABUM Web CBT Exam Player Engine
// Mensimulasikan Ujian Komputer Lab Sekolah dengan 6 Model Soal & Anti-Cheat Realtime

class CbtPlayer {
    constructor() {
        this.examId = 1;
        this.studentId = 1;
        this.exam = null;
        this.questions = [];
        this.session = null;
        this.currentIndex = 0;
        this.answers = {};
        this.doubts = [];
        this.remainingSeconds = 90 * 60; // 90 menit
        this.timerInterval = null;
        this.violationCount = 0;
        this.isSubmitting = false;
    }

    async init(examId = 1, studentId = 1) {
        this.examId = examId;
        this.studentId = studentId;

        try {
            const data = await API.getCbtExam(this.examId, this.studentId);
            this.exam = data.exam;
            this.questions = data.questions;
            this.session = data.session;
            this.answers = data.session.answers || {};
            this.doubts = data.session.doubt || [];
            this.violationCount = data.session.violation_count || 0;

            // Render Meta Info
            document.getElementById('exam-code-badge').textContent = this.exam.code;
            document.getElementById('exam-title-text').textContent = this.exam.title;

            // Inisialisasi Timer
            this.startTimer();

            // Render Grid Peta Soal
            this.renderQuestionGrid();

            // Render Soal Pertama
            this.renderQuestion(0);

            // Pasang Pengawas Anti-Cheat
            this.setupAntiCheat();

            // Pasang Shortcut Keyboard (A, B, C, D, E & Arrow)
            this.setupKeyboardShortcuts();

            console.log('CBT Player siap. Total soal:', this.questions.length);
        } catch (err) {
            console.error('Gagal memuat ujian CBT:', err);
            App.toast('Gagal memuat soal ujian dari database.', 'error');
        }
    }

    startTimer() {
        const timerDisplay = document.getElementById('cbt-timer-digits');
        this.timerInterval = setInterval(() => {
            if (this.remainingSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.forceSubmitTimeout();
                return;
            }

            this.remainingSeconds--;
            const hours = Math.floor(this.remainingSeconds / 3600);
            const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
            const seconds = this.remainingSeconds % 60;

            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timerDisplay.textContent = timeStr;

            // Indikator Mendesak
            if (this.remainingSeconds < 300) { // < 5 menit
                timerDisplay.classList.add('urgent');
            }
        }, 1000);
    }

    renderQuestion(index) {
        this.currentIndex = index;
        const q = this.questions[index];
        if (!q) return;

        // Update Header Soal
        document.getElementById('q-number-pill').textContent = `Soal No. ${q.question_number}`;
        
        const typeLabels = {
            single_choice: 'Pilihan Ganda Tunggal',
            multi_choice: 'Pilihan Ganda Kompleks (Multi-Opsi)',
            true_false: 'Benar / Salah Matriks',
            matching: 'Menjodohkan Pasangan',
            short_answer: 'Isian Singkat',
            essay: 'Uraian / Esai Reflektif'
        };
        document.getElementById('q-type-label').textContent = `${typeLabels[q.type] || q.type} • Bobot: ${q.points} Poin`;

        // Render Teks Soal
        document.getElementById('q-text-body').innerHTML = this.formatMathText(q.question_text);

        // Render Opsi Berdasarkan Tipe
        const container = document.getElementById('q-options-container');
        container.innerHTML = '';

        const currentAnswer = this.answers[q.question_number];

        if (q.type === 'single_choice') {
            this.renderSingleChoice(q, currentAnswer, container);
        } else if (q.type === 'multi_choice') {
            this.renderMultiChoice(q, currentAnswer, container);
        } else if (q.type === 'true_false') {
            this.renderTrueFalse(q, currentAnswer, container);
        } else if (q.type === 'matching') {
            this.renderMatching(q, currentAnswer, container);
        } else if (q.type === 'short_answer') {
            this.renderShortAnswer(q, currentAnswer, container);
        } else if (q.type === 'essay') {
            this.renderEssay(q, currentAnswer, container);
        }

        // Update Doubt Checkbox State
        const doubtCheck = document.getElementById('doubt-checkbox');
        doubtCheck.checked = this.doubts.includes(q.question_number);

        // Update Navigation Buttons
        document.getElementById('prev-btn').disabled = (index === 0);
        const nextBtn = document.getElementById('next-btn');
        if (index === this.questions.length - 1) {
            nextBtn.innerHTML = `Tinjau Selesai 📋`;
        } else {
            nextBtn.innerHTML = `Soal Berikutnya ➔`;
        }

        // Update Grid Active State
        this.updateGridActiveState();
    }

    formatMathText(text) {
        // Simple KaTeX-like visual replacer for clean mathematical rendering in HTML
        return text
            .replace(/\\\(O\(1\)\\\)/g, '<b><i>O</i>(1)</b>')
            .replace(/\\\(O\(\\log N\)\\\)/g, '<b><i>O</i>(log <i>N</i>)</b>')
            .replace(/\\\(O\(N\)\\\)/g, '<b><i>O</i>(<i>N</i>)</b>')
            .replace(/\\\(O\(N \\log N\)\\\)/g, '<b><i>O</i>(<i>N</i> log <i>N</i>)</b>')
            .replace(/\\\(O\(N\^2\)\\\)/g, '<b><i>O</i>(<i>N</i><sup>2</sup>)</b>')
            .replace(/\\\(N\\\)/g, '<i>N</i>')
            .replace(/\\\(f\(n\) = f\(n-1\) \+ 2n\\\)/g, '<span style="font-family: monospace; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-weight: 700; color: #0369a1;">f(n) = f(n-1) + 2n</span>')
            .replace(/\\\(f\(1\) = 2\\\)/g, '<span style="font-family: monospace; font-weight: bold;">f(1) = 2</span>')
            .replace(/\\\(f\(4\)\\\)/g, '<span style="font-family: monospace; font-weight: bold;">f(4)</span>');
    }

    renderSingleChoice(q, currentAnswer, container) {
        const list = document.createElement('div');
        list.className = 'option-list';

        q.options.forEach(opt => {
            const isSelected = (currentAnswer === opt.id);
            const item = document.createElement('div');
            item.className = `option-item ${isSelected ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="option-key">${opt.id}</div>
                <div class="option-content">${this.formatMathText(opt.text)}</div>
            `;
            item.onclick = () => {
                this.selectAnswer(q.question_number, opt.id);
                this.renderQuestion(this.currentIndex);
            };
            list.appendChild(item);
        });

        container.appendChild(list);
    }

    renderMultiChoice(q, currentAnswer, container) {
        const list = document.createElement('div');
        list.className = 'option-list';
        const selectedArr = Array.isArray(currentAnswer) ? currentAnswer : (currentAnswer ? currentAnswer.split(',') : []);

        q.options.forEach(opt => {
            const isChecked = selectedArr.includes(opt.id);
            const item = document.createElement('div');
            item.className = `option-item ${isChecked ? 'selected' : ''}`;
            item.innerHTML = `
                <input type="checkbox" ${isChecked ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--color-primary); pointer-events: none;">
                <div class="option-key" style="border-radius: 6px;">${opt.id}</div>
                <div class="option-content">${opt.text}</div>
            `;
            item.onclick = () => {
                let updated = [...selectedArr];
                if (updated.includes(opt.id)) {
                    updated = updated.filter(x => x !== opt.id);
                } else {
                    updated.push(opt.id);
                }
                this.selectAnswer(q.question_number, updated);
                this.renderQuestion(this.currentIndex);
            };
            list.appendChild(item);
        });

        container.appendChild(list);
    }

    renderTrueFalse(q, currentAnswer, container) {
        const saved = (typeof currentAnswer === 'object' && currentAnswer !== null) ? currentAnswer : {};
        const table = document.createElement('table');
        table.className = 'tf-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Pernyataan Analisis</th>
                    <th class="tf-cell-center">BENAR</th>
                    <th class="tf-cell-center">SALAH</th>
                </tr>
            </thead>
            <tbody>
                ${q.options.map(opt => `
                    <tr>
                        <td style="font-weight: 500;">${opt.statement}</td>
                        <td class="tf-cell-center">
                            <input type="radio" name="tf_${opt.id}" value="true" ${saved[opt.id] === true ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        </td>
                        <td class="tf-cell-center">
                            <input type="radio" name="tf_${opt.id}" value="false" ${saved[opt.id] === false ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        table.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.onchange = (e) => {
                const optId = e.target.name.replace('tf_', '');
                saved[optId] = (e.target.value === 'true');
                this.selectAnswer(q.question_number, saved);
            };
        });

        container.appendChild(table);
    }

    renderMatching(q, currentAnswer, container) {
        const saved = (typeof currentAnswer === 'object' && currentAnswer !== null) ? currentAnswer : {};
        const wrap = document.createElement('div');
        wrap.className = 'matching-container';

        q.options.left.forEach(leftItem => {
            const row = document.createElement('div');
            row.className = 'matching-row';
            row.innerHTML = `
                <div style="font-weight: 700; color: var(--color-primary);">${leftItem.text}</div>
                <div class="matching-arrow">➔</div>
                <div>
                    <select class="form-control" style="font-size: 13.5px; font-weight: 500;" data-left="${leftItem.id}">
                        <option value="">-- Pilih Definisi Cocok --</option>
                        ${q.options.right.map(rightItem => `
                            <option value="${rightItem.id}" ${saved[leftItem.id] === rightItem.id ? 'selected' : ''}>
                                ${rightItem.text}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;

            row.querySelector('select').onchange = (e) => {
                saved[leftItem.id] = e.target.value;
                this.selectAnswer(q.question_number, saved);
            };

            wrap.appendChild(row);
        });

        container.appendChild(wrap);
    }

    renderShortAnswer(q, currentAnswer, container) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'short-answer-input';
        input.placeholder = q.options.placeholder || 'Ketikkan jawaban singkat...';
        input.value = currentAnswer || '';

        input.oninput = (e) => {
            this.selectAnswer(q.question_number, e.target.value);
        };

        container.appendChild(input);
    }

    renderEssay(q, currentAnswer, container) {
        const textarea = document.createElement('textarea');
        textarea.className = 'essay-textarea';
        textarea.placeholder = q.options.hint || 'Tuliskan lembar jawaban esai Anda di sini...';
        textarea.value = currentAnswer || '';

        const wordCountDiv = document.createElement('div');
        wordCountDiv.style.cssText = 'text-align: right; font-size: 12px; color: var(--text-muted); margin-top: 6px; font-family: var(--font-mono);';
        const updateWordCount = (val) => {
            const count = val.trim() ? val.trim().split(/\s+/).length : 0;
            wordCountDiv.textContent = `Jumlah Kata: ${count} kata (Target min: ${q.options.min_words || 20} kata)`;
        };
        updateWordCount(textarea.value);

        textarea.oninput = (e) => {
            updateWordCount(e.target.value);
            this.selectAnswer(q.question_number, e.target.value);
        };

        container.appendChild(textarea);
        container.appendChild(wordCountDiv);
    }

    async selectAnswer(questionNumber, answerValue) {
        this.answers[questionNumber] = answerValue;
        this.updateSyncBadge(false);

        // Update Grid Item
        this.renderQuestionGrid();

        // Autosave ke SQLite dengan Debounce
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(async () => {
            try {
                await API.saveCbtAnswer({
                    exam_id: this.examId,
                    student_id: this.studentId,
                    question_number: questionNumber,
                    answer: answerValue
                });
                this.updateSyncBadge(true);
            } catch (err) {
                console.error('Gagal autosave:', err);
                App.toast('Koneksi terputus saat menyimpan jawaban!', 'warning');
            }
        }, 400);
    }

    updateSyncBadge(isSaved) {
        const indicator = document.getElementById('sync-status-indicator');
        if (!indicator) return;

        if (isSaved) {
            indicator.className = 'sync-indicator synced';
            indicator.innerHTML = `<span class="sync-dot"></span> Tersimpan otomatis ke server`;
        } else {
            indicator.className = 'sync-indicator';
            indicator.innerHTML = `<span class="sync-dot" style="background: #FBBF24; box-shadow: 0 0 8px #FBBF24;"></span> Menyimpan...`;
        }
    }

    async toggleDoubtCurrent() {
        const q = this.questions[this.currentIndex];
        if (!q) return;

        const qNum = q.question_number;
        const isDoubt = !this.doubts.includes(qNum);

        try {
            const res = await API.toggleCbtDoubt({
                exam_id: this.examId,
                student_id: this.studentId,
                question_number: qNum,
                is_doubt: isDoubt
            });
            this.doubts = res.doubts;
            document.getElementById('doubt-checkbox').checked = isDoubt;
            this.renderQuestionGrid();
        } catch (err) {
            App.toast('Gagal mengubah tanda ragu-ragu.', 'error');
        }
    }

    renderQuestionGrid() {
        const grid = document.getElementById('question-grid-container');
        if (!grid) return;
        grid.innerHTML = '';

        this.questions.forEach((q, idx) => {
            const qNum = q.question_number;
            const isAnswered = Boolean(this.answers[qNum]);
            const isDoubt = this.doubts.includes(qNum);
            const isCurrent = (idx === this.currentIndex);

            const btn = document.createElement('button');
            btn.className = `grid-btn ${isDoubt ? 'doubt' : (isAnswered ? 'answered' : '')} ${isCurrent ? 'current' : ''}`;
            btn.textContent = qNum;
            btn.onclick = () => this.renderQuestion(idx);
            grid.appendChild(btn);
        });

        // Update Legend Counters
        const answeredCount = Object.keys(this.answers).length;
        document.getElementById('legend-answered-count').textContent = answeredCount;
        document.getElementById('legend-doubt-count').textContent = this.doubts.length;
        document.getElementById('legend-empty-count').textContent = this.questions.length - answeredCount;
    }

    updateGridActiveState() {
        const btns = document.querySelectorAll('.grid-btn');
        btns.forEach((btn, idx) => {
            if (idx === this.currentIndex) {
                btn.classList.add('current');
            } else {
                btn.classList.remove('current');
            }
        });
    }

    prevQuestion() {
        if (this.currentIndex > 0) {
            this.renderQuestion(this.currentIndex - 1);
        }
    }

    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.renderQuestion(this.currentIndex + 1);
        } else {
            this.confirmFinishExam();
        }
    }

    setupAntiCheat() {
        // 1. Deteksi Tab Switch (visibilitychange)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.triggerViolation('Perpindahan Tab / Jendela Terdeteksi');
            }
        });

        // 2. Deteksi Window Blur (klik di luar browser)
        window.addEventListener('blur', () => {
            this.triggerViolation('Fokus Layar Ujian Hilang');
        });

        // 3. Blokir Klik Kanan
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            App.toast('Aksi klik kanan dinonaktifkan demi integritas ujian.', 'warning');
        });
    }

    async triggerViolation(reason) {
        if (this.isSubmitting) return;

        try {
            const res = await API.logCbtViolation({
                exam_id: this.examId,
                student_id: this.studentId
            });
            this.violationCount = res.violation_count;

            const modal = document.getElementById('anti-cheat-modal');
            document.getElementById('violation-count-badge').textContent = `Total Peringatan: ${this.violationCount} Kali`;
            modal.classList.add('show');
        } catch (err) {
            console.error('Gagal mencatat pelanggaran:', err);
        }
    }

    dismissViolation() {
        document.getElementById('anti-cheat-modal').classList.remove('show');
        // Usahakan masuk fullscreen kembali
        this.requestFullscreen();
    }

    requestFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Navigasi Arrow
            if (e.key === 'ArrowRight') this.nextQuestion();
            if (e.key === 'ArrowLeft') this.prevQuestion();

            // Shortcut Opsi A, B, C, D, E
            const key = e.key.toUpperCase();
            if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
                const q = this.questions[this.currentIndex];
                if (q && q.type === 'single_choice') {
                    this.selectAnswer(q.question_number, key);
                    this.renderQuestion(this.currentIndex);
                }
            }
        });
    }

    confirmFinishExam() {
        const answeredCount = Object.keys(this.answers).length;
        const total = this.questions.length;
        const emptyCount = total - answeredCount;
        const doubtCount = this.doubts.length;

        document.getElementById('confirm-answered-text').textContent = `${answeredCount} dari ${total} Butir`;
        document.getElementById('confirm-doubt-text').textContent = `${doubtCount} Butir`;
        document.getElementById('confirm-empty-text').textContent = `${emptyCount} Butir`;

        App.openModal('submit-confirm-modal');
    }

    async submitExam() {
        this.isSubmitting = true;
        App.closeModal('submit-confirm-modal');
        clearInterval(this.timerInterval);

        try {
            await API.finishCbtExam({
                exam_id: this.examId,
                student_id: this.studentId
            });

            App.toast('Ujian berhasil dikumpulkan ke server!', 'success');
            setTimeout(() => {
                window.location.href = '/siswa/ujian.html';
            }, 1200);
        } catch (err) {
            App.toast('Gagal menyelesaikan ujian.', 'error');
            this.isSubmitting = false;
        }
    }

    forceSubmitTimeout() {
        alert('Waktu ujian telah berakhir! Sistem akan mengumpulkan jawaban Anda secara otomatis.');
        this.submitExam();
    }
}

window.CbtPlayer = CbtPlayer;
