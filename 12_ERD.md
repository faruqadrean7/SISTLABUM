# 12. ERD Database Portal Sekolah

Pelengkap `08_DATABASE_SCHEMA.md`. Diagram memakai **Mermaid** (render di GitHub, GitLab, VS Code, Obsidian, mermaid.live).
Dipecah per domain agar terbaca. Kolom umum (`school_id`, `created_at`, `updated_at`, `deleted_at`) tidak digambar ulang di tiap tabel.

Legenda: `PK` primary key · `FK` foreign key · `UK` unique. Relasi: `||` tepat satu, `o|` nol/satu, `o{` nol atau banyak, `|{` satu atau banyak.

---

## 0. Gambaran Besar (relasi antar domain)
```mermaid
erDiagram
  USERS ||--o| STUDENTS : "profil"
  USERS ||--o| TEACHERS : "profil"
  USERS ||--o| GUARDIANS : "profil"
  USERS }o--o{ ROLES : "user_roles"
  STUDENTS }o--o{ GUARDIANS : "student_guardians"
  ACADEMIC_YEARS ||--o{ SEMESTERS : ""
  ACADEMIC_YEARS ||--o{ CLASSES : ""
  CLASSES ||--o{ CLASS_STUDENTS : ""
  STUDENTS ||--o{ CLASS_STUDENTS : ""
  CLASSES ||--o{ SCHEDULES : ""
  SCHEDULES ||--o{ JOURNALS : ""
  JOURNALS ||--o{ ATTENDANCES : ""
  STUDENTS ||--o{ ATTENDANCES : ""
  STUDENTS ||--o{ GRADES : ""
  STUDENTS ||--o{ PROGRESS_REPORTS : ""
  STUDENTS ||--o{ REPORT_CARDS : ""
  EXAMS ||--o{ EXAM_SESSIONS : ""
  STUDENTS ||--o{ EXAM_SESSIONS : ""
  STUDENTS ||--o{ STUDENT_POINTS : ""
  STUDENTS ||--o{ COUNSELING_CASES : ""
  APPLICANTS o|--o| STUDENTS : "enroll"
  USERS ||--o{ NOTIFICATIONS : ""
  USERS ||--o{ TICKETS : "pelapor"
  FACILITIES ||--o{ BOOKINGS : ""
  FILES ||--o{ APPLICANT_DOCUMENTS : ""
```

---

## 1. Identitas, Role & Audit
```mermaid
erDiagram
  USERS {
    uuid id PK
    string username UK
    string email UK
    string phone
    string password_hash
    string status "active|suspended|locked"
    boolean must_change_password
    timestamptz last_login_at
  }
  ROLES {
    uuid id PK
    string code UK
    string name
    boolean is_system
  }
  PERMISSIONS {
    uuid id PK
    string code UK "modul.resource.aksi"
    string description
  }
  ROLE_PERMISSIONS {
    uuid role_id PK, FK
    uuid permission_id PK, FK
  }
  USER_ROLES {
    uuid user_id PK, FK
    uuid role_id PK, FK
    uuid scope_class_id FK "opsional untuk walas"
  }
  REFRESH_TOKENS {
    uuid id PK
    uuid user_id FK
    uuid device_id FK
    string token_hash
    timestamptz expires_at
    timestamptz revoked_at
    uuid replaced_by
  }
  DEVICES {
    uuid id PK
    uuid user_id FK
    string platform
    string fcm_token
    timestamptz last_seen_at
  }
  PASSWORD_RESETS {
    uuid id PK
    uuid user_id FK
    string token_hash
    timestamptz expires_at
    timestamptz used_at
  }
  AUDIT_LOGS {
    uuid id PK
    uuid actor_id FK
    string action
    string entity
    uuid entity_id
    jsonb old_value
    jsonb new_value
    string ip
    timestamptz created_at
  }
  USERS ||--o{ USER_ROLES : ""
  ROLES ||--o{ USER_ROLES : ""
  ROLES ||--o{ ROLE_PERMISSIONS : ""
  PERMISSIONS ||--o{ ROLE_PERMISSIONS : ""
  USERS ||--o{ REFRESH_TOKENS : ""
  USERS ||--o{ DEVICES : ""
  DEVICES ||--o{ REFRESH_TOKENS : ""
  USERS ||--o{ PASSWORD_RESETS : ""
  USERS ||--o{ AUDIT_LOGS : "actor"
```

