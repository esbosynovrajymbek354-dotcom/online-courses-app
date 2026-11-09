// API негізгі URL
const API_BASE_URL = 'http://localhost:3000/api';

// Ағымдағы пайдаланушы және деректер
let currentUser = null;
let isLoginMode = true;
let allCourses = [];
let userEnrollments = [];
let currentCourseId = null;
let currentLessonIndex = 0;

// API функциялары
class ApiService {
    static async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Тіркеу API қатесі:', error);
            return { success: false, message: 'Серверге қосылу қатесі' };
        }
    }

    static async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error('Кіру API қатесі:', error);
            return { success: false, message: 'Серверге қосылу қатесі' };
        }
    }

    static async getCourses() {
        try {
            const response = await fetch(`${API_BASE_URL}/courses`);
            return await response.json();
        } catch (error) {
            console.error('Курстарды алу қатесі:', error);
            return { success: false, message: 'Курстарды жүктеу қатесі' };
        }
    }

    static async getUserEnrollments(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/enrollments/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Жазылуларды алу қатесі:', error);
            return { success: false, message: 'Жазылуларды жүктеу қатесі' };
        }
    }

    static async enrollCourse(enrollmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Жазылу API қатесі:', error);
            return { success: false, message: 'Жазылу қатесі' };
        }
    }

    static async updateEnrollment(enrollmentData) {
        try {
            const response = await fetch(`${API_BASE_URL}/enrollment/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(enrollmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('Жазылуды жаңарту API қатесі:', error);
            return { success: false, message: 'Жазылуды жаңарту қатесі' };
        }
    }

    static async completeLesson(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/lesson/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Сабақ аяқтау API қатесі:', error);
            return { success: false, message: 'Сабақты аяқтау қатесі' };
        }
    }

    static async updateProfile(userId, profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            return await response.json();
        } catch (error) {
            console.error('Профильді жаңарту API қатесі:', error);
            return { success: false, message: 'Профильді жаңарту қатесі' };
        }
    }

    static async generateCertificate(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/certificate/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Сертификат генерациялау API қатесі:', error);
            return { success: false, message: 'Сертификат жасау қатесі' };
        }
    }

    static async getCertificate(userId, courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/certificate/${userId}/${courseId}`);
            return await response.json();
        } catch (error) {
            console.error('Сертификатты алу API қатесі:', error);
            return { success: false, message: 'Сертификатты жүктеу қатесі' };
        }
    }

    static async completeCourse(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/course/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Курсты аяқтау API қатесі:', error);
            return { success: false, message: 'Курсты аяқтау қатесі' };
        }
    }

    static async checkVideoAccess(videoId) {
        try {
            // YouTube видео бар екенін тексеру үшін қарапайым тест
            const testUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(testUrl, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // ============= ЖАҢА API ФУНКЦИЯЛАРЫ: ВИДЕОЛАР ЖӘНЕ ТЕСТТЕР =============
    
    static async getLessonVideo(courseId, lessonIndex) {
        try {
            const response = await fetch(`${API_BASE_URL}/lessons/${courseId}/${lessonIndex}/video`);
            return await response.json();
        } catch (error) {
            console.error('Видео алу API қатесі:', error);
            return { success: false, message: 'Видео жүктеу қатесі' };
        }
    }

    static async getQuizByLesson(courseId, lessonIndex, userId = null) {
        try {
            let url = `${API_BASE_URL}/lessons/${courseId}/${lessonIndex}/quiz`;
            if (userId) {
                url += `?userId=${userId}`;
            }
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Тест алу API қатесі:', error);
            return { success: false, message: 'Тест жүктеу қатесі' };
        }
    }

    static async submitQuizAnswer(quizId, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Тест жауабын жіберу API қатесі:', error);
            return { success: false, message: 'Тест нәтижесін сақтау қатесі' };
        }
    }

    static async getUserQuizResults(userId, courseId, lessonIndex) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/quizzes/${courseId}/${lessonIndex}`);
            return await response.json();
        } catch (error) {
            console.error('Тест нәтижелерін алу API қатесі:', error);
            return { success: false, message: 'Тест нәтижелерін жүктеу қатесі' };
        }
    }

    static async getUserAllQuizResults(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/quizzes`);
            return await response.json();
        } catch (error) {
            console.error('Барлық тест нәтижелерін алу API қатесі:', error);
            return { success: false, message: 'Тест нәтижелерін жүктеу қатесі' };
        }
    }

    static async getCourseVideos(courseId) {
        try {
            const response = await fetch(`${API_BASE_URL}/courses/${courseId}/videos`);
            return await response.json();
        } catch (error) {
            console.error('Курс видеоларын алу API қатесі:', error);
            return { success: false, message: 'Видеоларды жүктеу қатесі' };
        }
    }
}

// Қолданбаны бастау
async function initApp() {
    console.log('Қолданба іске қосылуда...');
    setupEventListeners();
    await loadCourses();
    
    // Жергілікті жадыдан пайдаланушыны жүктеу
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            await navigateTo('dashboard');
        } catch (error) {
            console.error('Пайдаланушыны жүктеу қатесі:', error);
            localStorage.removeItem('currentUser');
        }
    }
    
    // Тест функциясы
    testVideoFunctionality();
}

// Курстарды жүктеу
async function loadCourses() {
    try {
        showLoading('Курстар жүктелуде...');
        const data = await ApiService.getCourses();
        
        if (data.success) {
            allCourses = data.courses;
            console.log(`✅ Курстар жүктелді: ${allCourses.length} дана`);
            
            // Курстарды тексеру
            allCourses.forEach(course => {
                console.log(`Курс: ${course.title}, Сабақтар: ${course.lessons?.length || 0}`);
                if (course.lessons && course.lessons.length > 0) {
                    course.lessons.forEach((lesson, index) => {
                        console.log(`  Сабақ ${index + 1}: ${lesson.title}`);
                    });
                }
            });
        } else {
            showToast('Курстарды жүктеу қатесі', 'error');
        }
    } catch (error) {
        console.error('Курстарды жүктеу қатесі:', error);
        showToast('Желі қатесі', 'error');
    } finally {
        hideLoading();
    }
}

// Оқиға тыңдаушыларды орнату
function setupEventListeners() {
    console.log('Оқиға тыңдаушылары орнатылуда...');
    
    // Негізгі түймелер
    const loginBtn = document.getElementById('loginBtnWelcome');
    const registerBtn = document.getElementById('registerBtnWelcome');
    const backBtn = document.getElementById('backToWelcome');
    const switchLink = document.getElementById('switchLink');
    const authForm = document.getElementById('authForm');
    
    if (loginBtn) loginBtn.addEventListener('click', () => showAuth(true));
    if (registerBtn) registerBtn.addEventListener('click', () => showAuth(false));
    if (backBtn) backBtn.addEventListener('click', showWelcome);
    if (switchLink) switchLink.addEventListener('click', toggleAuthMode);
    if (authForm) authForm.addEventListener('submit', handleAuth);
    
    // Навигация
    const navHome = document.getElementById('navHome');
    const navCourses = document.getElementById('navCourses');
    const navProfile = document.getElementById('navProfile');
    
    if (navHome) navHome.addEventListener('click', () => navigateTo('dashboard'));
    if (navCourses) navCourses.addEventListener('click', () => navigateTo('dashboard'));
    if (navProfile) navProfile.addEventListener('click', showProfile);
    
    console.log('✅ Оқиға тыңдаушылары орнатылды');
}

