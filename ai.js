// AI Chatbot Script
class AIChat {
    constructor() {
        this.chatBox = document.getElementById('chatBox');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // ربط الأحداث
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // قاعدة بيانات الإجابات
        this.responses = this.initializeResponses();
        
        // متغيرات الحالة
        this.isTyping = false;
    }

    initializeResponses() {
        return {
            // تحيات
            'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! 👋 كيف حالك؟',
            'صباح الخير': 'صباح النور! ☀️ أتمنى أن تكون بخير',
            'مساء الخير': 'مساء الخير! 🌙 كيف يمكنني مساعدتك؟',
            'كيف حالك': 'أنا بحال جيدة شكراً لسؤالك! 😊 وأنت كيف حالك؟',
            'شكراً': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'شكرا': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'spank you': 'You\'re welcome! 😊 How can I help?',
            'hello': 'Hello! 👋 How can I assist you today?',
            'hi': 'Hi there! 👋 What can I do for you?',
            
            // أسئلة تقنية
            'ما هو': 'هذا سؤال جيد! 🤔 يمكنك أن تكون أكثر تحديداً؟',
            'كيف': 'يمكنك أن توضح أكثر؟ 🤔',
            'هل': 'هذا يعتمد على السياق! 💭 هل يمكنك تفاصيل أكثر؟',
            
            // أسئلة عامة
            'من أنت': 'أنا chatbot ذكي مصنوع بلغة JavaScript! 🤖 هدفي مساعدتك والإجابة على أسئلتك',
            'من انت': 'أنا chatbot ذكي مصنوع بلغة JavaScript! 🤖 هدفي مساعدتك والإجابة على أسئلتك',
            'ما اسمك': 'اسمي AI Assistant 🤖 شرفني أن أعرفك!',
            'هل تستطيع الكلام بالعربية': 'نعم! أتحدث العربية بطلاقة! 🇸🇦 كيف يمكنني مساعدتك؟',
            
            // معلومات
            'أخبرني عن نفسك': 'أنا مساعد ذكي يعمل بدون الحاجة للإنترنت! 🤖\n✨ المميزات:\n• الرد السريع\n• دعم اللغة العربية\n• معالجة ذكية للنصوص\n• تعلم من التفاعلات',
            'هل تستطيع المساعدة': 'بالتأكيد! 💪 أنا هنا لمساعدتك في:\n📝 الإجابة على الأسئلة\n💡 تقديم المشورة\n🎓 شرح المفاهيم\nما الذي تريد معرفته؟',
            'ماذا تستطيع أن تفعل': 'يمكنني:\n💬 الدردشة والحوار\n🎯 الإجابة على الأسئلة\n📚 تقديم المعلومات\n🤝 مساعدتك في حل المشاكل\nجرب سؤالني عن أي شيء!',
            
            // تقنيات البرمجة
            'javascript': 'JavaScript لغة برمجة قوية! 💻 تستخدم في:\n🌐 تطوير الويب\n📱 تطبيقات الهاتف\n🖥️ تطبيقات سطح المكتب',
            'python': 'Python لغة رائعة وسهلة! 🐍\n📊 تحليل البيانات\n🤖 الذكاء الاصطناعي\n🌐 تطوير الويب',
            'html': 'HTML هو لغة الترميز الأساسية للويب! 🏗️\nتستخدم لبناء هيكل صفحات الويب',
            'css': 'CSS تستخدم لتصميم وتنسيق صفحات الويب! 🎨\nألوان وأشكال وتخطيطات جميلة',
            
            // مواضيع أخرى
            'البرمجة': 'البرمجة مهارة رائعة! 💻 تريد تعلم:\n🟡 JavaScript\n🔵 Python\n🟢 HTML/CSS\n❤️ أو شيء آخر؟',
            'الويب': 'تطوير الويب حقل واسع! 🌐\n⚡ Frontend: HTML, CSS, JavaScript\n🔧 Backend: Node.js, Python, PHP\n💾 Database: MongoDB, MySQL',
            'كمبيوتر': 'الحاسوب جهاز رائع! 💻\n🖥️ للعمل والإنتاجية\n🎮 للألعاب والترفيه\n📱 الأجهزة المحمولة',
            'الذكاء الاصطناعي': 'الذكاء الاصطناعي مستقبل التكنولوجيا! 🤖\n🧠 Machine Learning\n📊 Deep Learning\n💬 NLP - معالجة اللغة الطبيعية',
            
            // أسئلة عشوائية
            'اضحك': '😂😂😂 هههه أنت مضحك! 🤣',
            'مرحبا': '👋 مرحبا بك! تشرفت!',
            'بايبای': 'باي باي! 👋 كان سعيداً بالحديث معك! 😊',
            'وداعا': 'وداعاً! 👋 أتمنى أن نتحدث مرة أخرى قريباً! 💙',
            'باي': 'باي! 👋 شكراً للدردشة! 😊',
            'اعطني نكتة': '😄 تمام! نكتة لك:\nلماذا لا يذهب المبرمج إلى الشاطئ؟\nلأنه يخاف من Java! ☕😂',
            'اعطني فكرة': '💡 إليك بعض الأفكار:\n🎮 اصنع لعبة صغيرة\n📱 طبق تطبيق ويب\n🤖 صنع chatbot\n📊 تحليل بيانات',
            'ما أفضل لغة برمجة': '🏆 كل لغة لها مميزات!\n🐍 Python سهلة وقوية\n💻 JavaScript للويب\n🔧 C++ للأداء العالي\nاختر حسب احتياجاتك! 😊',
            'ساعدني': 'بالطبع! 🤝 أنا هنا لمساعدتك!\nأخبرني بماذا تحتاج مساعدة؟',
        };
    }

