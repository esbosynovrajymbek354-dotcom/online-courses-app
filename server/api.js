const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dbMethods } = require('./db.js');

const router = express.Router();

// ==================== АУТЕНТИФИКАЦИЯ ====================

// Пайдаланушы тіркеу
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Валидация
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Барлық өрістерді толтырыңыз'
            });
        }
        
        // Email форматын тексеру
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email дұрыс емес'
            });
        }
        
        // Email тексеру
        const existingUser = await dbMethods.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Бұл email тіркелген'
            });
        }
        
        // Құпия сөзді хэштеу
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Аватар құру
        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Пайдаланушыны сақтау
        const user = {
            id: uuidv4(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            avatar,
            phone: ''
        };
        
        await dbMethods.createUser(user);
        
        // Жауап қайтару (құпия сөзсіз)
        const { password: _, ...userWithoutPassword } = user;
        console.log(`✅ Жаңа пайдаланушы тіркелді: ${email}`);
        
        res.json({
            success: true,
            user: userWithoutPassword,
            message: 'Тіркелу сәтті өтті'
        });
    } catch (error) {
        console.error('❌ Тіркеу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сервер қатесі. Кейінірек қайталаңыз.'
        });
    }
});

// Пайдаланушы кіруі
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Валидация
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Барлық өрістерді толтырыңыз'
            });
        }
        
        // Пайдаланушыны табу
        const user = await dbMethods.findUserByEmail(email.toLowerCase().trim());
        if (!user) {
            console.log(`❌ Кіру әрекеті: ${email} табылмады`);
            return res.status(401).json({
                success: false,
                message: 'Email немесе құпия сөз қате'
            });
        }
        
        // Құпия сөзді тексеру
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log(`❌ Кіру әрекеті: ${email} құпия сөз қате`);
            return res.status(401).json({
                success: false,
                message: 'Email немесе құпия сөз қате'
            });
        }
        
        // Жауап қайтару (құпия сөзсіз)
        const { password: _, ...userWithoutPassword } = user;
        console.log(`✅ Пайдаланушы кірді: ${email}`);
        
        res.json({
            success: true,
            user: userWithoutPassword,
            message: 'Кіру сәтті өтті'
        });
    } catch (error) {
        console.error('❌ Кіру қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сервер қатесі. Кейінірек қайталаңыз.'
        });
    }
});

// ==================== КУРСТАР ====================

// Курстарды алу
router.get('/courses', async (req, res) => {
    try {
        console.log('📚 Курстар сұранысы');
        const courses = await dbMethods.getAllCourses();
        
        // JSON деректерді объектке айналдыру
        const formattedCourses = courses.map(course => {
            try {
                // lessons JSON болуы керек, оны парс етеміз
                let lessons = [];
                if (course.lessons) {
                    if (typeof course.lessons === 'string') {
                        lessons = JSON.parse(course.lessons);
                    } else if (Array.isArray(course.lessons)) {
                        lessons = course.lessons;
                    }
                }
                
                return {
                    ...course,
                    lessons: lessons,
                    price: `${course.price}₸`,
                    icon: course.icon || '📚',
                    total_lessons: course.total_lessons || lessons.length
                };
            } catch (error) {
                console.error(`❌ Курсты парс ету қатесі (${course.id}):`, error);
                return {
                    ...course,
                    lessons: [],
                    price: `${course.price}₸`,
                    icon: course.icon || '📚',
                    total_lessons: course.total_lessons || 0
                };
            }
        });
        
        console.log(`✅ Курстар жіберілді: ${formattedCourses.length} дана`);
        
        res.json({
            success: true,
            courses: formattedCourses
        });
    } catch (error) {
        console.error('❌ Курстарды алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Курстарды жүктеу қатесі',
            courses: []
        });
    }
});

