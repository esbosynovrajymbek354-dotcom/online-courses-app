const { db, initDatabase, dbMethods } = require('./db.js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Бастапқы деректерді қосу
async function seedDatabase() {
    console.log('Дерекқорды инициализациялау...');
    
    // 1. Алдымен таблицаларды құру
    try {
        await initDatabase();
        console.log('✅ Таблицалар сәтті құрылды');
    } catch (error) {
        console.error('❌ Таблицаларды құру қатесі:', error);
        return;
    }
    
    // 2. Бастапқы курс деректері (бұрынғыдай)
    const courses = [
        {
            id: 'course_1',
            title: 'Web Development Негіздері',
            description: 'HTML, CSS, JavaScript негіздерін үйреніңіз және қазіргі заманғы веб-сайттар жасаңыз.',
            price: 29990,
            icon: '🌐',
            total_lessons: 6,
            lessons: JSON.stringify([
                { title: 'HTML Негіздері', description: 'HTML тегтері мен құрылымы', duration: '45 мин' },
                { title: 'CSS Стильдері', description: 'CSS селекторлары мен қасиеттері', duration: '50 мин' },
                { title: 'CSS Flexbox', description: 'Заманауи layout жүйесі', duration: '40 мин' },
                { title: 'JavaScript Кіріспе', description: 'JS синтаксисі мен айнымалылар', duration: '60 мин' },
                { title: 'DOM Manipulation', description: 'JavaScript арқылы HTML басқару', duration: '55 мин' },
                { title: 'Final Project', description: 'Толық веб-сайт жасау', duration: '90 мин' }
            ])
        },
        {
            id: 'course_2',
            title: 'Python Programming',
            description: 'Python тілінің негізгі концепцияларын меңгеріп, практикалық жобалар жасаңыз.',
            price: 34990,
            icon: '🐍',
            total_lessons: 5,
            lessons: JSON.stringify([
                { title: 'Python Негіздері', description: 'Айнымалылар, типтер, операторлар', duration: '50 мин' },
                { title: 'Циклдар мен шарттар', description: 'if, for, while операторлары', duration: '45 мин' },
                { title: 'Функциялар', description: 'Функция жазу және қолдану', duration: '55 мин' },
                { title: 'ООП Негіздері', description: 'Класстар мен объектілер', duration: '70 мин' },
                { title: 'Жоба жасау', description: 'Python қосымшасын жасау', duration: '120 мин' }
            ])
        },
        {
            id: 'course_3',
            title: 'Data Science & AI',
            description: 'Деректерді талдау, машиналық оқыту және жасанды интеллект саласында маман болыңыз.',
            price: 49990,
            icon: '🤖',
            total_lessons: 6,
            lessons: JSON.stringify([
                { title: 'Data Science кіріспе', description: 'Деректер ғылымының негіздері', duration: '40 мин' },
                { title: 'NumPy & Pandas', description: 'Деректерді өңдеу кітапханалары', duration: '60 мин' },
                { title: 'Data Visualization', description: 'Matplotlib, Seaborn', duration: '50 мин' },
                { title: 'Machine Learning', description: 'ML алгоритмдері', duration: '75 мин' },
                { title: 'Neural Networks', description: 'Жасанды нейрондық желілер', duration: '80 мин' },
                { title: 'AI жобасы', description: 'Толық AI моделін жасау', duration: '150 мин' }
            ])
        },
        {
            id: 'course_4',
            title: 'Mobile App Development',
            description: 'iOS және Android платформаларына арналған мобильді қосымшалар әзірлеңіз.',
            price: 39990,
            icon: '📱',
            total_lessons: 5,
            lessons: JSON.stringify([
                { title: 'Mobile Dev кіріспе', description: 'React Native негіздері', duration: '45 мин' },
                { title: 'UI Components', description: 'Компоненттер құру', duration: '60 мин' },
                { title: 'Navigation', description: 'Экрандар арасында өту', duration: '50 мин' },
                { title: 'API Integration', description: 'Backend-пен байланыс', duration: '70 мин' },
                { title: 'App жариялау', description: 'Store-ға жүктеу', duration: '40 мин' }
            ])
        },
        {
            id: 'course_5',
            title: 'Digital Marketing',
            description: 'Цифрлық маркетинг стратегиялары мен құралдарын меңгеріңіз.',
            price: 24990,
            icon: '📊',
            total_lessons: 4,
            lessons: JSON.stringify([
                { title: 'Marketing Негіздері', description: 'Цифрлық маркетинг кіріспе', duration: '35 мин' },
                { title: 'SEO & SEM', description: 'Іздеу жүйелерін оңтайландыру', duration: '55 мин' },
                { title: 'Social Media', description: 'Әлеуметтік желілерде маркетинг', duration: '50 мин' },
                { title: 'Analytics', description: 'Google Analytics, метрикалар', duration: '45 мин' }
            ])
        },
        {
            id: 'course_6',
            title: 'UI/UX Design',
            description: 'Пайдаланушы интерфейсі мен тәжірибесін дизайн етуді үйреніңіз.',
            price: 32990,
            icon: '🎨',
            total_lessons: 5,
            lessons: JSON.stringify([
                { title: 'Design Principles', description: 'Дизайн принциптері', duration: '40 мин' },
                { title: 'Figma Негіздері', description: 'Figma құралын үйрену', duration: '65 мин' },
                { title: 'User Research', description: 'Пайдаланушыларды зерттеу', duration: '50 мин' },
                { title: 'Prototyping', description: 'Прототип жасау', duration: '70 мин' },
                { title: 'Design System', description: 'Дизайн жүйесін құру', duration: '60 мин' }
            ])
        }
    ];

    // Курстарды сақтау
    let coursesAdded = 0;
    for (const course of courses) {
        try {
            // Бар-жоғын тексеру үшін алдымен COUNT санау
            db.get(`SELECT COUNT(*) as count FROM courses WHERE id = ?`, [course.id], (err, row) => {
                if (err) {
                    console.error(`❌ Курсты тексеру қатесі (${course.id}):`, err);
                } else if (row.count === 0) {
                    // Курс жоқ болса, қосу
                    db.run(
                        `INSERT INTO courses (id, title, description, price, icon, total_lessons, lessons) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [course.id, course.title, course.description, course.price, course.icon, 
                         course.total_lessons, course.lessons],
                        (err) => {
                            if (err) {
                                console.error(`❌ Курсты сақтау қатесі (${course.id}):`, err);
                            } else {
                                coursesAdded++;
                                console.log(`✅ Курс қосылды: ${course.title}`);
                            }
                        }
                    );
                } else {
                    console.log(`ℹ️ Курс бұрыннан бар: ${course.title}`);
                }
            });
        } catch (error) {
            console.error(`❌ Курсты өңдеу қатесі (${course.id}):`, error);
        }
    }

    // 3. БАРЛЫҚ КУРСТАРҒА АРНАЛҒАН ВИДЕОЛАР МЕН ТЕСТТЕР
    console.log('🎬 Видеолар мен тесттер қосылуда...');
    
    // ================ COURSE 1: Web Development ================
    const videosForCourse1 = [
        {
            course_id: 'course_1',
            lesson_index: 0,
            youtube_video_id: 'qz0aGYrrlhU',
            title: 'HTML Негіздері - Кіріспе',
            description: 'HTML тегтері мен құрылымын үйренеміз. Бастапқы HTML құрылымы, тегтер, аттрибуттар.',
            duration: '45 мин'
        },
        {
            course_id: 'course_1',
            lesson_index: 1,
            youtube_video_id: 'yfoY53QXEnI',
            title: 'CSS Стильдері',
            description: 'CSS селекторлары мен қасиеттері. Элементтерге стиль беру, класстар, ID.',
            duration: '50 мин'
        },
        {
            course_id: 'course_1', 
            lesson_index: 2,
            youtube_video_id: 'JJSoEo8JSnc',
            title: 'Flexbox Tutorial',
            description: 'Заманауи CSS Flexbox жүйесі. Қазіргі заманғы веб-дизайн үшін негізгі құрал.',
            duration: '40 мин'
        },
        {
            course_id: 'course_1',
            lesson_index: 3,
            youtube_video_id: 'W6NZfCO5SIk',
            title: 'JavaScript негіздері',
            description: 'JavaScript синтаксисі мен айнымалылар. JS бағдарламалау тіліне кіріспе.',
            duration: '60 мин'
        },
        {
            course_id: 'course_1',
            lesson_index: 4,
            youtube_video_id: 'KIqk6PC2ojc',
            title: 'DOM Manipulation',
            description: 'JavaScript арқылы HTML элементтерін басқару. Ағымдағы веб-қосымшалар жасау.',
            duration: '55 мин'
        },
        {
            course_id: 'course_1',
            lesson_index: 5,
            youtube_video_id: 'lI1ae4REbFM',
            title: 'Final Project - Веб-сайт жасау',
            description: 'HTML, CSS, JavaScript қолданып толық веб-сайт жасау. Практикалық жоба.',
            duration: '90 мин'
        }
    ];

    // ================ COURSE 2: Python Programming ================
    const videosForCourse2 = [
        {
            course_id: 'course_2',
            lesson_index: 0,
            youtube_video_id: 'rfscVS0vtbw',
            title: 'Python негіздері',
            description: 'Python тіліне кіріспе. Айнымалылар, типтер, негізгі операторлар.',
            duration: '50 мин'
        },
        {
            course_id: 'course_2',
            lesson_index: 1,
            youtube_video_id: 'Z1Yd7upQsXY',
            title: 'Циклдар мен шарттар',
            description: 'if, for, while операторлары. Python бағдарламалаудағы негізгі логикалық құрылымдар.',
            duration: '45 мин'
        },
        {
            course_id: 'course_2',
            lesson_index: 2,
            youtube_video_id: '9Os0o3wzSaI',
            title: 'Функциялар',
            description: 'Python функцияларын жазу және қолдану. Параметрлер, мән қайтару, рекурсия.',
            duration: '55 мин'
        },
        {
            course_id: 'course_2',
            lesson_index: 3,
            youtube_video_id: 'ZDa-Z5JzLYM',
            title: 'ООП Негіздері',
            description: 'Python-дағы объектіге бағытталған программалау. Класстар, объектілер, мұрагерлік.',
            duration: '70 мин'
        },
        {
            course_id: 'course_2',
            lesson_index: 4,
            youtube_video_id: '8ext9G7xspg',
            title: 'Python жобасы',
            description: 'Python қолданып практикалық қосымша жасау. Толық проектті әзірлеу.',
            duration: '120 мин'
        }
    ];

    // ================ COURSE 3: Data Science & AI ================
    const videosForCourse3 = [
        {
            course_id: 'course_3',
            lesson_index: 0,
            youtube_video_id: 'ua-CiDNNj30',
            title: 'Data Science кіріспе',
            description: 'Деректер ғылымының негіздері. Деректерді талдау және визуализациялау.',
            duration: '40 мин'
        },
        {
            course_id: 'course_3',
            lesson_index: 1,
            youtube_video_id: 'yb4b1Ssk5_s',
            title: 'NumPy & Pandas',
            description: 'Деректерді өңдеу кітапханалары. Python-дағы деректерді талдау құралдары.',
            duration: '60 мин'
        },
        {
            course_id: 'course_3',
            lesson_index: 2,
            youtube_video_id: 'PJ1dvAgOAj0',
            title: 'Data Visualization',
            description: 'Matplotlib, Seaborn кітапханалары. Деректерді визуализациялау техникалары.',
            duration: '50 мин'
        },
        {
            course_id: 'course_3',
            lesson_index: 3,
            youtube_video_id: 'KNAWp2S3w94',
            title: 'Machine Learning',
            description: 'Машиналық оқыту алгоритмдері. Supervised, unsupervised learning.',
            duration: '75 мин'
        },
        {
            course_id: 'course_3',
            lesson_index: 4,
            youtube_video_id: 'aircAruvnKk',
            title: 'Neural Networks',
            description: 'Жасанды нейрондық желілер. Deep Learning негіздері.',
            duration: '80 мин'
        },
        {
            course_id: 'course_3',
            lesson_index: 5,
            youtube_video_id: 'wQ8BIBpya2k',
            title: 'AI жобасы',
            description: 'Толық AI моделін жасау. Нақты деректермен жұмыс істеу.',
            duration: '150 мин'
        }
    ];

    // ================ COURSE 4: Mobile App Development ================
    const videosForCourse4 = [
        {
            course_id: 'course_4',
            lesson_index: 0,
            youtube_video_id: '0-S5a0eXPoc',
            title: 'React Native негіздері',
            description: 'Мобильді қосымша әзірлеуге кіріспе. React Native ортасын орнату.',
            duration: '45 мин'
        },
        {
            course_id: 'course_4',
            lesson_index: 1,
            youtube_video_id: 'Hf4MJH0jDb4',
            title: 'UI Components',
            description: 'React Native UI компоненттері. Кнопкалар, мәтін өрістері, тізімдер.',
            duration: '60 мин'
        },
        {
            course_id: 'course_4',
            lesson_index: 2,
            youtube_video_id: 'DnCvN0R7Fq8',
            title: 'Navigation',
            description: 'Экрандар арасында өту. React Navigation кітапханасы.',
            duration: '50 мин'
        },
        {
            course_id: 'course_4',
            lesson_index: 3,
            youtube_video_id: 'zQjdH7y7pRo',
            title: 'API Integration',
            description: 'Backend API-мен байланысу. Fetch, axios қолдану.',
            duration: '70 мин'
        },
        {
            course_id: 'course_4',
            lesson_index: 4,
            youtube_video_id: 'mWPy7w1wZRo',
            title: 'App жариялау',
            description: 'App Store және Google Play-ге қосымша жүктеу.',
            duration: '40 мин'
        }
    ];

    // ================ COURSE 5: Digital Marketing ================
    const videosForCourse5 = [
        {
            course_id: 'course_5',
            lesson_index: 0,
            youtube_video_id: '7D2p9i_YtJ0',
            title: 'Digital Marketing кіріспе',
            description: 'Цифрлық маркетинг негіздері. Бренд құру стратегиялары.',
            duration: '35 мин'
        },
        {
            course_id: 'course_5',
            lesson_index: 1,
            youtube_video_id: 'mjPQVQ9Qj4Q',
            title: 'SEO & SEM',
            description: 'Іздеу жүйелерін оңтайландыру. Google Ads және SEO техникалары.',
            duration: '55 мин'
        },
        {
            course_id: 'course_5',
            lesson_index: 2,
            youtube_video_id: '8K1-HbW0J2c',
            title: 'Social Media Marketing',
            description: 'Әлеуметтік желілерде маркетинг. Facebook, Instagram, TikTok стратегиялары.',
            duration: '50 мин'
        },
        {
            course_id: 'course_5',
            lesson_index: 3,
            youtube_video_id: 'XhYy6yJAZ-Y',
            title: 'Analytics & Metrics',
            description: 'Google Analytics, метрикалар. Маркетинг тиімділігін өлшеу.',
            duration: '45 мин'
        }
    ];

    // ================ COURSE 6: UI/UX Design ================
    const videosForCourse6 = [
        {
            course_id: 'course_6',
            lesson_index: 0,
            youtube_video_id: 'c9Wg6Cb_YlU',
            title: 'Дизайн принциптері',
            description: 'UI/UX дизайнның негізгі принциптері. Колористика, типография.',
            duration: '40 мин'
        },
        {
            course_id: 'course_6',
            lesson_index: 1,
            youtube_video_id: 'fgK3qL_7L0c',
            title: 'Figma негіздері',
            description: 'Figma құралын үйрену. Дизайн құралдары, плагиндер.',
            duration: '65 мин'
        },
        {
            course_id: 'course_6',
            lesson_index: 2,
            youtube_video_id: 'Cj6Pp0lYwqA',
            title: 'User Research',
            description: 'Пайдаланушыларды зерттеу әдістері. Persona, user journey.',
            duration: '50 мин'
        },
        {
            course_id: 'course_6',
            lesson_index: 3,
            youtube_video_id: 'vK-3L5Qk5Kk',
            title: 'Prototyping',
            description: 'Прототип жасау. Wireframes, mockups, interactive prototypes.',
            duration: '70 мин'
        },
        {
            course_id: 'course_6',
            lesson_index: 4,
            youtube_video_id: 'R5cJQn4qLkI',
            title: 'Design System',
            description: 'Дизайн жүйесін құру. Components, patterns, style guides.',
            duration: '60 мин'
        }
    ];

    // Видеоларды сақтау функциясы
    function addVideos(videos) {
        videos.forEach(video => {
            db.get(`SELECT COUNT(*) as count FROM lesson_videos WHERE course_id = ? AND lesson_index = ?`, 
                   [video.course_id, video.lesson_index], (err, row) => {
                if (err) {
                    console.error(`❌ Видео тексеру қатесі:`, err);
                } else if (row.count === 0) {
                    db.run(
                        `INSERT INTO lesson_videos (course_id, lesson_index, youtube_video_id, title, description, duration) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [video.course_id, video.lesson_index, video.youtube_video_id, 
                         video.title, video.description, video.duration],
                        (err) => {
                            if (err) {
                                console.error(`❌ Видео сақтау қатесі:`, err);
                            } else {
                                console.log(`✅ Видео қосылды: ${video.title}`);
                            }
                        }
                    );
                } else {
                    console.log(`ℹ️ Видео бұрыннан бар: ${video.title}`);
                }
            });
        });
    }

    // Тест сұрақтарын сақтау функциясы
    function addQuizzes(quizzes) {
        quizzes.forEach(quiz => {
            db.get(`SELECT COUNT(*) as count FROM quizzes WHERE course_id = ? AND lesson_index = ? AND question = ?`, 
                   [quiz.course_id, quiz.lesson_index, quiz.question], (err, row) => {
                if (err) {
                    console.error(`❌ Тест тексеру қатесі:`, err);
                } else if (row.count === 0) {
                    db.run(
                        `INSERT INTO quizzes (course_id, lesson_index, question, options, correct_answer, explanation) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [quiz.course_id, quiz.lesson_index, quiz.question, 
                         JSON.stringify(quiz.options), quiz.correct_answer, quiz.explanation || null],
                        (err) => {
                            if (err) {
                                console.error(`❌ Тест сақтау қатесі:`, err);
                            } else {
                                console.log(`✅ Тест қосылды: ${quiz.question.substring(0, 40)}...`);
                            }
                        }
                    );
                } else {
                    console.log(`ℹ️ Тест бұрыннан бар: ${quiz.question.substring(0, 40)}...`);
                }
            });
        });
    }

    // ================ COURSE 1: Web Development TESTS ================
    const quizzesForCourse1 = {
        0: [ // HTML негіздері
            {
                course_id: 'course_1',
                lesson_index: 0,
                question: 'HTML деген не?',
                options: [
                    'Гипертекст белгілеу тілі',
                    'Программалау тілі',
                    'Дерекқор тілі',
                    'Операциялық жүйе'
                ],
                correct_answer: 0,
                explanation: 'HTML - HyperText Markup Language (Гипертекст белгілеу тілі) веб-беттерді құру үшін қолданылады.'
            },
            {
                course_id: 'course_1',
                lesson_index: 0,
                question: 'HTML құрамына не кіреді?',
                options: [
                    'Тегтер мен аттрибуттар',
                    'Функциялар мен объектілер',
                    'Транзакциялар',
                    'Серверлер'
                ],
                correct_answer: 0,
                explanation: 'HTML тегтер мен аттрибуттар арқылы құрылады.'
            },
            {
                course_id: 'course_1',
                lesson_index: 0,
                question: 'Қай тег HTML бас тегі болып табылады?',
                options: ['<html>', '<head>', '<body>', '<div>'],
                correct_answer: 0,
                explanation: '<html> тегі HTML құжатының бас тегі болып табылады.'
            }
        ],
        1: [ // CSS негіздері
            {
                course_id: 'course_1',
                lesson_index: 1,
                question: 'CSS деген не?',
                options: [
                    'Каскадты стильдер кестесі',
                    'Программалау тілі',
                    'Дерекқор тілі',
                    'HTML тегі'
                ],
                correct_answer: 0,
                explanation: 'CSS - Cascading Style Sheets (Каскадты стильдер кестесі) веб-беттердің көрінісін сипаттау үшін қолданылады.'
            },
            {
                course_id: 'course_1',
                lesson_index: 1,
                question: 'CSS қандай мақсатта қолданылады?',
                options: [
                    'Веб-беттерді стильдеу үшін',
                    'Дерекқорды басқару үшін',
                    'Сервер логикасы үшін',
                    'Мобильді қосымшалар үшін'
                ],
                correct_answer: 0,
                explanation: 'CSS веб-беттердің көрінісін басқару үшін қолданылады.'
            },
            {
                course_id: 'course_1',
                lesson_index: 1,
                question: 'CSS селекторы деген не?',
                options: [
                    'HTML элементін таңдау үшін пайдаланылатын өрнек',
                    'CSS файлының аты',
                    'JavaScript функциясы',
                    'Дерекқор кестесі'
                ],
                correct_answer: 0,
                explanation: 'CSS селекторы HTML элементтерін таңдау үшін қолданылады.'
            }
        ],
        2: [ // Flexbox
            {
                course_id: 'course_1',
                lesson_index: 2,
                question: 'Flexbox не үшін қолданылады?',
                options: [
                    'Элементтерді икемді орналастыру үшін',
                    'Түстерді таңдау үшін',
                    'Анимация жасау үшін',
                    'Деректерді сақтау үшін'
                ],
                correct_answer: 0,
                explanation: 'Flexbox элементтерді икемді орналастыру үшін қолданылады.'
            },
            {
                course_id: 'course_1',
                lesson_index: 2,
                question: 'Қай қасиет элементті негізгі ось бойынша орналастырады?',
                options: ['justify-content', 'align-items', 'flex-direction', 'flex-wrap'],
                correct_answer: 0,
                explanation: 'justify-content қасиеті элементті негізгі ось бойынша орналастырады.'
            }
        ],
        3: [ // JavaScript негіздері
            {
                course_id: 'course_1',
                lesson_index: 3,
                question: 'JavaScript қандай тіл?',
                options: [
                    'Сценарийлік программалау тілі',
                    'Белгілеу тілі',
                    'Дерекқор тілі',
                    'Ойын движок тілі'
                ],
                correct_answer: 0,
                explanation: 'JavaScript веб-браузерде орындалатын сценарийлік программалау тілі.'
            },
            {
                course_id: 'course_1',
                lesson_index: 3,
                question: 'JavaScript айнымалысын қалай жариялауға болады?',
                options: ['let, const, var', 'int, string, float', 'variable, constant', 'def, set, get'],
                correct_answer: 0,
                explanation: 'JavaScript-те айнымалыларды let, const немесе var көмегімен жариялауға болады.'
            }
        ],
        4: [ // DOM Manipulation
            {
                course_id: 'course_1',
                lesson_index: 4,
                question: 'DOM деген не?',
                options: [
                    'Құжат объектілерінің моделі',
                    'Дерекқор объекті моделі',
                    'Дизайн объекті моделі',
                    'Медиа объекті моделі'
                ],
                correct_answer: 0,
                explanation: 'DOM - Document Object Model (Құжат объектілерінің моделі) HTML құжатының құрылымын білдіреді.'
            }
        ],
        5: [ // Final Project
            {
                course_id: 'course_1',
                lesson_index: 5,
                question: 'Веб-сайт әзірлеуде қай технологиялар қажет?',
                options: [
                    'HTML, CSS, JavaScript',
                    'Python, Java, C++',
                    'Photoshop, Illustrator',
                    'MySQL, MongoDB'
                ],
                correct_answer: 0,
                explanation: 'Веб-сайт әзірлеу үшін HTML, CSS және JavaScript қажет.'
            }
        ]
    };

    // ================ COURSE 2: Python Programming TESTS ================
    const quizzesForCourse2 = {
        0: [ // Python негіздері
            {
                course_id: 'course_2',
                lesson_index: 0,
                question: 'Python қандай тіл?',
                options: [
                    'Жоғары деңгейлі интерпретацияланған тіл',
                    'Төмен деңгейлі компиляцияланған тіл',
                    'Белгілеу тілі',
                    'Дерекқор тілі'
                ],
                correct_answer: 0,
                explanation: 'Python - жоғары деңгейлі, интерпретацияланған бағдарламалау тілі.'
            }
        ],
        1: [ // Циклдар мен шарттар
            {
                course_id: 'course_2',
                lesson_index: 1,
                question: 'Python-да қандай цикл түрлері бар?',
                options: ['for, while', 'loop, repeat', 'circle, cycle', 'iterate, repeat'],
                correct_answer: 0,
                explanation: 'Python-да for және while циклдары бар.'
            }
        ],
        2: [ // Функциялар
            {
                course_id: 'course_2',
                lesson_index: 2,
                question: 'Python функциясын қалай анықтаймыз?',
                options: ['def', 'function', 'func', 'define'],
                correct_answer: 0,
                explanation: 'Python-да функцияны def кілт сөзімен анықтаймыз.'
            }
        ],
        3: [ // ООП
            {
                course_id: 'course_2',
                lesson_index: 3,
                question: 'ООП деген не?',
                options: [
                    'Объектіге бағытталған программалау',
                    'Объектісіз программалау',
                    'Операциялық объект программасы',
                    'Объекттік өңдеу процедурасы'
                ],
                correct_answer: 0,
                explanation: 'ООП - объектіге бағытталған программалау.'
            }
        ],
        4: [ // Жоба жасау
            {
                course_id: 'course_2',
                lesson_index: 4,
                question: 'Python жобасында қандай кітапханалар көп қолданылады?',
                options: ['NumPy, Pandas', 'React, Vue', 'HTML, CSS', 'MySQL, PostgreSQL'],
                correct_answer: 0,
                explanation: 'Python жобаларында NumPy және Pandas кітапханалары жиі қолданылады.'
            }
        ]
    };

    // ================ COURSE 3-6 ҮШІН ҚҰРЫЛҒАН ТЕСТТЕР (барлық сабақтарға) ================
    const generateQuizzesForCourse = (courseId, totalLessons, courseName) => {
        const quizzes = {};
        for (let i = 0; i < totalLessons; i++) {
            quizzes[i] = [
                {
                    course_id: courseId,
                    lesson_index: i,
                    question: `${courseName} курсының ${i+1}-сабағы не туралы?`,
                    options: [
                        `${courseName} негіздері`,
                        'Басқа курс туралы',
                        'Видео монтаж туралы',
                        'Музыка туралы'
                    ],
                    correct_answer: 0,
                    explanation: `Бұл сабақ ${courseName} курсының негізгі тақырыптары туралы.`
                },
                {
                    course_id: courseId,
                    lesson_index: i,
                    question: `${courseName} курсында қандай дағдыларды үйренеміз?`,
                    options: [
                        'Негізгі концепциялар мен практикалық дағдылар',
                        'Тек теория',
                        'Тек практика',
                        'Ешнәрсе'
                    ],
                    correct_answer: 0,
                    explanation: 'Бұл курста теория мен практиканы үйлестіре отырып үйренеміз.'
                }
            ];
        }
        return quizzes;
    };

    const quizzesForCourse3 = generateQuizzesForCourse('course_3', 6, 'Data Science & AI');
    const quizzesForCourse4 = generateQuizzesForCourse('course_4', 5, 'Mobile App Development');
    const quizzesForCourse5 = generateQuizzesForCourse('course_5', 4, 'Digital Marketing');
    const quizzesForCourse6 = generateQuizzesForCourse('course_6', 5, 'UI/UX Design');

    // Видеоларды қосу
    console.log('\n📹 Видеолар қосылуда...');
    setTimeout(() => {
        addVideos(videosForCourse1);
        addVideos(videosForCourse2);
        addVideos(videosForCourse3);
        addVideos(videosForCourse4);
        addVideos(videosForCourse5);
        addVideos(videosForCourse6);
    }, 2000);

    // Тесттерді қосу
    console.log('\n📝 Тест сұрақтары қосылуда...');
    setTimeout(() => {
        // Course 1 тесттері
        Object.values(quizzesForCourse1).forEach(quizzes => addQuizzes(quizzes));
        
        // Course 2 тесттері
        Object.values(quizzesForCourse2).forEach(quizzes => addQuizzes(quizzes));
        
        // Course 3-6 тесттері
        Object.values(quizzesForCourse3).forEach(quizzes => addQuizzes(quizzes));
        Object.values(quizzesForCourse4).forEach(quizzes => addQuizzes(quizzes));
        Object.values(quizzesForCourse5).forEach(quizzes => addQuizzes(quizzes));
        Object.values(quizzesForCourse6).forEach(quizzes => addQuizzes(quizzes));
        
        console.log('✅ Барлық курстарға тесттер қосылды!');
    }, 3000);

    // Тест пайдаланушысын қосу
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = {
            id: uuidv4(),
            name: 'Тест Пайдаланушы',
            email: 'test@example.com',
            password: hashedPassword,
            phone: '+7 (777) 123-45-67',
            avatar: 'TP'
        };

        // Пайдаланушы бар-жоғын тексеру
        db.get(`SELECT COUNT(*) as count FROM users WHERE email = ?`, [testUser.email], async (err, row) => {
            if (err) {
                console.error('❌ Пайдаланушыны тексеру қатесі:', err);
            } else if (row.count === 0) {
                // Пайдаланушы жоқ болса, қосу
                db.run(
                    `INSERT INTO users (id, name, email, password, phone, avatar) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [testUser.id, testUser.name, testUser.email, testUser.password, 
                     testUser.phone, testUser.avatar],
                    (err) => {
                        if (err) {
                            console.error('❌ Пайдаланушыны сақтау қатесі:', err);
                        } else {
                            console.log('\n✅ Тест пайдаланушысы қосылды');
                            console.log('📧 Email: test@example.com');
                            console.log('🔑 Құпия сөз: password123');
                        }
                    }
                );
            } else {
                console.log('\nℹ️ Тест пайдаланушысы бұрыннан бар');
            }
        });
    } catch (error) {
        console.error('❌ Тест пайдаланушысын қосу қатесі:', error);
    }

    // Кішігірім күту (асинхронды операциялар аяқталуы үшін)
    setTimeout(() => {
        console.log('\n==============================');
        console.log('🎉 БАРЛЫҚ КУРСТАРҒА ВИДЕО МЕН ТЕСТТЕР ҚОСЫЛДЫ!');
        console.log('📊 Статистика:');
        console.log('   • 6 курс қосылды');
        console.log('   • Барлық 31 сабаққа видеолар қосылды');
        console.log('   • Барлық сабақтарға тест сұрақтары қосылды');
        console.log('==============================\n');
        
        // Курстардың деректерін тексеру
        db.all(`SELECT 
            c.id, 
            c.title, 
            c.total_lessons,
            COUNT(DISTINCT lv.lesson_index) as video_count,
            COUNT(DISTINCT q.lesson_index) as quiz_count
        FROM courses c
        LEFT JOIN lesson_videos lv ON c.id = lv.course_id
        LEFT JOIN quizzes q ON c.id = q.course_id
        GROUP BY c.id`, [], (err, rows) => {
            if (!err && rows) {
                console.log('📋 Курстардың видеолар мен тесттер саны:');
                rows.forEach(row => {
                    console.log(`   ${row.title}: ${row.video_count}/${row.total_lessons} видео, ${row.quiz_count}/${row.total_lessons} тест`);
                });
                console.log('==============================\n');
            }
        });
    }, 5000);
}

// Скриптті іске қосу
seedDatabase().then(() => {
    setTimeout(() => {
        console.log('🚀 Бастапқы деректер қосылды');
        console.log('\n=== ҚОЛДАНУ НҰСҚАУЛЫҒЫ ===');
        console.log('1. Серверді іске қосу үшін: npm start');
        console.log('2. Браузерде ашу: http://localhost:3000');
        console.log('3. Тест аккаунты:');
        console.log('   📧 Email: test@example.com');
        console.log('   🔑 Құпия сөз: password123');
        console.log('4. Мүмкіндіктер:');
        console.log('   • БАРЛЫҚ курстарға жазылу');
        console.log('   • БАРЛЫҚ видео сабақтарды көру');
        console.log('   • БАРЛЫҚ сабақтар соңында тест тапсыру');
        console.log('   • Сертификат алу');
        console.log('==============================\n');
        process.exit(0);
    }, 7000);
}).catch(err => {
    console.error('❌ Қате:', err);
    process.exit(1);
});