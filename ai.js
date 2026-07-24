/**
 * AI Chatbot - محرك الذكاء الاصطناعي
 * تم التطوير بواسطة OtmanMomo
 * مع دعم Hugging Face AI API
 */

class AIChat {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTheme();
        this.loadSettings();
        this.checkAPIKey();
        this.conversationHistory = [];
        this.loadConversationHistory();
        this.showWelcomeMessage();
    }

    /**
     * تهيئة عناصر DOM
     */
    initializeElements() {
        this.chatBox = document.getElementById('chatBox');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.clearChatBtn = document.getElementById('clearChat');
        this.historyBtn = document.getElementById('historyBtn');
        this.connectionStatus = document.querySelector('.connection-status');
        this.historyModal = document.getElementById('historyModal');
        this.apiModal = document.getElementById('apiModal');
        this.notification = document.getElementById('notification');
    }

    /**
     * ربط مستمعي الأحداث
     */
    initializeEventListeners() {
        // أزرار الإرسال
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // أزرار رأس التطبيق
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.historyBtn.addEventListener('click', () => this.showHistory());

        // أزرار الأسئلة السريعة
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.userInput.value = e.target.dataset.prompt;
                this.sendMessage();
            });
        });

        // نافذة السجل
        document.getElementById('closeHistory').addEventListener('click', () => this.closeHistory());
        document.getElementById('exportHistory').addEventListener('click', () => this.exportHistory());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());

        // نافذة API Key
        document.getElementById('closeApiModal').addEventListener('click', () => this.closeApiModal());
        document.getElementById('saveApiKey').addEventListener('click', () => this.saveAPIKey());
        document.getElementById('skipApiKey').addEventListener('click', () => this.skipAPIKey());
    }

    /**
     * تهيئة النمط (داكن/فاتح)
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme') || 'light';
        this.applyTheme(savedTheme);
    }

    /**
     * تبديل النمط
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * تطبيق النمط
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('chatbot-theme', theme);
        this.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    /**
     * تحميل الإعدادات المحفوظة
     */
    loadSettings() {
        const apiKey = localStorage.getItem('huggingfaceAPI');
        if (apiKey) {
            this.apiKey = apiKey;
        }
    }

    /**
     * التحقق من وجود API Key
     */
    checkAPIKey() {
        if (!this.apiKey) {
            // عرض نافذة إدخال API Key بعد 2 ثانية
            setTimeout(() => this.showAPIModal(), 2000);
        }
    }

    /**
     * عرض نافذة API Key
     */
    showAPIModal() {
        this.apiModal.classList.add('active');
    }

    /**
     * إغلاق نافذة API Key
     */
    closeApiModal() {
        this.apiModal.classList.remove('active');
    }

    /**
     * حفظ API Key
     */
    saveAPIKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        if (apiKey.length > 0) {
            localStorage.setItem('huggingfaceAPI', apiKey);
            this.apiKey = apiKey;
            this.closeApiModal();
            this.showNotification('✅ تم حفظ API Key بنجاح!', 'success');
        } else {
            this.showNotification('⚠️ يرجى إدخال API Key', 'warning');
        }
    }

    /**
     * تخطي API Key
     */
    skipAPIKey() {
        this.closeApiModal();
        this.showNotification('💡 يمكنك إدخال API Key لاحقاً من خلال الإعدادات', 'info');
    }

    /**
     * عرض رسالة الترحيب
     */
    showWelcomeMessage() {
        const welcomeExists = this.chatBox.querySelector('.welcome-section');
        if (!welcomeExists && this.conversationHistory.length === 0) {
            // الرسالة موجودة بالفعل في HTML
        } else if (welcomeExists && this.conversationHistory.length > 0) {
            welcomeExists.remove();
        }
    }

    /**
     * إرسال الرسالة
     */
    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message) {
            this.userInput.focus();
            return;
        }
        
        if (this.isTyping) return;
        
        // إخفاء قسم الترحيب
        const welcomeSection = this.chatBox.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.display = 'none';
        }
        
        // إضافة رسالة المستخدم
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.userInput.focus();
        
        // عرض مؤشر الكتابة
        this.isTyping = true;
        this.showTyping();
        
        try {
            // الحصول على الرد
            const response = await this.getResponse(message);
            
            // إزالة مؤشر الكتابة
            this.removeTyping();
            
            // إضافة رد الـ Bot
            this.addMessage(response, 'bot');
            
            // حفظ المحادثة
            this.saveToHistory(message, response);
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTyping();
            this.addMessage('❌ حدث خطأ! يرجى المحاولة مرة أخرى.', 'bot');
        } finally {
            this.isTyping = false;
        }
    }

    /**
     * الحصول على الرد من AI
     */
    async getResponse(userMessage) {
        // محاولة الحصول على رد من API
        if (this.apiKey) {
            try {
                return await this.queryHuggingFace(userMessage);
            } catch (error) {
                console.warn('API Error:', error);
                return this.generateFallbackResponse(userMessage);
            }
        } else {
            // استخدام الردود الاحتياطية
            return this.generateFallbackResponse(userMessage);
        }
    }

    /**
     * الاستعلام من Hugging Face API
     */
    async queryHuggingFace(userMessage) {
        const apiUrl = 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf';
        
        // إعداد السياق
        let context = 'أنت مساعد ذكي يساعد المستخدمين بالعربية والإنجليزية بطريقة ودية ومفيدة.\n';
        
        if (this.conversationHistory.length > 0) {
            const recentHistory = this.conversationHistory.slice(-4);
            for (let item of recentHistory) {
                context += `المستخدم: ${item.user}\nالمساعد: ${item.response}\n`;
            }
        }
        
        const prompt = `${context}المستخدم: ${userMessage}\nالمساعد:`;
        
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.7,
                    top_p: 0.95,
                    repetition_penalty: 1.2,
                },
            }),
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('huggingfaceAPI');
                this.apiKey = null;
                throw new Error('Invalid API Key');
            } else if (response.status === 503) {
                return '⏳ النموذج قيد التحميل... يرجى المحاولة خلال قليل.';
            }
            throw new Error(`API Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result[0]?.generated_text) {
            let aiResponse = result[0].generated_text;
            const parts = aiResponse.split('المساعد:');
            if (parts.length > 1) {
                aiResponse = parts[parts.length - 1].trim();
            }
            return aiResponse || this.generateFallbackResponse(userMessage);
        }
        
        throw new Error('No response from API');
    }

    /**
     * توليد رد احتياطي
     */
    generateFallbackResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // قاموس الإجابات الأساسية
        const basicResponses = {
            // التحيات
            'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! 👋 كيف حالك؟',
            'صباح الخير': 'صباح النور! ☀️ أتمنى أن تكون بخير',
            'مساء الخير': 'مساء الخير! 🌙 كيف يمكنني مساعدتك؟',
            'كيف حالك': 'أنا بحال جيدة شكراً! 😊 وأنت كيف حالك؟',
            'شكرا': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'شكراً': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'مرحبا': 'مرحباً بك! 👋 كيف يمكنني مساعدتك؟',
            'باي': 'باي! 👋 شكراً للدردشة! 😊',
            'وداعا': 'وداعاً! 👋 أتمنى أن نتحدث مرة أخرى قريباً!',
            
            // الأسئلة العامة
            'من أنت': 'أنا مساعد ذكي يعمل بـ Llama-2 AI 🤖\nأستطيع مساعدتك في أي موضوع!',
            'ماذا تستطيع': 'يمكنني:\n💬 الدردشة والحوار\n📚 الإجابة على الأسئلة\n🎓 تقديم المساعدة\n💡 تقديم الاقتراحات',
            'أخبرني عن نفسك': 'أنا مساعد ذكي متقدم! 🤖\n✨ أستخدم نموذج Llama-2\n🌍 أتحدث العربية والإنجليزية\n💪 هنا لمساعدتك في كل شيء',
        };
        
        // البحث عن إجابة مطابقة
        for (let [key, value] of Object.entries(basicResponses)) {
            if (message.includes(key) || key.includes(message)) {
                return value;
            }
        }
        
        // ردود عشوائية
        const randomResponses = [
            '🤔 سؤال مثير للاهتمام! هل يمكنك توضيح أكثر؟',
            '💭 أنا أتعلم! أخبرني أكثر عن هذا الموضوع؟',
            '🤖 سؤال رائع! هل لديك معلومات إضافية؟',
            '⚡ أفهم! هل تريد شرحاً أكثر تفصيلاً؟',
            '💡 فكرة جيدة! ماذا تريد أن تعرف بالضبط؟',
            '🎯 نقطة مهمة! هل يمكنك التوضيح أكثر؟',
        ];
        
        return randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }

    /**
     * إضافة رسالة إلى الدردشة
     */
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

    /**
     * عرض مؤشر الكتابة
     */
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

    /**
     * إزالة مؤشر الكتابة
     */
    removeTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * مسح المحادثة
     */
    clearChat() {
        if (confirm('هل تريد مسح المحادثة؟')) {
            this.chatBox.innerHTML = '';
            this.conversationHistory = [];
            this.showWelcomeMessage();
            this.showNotification('✅ تم مسح المحادثة', 'success');
        }
    }

    /**
     * حفظ المحادثة في السجل
     */
    saveToHistory(user, bot) {
        this.conversationHistory.push({
            user,
            response: bot,
            timestamp: new Date().toISOString(),
        });
        
        // حفظ في localStorage
        localStorage.setItem('chatHistory', JSON.stringify(this.conversationHistory));
    }

    /**
     * تحميل سجل المحادثات
     */
    loadConversationHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            try {
                this.conversationHistory = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading history:', e);
                this.conversationHistory = [];
            }
        }
    }

    /**
     * عرض سجل المحادثات
     */
    showHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (this.conversationHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #999;">لا توجد محادثات محفوظة</p>';
        } else {
            this.conversationHistory.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="history-time">⏰ ${new Date(item.timestamp).toLocaleString('ar-EG')}</div>
                    <div class="history-user">👤 أنت: ${item.user}</div>
                    <div class="history-bot">🤖 المساعد: ${item.response}</div>
                `;
                historyList.appendChild(div);
            });
        }
        
        this.historyModal.classList.add('active');
    }

    /**
     * إغلاق نافذة السجل
     */
    closeHistory() {
        this.historyModal.classList.remove('active');
    }

    /**
     * تصدير السجل
     */
    exportHistory() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('⚠️ لا توجد محادثات لتصديرها', 'warning');
            return;
        }
        
        const dataStr = JSON.stringify(this.conversationHistory, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `chatbot-history-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('✅ تم تحميل السجل بنجاح!', 'success');
    }

    /**
     * حذف السجل
     */
    clearHistory() {
        if (confirm('هل تريد حذف سجل المحادثات بشكل دائم؟')) {
            localStorage.removeItem('chatHistory');
            this.conversationHistory = [];
            this.showHistory();
            this.showNotification('✅ تم حذف السجل', 'success');
        }
    }

    /**
     * عرض الإشعارات
     */
    showNotification(message, type = 'info') {
        this.notification.textContent = message;
        this.notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new AIChat();
    console.log('🤖 AI Chatbot تم تفعيله بنجاح!');
    console.log('📝 للمزيد من المعلومات، زر: https://github.com/OtmanMomo/AI-Chatbot');
});

// التعامل مع تغيير حالة الاتصال
window.addEventListener('online', () => {
    if (window.chatbot) {
        const statusEl = document.querySelector('.connection-status');
        const dot = statusEl.querySelector('.status-dot');
        dot.classList.remove('offline');
        dot.classList.add('online');
    }
});

window.addEventListener('offline', () => {
    if (window.chatbot) {
        const statusEl = document.querySelector('.connection-status');
        const dot = statusEl.querySelector('.status-dot');
        dot.classList.remove('online');
        dot.classList.add('offline');
    }
});