// Курсты ID бойынша алу
router.get('/courses/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log(`📚 Курс сұранысы: ${courseId}`);
        
        const course = await dbMethods.getCourseById(courseId);
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс табылмады'
            });
        }
        
        // Lessons парс ету
        let lessons = [];
        if (course.lessons) {
            if (typeof course.lessons === 'string') {
                lessons = JSON.parse(course.lessons);
            } else if (Array.isArray(course.lessons)) {
                lessons = course.lessons;
            }
        }
        
        const formattedCourse = {
            ...course,
            lessons: lessons,
            price: `${course.price}₸`,
            icon: course.icon || '📚',
            total_lessons: course.total_lessons || lessons.length
        };
        
        console.log(`✅ Курс жіберілді: ${course.title}`);
        
        res.json({
            success: true,
            course: formattedCourse
        });
    } catch (error) {
        console.error('❌ Курсты алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Курсты жүктеу қатесі'
        });
    }
});

// ==================== ЖАЗЫЛУЛАР ====================

// Жазылуларды алу
router.get('/enrollments/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`📋 Жазылулар сұранысы: ${userId}`);
        
        const enrollments = await dbMethods.getUserEnrollments(userId);
        
        const formattedEnrollments = enrollments.map(e => ({
            ...e,
            completed_lessons: e.completed_lessons || '[]',
            progress: e.progress || 0,
            status: e.status || 'pending'
        }));
        
        console.log(`✅ Жазылулар жіберілді: ${formattedEnrollments.length} дана`);
        
        res.json({
            success: true,
            enrollments: formattedEnrollments
        });
    } catch (error) {
        console.error('❌ Жазылуларды алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Жазылуларды жүктеу қатесі',
            enrollments: []
        });
    }
});

// Курсқа жазылу
router.post('/enroll', async (req, res) => {
    try {
        const enrollmentData = req.body;
        console.log(`🎓 Жазылу әрекеті: ${enrollmentData.user_email} -> ${enrollmentData.course_title}`);
        
        // Валидация
        if (!enrollmentData.user_id || !enrollmentData.course_id) {
            return res.status(400).json({
                success: false,
                message: 'Жазылу деректері толық емес'
            });
        }
        
        // Жазылуды тексеру
        const existingEnrollment = await dbMethods.getEnrollmentByUserAndCourse(
            enrollmentData.user_id,
            enrollmentData.course_id
        );
        
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: 'Сіз бұл курсқа жазылғансыз'
            });
        }
        
        // Курсты тексеру
        const course = await dbMethods.getCourseById(enrollmentData.course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс табылмады'
            });
        }
        
        // Жазылуды сақтау
        const enrollment = await dbMethods.createEnrollment({
            ...enrollmentData,
            course_title: enrollmentData.course_title || course.title,
            status: 'pending',
            progress: 0,
            completed_lessons: '[]'
        });
        
        console.log(`✅ Жазылу сәтті: ${enrollmentData.user_email} -> ${enrollmentData.course_title}`);
        
        res.json({
            success: true,
            enrollment,
            message: 'Курсқа сәтті жазылдыңыз'
        });
    } catch (error) {
        console.error('❌ Жазылу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Жазылу қатесі. Кейінірек қайталаңыз.'
        });
    }
});

// Жазылуды жаңарту
router.post('/enrollment/update', async (req, res) => {
    try {
        const enrollmentData = req.body;
        console.log(`🔄 Жазылу жаңарту: ${enrollmentData.id}`);
        
        if (!enrollmentData.id) {
            return res.status(400).json({
                success: false,
                message: 'Жазылу ID қажет'
            });
        }
        
        await dbMethods.updateEnrollment(enrollmentData.id, {
            status: enrollmentData.status || 'pending',
            progress: enrollmentData.progress || 0,
            completed_lessons: enrollmentData.completed_lessons || '[]'
        });
        
        console.log(`✅ Жазылу жаңартылды: ${enrollmentData.id}`);
        
        res.json({
            success: true,
            message: 'Жазылу жаңартылды'
        });
    } catch (error) {
        console.error('❌ Жазылуды жаңарту қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Жазылуды жаңарту қатесі'
        });
    }
});