---

## 2. Master Data (siswa, guru, kelas, mapel)
```mermaid
erDiagram
  ACADEMIC_YEARS {
    uuid id PK
    string name UK
    date start_date
    date end_date
    boolean is_active
  }
  SEMESTERS {
    uuid id PK
    uuid academic_year_id FK
    string name
    date start_date
    date end_date
    boolean is_active
  }
  STUDENTS {
    uuid id PK
    uuid user_id FK
    string nis UK
    string nisn UK
    string nik_enc
    string full_name
    string gender
    string birth_place
    date birth_date
    string religion
    string address
    uuid photo_file_id FK
    string status "aktif|lulus|pindah|keluar"
    date entry_date
  }
  STUDENT_STATUS_HISTORY {
    uuid id PK
    uuid student_id FK
    string status
    string reason
    date effective_date
  }
  GUARDIANS {
    uuid id PK
    uuid user_id FK
    string full_name
    string phone
    string occupation
    string address
  }
  STUDENT_GUARDIANS {
    uuid student_id PK, FK
    uuid guardian_id PK, FK
    string relationship
    boolean is_primary
  }
  TEACHERS {
    uuid id PK
    uuid user_id FK
    string nip
    string nuptk
    string full_name
    string position
    string status
  }
  STAFF {
    uuid id PK
    uuid user_id FK
    string full_name
    string position
    string unit
  }
  GRADE_LEVELS {
    uuid id PK
    string name
    int sort_order
  }
  MAJORS {
    uuid id PK
    string name
  }
  CLASSES {
    uuid id PK
    uuid academic_year_id FK
    uuid grade_level_id FK
    uuid major_id FK
    uuid homeroom_teacher_id FK
    string name
    int capacity
  }
  CLASS_STUDENTS {
    uuid id PK
    uuid class_id FK
    uuid student_id FK
    date joined_at
    date left_at
  }
  SUBJECTS {
    uuid id PK
    string code UK
    string name
    string subject_group
  }
  TEACHING_ASSIGNMENTS {
    uuid id PK
    uuid semester_id FK
    uuid class_id FK
    uuid subject_id FK
    uuid teacher_id FK
    int hours_per_week
  }
  ROOMS {
    uuid id PK
    string code UK
    string name
    string room_type
    int capacity
  }
  ACADEMIC_YEARS ||--o{ SEMESTERS : ""
  ACADEMIC_YEARS ||--o{ CLASSES : ""
  GRADE_LEVELS ||--o{ CLASSES : ""
  MAJORS ||--o{ CLASSES : ""
  TEACHERS ||--o{ CLASSES : "wali kelas"
  CLASSES ||--o{ CLASS_STUDENTS : ""
  STUDENTS ||--o{ CLASS_STUDENTS : ""
  STUDENTS ||--o{ STUDENT_STATUS_HISTORY : ""
  STUDENTS ||--o{ STUDENT_GUARDIANS : ""
  GUARDIANS ||--o{ STUDENT_GUARDIANS : ""
  SEMESTERS ||--o{ TEACHING_ASSIGNMENTS : ""
  CLASSES ||--o{ TEACHING_ASSIGNMENTS : ""
  SUBJECTS ||--o{ TEACHING_ASSIGNMENTS : ""
  TEACHERS ||--o{ TEACHING_ASSIGNMENTS : ""
```

---

