import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom Metrik Telemetri
export const cbtLoginDuration = new Trend('cbt_login_duration', true);
export const cbtSaveAnswerDuration = new Trend('cbt_save_answer_duration', true);
export const cbtHeartbeatDuration = new Trend('cbt_heartbeat_duration', true);
export const cbtErrorRate = new Rate('cbt_error_rate');
export const cbtSuccessfulSubmissions = new Counter('cbt_successful_submissions');

// Usulan Ambang Batas Penerimaan (Proposed SLA Thresholds)
export const options = {
  scenarios: {
    cbt_concurrent_examinees: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 100 },  // Ramp-up bertahap 100 siswa
        { duration: '5m', target: 300 },  // Akselerasi ke 300 siswa
        { duration: '5m', target: 500 },  // Puncak ujian serentak 500 siswa
        { duration: '15m', target: 500 }, // Steady state 500 siswa aktif selama ujian
        { duration: '2m', target: 0 },    // Ramp-down setelah ujian selesai
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // Kriteria Keberhasilan Beban (SLA Mandat):
    // 1. 95% request latensi < 500ms
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // 2. Tingkat kegagalan HTTP < 1%
    http_req_failed: ['rate<0.01'],
    // 3. Tingkat error alur CBT < 1%
    cbt_error_rate: ['rate<0.01'],
    // 4. Latensi penyimpanan autosave jawaban p95 < 250ms
    cbt_save_answer_duration: ['p(95)<250'],
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
const EXAM_ID = __ENV.CBT_EXAM_ID || '00000000-0000-0000-0000-000000000001';
const ROOM_TOKEN = __ENV.CBT_ROOM_TOKEN || 'BIO123';

export default function () {
  const vuId = __VU;
  const iteration = __ITER;
  
  // 1. Autentikasi Siswa Sintetis (Berdasarkan pool akun siswa)
  const studentEmail = `student${(vuId % 500) + 1}@labschool.sch.id`;
  const loginPayload = JSON.stringify({
    identifier: studentEmail,
    password: 'Password123!',
  });

  const loginHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers: loginHeaders });
  cbtLoginDuration.add(loginRes.timings.duration);

  const loginSuccess = check(loginRes, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'no fatal 500 error on login': (r) => r.status !== 500,
  });

  if (!loginSuccess || loginRes.status !== 200) {
    cbtErrorRate.add(1);
    sleep(2);
    return;
  }

  const loginData = loginRes.json();
  const token = loginData && loginData.data && loginData.data.tokens ? loginData.data.tokens.accessToken : null;

  if (!token) {
    cbtErrorRate.add(1);
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Mulai atau Lanjutkan Sesi Ujian (Start / Resume Exam Session)
  const startPayload = JSON.stringify({ token: ROOM_TOKEN });
  const startRes = http.post(`${BASE_URL}/exams/${EXAM_ID}/start-session`, startPayload, { headers: authHeaders });

  check(startRes, {
    'start session non-500': (r) => r.status !== 500,
  });

  let sessionId = null;
  if (startRes.status === 200) {
    const sessionData = startRes.json();
    sessionId = sessionData && sessionData.data ? sessionData.data.id : null;
  }

  // 3. Ambil Butir Soal Ujian (Load Exam Questions)
  const questionsRes = http.get(`${BASE_URL}/exams/${EXAM_ID}/session-questions`, { headers: authHeaders });
  check(questionsRes, {
    'questions load non-500': (r) => r.status !== 500,
  });

  let questionIds = [];
  if (questionsRes.status === 200) {
    const qData = questionsRes.json();
    if (qData && qData.data && Array.isArray(qData.data)) {
      questionIds = qData.data.map(q => q.id);
    }
  }

  // 4. Simulasi Siklus Pengerjaan Soal (Answering & Heartbeat Loop)
  // Siswa menjawab 3 - 5 butir soal dengan jeda berpikir realistis (3 - 8 detik)
  const questionsToAnswer = questionIds.length > 0 ? questionIds.slice(0, 5) : [
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000011',
  ];

  for (let i = 0; i < questionsToAnswer.length; i++) {
    // Kirim Heartbeat Browser / Anti-Cheat
    if (sessionId) {
      const heartbeatPayload = JSON.stringify({
        screen_state: 'fullscreen',
        active_tab: true,
        battery_level: 85,
        client_timestamp: new Date().toISOString(),
      });
      const hbRes = http.post(`${BASE_URL}/exam-sessions/${sessionId}/heartbeat`, heartbeatPayload, { headers: authHeaders });
      cbtHeartbeatDuration.add(hbRes.timings.duration);
    }

    // Waktu berpikir siswa
    sleep(Math.random() * 3 + 2);

    // Kirim Autosave Jawaban
    const answerPayload = JSON.stringify({
      question_id: questionsToAnswer[i],
      answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      is_flagged: false,
    });

    const saveRes = http.post(`${BASE_URL}/exams/${EXAM_ID}/save-answer`, answerPayload, { headers: authHeaders });
    cbtSaveAnswerDuration.add(saveRes.timings.duration);

    check(saveRes, {
      'save answer non-500': (r) => r.status !== 500,
    });

    if (saveRes.status === 200 || saveRes.status === 201) {
      cbtSuccessfulSubmissions.add(1);
    }
  }

  // Jeda akhir sebelum iterasi berikutnya
  sleep(5);
}