// Сабақты аяқтау
router.post('/lesson/complete', async (req, res) => {
    try {
        const { user_id, course_id, lesson_index } = req.body;
        console.log(`✅ Сабақ аяқтау: ${user_id} -> ${course_id} -> ${lesson_index}`);
        
        if (!user_id || !course_id || lesson_index === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Барлық деректерді толтырыңыз'
            });
        }
        
        // Жазылуды табу
        const enrollment = await dbMethods.getEnrollmentByUserAndCourse(user_id, course_id);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Жазылу табылмады'
            });
        }
        
        // Курсты табу
        const course = await dbMethods.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс табылмады'
            });
        }
        
        // Аяқталған сабақтарды жаңарту
        let completedLessons = [];
        try {
            completedLessons = JSON.parse(enrollment.completed_lessons || '[]');
        } catch (error) {
            completedLessons = [];
        }
        
        // Сабақты қосу, егер әлі қосылмаған болса
        if (!completedLessons.includes(lesson_index)) {
            completedLessons.push(lesson_index);
        }
        
        // Прогресті есептеу
        const totalLessons = course.total_lessons || (course.lessons ? JSON.parse(course.lessons).length : 1);
        const progress = Math.round((completedLessons.length / totalLessons) * 100);
        
        // Жазылуды жаңарту
        await dbMethods.updateEnrollment(enrollment.id, {
            status: enrollment.status,
            progress,
            completed_lessons: JSON.stringify(completedLessons)
        });
        
        console.log(`✅ Сабақ аяқталды: ${progress}% прогресс`);
        
        res.json({
            success: true,
            progress,
            completed_lessons: completedLessons,
            message: 'Сабақ аяқталды'
        });
    } catch (error) {
        console.error('❌ Сабақты аяқтау қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сабақты аяқтау қатесі'
        });
    }
});

// ==================== ПРОФИЛЬ ====================

// Профильді жаңарту
router.put('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, phone } = req.body;
        console.log(`👤 Профиль жаңарту: ${userId}`);
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Аты-жөні қажет'
            });
        }
        
        // Аватар құру
        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Пайдаланушыны жаңарту
        await dbMethods.updateUser(userId, { 
            name: name.trim(), 
            phone: phone || '', 
            avatar 
        });
        
        // Пайдаланушының барлық жазылуларын жаңарту
        const enrollments = await dbMethods.getUserEnrollments(userId);
        for (const enrollment of enrollments) {
            await dbMethods.updateEnrollment(enrollment.id, {
                ...enrollment,
                user_name: name.trim()
            });
        }
        
        console.log(`✅ Профиль жаңартылды: ${userId}`);
        
        res.json({
            success: true,
            message: 'Профиль жаңартылды'
        });
    } catch (error) {
        console.error('❌ Профильді жаңарту қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Профильді жаңарту қатесі'
        });
    }
});

// ==================== СЕРТИФИКАТТАР ====================

// Сертификат генерациялау
router.post('/certificate/generate', async (req, res) => {
    try {
        const { user_id, user_name, course_id, course_title } = req.body;
        console.log(`🎓 Сертификат генерациялау: ${user_name} -> ${course_title}`);
        
        if (!user_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Барлық деректерді толтырыңыз'
            });
        }
        
        // Сертификатты тексеру
        const existingCert = await dbMethods.getUserCertificate(user_id, course_id);
        if (existingCert) {
            return res.json({
                success: true,
                certificate: existingCert,
                message: 'Сертификат бұрыннан бар'
            });
        }
        
        // Сериялық нөмір генерациялау
        const serialNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        // Сертификатты сақтау
        const certificate = await dbMethods.createCertificate({
            user_id,
            user_name: user_name || 'Пайдаланушы',
            course_id,
            course_title: course_title || 'Курс',
            serial_number: serialNumber
        });
        
        console.log(`✅ Сертификат жасалды: ${serialNumber}`);
        
        res.json({
            success: true,
            certificate,
            message: 'Сертификат жасалды'
        });
    } catch (error) {
        console.error('❌ Сертификат генерациялау қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сертификат жасау қатесі'
        });
    }
});