## 3. PPDB
```mermaid
erDiagram
  PPDB_WAVES {
    uuid id PK
    string name
    timestamptz open_at
    timestamptz close_at
    timestamptz result_publish_at
    string status
  }
  PPDB_TRACKS {
    uuid id PK
    uuid wave_id FK
    string code
    string name
    int quota
    jsonb score_formula
  }
  PPDB_REQUIREMENTS {
    uuid id PK
    uuid track_id FK
    string document_type
    boolean is_required
    string description
  }
  APPLICANTS {
    uuid id PK
    uuid wave_id FK
    uuid track_id FK
    uuid user_id FK
    uuid student_id FK "terisi saat konversi"
    string registration_no UK
    string nik_enc
    string full_name
    date birth_date
    string status "draft|submitted|verified|revision|selected|waitlist|rejected|enrolled"
    numeric score
    int rank
    string decision
    jsonb step_data
  }
  APPLICANT_PARENTS {
    uuid id PK
    uuid applicant_id FK
    string parent_type
    string name
    string occupation
    string income_range
    string phone
  }
  APPLICANT_DOCUMENTS {
    uuid id PK
    uuid applicant_id FK
    uuid file_id FK
    string document_type
    string status "menunggu|valid|ditolak"
    string reject_reason
    uuid verified_by FK
  }
  APPLICANT_STATUS_HISTORY {
    uuid id PK
    uuid applicant_id FK
    string from_status
    string to_status
    string note
    uuid actor_id FK
    timestamptz created_at
  }
  PPDB_RE_REGISTRATIONS {
    uuid id PK
    uuid applicant_id FK
    timestamptz confirmed_at
    string status
    string notes
  }
  PPDB_WAVES ||--o{ PPDB_TRACKS : ""
  PPDB_TRACKS ||--o{ PPDB_REQUIREMENTS : ""
  PPDB_WAVES ||--o{ APPLICANTS : ""
  PPDB_TRACKS ||--o{ APPLICANTS : ""
  APPLICANTS ||--o{ APPLICANT_PARENTS : ""
  APPLICANTS ||--o{ APPLICANT_DOCUMENTS : ""
  APPLICANTS ||--o{ APPLICANT_STATUS_HISTORY : ""
  APPLICANTS ||--o| PPDB_RE_REGISTRATIONS : ""
```

---

## 4. Akademik I: Jadwal, Jurnal, Presensi, Izin
```mermaid
erDiagram
  TIME_SLOTS {
    uuid id PK
    string name
    time start_time
    time end_time
    string day_type
  }
  SCHEDULES {
    uuid id PK
    uuid semester_id FK
    uuid class_id FK
    uuid subject_id FK
    uuid teacher_id FK
    uuid room_id FK
    uuid time_slot_id FK
    int day_of_week
  }
  JOURNALS {
    uuid id PK
    uuid schedule_id FK
    uuid teacher_id FK
    date session_date
    string topic
    string method
    string notes
  }
  ATTENDANCES {
    uuid id PK
    uuid journal_id FK "null untuk presensi gerbang"
    uuid student_id FK
    date att_date
    string status "hadir|izin|sakit|alpa|terlambat"
    string source "kelas|gerbang"
    string note
    uuid recorded_by FK
  }
  LEAVE_REQUESTS {
    uuid id PK
    uuid student_id FK
    uuid requested_by FK
    string leave_type
    date start_date
    date end_date
    string reason
    uuid attachment_file_id FK
    string status
    uuid decided_by FK
  }
  STAFF_ATTENDANCES {
    uuid id PK
    uuid user_id FK
    date att_date
    timestamptz check_in
    timestamptz check_out
    numeric lat
    numeric lng
    string status
  }
  TEACHING_MATERIALS {
    uuid id PK
    uuid grade_level_id FK
    uuid subject_id FK
    uuid uploaded_by FK
    uuid file_id FK
    string material_type "modul|ATP|silabus|P5"
    int version
  }
  LEARNING_MATERIALS {
    uuid id PK
    uuid class_id FK
    uuid subject_id FK
    uuid teacher_id FK
    string title
    uuid file_id FK
  }
  ASSIGNMENTS {
    uuid id PK
    uuid class_id FK
    uuid subject_id FK
    uuid teacher_id FK
    string title
    timestamptz due_at
  }
  ASSIGNMENT_SUBMISSIONS {
    uuid id PK
    uuid assignment_id FK
    uuid student_id FK
    uuid file_id FK
    numeric score
    timestamptz submitted_at
  }
  TIME_SLOTS ||--o{ SCHEDULES : ""
  SCHEDULES ||--o{ JOURNALS : ""
  JOURNALS ||--o{ ATTENDANCES : ""
  STUDENTS ||--o{ ATTENDANCES : ""
  STUDENTS ||--o{ LEAVE_REQUESTS : ""
  ROOMS ||--o{ SCHEDULES : ""
  CLASSES ||--o{ SCHEDULES : ""
  TEACHERS ||--o{ SCHEDULES : ""
  SUBJECTS ||--o{ SCHEDULES : ""
  USERS ||--o{ STAFF_ATTENDANCES : ""
  ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : ""
  STUDENTS ||--o{ ASSIGNMENT_SUBMISSIONS : ""
```

