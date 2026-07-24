// AI Chatbot Script with Real AI Integration
class AIChat {
    constructor() {
        this.chatBox = document.getElementById('chatBox');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // API Configuration
        this.huggingfaceAPI = 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf';
        this.apiKey = this.getAPIKey(); // سيطلب من المستخدم إدخال API Key
        
        // ربط الأحداث
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // قاعدة بيانات الإجابات الاحتياطية (للردود البسيطة فقط)
        this.fallbackResponses = this.initializeFallbackResponses();
        
        // متغيرات الحالة
        this.isTyping = false;
        this.conversationHistory = [];
    }

    getAPIKey() {
        let apiKey = localStorage.getItem('huggingfaceAPI');
        if (!apiKey) {
            apiKey = prompt('🔑 يرجى إدخال Hugging Face API Key للحصول على ذكاء اصطناعي حقيقي:\n\n(احصل عليها من: https://huggingface.co/settings/tokens)');
            if (apiKey) {
                localStorage.setItem('huggingfaceAPI', apiKey);
            } else {
                alert('⚠️ بدون API Key، سيعمل الـ Chatbot بنمط محدود!');
            }
        }
        return apiKey;
    }

    initializeFallbackResponses() {
        return {
            // تحيات
            'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! 👋 كيف حالك؟',
            'صباح الخير': 'صباح النور! ☀️ أتمنى أن تكون بخير',
            'مساء الخير': 'مساء الخير! 🌙 كيف يمكنني مساعدتك؟',
            'كيف حالك': 'أنا بحال جيدة شكراً لسؤالك! 😊 وأنت كيف حالك؟',
            'شكراً': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'شكرا': 'على الرحب والسعة! 🙏 هل هناك شيء آخر؟',
            'thank you': 'You\'re welcome! 😊 Is there anything else?',
            'hello': 'Hello! 👋 How can I assist you today?',
            'hi': 'Hi there! 👋 What can I do for you?',
            'مرحبا': '👋 مرحبا بك! تشرفت!',
            'بايبای': 'باي باي! 👋 كان سعيداً بالحديث معك! 😊',
            'وداعا': 'وداعاً! 👋 أتمنى أن نتحدث مرة أخرى قريباً! 💙',
            'باي': 'باي! 👋 شكراً للدردشة! 😊',
        };
    }

    findFallbackResponse(userMessage) {
        const message = userMessage.trim().toLowerCase();

        // البحث عن تطابق دقيق
        for (let key in this.fallbackResponses) {
            if (message === key.toLowerCase()) {
                return this.fallbackResponses[key];
            }
        }

        // البحث عن تطابق جزئي
        for (let key in this.fallbackResponses) {
            if (message.includes(key.toLowerCase())) {
                return this.fallbackResponses[key];
            }
        }

        return null;
    }

    async queryHuggingFace(userMessage) {
        if (!this.apiKey) {
            return this.generateOfflineResponse(userMessage);
        }

        try {
            // إعداد السياق من سجل المحادثة
            let context = 'أنت مساعد ذكي يساعد المستخدمين بالعربية والإنجليزية.\n';
            
            if (this.conversationHistory.length > 0) {
                const recentHistory = this.conversationHistory.slice(-4); // آخر 4 رسائل
                for (let item of recentHistory) {
                    context += `المستخدم: ${item.user}\nالمساعد: ${item.response}\n`;
                }
            }

            const prompt = `${context}المستخدم: ${userMessage}\nالمساعد:`;

            const response = await fetch(this.huggingfaceAPI, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 256,
                        temperature: 0.7,
                        top_p: 0.95,
                    },
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('huggingfaceAPI');
                    this.apiKey = null;
                    return '❌ خطأ في API Key! يرجى إدخال مفتاح صحيح.';
                } else if (response.status === 503) {
                    return '⏳ النموذج يتم تحميله... يرجى المحاولة مرة أخرى خلال قليل.';
                }
                return this.generateOfflineResponse(userMessage);
            }

            const result = await response.json();
            
            if (result[0]?.generated_text) {
                let aiResponse = result[0].generated_text;
                // استخراج الرد من النص المولد
                const parts = aiResponse.split('المساعد:');
                if (parts.length > 1) {
                    aiResponse = parts[parts.length - 1].trim();
                }
                return aiResponse || this.generateOfflineResponse(userMessage);
            }

            return this.generateOfflineResponse(userMessage);

        } catch (error) {
            console.error('API Error:', error);
            return '⚠️ حدث خطأ في الاتصال بـ AI. جاري محاولة إعادة الاتصال...';
        }
    }

    generateOfflineResponse(userMessage) {
        const offlineResponses = [
            '🤖 أنا في وضع بدون اتصال. هل تريد مساعدتي في موضوع تقني؟',
            '💭 يمكنك إدخال API Key من Hugging Face للحصول على إجابات أفضل!',
            '⚡ أنا هنا للمساعدة! ماذا تحتاج؟',
            '🔧 حاول استخدام أسئلة واضحة ومحددة للحصول على أفضل النتائج!',
        ];
        return offlineResponses[Math.floor(Math.random() * offlineResponses.length)];
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
        
        try {
            // محاولة الحصول على رد ذكي من API
            let response;
            
            // تحقق أولاً من الردود البسيطة
            const fallbackResp = this.findFallbackResponse(message);
            if (fallbackResp) {
                response = fallbackResp;
            } else {
                // استخدم Hugging Face API للردود الأخرى
                response = await this.queryHuggingFace(message);
            }
            
            // إزالة مؤشر الكتابة
            this.removeTyping();
            
            // إضافة رد الـ AI
            this.addMessage(response, 'bot');
            
            // حفظ في السجل
            this.conversationHistory.push({
                user: message,
                response: response
            });
            
            // حفظ في localStorage
            this.saveChatHistory(message, response);
            
        } catch (error) {
            console.error('Error:', error);
            this.removeTyping();
            this.addMessage('❌ حدث خطأ! يرجى المحاولة مرة أخرى.', 'bot');
        } finally {
            this.isTyping = false;
        }
    }

    saveChatHistory(userMessage, botResponse) {
        let history = JSON.parse(localStorage.getItem('chatHistory')) || [];
        history.push({
            timestamp: new Date().toLocaleString('ar-EG'),
            user: userMessage,
            bot: botResponse
        });
        localStorage.setItem('chatHistory', JSON.stringify(history));
    }

    // دالة لتغيير API Key
    changeAPIKey() {
        localStorage.removeItem('huggingfaceAPI');
        this.apiKey = this.getAPIKey();
        alert('✅ تم تحديث API Key!');
    }
}

// تهيئة الـ Chatbot عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const chat = new AIChat();
    console.log('🤖 AI Chatbot تم تفعيله بنجاح - مع دعم Hugging Face AI!');
    
    // إضافة زر لتغيير API Key (اختياري)
    const changeKeyBtn = document.createElement('button');
    changeKeyBtn.textContent = '🔑 تغيير API Key';
    changeKeyBtn.style.cssText = 'position: fixed; bottom: 20px; left: 20px; padding: 10px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
    changeKeyBtn.onclick = () => chat.changeAPIKey();
    document.body.appendChild(changeKeyBtn);
});