// Сертификатты алу
router.get('/certificate/:userId/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        console.log(`🎓 Сертификат сұранысы: ${userId} -> ${courseId}`);
        
        const certificate = await dbMethods.getUserCertificate(userId, courseId);
        
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Сертификат табылмады'
            });
        }
        
        console.log(`✅ Сертификат жіберілді: ${certificate.serial_number}`);
        
        res.json({
            success: true,
            certificate
        });
    } catch (error) {
        console.error('❌ Сертификатты алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сертификатты жүктеу қатесі'
        });
    }
});

// Курсты аяқтау және сертификатты тексеру
router.post('/course/complete', async (req, res) => {
    try {
        const { user_id, course_id } = req.body;
        console.log(`🏁 Курс аяқтау: ${user_id} -> ${course_id}`);
        
        if (!user_id || !course_id) {
            return res.status(400).json({
                success: false,
                message: 'Барлық деректерді толтырыңыз'
            });
        }
        
        // Жазылуды табу
        const enrollment = await dbMethods.getEnrollmentByUserAndCourse(user_id, course_id);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: 'Жазылу табылмады'
            });
        }
        
        // Курсты табу
        const course = await dbMethods.getCourseById(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Курс табылмады'
            });
        }
        
        // Прогресті тексеру (100% болуы керек)
        if (enrollment.progress === 100) {
            // Сертификатты тексеру
            let certificate = await dbMethods.getUserCertificate(user_id, course_id);
            let certificateIssued = false;
            
            // Егер сертификат жоқ болса, жасау
            if (!certificate) {
                const serialNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
                
                certificate = await dbMethods.createCertificate({
                    user_id,
                    user_name: enrollment.user_name,
                    course_id,
                    course_title: enrollment.course_title || course.title,
                    serial_number: serialNumber
                });
                
                certificateIssued = true;
                console.log(`✅ Жаңа сертификат жасалды: ${serialNumber}`);
            } else {
                certificateIssued = true;
                console.log(`✅ Сертификат бұрыннан бар: ${certificate.serial_number}`);
            }
            
            res.json({
                success: true,
                certificate_issued: certificateIssued,
                certificate,
                message: 'Курс аяқталды! Сертификат дайын'
            });
        } else {
            res.json({
                success: false,
                certificate_issued: false,
                message: `Курс әлі аяқталмады (${enrollment.progress}%)`
            });
        }
    } catch (error) {
        console.error('❌ Курсты аяқтау қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Курсты аяқтау қатесі'
        });
    }
});

// Пайдаланушы сертификаттарын алу
router.get('/certificates/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`📜 Сертификаттар сұранысы: ${userId}`);
        
        const certificates = await dbMethods.getUserCertificates(userId);
        
        res.json({
            success: true,
            certificates
        });
    } catch (error) {
        console.error('❌ Сертификаттарды алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Сертификаттарды жүктеу қатесі',
            certificates: []
        });
    }
});

// Курс прогрессін алу
router.get('/progress/:userId/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        console.log(`📊 Прогресс сұранысы: ${userId} -> ${courseId}`);
        
        const progress = await dbMethods.getCourseProgress(userId, courseId);
        
        res.json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('❌ Прогресті алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Прогресті жүктеу қатесі',
            progress: 0
        });
    }
});

// ==================== ЖАҢА ENDPOINT-ТЕР: ВИДЕОЛАР ЖӘНЕ ТЕСТТЕР ====================

// Курстың видеоларын алу
router.get('/courses/:courseId/videos', async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log(`🎥 Курс видеолары сұранысы: ${courseId}`);
        
        const videos = await dbMethods.getCourseVideos(courseId);
        
        console.log(`✅ Видеолар жіберілді: ${videos.length} дана`);
        
        res.json({
            success: true,
            videos: videos
        });
    } catch (error) {
        console.error('❌ Видеоларды алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Видеоларды жүктеу қатесі'
        });
    }
});