---

## 5. Akademik II: Nilai, Karakter, Progress Report, Rapor
```mermaid
erDiagram
  GRADE_COMPONENTS {
    uuid id PK
    uuid subject_id FK
    uuid semester_id FK
    uuid class_id FK "opsional"
    string code
    string name
    numeric weight
  }
  GRADE_PERIODS {
    uuid id PK
    uuid semester_id FK
    int month
    string status "open|locked"
    uuid locked_by FK
    timestamptz locked_at
  }
  GRADES {
    uuid id PK
    uuid student_id FK
    uuid component_id FK
    uuid period_id FK
    uuid exam_id FK "jika dari CBT"
    numeric value
    string source "manual|cbt"
    uuid entered_by FK
  }
  CHARACTER_NOTES {
    uuid id PK
    uuid student_id FK
    uuid period_id FK
    jsonb scale_data
    string homeroom_note
    uuid author_id FK
  }
  PROGRESS_REPORTS {
    uuid id PK
    uuid student_id FK
    uuid period_id FK
    jsonb data_snapshot
    uuid file_id FK
    string status "draft|menunggu_acc|disetujui|terbit"
    uuid approved_by FK
    string verify_token UK
  }
  REPORT_CARDS {
    uuid id PK
    uuid student_id FK
    uuid semester_id FK
    jsonb data_snapshot
    uuid file_id FK
    string status
    timestamptz locked_at
    uuid approved_by FK
    string verify_token UK
  }
  REPORT_DESCRIPTION_TEMPLATES {
    uuid id PK
    uuid subject_id FK
    string level "tuntas|belum"
    string template_text
  }
  GRADE_COMPONENTS ||--o{ GRADES : ""
  GRADE_PERIODS ||--o{ GRADES : ""
  STUDENTS ||--o{ GRADES : ""
  STUDENTS ||--o{ CHARACTER_NOTES : ""
  GRADE_PERIODS ||--o{ CHARACTER_NOTES : ""
  STUDENTS ||--o{ PROGRESS_REPORTS : ""
  GRADE_PERIODS ||--o{ PROGRESS_REPORTS : ""
  STUDENTS ||--o{ REPORT_CARDS : ""
  SEMESTERS ||--o{ REPORT_CARDS : ""
  SUBJECTS ||--o{ REPORT_DESCRIPTION_TEMPLATES : ""
```

---

