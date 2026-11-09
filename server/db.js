const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Дерекқор файлының жолы
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Дерекқорға қосылу
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Дерекқорға қосылу қатесі:', err.message);
    } else {
        console.log('SQLite дерекқорына қосылды');
    }
});

// Дерекқор инициализациясы - Promise қайтаратын етіп өзгертеміз
function initDatabase() {
    return new Promise((resolve, reject) => {
        // Пайдаланушылар таблицасы
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
        });

        // Курстар таблицасы
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price INTEGER NOT NULL,
            icon TEXT,
            total_lessons INTEGER NOT NULL,
            lessons TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) reject(err);
        });

        // Жазылулар таблицасы
        db.run(`CREATE TABLE IF NOT EXISTS enrollments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_email TEXT NOT NULL,
            course_id TEXT NOT NULL,
            course_title TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            completed_lessons TEXT DEFAULT '[]',
            enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )`, (err) => {
            if (err) reject(err);
        });

        // Сертификаттар таблицасы
        db.run(`CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            course_id TEXT NOT NULL,
            course_title TEXT NOT NULL,
            serial_number TEXT UNIQUE NOT NULL,
            issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )`, (err) => {
            if (err) reject(err);
        });

        // ============= ЖАҢА КЕСТЕЛЕР: ВИДЕОЛАР ЖӘНЕ ТЕСТТЕР =============
        
        // Сабақ видеолары үшін кесте
        db.run(`CREATE TABLE IF NOT EXISTS lesson_videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL,
            lesson_index INTEGER NOT NULL,
            youtube_video_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses (id),
            UNIQUE(course_id, lesson_index)
        )`, (err) => {
            if (err) console.error('lesson_videos кестесі қатесі:', err);
        });

        // Тест сұрақтары үшін кесте
        db.run(`CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id TEXT NOT NULL,
            lesson_index INTEGER NOT NULL,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            explanation TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses (id)
        )`, (err) => {
            if (err) console.error('quizzes кестесі қатесі:', err);
        });

        // Пайдаланушылардың тест нәтижелері үшін кесте
        db.run(`CREATE TABLE IF NOT EXISTS user_quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            course_id TEXT NOT NULL,
            lesson_index INTEGER NOT NULL,
            quiz_id INTEGER NOT NULL,
            user_answer INTEGER NOT NULL,
            is_correct BOOLEAN NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (course_id) REFERENCES courses (id),
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
            UNIQUE(user_id, quiz_id)
        )`, (err) => {
            if (err) {
                console.error('user_quiz_results кестесі қатесі:', err);
                reject(err);
            } else {
                console.log('Барлық таблицалар құрылды');
                resolve();
            }
        });
    });
}