// Сабақ видеосын алу
router.get('/lessons/:courseId/:lessonIndex/video', async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.params;
        console.log(`🎥 Сабақ видеосы сұранысы: ${courseId} -> ${lessonIndex}`);
        
        const video = await dbMethods.getLessonVideo(courseId, parseInt(lessonIndex));
        
        if (!video) {
            return res.json({
                success: false,
                message: 'Бұл сабаққа видео табылмады',
                video: null
            });
        }
        
        console.log(`✅ Видео жіберілді: ${video.title}`);
        
        res.json({
            success: true,
            video: video
        });
    } catch (error) {
        console.error('❌ Видео алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Видео жүктеу қатесі'
        });
    }
});

// Сабақтың тест сұрақтарын алу
router.get('/lessons/:courseId/:lessonIndex/quiz', async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.params;
        const userId = req.query.userId;
        console.log(`📝 Тест сұранысы: ${courseId} -> ${lessonIndex} (пользователь: ${userId || 'жоқ'})`);
        
        let quizzes;
        if (userId) {
            // Пайдаланушының жауаптарымен бірге алу
            quizzes = await dbMethods.getUserQuizResults(userId, courseId, parseInt(lessonIndex));
        } else {
            // Жай тест сұрақтарын алу
            quizzes = await dbMethods.getQuizByLesson(courseId, parseInt(lessonIndex));
        }
        
        // JSON опцияларын парс ету
        const formattedQuizzes = quizzes.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        
        console.log(`✅ Тест сұрақтары жіберілді: ${formattedQuizzes.length} дана`);
        
        res.json({
            success: true,
            quizzes: formattedQuizzes
        });
    } catch (error) {
        console.error('❌ Тест сұрақтарын алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест сұрақтарын жүктеу қатесі'
        });
    }
});

// Тест нәтижесін сақтау
router.post('/quizzes/:quizId/submit', async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizData = req.body;
        console.log(`📝 Тест нәтижесі сақтау: quizId=${quizId}, user=${quizData.user_id}`);
        
        // Валидация
        if (!quizData.user_id || quizData.user_answer === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Барлық деректерді толтырыңыз'
            });
        }
        
        // Тестті алу (дұрыс жауапты білу үшін)
        const quiz = await dbMethods.getQuizById(quizId);
        
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Тест табылмады'
            });
        }
        
        // JSON опцияларын парс ету
        const options = typeof quiz.options === 'string' ? JSON.parse(quiz.options) : quiz.options;
        
        // Дұрыс жауапты тексеру
        const isCorrect = quizData.user_answer === quiz.correct_answer;
        
        // Егер пайдаланушы бұрыннан жауап берген болса, жаңарту
        const existingResult = await dbMethods.getUserQuizResult(quizData.user_id, parseInt(quizId));
        
        let result;
        if (existingResult) {
            // Жауапты жаңарту
            await dbMethods.updateQuizResult(quizData.user_id, parseInt(quizId), {
                user_answer: quizData.user_answer,
                is_correct: isCorrect
            });
            result = { ...existingResult, user_answer: quizData.user_answer, is_correct: isCorrect };
        } else {
            // Жаңа нәтижені сақтау
            result = await dbMethods.saveQuizResult({
                user_id: quizData.user_id,
                course_id: quizData.course_id,
                lesson_index: quizData.lesson_index,
                quiz_id: parseInt(quizId),
                user_answer: quizData.user_answer,
                is_correct: isCorrect
            });
        }
        
        console.log(`✅ Тест нәтижесі сақталды: ${isCorrect ? 'ДҰРЫС' : 'ҚАТЕ'}`);
        
        res.json({
            success: true,
            result: result,
            is_correct: isCorrect,
            correct_answer: quiz.correct_answer,
            explanation: quiz.explanation,
            options: options,
            message: isCorrect ? 'Дұрыс жауап! 🎉' : 'Қате жауап 😔'
        });
    } catch (error) {
        console.error('❌ Тест нәтижесін сақтау қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест нәтижесін сақтау қатесі'
        });
    }
});