## 6. CBT (Ujian Digital)
```mermaid
erDiagram
  QUESTION_BANKS {
    uuid id PK
    uuid subject_id FK
    uuid grade_level_id FK
    uuid owner_id FK
    string name
  }
  QUESTIONS {
    uuid id PK
    uuid bank_id FK
    string question_type "pg|pg_kompleks|bs|menjodohkan|isian|uraian"
    jsonb body
    string cp_code
    string cognitive_level "LOTS|MOTS|HOTS"
    int difficulty
    numeric weight
    string explanation
    int version
    string status
  }
  QUESTION_OPTIONS {
    uuid id PK
    uuid question_id FK
    string label
    jsonb body
    boolean is_correct
    string match_key
  }
  EXAMS {
    uuid id PK
    uuid subject_id FK
    uuid created_by FK
    string title
    string exam_type "kuis|harian|STS|SAS|remedial|pengayaan"
    int duration_min
    timestamptz start_at
    timestamptz end_at
    numeric passing_grade
    boolean shuffle_questions
    boolean shuffle_options
    string show_result_mode
    string status
    uuid parent_exam_id FK "untuk remedial"
  }
  EXAM_QUESTIONS {
    uuid id PK
    uuid exam_id FK
    uuid question_id FK
    int sort_order
    numeric weight_override
    string package_code
  }
  EXAM_ROOMS {
    uuid id PK
    uuid exam_id FK
    uuid room_id FK
    uuid proctor_id FK
    int session_no
    string token
    timestamptz token_expires_at
  }
  EXAM_PARTICIPANTS {
    uuid id PK
    uuid exam_id FK
    uuid student_id FK
    uuid exam_room_id FK
    string package_code
  }
  EXAM_SESSIONS {
    uuid id PK
    uuid exam_id FK
    uuid student_id FK
    string status "belum|mengerjakan|selesai|terkunci"
    timestamptz started_at
    timestamptz deadline_at
    timestamptz submitted_at
    int extra_minutes
    string seed
    numeric score
    string locked_reason
  }
  EXAM_ANSWERS {
    uuid id PK
    uuid session_id FK
    uuid question_id FK
    jsonb answer
    boolean is_flagged
    numeric score
    uuid graded_by FK
    timestamptz answered_at
  }
  EXAM_VIOLATIONS {
    uuid id PK
    uuid session_id FK
    string violation_type
    jsonb meta
    timestamptz occurred_at
  }
  EXAM_PROCTOR_ACTIONS {
    uuid id PK
    uuid session_id FK
    uuid actor_id FK
    string action
    string reason
    timestamptz created_at
  }
  EXAM_ITEM_ANALYSIS {
    uuid id PK
    uuid exam_id FK
    uuid question_id FK
    numeric difficulty_index
    numeric discrimination_index
    jsonb distractor_stats
  }
  QUESTION_BANKS ||--o{ QUESTIONS : ""
  QUESTIONS ||--o{ QUESTION_OPTIONS : ""
  EXAMS ||--o{ EXAM_QUESTIONS : ""
  QUESTIONS ||--o{ EXAM_QUESTIONS : ""
  EXAMS ||--o{ EXAM_ROOMS : ""
  EXAMS ||--o{ EXAM_PARTICIPANTS : ""
  EXAM_ROOMS ||--o{ EXAM_PARTICIPANTS : ""
  EXAMS ||--o{ EXAM_SESSIONS : ""
  STUDENTS ||--o{ EXAM_SESSIONS : ""
  EXAM_SESSIONS ||--o{ EXAM_ANSWERS : ""
  QUESTIONS ||--o{ EXAM_ANSWERS : ""
  EXAM_SESSIONS ||--o{ EXAM_VIOLATIONS : ""
  EXAM_SESSIONS ||--o{ EXAM_PROCTOR_ACTIONS : ""
  EXAMS ||--o{ EXAM_ITEM_ANALYSIS : ""
  EXAMS o|--o{ EXAMS : "remedial dari"
```

---