    findResponse(userMessage) {
        const message = userMessage.trim().toLowerCase();

        // البحث عن تطابق دقيق
        for (let key in this.responses) {
            if (message === key.toLowerCase()) {
                return this.responses[key];
            }
        }

        // البحث عن تطابق جزئي
        for (let key in this.responses) {
            if (message.includes(key.toLowerCase())) {
                return this.responses[key];
            }
        }

        // إذا لم يوجد رد معروف
        return this.generateSmartResponse(message);
    }

    generateSmartResponse(userMessage) {
        // ردود ذكية عند عدم وجود إجابة مباشرة
        const smartResponses = [
            '🤔 هذا سؤال مثير للاهتمام! هل يمكنك توضيح أكثر؟',
            '💭 أنا أتعلم! لم أسمع بهذا من قبل. أخبرني أكثر؟',
            '🤖 سؤال رائع! لم أكن أعرف الإجابة، هل تستطيع مساعدتي؟',
            '😊 هذا موضوع جديد! هل يمكنك شرحه لي؟',
            '⚡ أنا أتطور! جرب سؤال آخر أو اطلب مني أن أساعدك بشيء معين',
        ];
        
        return smartResponses[Math.floor(Math.random() * smartResponses.length)];
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.chatBox.appendChild(messageDiv);
        
        // التمرير التلقائي للأسفل
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    showTyping() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.id = 'typing-indicator';
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingDiv.appendChild(dot);
        }
        
        messageDiv.appendChild(typingDiv);
        this.chatBox.appendChild(messageDiv);
        this.chatBox.scrollTop = this.chatBox.scrollHeight;
    }

    removeTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message) return;
        
        if (this.isTyping) return;
        
        // إضافة رسالة المستخدم
        this.addMessage(message, 'user');
        this.userInput.value = '';
        
        // إظهار مؤشر الكتابة
        this.isTyping = true;
        this.showTyping();
        
        // محاكاة تأخير الذكاء الاصطناعي (500-1000ms)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        
        // الحصول على الرد
        const response = this.findResponse(message);
        
        // إزالة مؤشر الكتابة
        this.removeTyping();
        
        // إضافة رد الـ AI
        this.addMessage(response, 'bot');
        this.isTyping = false;
        
        // حفظ المحادثة (اختياري)
        this.saveChatHistory(message, response);
    }

    saveChatHistory(userMessage, botResponse) {
        // حفظ في localStorage
        let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        history.push({
            timestamp: new Date().toLocaleString('ar-EG'),
            user: userMessage,
            bot: botResponse
        });
        localStorage.setItem('chatHistory', JSON.stringify(history));
    }
}

// تهيئة الـ Chatbot عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const chat = new AIChat();
    console.log('🤖 AI Chatbot تم تفعيله بنجاح!');
});