// Пайдаланушының тест нәтижелерін алу
router.get('/users/:userId/quizzes/:courseId/:lessonIndex', async (req, res) => {
    try {
        const { userId, courseId, lessonIndex } = req.params;
        console.log(`📊 Тест нәтижелері сұранысы: ${userId} -> ${courseId} -> ${lessonIndex}`);
        
        const results = await dbMethods.getUserQuizResults(userId, courseId, parseInt(lessonIndex));
        
        // JSON опцияларын парс ету
        const formattedResults = results.map(r => ({
            ...r,
            options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
        }));
        
        // Статистиканы есептеу
        const totalQuestions = formattedResults.length;
        const answeredQuestions = formattedResults.filter(r => r.user_answer !== null && r.user_answer !== undefined).length;
        const correctAnswers = formattedResults.filter(r => r.is_correct).length;
        const score = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;
        
        console.log(`✅ Тест нәтижелері жіберілді: ${correctAnswers}/${answeredQuestions} (${score}%)`);
        
        res.json({
            success: true,
            results: formattedResults,
            statistics: {
                total_questions: totalQuestions,
                answered_questions: answeredQuestions,
                correct_answers: correctAnswers,
                score: score,
                percentage: score
            }
        });
    } catch (error) {
        console.error('❌ Тест нәтижелерін алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест нәтижелерін жүктеу қатесі'
        });
    }
});

// Пайдаланушының барлық тест нәтижелерін алу
router.get('/users/:userId/quizzes', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`📊 Барлық тест нәтижелері сұранысы: ${userId}`);
        
        const results = await dbMethods.getUserAllQuizResults(userId);
        
        // Группалау курстар бойынша
        const groupedResults = results.reduce((acc, result) => {
            const key = `${result.course_id}_${result.lesson_index}`;
            if (!acc[key]) {
                acc[key] = {
                    course_id: result.course_id,
                    lesson_index: result.lesson_index,
                    results: []
                };
            }
            acc[key].results.push(result);
            return acc;
        }, {});
        
        const formattedResults = Object.values(groupedResults);
        
        // Жалпы статистика
        const totalAttempts = results.length;
        const correctAnswers = results.filter(r => r.is_correct).length;
        const overallScore = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;
        
        console.log(`✅ Барлық тест нәтижелері жіберілді: ${correctAnswers}/${totalAttempts} (${overallScore}%)`);
        
        res.json({
            success: true,
            results: formattedResults,
            statistics: {
                total_attempts: totalAttempts,
                correct_answers: correctAnswers,
                overall_score: overallScore
            }
        });
    } catch (error) {
        console.error('❌ Барлық тест нәтижелерін алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест нәтижелерін жүктеу қатесі'
        });
    }
});

// Курс бойынша тест статистикасы
router.get('/quizzes/statistics/:courseId/:lessonIndex', async (req, res) => {
    try {
        const { courseId, lessonIndex } = req.params;
        console.log(`📈 Тест статистикасы сұранысы: ${courseId} -> ${lessonIndex}`);
        
        const statistics = await dbMethods.getQuizStatistics(courseId, parseInt(lessonIndex));
        
        const formattedStatistics = statistics.map(stat => ({
            ...stat,
            success_rate: stat.total_attempts > 0 ? Math.round((stat.correct_answers / stat.total_attempts) * 100) : 0
        }));
        
        console.log(`✅ Тест статистикасы жіберілді: ${formattedStatistics.length} сұрақ`);
        
        res.json({
            success: true,
            statistics: formattedStatistics
        });
    } catch (error) {
        console.error('❌ Тест статистикасын алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест статистикасын жүктеу қатесі'
        });
    }
});

// Пайдаланушының курстағы жалпы статистикасы
router.get('/users/:userId/quiz-stats/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        console.log(`📈 Курс тест статистикасы сұранысы: ${userId} -> ${courseId}`);
        
        const stats = await dbMethods.getUserCourseQuizStats(userId, courseId);
        
        const score = stats.total_attempts > 0 ? Math.round((stats.correct_answers / stats.total_attempts) * 100) : 0;
        
        console.log(`✅ Курс тест статистикасы жіберілді: ${stats.correct_answers}/${stats.total_attempts} (${score}%)`);
        
        res.json({
            success: true,
            stats: {
                ...stats,
                score: score,
                percentage: score
            }
        });
    } catch (error) {
        console.error('❌ Курс тест статистикасын алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест статистикасын жүктеу қатесі'
        });
    }
});