## 7. Kesiswaan & BK
```mermaid
erDiagram
  POINT_TYPES {
    uuid id PK
    string kind "pelanggaran|prestasi"
    string name
    int points
    string severity
  }
  STUDENT_POINTS {
    uuid id PK
    uuid student_id FK
    uuid point_type_id FK
    uuid recorded_by FK
    uuid evidence_file_id FK
    date point_date
    string notes
  }
  POINT_THRESHOLDS {
    uuid id PK
    int min_points
    string action
    jsonb notify_roles
  }
  EXTRACURRICULARS {
    uuid id PK
    uuid coach_id FK
    string name
    int quota
  }
  EXTRACURRICULAR_MEMBERS {
    uuid id PK
    uuid extracurricular_id FK
    uuid student_id FK
    string status
    string final_grade
  }
  EXTRACURRICULAR_JOURNALS {
    uuid id PK
    uuid extracurricular_id FK
    date session_date
    string activity
    jsonb attendance
  }
  ACTIVITY_DOCUMENTS {
    uuid id PK
    uuid extracurricular_id FK
    uuid file_id FK
    string doc_type "proposal|laporan"
  }
  COMPETITIONS {
    uuid id PK
    string name
    string level
    date held_at
  }
  COMPETITION_ENTRIES {
    uuid id PK
    uuid competition_id FK
    uuid student_id FK
    string result
    uuid achievement_id FK
  }
  ACHIEVEMENTS {
    uuid id PK
    uuid student_id FK
    string title
    string rank_level
    date achieved_at
  }
  TRIPS {
    uuid id PK
    string title
    date depart_date
    jsonb route
    uuid guide_file_id FK
  }
  TRIP_PARTICIPANTS {
    uuid id PK
    uuid trip_id FK
    uuid student_id FK
  }
  TRIP_CONSENTS {
    uuid id PK
    uuid trip_participant_id FK
    uuid guardian_id FK
    string decision
    timestamptz decided_at
  }
  COUNSELING_CASES {
    uuid id PK
    uuid student_id FK
    uuid counselor_id FK
    string category
    string status
    string summary_enc "terenkripsi"
  }
  COUNSELING_SESSIONS {
    uuid id PK
    uuid case_id FK
    date session_date
    string notes_enc "terenkripsi"
    string follow_up
  }
  COUNSELING_REFERRALS {
    uuid id PK
    uuid student_id FK
    uuid referred_by FK
    string reason
    string status
  }
  COUNSELING_REQUESTS {
    uuid id PK
    uuid student_id FK
    uuid requested_by FK
    string topic
    string status
  }
  EARLY_WARNINGS {
    uuid id PK
    uuid student_id FK
    string rule_code
    string severity
    jsonb data
    string status
    uuid handled_by FK
  }
  POINT_TYPES ||--o{ STUDENT_POINTS : ""
  STUDENTS ||--o{ STUDENT_POINTS : ""
  EXTRACURRICULARS ||--o{ EXTRACURRICULAR_MEMBERS : ""
  STUDENTS ||--o{ EXTRACURRICULAR_MEMBERS : ""
  EXTRACURRICULARS ||--o{ EXTRACURRICULAR_JOURNALS : ""
  EXTRACURRICULARS ||--o{ ACTIVITY_DOCUMENTS : ""
  COMPETITIONS ||--o{ COMPETITION_ENTRIES : ""
  STUDENTS ||--o{ COMPETITION_ENTRIES : ""
  STUDENTS ||--o{ ACHIEVEMENTS : ""
  ACHIEVEMENTS o|--o{ COMPETITION_ENTRIES : ""
  TRIPS ||--o{ TRIP_PARTICIPANTS : ""
  STUDENTS ||--o{ TRIP_PARTICIPANTS : ""
  TRIP_PARTICIPANTS ||--o| TRIP_CONSENTS : ""
  STUDENTS ||--o{ COUNSELING_CASES : ""
  COUNSELING_CASES ||--o{ COUNSELING_SESSIONS : ""
  STUDENTS ||--o{ COUNSELING_REFERRALS : ""
  STUDENTS ||--o{ COUNSELING_REQUESTS : ""
  STUDENTS ||--o{ EARLY_WARNINGS : ""
```

---

