const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./api.js');
const { initDatabase } = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статикалық файлдар
app.use(express.static(path.join(__dirname, '..', 'public')));

// Дерекқорды инициализациялау және серверді іске қосу
async function startServer() {
    try {
        // Дерекқорды инициализациялау
        await initDatabase();
        console.log('Дерекқор сәтті инициализацияланды');
        
        // API маршруттары
        app.use('/api', apiRoutes);

        // Негізгі маршрут
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
        });

        // Серверді іске қосу
        app.listen(PORT, () => {
            console.log(`\n✅ Сервер ${PORT} портында жұмыс істеп тұр`);
            console.log(`🌐 http://localhost:${PORT}`);
            console.log('\n=== ҚОЛДАНУ НҰСҚАУЛЫҒЫ ===');
            console.log('1. Тест аккаунтымен кіру:');
            console.log('   Email: test@example.com');
            console.log('   Құпия сөз: password123');
            console.log('2. Жаңа пайдаланушы тіркеуге болады');
            console.log('3. Курсқа жазылып, сабақтарды оқыңыз');
            console.log('===========================\n');
        });
    } catch (error) {
        console.error('Серверді іске қосу қатесі:', error);
        process.exit(1);
    }
}

// Серверді бастау
startServer();