// Экранды ауыстыру функциялары
function showWelcome() {
    hideAllScreens();
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
}

function showAuth(login) {
    isLoginMode = login;
    hideAllScreens();
    document.getElementById('authScreen').classList.remove('hidden');
    
    const nameGroup = document.getElementById('nameGroup');
    const authTitle = document.getElementById('authTitle');
    const authBtnText = document.getElementById('authBtnText');
    const switchText = document.getElementById('switchText');
    const switchLink = document.getElementById('switchLink');
    
    if (login) {
        if (nameGroup) nameGroup.classList.add('hidden');
        if (authTitle) authTitle.textContent = 'Кіру';
        if (authBtnText) authBtnText.textContent = 'Кіру';
        if (switchText) switchText.textContent = 'Аккаунтыңыз жоқ па?';
        if (switchLink) switchLink.textContent = 'Тіркелу';
    } else {
        if (nameGroup) nameGroup.classList.remove('hidden');
        if (authTitle) authTitle.textContent = 'Тіркелу';
        if (authBtnText) authBtnText.textContent = 'Тіркелу';
        if (switchText) switchText.textContent = 'Аккаунтыңыз бар ма?';
        if (switchLink) switchLink.textContent = 'Кіру';
    }
}

function toggleAuthMode() {
    showAuth(!isLoginMode);
}

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput')?.value;
    const password = document.getElementById('passwordInput')?.value;
    const name = document.getElementById('nameInput')?.value;
    
    if (!email || !password) {
        showToast('Барлық өрістерді толтырыңыз', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('authSubmitBtn');
    const btnText = document.getElementById('authBtnText');
    
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.innerHTML = '<div class="loading-spinner">⏳</div>';
    
    try {
        if (isLoginMode) {
            // Кіру
            showLoading('Кіру...');
            const result = await ApiService.login({ email, password });
            hideLoading();
            
            if (result.success && result.user) {
                currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showToast('Сәтті кірдіңіз! 🎉', 'success');
                await navigateTo('dashboard');
            } else {
                showToast(result.message || 'Кіру қатесі', 'error');
            }
        } else {
            // Тіркелу
            if (!name) {
                showToast('Аты-жөніңізді енгізіңіз', 'error');
                return;
            }
            
            showLoading('Тіркелу...');
            const result = await ApiService.register({ name, email, password });
            hideLoading();
            
            if (result.success && result.user) {
                currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showToast('Тіркелу сәтті өтті! ✅', 'success');
                await navigateTo('dashboard');
            } else {
                showToast(result.message || 'Тіркелу қатесі', 'error');
            }
        }
    } catch (error) {
        hideLoading();
        showToast('Желі қатесі', 'error');
        console.error('Аутентификация қатесі:', error);
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = isLoginMode ? 'Кіру' : 'Тіркелу';
    }
}

async function navigateTo(screen) {
    hideAllScreens();
    
    // Навигация түймелерін жаңарту
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-100', 'text-blue-900');
        btn.classList.add('text-gray-600');
    });
    
    if (screen === 'dashboard') {
        document.getElementById('dashboardScreen').classList.remove('hidden');
        document.getElementById('bottomNav').classList.remove('hidden');
        
        const navHome = document.getElementById('navHome');
        if (navHome) {
            navHome.classList.add('active', 'bg-blue-100', 'text-blue-900');
            navHome.classList.remove('text-gray-600');
        }
        
        await updateDashboard();
    } else if (screen === 'profile') {
        document.getElementById('profileScreen').classList.remove('hidden');
        document.getElementById('bottomNav').classList.remove('hidden');
        
        const navProfile = document.getElementById('navProfile');
        if (navProfile) {
            navProfile.classList.add('active', 'bg-blue-100', 'text-blue-900');
            navProfile.classList.remove('text-gray-600');
        }
        
        showProfile();
    } else if (screen === 'welcome') {
        showWelcome();
    }
}

async function updateDashboard() {
    if (!currentUser) return;
    
    // Пайдаланушы атын жаңарту
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = currentUser.name;
    if (userAvatar) userAvatar.textContent = getInitials(currentUser.name);
    
    try {
        showLoading('Деректер жүктелуде...');
        // Жазылуларды жүктеу
        const enrollmentsData = await ApiService.getUserEnrollments(currentUser.id);
        hideLoading();
        
        if (enrollmentsData.success) {
            userEnrollments = enrollmentsData.enrollments;
            
            // Жалпы прогресті есептеу
            const totalProgress = userEnrollments.length > 0
                ? Math.round(userEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / userEnrollments.length)
                : 0;
            
            const totalProgressElem = document.getElementById('totalProgress');
            const totalCoursesElem = document.getElementById('totalCourses');
            
            if (totalProgressElem) totalProgressElem.textContent = totalProgress + '%';
            if (totalCoursesElem) totalCoursesElem.textContent = userEnrollments.length + ' курс';
            
            // Жазылған курстарды көрсету
            displayEnrolledCourses();
            // Барлық курстарды көрсету
            displayAllCourses();
        }
    } catch (error) {
        hideLoading();
        showToast('Деректерді жүктеу қатесі', 'error');
        console.error('Dashboard жаңарту қатесі:', error);
    }
}