## 8. Sarpras & Perpustakaan
```mermaid
erDiagram
  FACILITIES {
    uuid id PK
    uuid room_id FK
    string name
    string facility_type "ruang|alat"
    int capacity
    boolean requires_approval
  }
  BOOKINGS {
    uuid id PK
    uuid facility_id FK
    uuid requested_by FK
    timestamptz start_at
    timestamptz end_at
    string purpose
    string status "diajukan|disetujui|ditolak|selesai"
    uuid decided_by FK
  }
  ASSETS {
    uuid id PK
    uuid room_id FK
    string asset_code UK "QR/barcode"
    string name
    string category
    string asset_condition
    date acquired_at
  }
  ASSET_AUDITS {
    uuid id PK
    string title
    date audit_date
    uuid auditor_id FK
    string status
  }
  ASSET_AUDIT_ITEMS {
    uuid id PK
    uuid audit_id FK
    uuid asset_id FK
    string found_condition
    boolean is_present
  }
  TICKETS {
    uuid id PK
    uuid reporter_id FK
    uuid room_id FK
    uuid asset_id FK
    uuid assignee_id FK
    string description
    string priority
    string status "pending|diproses|selesai"
    uuid photo_file_id FK
  }
  TICKET_EVENTS {
    uuid id PK
    uuid ticket_id FK
    uuid actor_id FK
    string event_type
    string note
    uuid file_id FK
    timestamptz created_at
  }
  LIBRARY_BOOKS {
    uuid id PK
    string title
    string author
    string isbn
    string book_type "fisik|digital"
    int stock
    uuid file_id FK
  }
  LOANS {
    uuid id PK
    uuid book_id FK
    uuid borrower_id FK
    date loan_date
    date due_date
    date returned_at
    int fine_amount
  }
  LAB_EQUIPMENT {
    uuid id PK
    uuid room_id FK
    string name
    int stock
  }
  LAB_LOANS {
    uuid id PK
    uuid equipment_id FK
    uuid borrower_id FK
    date loan_date
    date returned_at
  }
  FACILITIES ||--o{ BOOKINGS : ""
  ROOMS ||--o{ FACILITIES : ""
  ROOMS ||--o{ ASSETS : ""
  ASSET_AUDITS ||--o{ ASSET_AUDIT_ITEMS : ""
  ASSETS ||--o{ ASSET_AUDIT_ITEMS : ""
  ASSETS ||--o{ TICKETS : ""
  ROOMS ||--o{ TICKETS : ""
  TICKETS ||--o{ TICKET_EVENTS : ""
  LIBRARY_BOOKS ||--o{ LOANS : ""
  LAB_EQUIPMENT ||--o{ LAB_LOANS : ""
```

---

