// Joke Generator Script with External API Integration
class JokeGenerator {
    constructor() {
        this.currentJoke = null;
        this.jokeCount = 0;
        this.apiUrl = 'https://official-joke-api.appspot.com/random_joke';
        this.categoryApiUrl = 'https://official-joke-api.appspot.com/jokes/{category}/random';
        
        this.jokeText = document.getElementById('jokeText');
        this.newJokeBtn = document.getElementById('newJokeBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.categorySelect = document.getElementById('categorySelect');
        this.jokeCountDisplay = document.getElementById('jokeCount');
        
        // إنشاء نجوم التقييم
        this.createStars();
        
        // ربط الأحداث
        this.attachEventListeners();
        
        // تحميل أول نكتة
        this.loadJoke();
    }

    attachEventListeners() {
        this.newJokeBtn.addEventListener('click', () => this.loadJoke());
        this.categorySelect.addEventListener('change', () => this.loadJoke());
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.textContent = '⭐';
            star.dataset.rating = i;
            star.addEventListener('click', () => this.ratJoke(i));
            starsContainer.appendChild(star);
        }
    }

    async loadJoke() {
        try {
            this.showLoading();
            this.hideError();
            
            const category = this.categorySelect.value;
            let url = this.apiUrl;

            // إذا تم اختيار فئة معينة
            if (category) {
                url = this.categoryApiUrl.replace('{category}', category);
            }

            // جلب النكتة من الـ API
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch joke');
            }

            const joke = await response.json();
            this.currentJoke = joke;
            this.displayJoke(joke);
            this.jokeCount++;
            this.jokeCountDisplay.textContent = this.jokeCount;
            
            // إعادة تعيين النجوم
            this.createStars();

        } catch (error) {
            this.showError('Failed to load joke. Please try again!');
            console.error('Error:', error);
        }
    }

    displayJoke(joke) {
        // التحقق من نوع النكتة (setup/delivery أم single)
        if (joke.setup && joke.delivery) {
            // نكتة بها setup و delivery (مثل knock-knock)
            this.jokeText.innerHTML = `
                <div>
                    <div class="joke-setup">${this.escapeHtml(joke.setup)}</div>
                    <div class="joke-punchline">${this.escapeHtml(joke.delivery)}</div>
                </div>
            `;
        } else {
            // نكتة عادية (single)
            this.jokeText.innerHTML = `<div>${this.escapeHtml(joke.joke || 'No joke available')}</div>`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        this.jokeText.innerHTML = '<span class="loading-text">🤔 Loading a funny joke...</span>';
        this.newJokeBtn.disabled = true;
    }

    hideLoading() {
        this.newJokeBtn.disabled = false;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        this.jokeText.innerHTML = '<span class="loading-text">⚠️ Could not load joke</span>';
        this.hideLoading();
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }

    getJokeText() {
        if (!this.currentJoke) return '';

        if (this.currentJoke.setup && this.currentJoke.delivery) {
            return `${this.currentJoke.setup}\n\n${this.currentJoke.delivery}`;
        }
        return this.currentJoke.joke || '';
    }

    copyJoke() {
        const jokeText = this.getJokeText();
        if (!jokeText) {
            this.showError('No joke to copy!');
            return;
        }

        navigator.clipboard.writeText(jokeText).then(() => {
            // تغيير نص الزر مؤقتاً
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied! ✓';
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            this.showError('Failed to copy joke');
            console.error('Copy error:', err);
        });
    }

    shareJoke() {
        const jokeText = this.getJokeText();
        if (!jokeText) {
            this.showError('No joke to share!');
            return;
        }

        // التحقق من دعم Web Share API
        if (navigator.share) {
            navigator.share({
                title: '😂 Check out this joke!',
                text: jokeText,
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            });
        } else {
            // إذا لم تكن الميزة مدعومة، نسخ الرابط بدلاً من ذلك
            const url = window.location.href;
            navigator.clipboard.writeText(`${jokeText}\n\nشارك الحصول على المزيد من النكات: ${url}`);
            
            const originalText = this.shareBtn.textContent;
            this.shareBtn.textContent = 'Copied Share Link! ✓';
            setTimeout(() => {
                this.shareBtn.textContent = originalText;
            }, 2000);
        }
    }

    ratJoke(rating) {
        // تحديث النجوم المملوءة
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });

        // حفظ التقييم
        this.saveRating(rating);
    }

    saveRating(rating) {
        // حفظ التقييم في localStorage
        let ratings = JSON.parse(localStorage.getItem('jokeRatings')) || [];
        ratings.push({
            joke: this.getJokeText(),
            rating: rating,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('jokeRatings', JSON.stringify(ratings));
        
        console.log(`✓ Joke rated ${rating} stars!`);
    }
}

// Global function for HTML onclick handlers
function generateJoke() {
    if (window.jokeGenerator) {
        window.jokeGenerator.loadJoke();
    }
}

function copyJoke() {
    if (window.jokeGenerator) {
        window.jokeGenerator.copyJoke();
    }
}

function shareJoke() {
    if (window.jokeGenerator) {
        window.jokeGenerator.shareJoke();
    }
}

// تهيئة الـ Joke Generator عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.jokeGenerator = new JokeGenerator();
    console.log('😂 Joke Generator تم تفعيله بنجاح!');
});