function displayEnrolledCourses() {
    const container = document.getElementById('enrolledCourses');
    if (!container) return;
    
    if (userEnrollments.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-100 rounded-2xl p-6 text-center">
                <div class="text-4xl mb-3">📚</div>
                <p class="text-gray-600 text-sm">Әзірше жазылған курстарыңыз жоқ</p>
                <button onclick="displayAllCourses()" class="mt-4 text-blue-600 text-sm hover:underline">
                    Курстарды көру →
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userEnrollments.map(enrollment => {
        const course = allCourses.find(c => c.id === enrollment.course_id);
        if (!course) return '';
        
        const progress = enrollment.progress || 0;
        
        return `
            <div class="course-card bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100 hover:border-blue-200 transition-all cursor-pointer" onclick="showCourseDetail('${course.id}')">
                <div class="flex items-start gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        ${course.icon || '📚'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-gray-800 text-sm mb-1 truncate">${course.title}</h5>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xs px-2 py-1 rounded-lg ${enrollment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                                ${enrollment.status === 'paid' ? '✓ Төленді' : '⏳ Күтілуде'}
                            </span>
                        </div>
                        <div class="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full progress-animate" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">${Math.round(progress)}% аяқталды</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function displayAllCourses() {
    const container = document.getElementById('allCourses');
    if (!container) return;
    
    container.innerHTML = allCourses.map(course => {
        const enrollment = userEnrollments.find(e => e.course_id === course.id);
        
        return `
            <div class="course-card bg-white rounded-2xl p-4 shadow-md border-2 border-gray-100 hover:border-blue-200 transition-all cursor-pointer" onclick="showCourseDetail('${course.id}')">
                <div class="flex items-start gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        ${course.icon || '📚'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h5 class="font-bold text-gray-800 text-sm mb-1">${course.title}</h5>
                        <p class="text-xs text-gray-600 mb-2 line-clamp-2">${course.description}</p>
                        <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>🎥 ${course.total_lessons || 0} видео сабақ</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-blue-900 font-bold text-sm">${course.price || '0'}₸</span>
                            <span class="text-xs text-gray-500">${course.total_lessons || 0} сабақ</span>
                        </div>
                        ${enrollment ? '<div class="mt-2 text-xs text-green-600 font-semibold">✓ Жазылған</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function showCourseDetail(courseId) {
    console.log('Курс деталдарын көрсету:', courseId);
    
    const course = allCourses.find(c => c.id === courseId);
    if (!course) {
        showToast('Курс табылмады', 'error');
        return;
    }
    
    const enrollment = userEnrollments.find(e => e.course_id === courseId);
    
    hideAllScreens();
    document.getElementById('courseDetailScreen').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    
    const content = document.getElementById('courseDetailContent');
    if (!content) return;
    
    // Курстың сабақтарын алу
    const lessons = Array.isArray(course.lessons) ? course.lessons : [];
    const completedLessons = enrollment ? JSON.parse(enrollment.completed_lessons || '[]') : [];
    const progress = enrollment ? enrollment.progress : 0;
    
    // API арқылы курс видеоларын алу
    let videoCount = 0;
    try {
        const videosResponse = await ApiService.getCourseVideos(courseId);
        if (videosResponse.success) {
            videoCount = videosResponse.videos.length;
        }
    } catch (error) {
        console.error('Видеолар санын алу қатесі:', error);
    }
    
    content.innerHTML = `
        <div class="gradient-bg text-white p-6 pb-8">
            <button onclick="navigateTo('dashboard')" class="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span class="text-sm">Артқа</span>
            </button>
            <div class="text-center mb-6">
                <div class="w-20 h-20 bg-white/20 rounded-3xl mx-auto flex items-center justify-center text-5xl backdrop-blur mb-4">
                    ${course.icon || '📚'}
                </div>
                <h2 class="text-2xl font-bold mb-2">${course.title}</h2>
                <p class="text-sm text-white/90">${course.description}</p>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                    <div class="text-2xl font-bold">${course.total_lessons || 0}</div>
                    <div class="text-xs text-white/80">Сабақтар</div>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                    <div class="text-2xl font-bold">${Math.round(progress)}%</div>
                    <div class="text-xs text-white/80">Прогресс</div>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                    <div class="text-lg font-bold">${course.price || '0'}₸</div>
                    <div class="text-xs text-white/80">Бағасы</div>
                </div>
            </div>
            
            <!-- Видео көрсеткіші -->
            <div class="mt-4 bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                <div class="flex items-center gap-2 text-sm mb-1">
                    <span>🎥</span>
                    <span>Қамтылған материалдар:</span>
                </div>
                <p class="text-xs text-white/80">
                    ${videoCount} видео сабақ, ${course.total_lessons || 0} практикалық тапсырма, тесттер
                </p>
            </div>
            
            ${!enrollment ? `
                <button onclick="enrollCourse('${course.id}')" class="w-full mt-4 bg-white text-blue-900 font-bold py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                    🎓 Курсқа жазылу - ${course.price || '0'}₸
                </button>
            ` : enrollment.status === 'pending' ? `
                <button onclick="payForCourse('${course.id}')" class="w-full mt-4 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-all active:scale-95">
                    💳 Төлеу - ${course.price || '0'}₸
                </button>
            ` : `
                <div class="mt-4">
                    <div class="relative w-full h-3 bg-white/20 rounded-full overflow-hidden">
                        <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500 progress-animate" style="width: ${progress}%"></div>
                    </div>
                    <p class="text-xs text-white/90 mt-2 text-center">${Math.round(progress)}% аяқталды</p>
                    
                    ${progress === 100 ? `
                        <div class="mt-4 p-3 bg-green-900/30 rounded-xl border border-green-400/50">
                            <p class="text-center text-green-300 text-sm">
                                🎉 Курс аяқталды! Сертификат дайын!
                            </p>
                        </div>
                    ` : ''}
                </div>
            `}
        </div>
        <div class="p-6 space-y-3">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📖</span>
                <span>Сабақтар тізімі</span>
            </h3>
            ${lessons.length > 0 ? lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(index);
                const canAccess = enrollment && enrollment.status === 'paid';
                
                // Тесттердің бар-жоғын тексеру
                let hasQuiz = false;
                // Біз бұны кейінірек анықтаймыз
                
                return `
                    <div class="bg-white rounded-xl p-4 shadow-sm border-2 ${isCompleted ? 'border-green-200 bg-green-50' : canAccess ? 'border-gray-100 hover:border-blue-200' : 'border-gray-100'} transition-all ${canAccess ? 'cursor-pointer' : 'opacity-60'}"
                        ${canAccess ? `onclick="openLesson('${course.id}', ${index})"` : ''}>
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 ${isCompleted ? 'bg-green-500' : canAccess ? 'bg-blue-900' : 'bg-gray-400'} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                ${isCompleted ? '✓' : index + 1}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-gray-800 text-sm mb-1">${lesson.title}</h4>
                                <p class="text-xs text-gray-600 mb-2">${lesson.description}</p>
                                <div class="flex items-center gap-3 text-xs text-gray-500">
                                    <span>⏱️ ${lesson.duration || 'Ұзақтық белгісіз'}</span>
                                    ${isCompleted ? '<span class="text-green-600 font-semibold">✓ Аяқталды</span>' :
                                      canAccess ? '<span class="text-blue-600">▶ Көру</span>' :
                                      '<span class="text-gray-500">🔒 Жабық</span>'}
                                </div>
                                ${isCompleted ? `
                                    <div class="mt-2">
                                        <button onclick="showQuizResults('${course.id}', ${index})" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-200 transition-colors">
                                            📊 Тест нәтижелері
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('') : `
                <div class="bg-gray-100 rounded-xl p-6 text-center">
                    <div class="text-4xl mb-3">📚</div>
                    <p class="text-gray-600 text-sm">Сабақтар әзірше қосылмаған</p>
                </div>
            `}
            
            ${progress === 100 ? `
                <button onclick="showCertificate('${course.id}')" class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 active:scale-95">
                    🎓 Сертификатты көру
                </button>
            ` : ''}
        </div>
    `;
    
    currentCourseId = courseId;
}

async function enrollCourse(courseId) {
    if (!currentUser) {
        showToast('Алдымен кіру керек', 'error');
        showAuth(true);
        return;
    }
    
    try {
        const course = allCourses.find(c => c.id === courseId);
        if (!course) {
            showToast('Курс табылмады', 'error');
            return;
        }
        
        showLoading('Жазылу...');
        const result = await ApiService.enrollCourse({
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_email: currentUser.email,
            course_id: courseId,
            course_title: course.title,
            price: course.price
        });
        hideLoading();
        
        if (result.success) {
            showToast('Курсқа сәтті жазылдыңыз! 🎉', 'success');
            // Жазылуларды жаңарту
            const enrollmentsData = await ApiService.getUserEnrollments(currentUser.id);
            if (enrollmentsData.success) {
                userEnrollments = enrollmentsData.enrollments;
                showCourseDetail(courseId); // Курс бетіне қайта оралу
            }
        } else {
            showToast(result.message || 'Қате орын алды', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Желі қатесі', 'error');
        console.error('Жазылу қатесі:', error);
    }
}

async function payForCourse(courseId) {
    try {
        const enrollment = userEnrollments.find(e => e.course_id === courseId);
        if (!enrollment) {
            showToast('Жазылу табылмады', 'error');
            return;
        }
        
        showLoading('Төлем өңделуде...');
        const result = await ApiService.updateEnrollment({
            ...enrollment,
            status: 'paid'
        });
        hideLoading();
        
        if (result.success) {
            showToast('Төлем сәтті өтті! 💳', 'success');
            // Жазылуларды жаңарту
            const enrollmentsData = await ApiService.getUserEnrollments(currentUser.id);
            if (enrollmentsData.success) {
                userEnrollments = enrollmentsData.enrollments;
                showCourseDetail(courseId);
            }
        } else {
            showToast('Төлем қатесі', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Желі қатесі', 'error');
        console.error('Төлем қатесі:', error);
    }
}

async function openLesson(courseId, lessonIndex) {
    console.log('Сабақ ашу:', courseId, lessonIndex);
    
    const course = allCourses.find(c => c.id === courseId);
    if (!course) {
        showToast('Курс табылмады', 'error');
        return;
    }
    
    const lesson = course.lessons?.[lessonIndex];
    if (!lesson) {
        showToast('Сабақ табылмады', 'error');
        return;
    }
    
    const enrollment = userEnrollments.find(e => e.course_id === courseId);
    const completedLessons = enrollment ? JSON.parse(enrollment.completed_lessons || '[]') : [];
    const isCompleted = completedLessons.includes(lessonIndex);
    
    hideAllScreens();
    document.getElementById('lessonScreen').classList.remove('hidden');
    
    const content = document.getElementById('lessonContent');
    if (!content) return;
    
    currentCourseId = courseId;
    currentLessonIndex = lessonIndex;
    
    // API арқылы видео алу
    let videoData = null;
    try {
        const videoResponse = await ApiService.getLessonVideo(courseId, lessonIndex);
        if (videoResponse.success && videoResponse.video) {
            videoData = videoResponse.video;
        }
    } catch (error) {
        console.error('Видео алу қатесі:', error);
    }
    
    // Тесттердің бар-жоғын тексеру
    let hasQuiz = false;
    let quizCount = 0;
    try {
        const quizResponse = await ApiService.getQuizByLesson(courseId, lessonIndex, currentUser?.id);
        hasQuiz = quizResponse.success && quizResponse.quizzes && quizResponse.quizzes.length > 0;
        if (hasQuiz) {
            quizCount = quizResponse.quizzes.length;
        }
    } catch (error) {
        console.error('Тесттерді тексеру қатесі:', error);
    }
    
    // Видеоны қосу үшін HTML
    let videoHtml = '';
    
    if (videoData && videoData.youtube_video_id) {
        const videoId = videoData.youtube_video_id;
        console.log('YouTube видео ID:', videoId);
        
        // YouTube embed - қарапайым және сенімді нұсқа
        videoHtml = `
            <div class="video-container">
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1"
                    class="youtube-embed"
                    title="${videoData.title || lesson.title}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
                ${videoData.title ? `
                    <div class="p-3 bg-gray-900 text-white">
                        <h4 class="font-bold">${videoData.title}</h4>
                        ${videoData.duration ? `<p class="text-sm text-gray-300">⏱️ ${videoData.duration}</p>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Видео жоқ болса, әдепкі көрініс
        videoHtml = `
            <div class="bg-gradient-to-r from-gray-800 to-gray-900 p-8 text-center">
                <div class="text-6xl mb-4">📹</div>
                <h3 class="text-white text-lg mb-2">Видео материал</h3>
                <p class="text-gray-300">${lesson.title}</p>
                <p class="text-gray-400 text-sm mt-2">Бұл сабаққа видео қосылмаған</p>
            </div>
        `;
    }
    
    content.innerHTML = `
        ${videoHtml}
        <div class="p-6 bg-white">
            <button onclick="showCourseDetail('${courseId}')" class="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span class="text-sm">Курсқа оралу</span>
            </button>
            <div class="mb-6">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                        Сабақ ${lessonIndex + 1}/${course.lessons.length}
                    </span>
                    <span class="text-xs text-gray-500">⏱️ ${lesson.duration || videoData?.duration || 'Ұзақтық белгісіз'}</span>
                    ${videoData ? '<span class="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">🎥 Видео бар</span>' : ''}
                    ${hasQuiz ? `<span class="text-xs text-green-500 bg-green-50 px-2 py-1 rounded-lg">📝 ${quizCount} тест</span>` : ''}
                </div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${lesson.title}</h2>
                <p class="text-gray-600 mb-4">${lesson.description}</p>
                
                ${videoData?.description ? `
                    <div class="bg-blue-50 rounded-xl p-4 mb-4">
                        <h3 class="font-semibold text-blue-700 mb-2">🎬 Видео сипаттамасы:</h3>
                        <p class="text-blue-600 text-sm">${videoData.description}</p>
                    </div>
                ` : ''}
                
                <div class="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 class="font-semibold text-gray-700 mb-2">📚 Сабақ мазмұны:</h3>
                    <ul class="space-y-2 text-gray-600">
                        <li class="flex items-start gap-2">
                            <span class="text-green-500">✓</span>
                            <span>${getLessonContent(courseId, lessonIndex)}</span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="text-green-500">✓</span>
                            <span>Практикалық тапсырмалар</span>
                        </li>
                        ${hasQuiz ? `
                            <li class="flex items-start gap-2">
                                <span class="text-green-500">✓</span>
                                <span>Тестілер мен бағалау (${quizCount} сұрақ)</span>
                            </li>
                        ` : ''}
                    </ul>
                </div>
            </div>
            <div class="space-y-3">
                ${hasQuiz && !isCompleted ? `
                    <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                        <p class="text-yellow-700 text-sm mb-2">Сабақты аяқтағаннан кейін тест тапсыра аласыз</p>
                    </div>
                ` : ''}
                
                ${hasQuiz && isCompleted ? `
                    <button onclick="showQuiz('${courseId}', ${lessonIndex})" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
                        📝 Тестті тапсыру
                    </button>
                ` : ''}
                
                ${!isCompleted ? `
                    <button onclick="completeLesson('${courseId}', ${lessonIndex})" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
                        ✓ Сабақты аяқтау
                    </button>
                ` : `
                    <div class="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <div class="text-green-600 font-bold text-lg mb-1">✓ Аяқталды</div>
                        <p class="text-sm text-green-700">Сіз бұл сабақты аяқтадыңыз</p>
                    </div>
                `}
                
                ${hasQuiz && isCompleted ? `
                    <button onclick="showQuizResults('${courseId}', ${lessonIndex})" class="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all active:scale-95">
                        📊 Тест нәтижелері
                    </button>
                ` : ''}
                
                ${lessonIndex < course.lessons.length - 1 ? `
                    <button onclick="openLesson('${courseId}', ${lessonIndex + 1})" ${!isCompleted ? 'disabled' : ''} 
                        class="w-full ${isCompleted ? 'bg-blue-900 hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'} text-white font-bold py-4 rounded-xl transition-all active:scale-95">
                        Келесі сабақ →
                    </button>
                ` : isCompleted ? `
                    <button onclick="showCourseDetail('${courseId}')" class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95">
                        🎉 Курсқа оралу
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Сабақтарға арналған мазмұн функциясы
function getLessonContent(courseId, lessonIndex) {
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return 'Негізгі материалдар';
    
    const lessonContentMap = {
        'course_1': [
            'HTML тегтері мен аттрибуттары',
            'CSS селекторлары мен қасиеттері',
            'Flexbox және Grid құрылымдары',
            'JavaScript синтаксисі',
            'DOM манипуляциясы',
            'Толық веб-сайт жасау'
        ],
        'course_2': [
            'Python негіздері',
            'Шартты операторлар',
            'Функциялар мен модульдер',
            'Класстар мен объектілер',
            'Практикалық жоба'
        ],
        'course_3': [
            'Data Science негіздері',
            'NumPy және Pandas кітапханалары',
            'Деректерді визуализациялау',
            'Машиналық оқыту алгоритмдері',
            'Нейрондық желілер',
            'AI моделін жасау'
        ],
        'course_4': [
            'React Native негіздері',
            'UI компоненттері',
            'Навигация жүйесі',
            'API интеграциясы',
            'Қосымшаны жариялау'
        ],
        'course_5': [
            'Цифрлық маркетинг негіздері',
            'SEO және SEM стратегиялары',
            'Әлеуметтік желілерде маркетинг',
            'Аналитика және метрикалар'
        ],
        'course_6': [
            'Дизайн принциптері',
            'Figma құралы',
            'Пайдаланушы зерттеулері',
            'Прототип жасау',
            'Дизайн жүйесі'
        ]
    };
    
    return lessonContentMap[courseId]?.[lessonIndex] || 'Негізгі материалдар';
}

async function completeLesson(courseId, lessonIndex) {
    try {
        if (!currentUser) {
            showToast('Алдымен кіру керек', 'error');
            return;
        }
        
        showLoading('Сабақ аяқталуда...');
        const result = await ApiService.completeLesson({
            user_id: currentUser.id,
            course_id: courseId,
            lesson_index: lessonIndex
        });
        hideLoading();
        
        if (result.success) {
            showToast('Сабақ аяқталды! 🎉', 'success');
            
            // Жазылуларды жаңарту
            const enrollmentsData = await ApiService.getUserEnrollments(currentUser.id);
            if (enrollmentsData.success) {
                userEnrollments = enrollmentsData.enrollments;
                
                // Егер курс аяқталса (progress === 100)
                const enrollment = userEnrollments.find(e => e.course_id === courseId);
                if (enrollment && enrollment.progress === 100) {
                    // Сертификатты тексеру немесе генерациялау
                    const courseCompleteResult = await ApiService.completeCourse({
                        user_id: currentUser.id,
                        course_id: courseId
                    });
                    
                    if (courseCompleteResult.success && courseCompleteResult.certificate_issued) {
                        setTimeout(() => {
                            showToast('Құттықтаймыз! Курс аяқталды! 🎓', 'success');
                            updateCourseDetailWithCertificate(courseId);
                        }, 1000);
                    }
                }
                
                // Сабақ экранын жаңарту
                openLesson(courseId, lessonIndex);
            }
        } else {
            showToast(result.message || 'Қате орын алды', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Желі қатесі', 'error');
        console.error('Сабақ аяқтау қатесі:', error);
    }
}

// ============= ЖАҢА ФУНКЦИЯЛАР: ТЕСТТЕР =============

// Тест көрсету функциясы
async function showQuiz(courseId, lessonIndex) {
    try {
        if (!currentUser) {
            showToast('Алдымен кіру керек', 'error');
            return;
        }
        
        showLoading('Тест жүктелуде...');
        const response = await ApiService.getQuizByLesson(courseId, lessonIndex, currentUser.id);
        hideLoading();
        
        if (response.success && response.quizzes && response.quizzes.length > 0) {
            hideAllScreens();
            document.getElementById('quizScreen').classList.remove('hidden');
            
            const content = document.getElementById('quizContent');
            if (!content) return;
            
            const course = allCourses.find(c => c.id === courseId);
            const lesson = course?.lessons?.[lessonIndex];
            
            let quizHTML = `
                <div class="gradient-bg text-white p-6 rounded-b-3xl">
                    <button onclick="openLesson('${courseId}', ${lessonIndex})" class="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span class="text-sm">Сабаққа оралу</span>
                    </button>
                    <div class="text-center">
                        <div class="text-4xl mb-3">📝</div>
                        <h2 class="text-xl font-bold mb-2">Тест</h2>
                        <p class="text-sm text-white/80">${course?.title || ''} - ${lesson?.title || ''}</p>
                        <p class="text-xs text-white/60 mt-1">${response.quizzes.length} сұрақ</p>
                    </div>
                </div>
                <div class="p-6">
                    <form id="quizForm">
            `;
            
            response.quizzes.forEach((quiz, index) => {
                const userAnswer = quiz.user_answer;
                const isAnswered = userAnswer !== undefined && userAnswer !== null;
                const isCorrect = quiz.is_correct;
                
                quizHTML += `
                    <div class="bg-white rounded-xl p-4 shadow-sm border-2 ${isAnswered ? (isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') : 'border-gray-100'} mb-4">
                        <div class="flex items-start gap-3 mb-3">
                            <div class="w-8 h-8 ${isAnswered ? (isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-900'} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800 text-sm mb-3">${quiz.question}</h4>
                                
                                <div class="space-y-2">
                                    ${quiz.options.map((option, optionIndex) => {
                                        const isSelected = userAnswer === optionIndex;
                                        const isCorrectOption = optionIndex === quiz.correct_answer;
                                        
                                        let optionClass = "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ";
                                        let radioClass = "w-5 h-5 rounded-full border-2 flex items-center justify-center ";
                                        
                                        if (isAnswered) {
                                            if (isCorrectOption) {
                                                optionClass += "bg-green-100 border-green-300";
                                                radioClass += "border-green-500 bg-green-500";
                                            } else if (isSelected && !isCorrect) {
                                                optionClass += "bg-red-100 border-red-300";
                                                radioClass += "border-red-500 bg-red-500";
                                            } else {
                                                optionClass += "bg-gray-100 border-gray-300";
                                                radioClass += "border-gray-400";
                                            }
                                        } else {
                                            optionClass += "hover:bg-blue-50 border-2 border-gray-200";
                                            radioClass += "border-gray-400";
                                        }
                                        
                                        return `
                                            <label class="${optionClass}" onclick="${!isAnswered ? `selectQuizOption(${quiz.id}, ${optionIndex})` : ''}">
                                                <div class="${radioClass}">
                                                    ${isAnswered && isCorrectOption ? '<div class="w-2 h-2 bg-white rounded-full"></div>' : ''}
                                                    ${isAnswered && isSelected && !isCorrect ? '<div class="text-white text-xs">✗</div>' : ''}
                                                </div>
                                                <span class="text-sm flex-1">${option}</span>
                                                ${isAnswered && isCorrectOption ? '<span class="ml-auto text-green-600 text-sm font-semibold">✓ Дұрыс</span>' : ''}
                                                ${isAnswered && isSelected && !isCorrect ? '<span class="ml-auto text-red-600 text-sm font-semibold">✗ Қате</span>' : ''}
                                            </label>
                                        `;
                                    }).join('')}
                                </div>
                                
                                ${isAnswered && quiz.explanation ? `
                                    <div class="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p class="text-xs text-blue-700 font-semibold mb-1">📌 Түсіндірме:</p>
                                        <p class="text-xs text-blue-600">${quiz.explanation}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${!isAnswered ? `
                            <input type="hidden" name="quiz_${quiz.id}" id="quiz_${quiz.id}" value="">
                        ` : ''}
                    </div>
                `;
            });
            
            // Егер барлық сұрақтарға жауап берілмеген болса, сақтау түймесін қосу
            const allAnswered = response.quizzes.every(q => q.user_answer !== undefined && q.user_answer !== null);
            
            if (!allAnswered) {
                quizHTML += `
                    <button type="button" onclick="submitQuiz('${courseId}', ${lessonIndex})" 
                            class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
                        📤 Жауаптарды сақтау
                    </button>
                `;
            } else {
                quizHTML += `
                    <div class="text-center">
                        <p class="text-green-600 font-semibold mb-3">✅ Барлық сұрақтарға жауап берілді</p>
                        <button type="button" onclick="openLesson('${courseId}', ${lessonIndex})" 
                                class="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-all active:scale-95">
                            Сабаққа оралу
                        </button>
                    </div>
                `;
            }
            
            quizHTML += `
                    </form>
                </div>
            `;
            
            content.innerHTML = quizHTML;
        } else {
            showToast('Тест сұрақтары табылмады', 'info');
        }
    } catch (error) {
        hideLoading();
        showToast('Тестті жүктеу қатесі', 'error');
        console.error('Тест көрсету қатесі:', error);
    }
}

// Тест нәтижелерін көрсету
async function showQuizResults(courseId, lessonIndex) {
    try {
        if (!currentUser) {
            showToast('Алдымен кіру керек', 'error');
            return;
        }
        
        showLoading('Нәтижелер жүктелуде...');
        const response = await ApiService.getUserQuizResults(currentUser.id, courseId, lessonIndex);
        hideLoading();
        
        if (response.success) {
            hideAllScreens();
            document.getElementById('quizResultsScreen').classList.remove('hidden');
            
            const content = document.getElementById('quizResultsContent');
            if (!content) return;
            
            const course = allCourses.find(c => c.id === courseId);
            const lesson = course?.lessons?.[lessonIndex];
            const stats = response.statistics;
            
            let resultsHTML = `
                <div class="gradient-bg text-white p-6 rounded-b-3xl">
                    <button onclick="openLesson('${courseId}', ${lessonIndex})" class="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span class="text-sm">Сабаққа оралу</span>
                    </button>
                    <div class="text-center">
                        <div class="text-4xl mb-3">🏆</div>
                        <h2 class="text-xl font-bold mb-2">Тест нәтижелері</h2>
                        <p class="text-sm text-white/80">${course?.title || ''} - ${lesson?.title || ''}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-3 mt-4">
                        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                            <div class="text-2xl font-bold">${stats.correct_answers}/${stats.answered_questions}</div>
                            <div class="text-xs text-white/80">Дұрыс</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                            <div class="text-2xl font-bold">${stats.score}%</div>
                            <div class="text-xs text-white/80">Ұпай</div>
                        </div>
                        <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                            <div class="text-xl font-bold">${stats.correct_answers >= Math.floor(stats.total_questions * 0.7) ? '✅' : '❌'}</div>
                            <div class="text-xs text-white/80">Өтті</div>
                        </div>
                    </div>
                </div>
                <div class="p-6">
            `;
            
            if (stats.total_questions === 0) {
                resultsHTML += `
                    <div class="text-center py-8">
                        <div class="text-4xl mb-3">📝</div>
                        <p class="text-gray-600">Әзірше тест нәтижелері жоқ</p>
                        <button onclick="showQuiz('${courseId}', ${lessonIndex})" class="mt-4 bg-blue-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-800 transition-all">
                            Тест тапсыру
                        </button>
                    </div>
                `;
            } else {
                response.results.forEach((quiz, index) => {
                    resultsHTML += `
                        <div class="bg-white rounded-xl p-4 shadow-sm border-2 ${quiz.is_correct ? 'border-green-200' : 'border-red-200'} mb-4">
                            <div class="flex items-start gap-3 mb-3">
                                <div class="w-8 h-8 ${quiz.is_correct ? 'bg-green-500' : 'bg-red-500'} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                    ${index + 1}
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-800 text-sm mb-2">${quiz.question}</h4>
                                    <div class="space-y-1">
                                        ${quiz.options.map((option, optionIndex) => {
                                            let optionClass = "p-2 rounded text-sm ";
                                            if (optionIndex === quiz.correct_answer) {
                                                optionClass += "bg-green-100 text-green-700";
                                            } else if (optionIndex === quiz.user_answer && !quiz.is_correct) {
                                                optionClass += "bg-red-100 text-red-700";
                                            } else {
                                                optionClass += "bg-gray-100 text-gray-600";
                                            }
                                            
                                            let marker = "";
                                            if (optionIndex === quiz.correct_answer) marker = "✓ ";
                                            if (optionIndex === quiz.user_answer && !quiz.is_correct) marker = "✗ ";
                                            
                                            return `
                                                <div class="${optionClass}">
                                                    ${marker}${option}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                            ${quiz.explanation ? `
                                <div class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p class="text-xs text-blue-700 font-semibold mb-1">📌 Түсіндірме:</p>
                                    <p class="text-xs text-blue-600">${quiz.explanation}</p>
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
                
                // Нәтиже жалпы бағалауы
                let performanceMessage = '';
                let performanceColor = '';
                let performanceIcon = '';
                
                if (stats.percentage >= 80) {
                    performanceMessage = 'Өте жақсы! 🎉';
                    performanceColor = 'text-green-600';
                    performanceIcon = '🏅';
                } else if (stats.percentage >= 60) {
                    performanceMessage = 'Жақсы! 👍';
                    performanceColor = 'text-blue-600';
                    performanceIcon = '⭐';
                } else {
                    performanceMessage = 'Жақсарту керек 📚';
                    performanceColor = 'text-yellow-600';
                    performanceIcon = '📖';
                }
                
                resultsHTML += `
                    <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                        <h3 class="font-bold text-gray-800 mb-2">Жалпы бағалау: ${performanceIcon}</h3>
                        <p class="${performanceColor} font-semibold mb-2 text-lg">${performanceMessage}</p>
                        <p class="text-sm text-gray-600">
                            Сіз ${stats.correct_answers} сұраққа дұрыс жауап бердіңіз, 
                            ${stats.answered_questions - stats.correct_answers} сұрақ қате.
                        </p>
                        <div class="mt-3 relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full progress-animate" style="width: ${stats.percentage}%"></div>
                        </div>
                        <p class="text-xs text-gray-600 mt-1 text-right">${stats.percentage}%</p>
                    </div>
                `;
            }
            
            resultsHTML += `
                    <div class="mt-4 space-y-3">
                        <button onclick="showQuiz('${courseId}', ${lessonIndex})" 
                                class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all active:scale-95">
                            🔄 Тестті қайта тапсыру
                        </button>
                        <button onclick="openLesson('${courseId}', ${lessonIndex})" 
                                class="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-all active:scale-95">
                            Сабаққа оралу
                        </button>
                    </div>
                </div>
            `;
            
            content.innerHTML = resultsHTML;
        } else {
            showToast('Нәтижелерді жүктеу қатесі', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Нәтижелерді жүктеу қатесі', 'error');
        console.error('Нәтижелерді көрсету қатесі:', error);
    }
}

// Тест сұрағына жауап таңдау
function selectQuizOption(quizId, optionIndex) {
    // Бұл функция арналған жауаптарды жаңарту үшін қолданылады
    const inputField = document.getElementById(`quiz_${quizId}`);
    if (inputField) {
        inputField.value = optionIndex;
        
        // Таңдалған опцияны көрсету
        const quizElement = inputField.closest('.bg-white');
        if (quizElement) {
            // Барлық опцияларды қалпына келтіру
            quizElement.querySelectorAll('label').forEach(label => {
                label.classList.remove('bg-blue-100', 'border-blue-300');
                label.classList.add('bg-gray-100', 'border-gray-300');
            });
            
            // Таңдалған опцияны белгілеу
            const selectedLabel = quizElement.querySelector(`label[onclick*="${quizId}, ${optionIndex}"]`);
            if (selectedLabel) {
                selectedLabel.classList.remove('bg-gray-100', 'border-gray-300');
                selectedLabel.classList.add('bg-blue-100', 'border-blue-300');
            }
        }
    }
}

// Тест жауаптарын жіберу
async function submitQuiz(courseId, lessonIndex) {
    try {
        const response = await ApiService.getQuizByLesson(courseId, lessonIndex, currentUser?.id);
        
        if (response.success && response.quizzes) {
            showLoading('Жауаптар тексерілуде...');
            
            let allAnswered = true;
            const promises = [];
            
            // Әрбір тест үшін жауапты жіберу
            response.quizzes.forEach(quiz => {
                const inputField = document.getElementById(`quiz_${quiz.id}`);
                if (inputField && inputField.value !== '') {
                    const userAnswer = parseInt(inputField.value);
                    
                    const promise = ApiService.submitQuizAnswer(quiz.id, {
                        user_id: currentUser.id,
                        course_id: courseId,
                        lesson_index: lessonIndex,
                        user_answer: userAnswer
                    });
                    
                    promises.push(promise);
                } else {
                    allAnswered = false;
                    console.log(`❌ Жауап берілмеген сұрақ: ${quiz.id}`);
                }
            });
            
            if (!allAnswered) {
                hideLoading();
                showToast('Барлық сұрақтарға жауап беріңіз', 'error');
                return;
            }
            
            // Барлық жауаптарды күту
            await Promise.all(promises);
            hideLoading();
            
            // Тест экранын жаңарту
            showQuiz(courseId, lessonIndex);
            
            showToast('Тест нәтижелері сақталды! ✅', 'success');
            
        } else {
            showToast('Тест сұрақтары табылмады', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Тест нәтижесін сақтау қатесі', 'error');
        console.error('Тест жіберу қатесі:', error);
    }
}

// ============= ҚАЛҒАН ФУНКЦИЯЛАР =============

async function showCertificate(courseId) {
    try {
        if (!currentUser) {
            showToast('Алдымен кіру керек', 'error');
            return;
        }
        
        showLoading('Сертификат жүктелуде...');
        const result = await ApiService.getCertificate(currentUser.id, courseId);
        hideLoading();
        
        if (result.success && result.certificate) {
            const cert = result.certificate;
            const course = allCourses.find(c => c.id === courseId);
            const enrollment = userEnrollments.find(e => e.course_id === courseId);
            
            hideAllScreens();
            document.getElementById('certificateScreen').classList.remove('hidden');
            
            const content = document.getElementById('certificateContent');
            if (!content) return;
            
            content.innerHTML = `
                <button onclick="showCourseDetail('${courseId}')" class="mb-6 text-white flex items-center gap-2 hover:gap-3 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    <span class="text-sm">Артқа</span>
                </button>
                <div class="certificate bg-white rounded-3xl p-8 shadow-2xl border-8 border-yellow-400 animate-slide-up">
                    <div class="text-center space-y-4">
                        <div class="text-6xl mb-4">🎓</div>
                        <h2 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-purple-900">
                            СЕРТИФИКАТ
                        </h2>
                        <p class="text-gray-600">Курсты сәтті аяқтағаны туралы</p>
                        <div class="py-6">
                            <p class="text-sm text-gray-600 mb-2">Осы сертификат берілді</p>
                            <div class="text-2xl font-bold text-blue-900 mb-4 underline decoration-wavy decoration-yellow-400">
                                ${currentUser.name}
                            </div>
                            <p class="text-sm text-gray-600 mb-2">Келесі курсты сәтті аяқтағаны үшін:</p>
                            <div class="text-xl font-bold text-gray-800 mb-4">
                                ${course?.icon || '📚'} ${course?.title || cert.course_title}
                            </div>
                            <p class="text-xs text-gray-600 leading-relaxed">
                                Студент барлық ${course?.total_lessons || 0} сабақты аяқтап,
                                білім мен дағдыларды меңгерді.
                            </p>
                        </div>
                        <div class="pt-6 border-t-2 border-gray-200 space-y-2">
                            <div class="text-xs text-gray-600">
                                <strong>Берілген күні:</strong><br>
                                ${new Date(cert.issue_date).toLocaleDateString('kk-KZ', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div class="text-xs text-gray-600 font-mono">
                                <strong>Сертификат №:</strong> ${cert.serial_number}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Сертификат жоқ болса, құруға әрекет жасау
            const courseCompleteResult = await ApiService.completeCourse({
                user_id: currentUser.id,
                course_id: courseId
            });
            
            if (courseCompleteResult.success && courseCompleteResult.certificate_issued) {
                // Қайтадан көрсету
                showCertificate(courseId);
            } else {
                showToast('Сертификат табылмады немесе әлі дайын емес', 'error');
                showCourseDetail(courseId);
            }
        }
    } catch (error) {
        hideLoading();
        showToast('Сертификатты жүктеу қатесі', 'error');
        console.error('Сертификат көрсету қатесі:', error);
    }
}

async function showProfile() {
    if (!currentUser) {
        showToast('Алдымен кіру керек', 'error');
        showAuth(true);
        return;
    }
    
    hideAllScreens();
    document.getElementById('profileScreen').classList.remove('hidden');
    
    const completedCourses = userEnrollments.filter(e => e.progress === 100).length;
    const content = document.getElementById('profileContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="gradient-bg text-white p-6 pb-8 rounded-b-3xl">
            <h3 class="text-xl font-bold mb-6">Профиль</h3>
            <div class="text-center mb-6">
                <div class="w-24 h-24 bg-white/20 rounded-3xl mx-auto flex items-center justify-center text-4xl backdrop-blur mb-4">
                    ${getInitials(currentUser.name)}
                </div>
                <h2 class="text-2xl font-bold mb-1">${currentUser.name}</h2>
                <p class="text-sm text-white/80">${currentUser.email}</p>
                ${currentUser.phone ? `<p class="text-sm text-white/60 mt-1">${currentUser.phone}</p>` : ''}
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                    <div class="text-2xl font-bold">${userEnrollments.length}</div>
                    <div class="text-xs text-white/80">Барлық курстар</div>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-3 text-center border border-white/20">
                    <div class="text-2xl font-bold">${completedCourses}</div>
                    <div class="text-xs text-white/80">Аяқталған</div>
                </div>
            </div>
        </div>
        <div class="p-6 space-y-4">
            <h4 class="font-bold text-gray-800 mb-3">Профильді өңдеу</h4>
            <form id="profileForm" class="space-y-4">
                <div>
                    <label for="profileName" class="block text-sm font-semibold text-gray-700 mb-2">Аты-жөні</label>
                    <input type="text" id="profileName" value="${currentUser.name}" required
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors">
                </div>
                <div>
                    <label for="profilePhone" class="block text-sm font-semibold text-gray-700 mb-2">Телефон</label>
                    <input type="tel" id="profilePhone" value="${currentUser.phone || ''}" placeholder="+7 (777) 123-45-67"
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors">
                </div>
                <div>
                    <label for="profileEmailDisplay" class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" id="profileEmailDisplay" value="${currentUser.email}" readonly
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500">
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
                    💾 Өзгерістерді сақтау
                </button>
            </form>
            <button onclick="logout()" class="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all active:scale-95">
                🚪 Шығу
            </button>
        </div>
    `;
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const newName = document.getElementById('profileName')?.value;
    const newPhone = document.getElementById('profilePhone')?.value;
    
    if (!newName) {
        showToast('Аты-жөніңізді енгізіңіз', 'error');
        return;
    }
    
    try {
        showLoading('Профиль жаңартылуда...');
        const result = await ApiService.updateProfile(currentUser.id, {
            name: newName,
            phone: newPhone
        });
        hideLoading();
        
        if (result.success) {
            currentUser.name = newName;
            currentUser.phone = newPhone;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showToast('Профиль сәтті жаңартылды! ✅', 'success');
            setTimeout(() => navigateTo('dashboard'), 1000);
        } else {
            showToast(result.message || 'Профильді жаңарту қатесі', 'error');
        }
    } catch (error) {
        hideLoading();
        showToast('Желі қатесі', 'error');
        console.error('Профильді жаңарту қатесі:', error);
    }
}

function updateCourseDetailWithCertificate(courseId) {
    const courseDetailContent = document.getElementById('courseDetailContent');
    if (!courseDetailContent) return;
    
    // Сертификат түймесін қосу
    const existingButton = courseDetailContent.querySelector('.certificate-button');
    if (!existingButton) {
        const buttonHtml = `
            <button onclick="showCertificate('${courseId}')" 
                    class="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all mt-4 certificate-button active:scale-95">
                🎓 Сертификатты көру
            </button>
        `;
        
        // Түймені қосу
        const lessonsSection = courseDetailContent.querySelector('.space-y-3');
        if (lessonsSection) {
            lessonsSection.insertAdjacentHTML('beforeend', buttonHtml);
        }
    }
}

function logout() {
    currentUser = null;
    userEnrollments = [];
    currentCourseId = null;
    currentLessonIndex = 0;
    localStorage.removeItem('currentUser');
    showWelcome();
    showToast('Сәтті шықтыңыз 👋', 'success');
}

// Көмекші функциялар
function hideAllScreens() {
    const screens = [
        'welcomeScreen',
        'authScreen', 
        'dashboardScreen',
        'courseDetailScreen',
        'lessonScreen',
        'profileScreen',
        'certificateScreen',
        'quizScreen',
        'quizResultsScreen'
    ];
    
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('hidden');
    });
}

function getInitials(name) {
    if (!name || typeof name !== 'string') return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '👤';
}

function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    toast.className = `${bgColor} text-white px-6 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-3`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Загрузка индикаторы функциялары
function showLoading(message = 'Жүктелуде...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const messageElem = overlay.querySelector('p');
        if (messageElem && message) {
            messageElem.textContent = message;
        }
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Видео функционалдылығын тексеру
function testVideoFunctionality() {
    console.log('=== ВИДЕО ЖӘНЕ ТЕСТ ТЕСТІ ===');
    console.log('1. Барлық курстар:', allCourses.length);
    
    allCourses.forEach((course, i) => {
        console.log(`Курс ${i+1}: ${course.title}`);
        if (course.lessons && Array.isArray(course.lessons)) {
            console.log(`  Сабақтар: ${course.lessons.length}`);
        }
    });
    
    console.log('=== ТЕСТ АЯҚТАЛДЫ ===');
}

// YouTube Player API (қосымша)
function loadYouTubeAPI() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

// Қолданбаны іске қосу
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM дайын');
    initApp().catch(error => {
        console.error('Қолданбаны іске қсу қатесі:', error);
        showToast('Қолданбаны іске қосу қатесі', 'error');
    });
});

// Глобальды функциялар (HTML ішінен шақыру үшін)
window.openLesson = openLesson;
window.showCourseDetail = showCourseDetail;
window.enrollCourse = enrollCourse;
window.payForCourse = payForCourse;
window.completeLesson = completeLesson;
window.showCertificate = showCertificate;
window.navigateTo = navigateTo;
window.showAuth = showAuth;
window.logout = logout;
window.getLessonContent = getLessonContent;
window.updateCourseDetailWithCertificate = updateCourseDetailWithCertificate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showQuiz = showQuiz;
window.showQuizResults = showQuizResults;
window.selectQuizOption = selectQuizOption;
window.submitQuiz = submitQuiz;