## 9. Humas, CMS, Notifikasi, File & Sistem
```mermaid
erDiagram
  GUESTS {
    uuid id PK
    uuid target_user_id FK
    string full_name
    string institution
    string phone
    string purpose
    uuid photo_file_id FK
    timestamptz check_in
    timestamptz check_out
  }
  COMPLAINTS {
    uuid id PK
    uuid reporter_user_id FK "null jika anonim"
    string ticket_code UK
    string category
    string content
    boolean is_anonymous
    string status
    uuid assigned_to FK
  }
  COMPLAINT_EVENTS {
    uuid id PK
    uuid complaint_id FK
    uuid actor_id FK
    string event_type
    string response_text
    timestamptz created_at
  }
  PARTNERSHIPS {
    uuid id PK
    string partner_name
    string scope
    date valid_from
    date valid_until
    uuid mou_file_id FK
  }
  EXCHANGE_PROGRAMS {
    uuid id PK
    uuid partnership_id FK
    string name
    date start_date
    date end_date
  }
  EXCHANGE_PARTICIPANTS {
    uuid id PK
    uuid program_id FK
    uuid student_id FK
    string status
  }
  ALUMNI {
    uuid id PK
    uuid student_id FK
    int graduation_year
    string next_institution
    string occupation
    string contact
  }
  TRACER_SURVEYS {
    uuid id PK
    string title
    jsonb questions
  }
  TRACER_RESPONSES {
    uuid id PK
    uuid survey_id FK
    uuid alumni_id FK
    jsonb answers
  }
  POSTS {
    uuid id PK
    uuid category_id FK
    uuid author_id FK
    uuid cover_file_id FK
    string slug UK
    string title
    string content
    string status "draft|terbit|arsip"
    string visibility "publik|internal"
    timestamptz published_at
  }
  POST_CATEGORIES {
    uuid id PK
    string name
    string slug UK
  }
  ALBUMS {
    uuid id PK
    string title
    uuid cover_file_id FK
  }
  MEDIA_ITEMS {
    uuid id PK
    uuid album_id FK
    uuid file_id FK
    string media_type
    string caption
  }
  BULLETINS {
    uuid id PK
    string title
    uuid file_id FK
    uuid cover_file_id FK
  }
  EVENTS {
    uuid id PK
    string title
    string category
    string visibility "publik|internal"
    timestamptz start_at
    timestamptz end_at
  }
  DOWNLOADS {
    uuid id PK
    string title
    string category
    string visibility
    uuid file_id FK
  }
  SITE_SETTINGS {
    uuid id PK
    string setting_key UK
    jsonb setting_value
  }
  NOTIFICATIONS {
    uuid id PK
    uuid user_id FK
    string notif_type
    string title
    string body
    jsonb data
    timestamptz read_at
  }
  ANNOUNCEMENTS {
    uuid id PK
    uuid author_id FK
    string title
    string body
    string target_type "semua|kelas|tingkat|role"
    jsonb target_ids
    timestamptz publish_at
  }
  ANNOUNCEMENT_READS {
    uuid announcement_id PK, FK
    uuid user_id PK, FK
    timestamptz read_at
  }
  NOTIFICATION_TEMPLATES {
    uuid id PK
    string code UK
    string channel
    string template_text
  }
  NOTIFICATION_LOGS {
    uuid id PK
    uuid user_id FK
    uuid template_id FK
    string channel
    string status
    string provider_ref
    string error
  }
  FILES {
    uuid id PK
    uuid owner_id
    string owner_type
    string bucket
    string object_key
    string mime_type
    bigint size_bytes
    string visibility "publik|privat"
    string checksum
  }
  JOBS {
    uuid id PK
    uuid requested_by FK
    uuid result_file_id FK
    string job_type
    string status
    int progress
  }
  APP_CONFIG {
    string config_key PK
    jsonb config_value
  }
  HOLIDAYS {
    uuid id PK
    date holiday_date
    string name
  }
  COMPLAINTS ||--o{ COMPLAINT_EVENTS : ""
  PARTNERSHIPS ||--o{ EXCHANGE_PROGRAMS : ""
  EXCHANGE_PROGRAMS ||--o{ EXCHANGE_PARTICIPANTS : ""
  TRACER_SURVEYS ||--o{ TRACER_RESPONSES : ""
  ALUMNI ||--o{ TRACER_RESPONSES : ""
  POST_CATEGORIES ||--o{ POSTS : ""
  ALBUMS ||--o{ MEDIA_ITEMS : ""
  ANNOUNCEMENTS ||--o{ ANNOUNCEMENT_READS : ""
  NOTIFICATION_TEMPLATES ||--o{ NOTIFICATION_LOGS : ""
  FILES ||--o{ MEDIA_ITEMS : ""
  FILES ||--o{ DOWNLOADS : ""
```

---

## 10. Catatan Relasi Lintas Domain
| Relasi | Aturan |
|---|---|
| `FILES` dirujuk banyak tabel via `file_id` | Hanya satu tabel `files`; `owner_type`/`owner_id` untuk penelusuran |
| `USERS` dirujuk `created_by`, `recorded_by`, `author_id`, dll. | FK ke `users.id`, tidak digambar ulang agar diagram bersih |
| `APPLICANTS.student_id` → `STUDENTS.id` | Terisi saat konversi; unik agar konversi idempoten |
| `GRADES.exam_id` → `EXAMS.id` | Nilai otomatis dari CBT; `source = cbt` |
| `ATTENDANCES.journal_id` nullable | Null untuk presensi gerbang harian |
| `BOOKINGS` | Constraint exclusion GiST pada (facility_id, rentang waktu) untuk booking disetujui |
| `COUNSELING_*` | Kolom `*_enc` terenkripsi; baca wajib menulis `audit_logs` |
| `PROGRESS_REPORTS` / `REPORT_CARDS` | `data_snapshot` membekukan data saat terbit |

## Changelog
- 1.0: ERD awal per domain, selaras dengan `08_DATABASE_SCHEMA.md`.