// Видео қосу (әкімшілік)
router.post('/admin/videos', async (req, res) => {
    try {
        const videoData = req.body;
        console.log(`🎬 Жаңа видео қосу: ${videoData.title}`);
        
        // Валидация
        if (!videoData.course_id || videoData.lesson_index === undefined || !videoData.youtube_video_id || !videoData.title) {
            return res.status(400).json({
                success: false,
                message: 'Барлық міндетті өрістерді толтырыңыз'
            });
        }
        
        const video = await dbMethods.addLessonVideo(videoData);
        
        console.log(`✅ Видео қосылды: ${video.title}`);
        
        res.json({
            success: true,
            video: video,
            message: 'Видео сәтті қосылды'
        });
    } catch (error) {
        console.error('❌ Видео қосу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Видео қосу қатесі'
        });
    }
});

// Тест сұрағы қосу (әкімшілік)
router.post('/admin/quizzes', async (req, res) => {
    try {
        const quizData = req.body;
        console.log(`📝 Жаңа тест сұрағы қосу: ${quizData.question.substring(0, 50)}...`);
        
        // Валидация
        if (!quizData.course_id || quizData.lesson_index === undefined || !quizData.question || 
            !quizData.options || !Array.isArray(quizData.options) || quizData.options.length < 2 ||
            quizData.correct_answer === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Барлық міндетті өрістерді толтырыңыз'
            });
        }
        
        const quiz = await dbMethods.addQuizQuestion(quizData);
        
        console.log(`✅ Тест сұрағы қосылды: ${quiz.question.substring(0, 50)}...`);
        
        res.json({
            success: true,
            quiz: quiz,
            message: 'Тест сұрағы сәтті қосылды'
        });
    } catch (error) {
        console.error('❌ Тест сұрағы қосу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест сұрағы қосу қатесі'
        });
    }
});

// Курстың барлық тест сұрақтарын алу
router.get('/courses/:courseId/quizzes', async (req, res) => {
    try {
        const { courseId } = req.params;
        console.log(`📝 Курстың барлық тест сұрақтары сұранысы: ${courseId}`);
        
        const quizzes = await dbMethods.getAllQuizzesForCourse(courseId);
        
        // JSON опцияларын парс ету
        const formattedQuizzes = quizzes.map(q => ({
            ...q,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        
        console.log(`✅ Курстың тест сұрақтары жіберілді: ${formattedQuizzes.length} дана`);
        
        res.json({
            success: true,
            quizzes: formattedQuizzes
        });
    } catch (error) {
        console.error('❌ Курстың тест сұрақтарын алу қатесі:', error);
        res.status(500).json({
            success: false,
            message: 'Тест сұрақтарын жүктеу қатесі'
        });
    }
});

// ==================== КОММЕНТАРИЙЛЕР ====================

// Дені саулықты тексеру
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API жұмыс істеп тұр',
        timestamp: new Date().toISOString(),
        endpoints: {
            authentication: ['/register', '/login'],
            courses: ['/courses', '/courses/:id'],
            enrollments: ['/enrollments/:userId', '/enroll', '/enrollment/update'],
            videos: ['/courses/:id/videos', '/lessons/:courseId/:lessonIndex/video'],
            quizzes: [
                '/lessons/:courseId/:lessonIndex/quiz',
                '/quizzes/:quizId/submit',
                '/users/:userId/quizzes/:courseId/:lessonIndex',
                '/users/:userId/quizzes',
                '/courses/:courseId/quizzes'
            ],
            profile: ['/profile/:userId'],
            certificates: ['/certificate/:userId/:courseId', '/certificates/:userId', '/certificate/generate'],
            progress: ['/progress/:userId/:courseId'],
            statistics: ['/quizzes/statistics/:courseId/:lessonIndex', '/users/:userId/quiz-stats/:courseId'],
            admin: ['/admin/videos', '/admin/quizzes']
        }
    });
});

// 404 қатесі
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint табылмады'
    });
});

module.exports = router;