// Базалық функциялар
const dbMethods = {
    // === Пайдаланушылар әдістері ===
    createUser: (userData) => {
        return new Promise((resolve, reject) => {
            const { id, name, email, password, phone, avatar } = userData;
            db.run(
                `INSERT INTO users (id, name, email, password, phone, avatar) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, name, email, password, phone || null, avatar || null],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id, ...userData });
                }
            );
        });
    },

    findUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findUserById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    updateUser: (id, userData) => {
        return new Promise((resolve, reject) => {
            const { name, phone, avatar } = userData;
            db.run(
                `UPDATE users SET name = ?, phone = ?, avatar = ? WHERE id = ?`,
                [name, phone || null, avatar || null, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ success: true });
                }
            );
        });
    },

    // === Курстар әдістері ===
    getAllCourses: () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM courses`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getCourseById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM courses WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // === Жазылулар әдістері ===
    createEnrollment: (enrollmentData) => {
        return new Promise((resolve, reject) => {
            const { user_id, user_name, user_email, course_id, course_title, status = 'pending' } = enrollmentData;
            db.run(
                `INSERT INTO enrollments (user_id, user_name, user_email, course_id, course_title, status) VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, user_name, user_email, course_id, course_title, status],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...enrollmentData });
                }
            );
        });
    },

    getUserEnrollments: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM enrollments WHERE user_id = ?`, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getEnrollmentByUserAndCourse: (userId, courseId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?`,
                [userId, courseId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    updateEnrollment: (id, enrollmentData) => {
        return new Promise((resolve, reject) => {
            const { status, progress, completed_lessons } = enrollmentData;
            db.run(
                `UPDATE enrollments SET status = ?, progress = ?, completed_lessons = ? WHERE id = ?`,
                [status, progress, completed_lessons, id],
                function(err) {
                    if (err) reject(err);
                    else resolve({ success: true });
                }
            );
        });
    },

    // === Сертификаттар әдістері ===
    createCertificate: (certificateData) => {
        return new Promise((resolve, reject) => {
            const { user_id, user_name, course_id, course_title, serial_number } = certificateData;
            db.run(
                `INSERT INTO certificates (user_id, user_name, course_id, course_title, serial_number) VALUES (?, ?, ?, ?, ?)`,
                [user_id, user_name, course_id, course_title, serial_number],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...certificateData });
                }
            );
        });
    },

    getUserCertificate: (userId, courseId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM certificates WHERE user_id = ? AND course_id = ?`,
                [userId, courseId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    getUserCertificates: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM certificates WHERE user_id = ? ORDER BY issue_date DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // === Курс прогрессі әдістері ===
    getCourseProgress: (userId, courseId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT progress FROM enrollments WHERE user_id = ? AND course_id = ?`,
                [userId, courseId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.progress : 0);
                }
            );
        });
    },

    // ============= ЖАҢА ӘДІСТЕР: ВИДЕОЛАР ЖӘНЕ ТЕСТТЕР =============
    
    // Сабақ видеоларын алу
    getLessonVideo: (courseId, lessonIndex) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM lesson_videos WHERE course_id = ? AND lesson_index = ?`,
                [courseId, lessonIndex],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Курстың барлық видеоларын алу
    getCourseVideos: (courseId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM lesson_videos WHERE course_id = ? ORDER BY lesson_index`,
                [courseId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Сабақтың тест сұрақтарын алу
    getQuizByLesson: (courseId, lessonIndex) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM quizzes WHERE course_id = ? AND lesson_index = ? ORDER BY id`,
                [courseId, lessonIndex],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Тест нәтижесін сақтау
    saveQuizResult: (quizData) => {
        return new Promise((resolve, reject) => {
            const { user_id, course_id, lesson_index, quiz_id, user_answer, is_correct } = quizData;
            db.run(
                `INSERT INTO user_quiz_results (user_id, course_id, lesson_index, quiz_id, user_answer, is_correct) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, course_id, lesson_index, quiz_id, user_answer, is_correct],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...quizData });
                }
            );
        });
    },

    // Пайдаланушының тест нәтижелерін алу
    getUserQuizResults: (userId, courseId, lessonIndex) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT q.*, ur.user_answer, ur.is_correct, ur.completed_at 
                 FROM quizzes q 
                 LEFT JOIN user_quiz_results ur ON q.id = ur.quiz_id AND ur.user_id = ?
                 WHERE q.course_id = ? AND q.lesson_index = ? 
                 ORDER BY q.id`,
                [userId, courseId, lessonIndex],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Видеоны сақтау (әкімшілік үшін)
    addLessonVideo: (videoData) => {
        return new Promise((resolve, reject) => {
            const { course_id, lesson_index, youtube_video_id, title, description, duration } = videoData;
            db.run(
                `INSERT INTO lesson_videos (course_id, lesson_index, youtube_video_id, title, description, duration) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [course_id, lesson_index, youtube_video_id, title, description || null, duration || null],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...videoData });
                }
            );
        });
    },

    // Тест сұрағын сақтау (әкімшілік үшін)
    addQuizQuestion: (quizData) => {
        return new Promise((resolve, reject) => {
            const { course_id, lesson_index, question, options, correct_answer, explanation } = quizData;
            db.run(
                `INSERT INTO quizzes (course_id, lesson_index, question, options, correct_answer, explanation) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [course_id, lesson_index, question, JSON.stringify(options), correct_answer, explanation || null],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...quizData });
                }
            );
        });
    },

    // Тест сұрағын ID бойынша алу
    getQuizById: (quizId) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM quizzes WHERE id = ?`, [quizId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    // Пайдаланушының барлық тест нәтижелерін алу
    getUserAllQuizResults: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT ur.*, q.question, q.correct_answer 
                 FROM user_quiz_results ur 
                 JOIN quizzes q ON ur.quiz_id = q.id 
                 WHERE ur.user_id = ? 
                 ORDER BY ur.completed_at DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Сабақ бойынша тест статистикасы
    getQuizStatistics: (courseId, lessonIndex) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT 
                    q.id,
                    q.question,
                    COUNT(ur.id) as total_attempts,
                    SUM(CASE WHEN ur.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
                 FROM quizzes q
                 LEFT JOIN user_quiz_results ur ON q.id = ur.quiz_id
                 WHERE q.course_id = ? AND q.lesson_index = ?
                 GROUP BY q.id
                 ORDER BY q.id`,
                [courseId, lessonIndex],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Пайдаланушының курстағы жалпы статистикасы
    getUserCourseQuizStats: (userId, courseId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT 
                    COUNT(ur.id) as total_attempts,
                    SUM(CASE WHEN ur.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
                 FROM user_quiz_results ur
                 JOIN quizzes q ON ur.quiz_id = q.id
                 WHERE ur.user_id = ? AND ur.course_id = ?`,
                [userId, courseId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row || { total_attempts: 0, correct_answers: 0 });
                }
            );
        });
    },

    // Пайдаланушының сабақтағы тест нәтижесін тексеру
    getUserQuizResult: (userId, quizId) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM user_quiz_results WHERE user_id = ? AND quiz_id = ?`,
                [userId, quizId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Пайдаланушының тест нәтижесін жаңарту
    updateQuizResult: (userId, quizId, quizData) => {
        return new Promise((resolve, reject) => {
            const { user_answer, is_correct } = quizData;
            db.run(
                `UPDATE user_quiz_results SET user_answer = ?, is_correct = ?, completed_at = CURRENT_TIMESTAMP 
                 WHERE user_id = ? AND quiz_id = ?`,
                [user_answer, is_correct, userId, quizId],
                function(err) {
                    if (err) reject(err);
                    else resolve({ success: true });
                }
            );
        });
    },

    // Курстың барлық тест сұрақтарын алу
    getAllQuizzesForCourse: (courseId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT * FROM quizzes WHERE course_id = ? ORDER BY lesson_index, id`,
                [courseId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
};

module.exports = { db, initDatabase, dbMethods };