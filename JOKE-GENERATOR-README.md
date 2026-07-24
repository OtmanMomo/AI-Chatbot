# 😂 Joke Generator - Random Joke API

## 🎉 ما هو Joke Generator؟

**Joke Generator** أداة مجانية وممتعة لجلب نكات عشوائية من خادم خارجي! كل ضغطة على الزر تحصل على نكتة جديدة ومضحكة! 🤣

## ✨ المميزات

- ✅ **نكات عشوائية** - نكت مختلفة في كل مرة
- ✅ **فئات مختلفة** - عام، برمجة، knock-knock
- ✅ **API حقيقي** - متصل بـ Official Joke API
- ✅ **نسخ سهل** - انسخ النكتة بضغطة زر
- ✅ **مشاركة سريعة** - شارك النكات مع أصدقاؤك
- ✅ **تقييم النكات** - أعط تقييم للنكات المفضلة
- ✅ **واجهة جميلة** - تصميم عصري وملون
- ✅ **سريع وخفيف** - بدون تأخير

## 🚀 كيفية الاستخدام

### الطريقة 1: تشغيل محلي

```bash
# 1. استنساخ المشروع
git clone https://github.com/OtmanMomo/AI-Chatbot.git

# 2. دخول المجلد
cd AI-Chatbot

# 3. تشغيل خادم ويب (Python)
python -m http.server 8000

# 4. افتح المتصفح على
http://localhost:8000/joke-generator.html
```

### الطريقة 2: فتح مباشر
1. حمل الملفات من GitHub
2. افتح `joke-generator.html` مباشرة في المتصفح

### الطريقة 3: GitHub Pages (قريباً)
```
https://OtmanMomo.github.io/AI-Chatbot/joke-generator.html
```

## 📁 الملفات المستخدمة

- **joke-generator.html** - واجهة المستخدم
- **joke-generator.js** - المنطق والـ API Integration

## 🌐 API المستخدم

### Official Joke API
- **الموقع**: https://official-joke-api.appspot.com/
- **مجاني**: ✅ نعم، بدون اشتراكات
- **بدون مفتاح**: ✅ لا يحتاج API Key

### نقاط النهاية (Endpoints)

```javascript
// نكتة عشوائية من أي فئة
GET https://official-joke-api.appspot.com/random_joke

// نكتة من فئة معينة
GET https://official-joke-api.appspot.com/jokes/{category}/random
```

### الفئات المدعومة

```
- general      (نكات عامة)
- programming  (نكات برمجة)
- knock-knock  (نكات knock-knock)
```

## 💬 أمثلة على النكات

```
Setup: "Why do programmers prefer dark mode?"
Delivery: "Because light attracts bugs! 🐛"

---

Single: "Why did the developer go broke? Because he used up all his cache! 💰"
```

## 🎮 كيفية الاستخدام

### الخطوة 1: افتح الصفحة
افتح `joke-generator.html` في المتصفح

### الخطوة 2: احصل على نكتة
اضغط على زر **"Get New Joke 😄"**

### الخطوة 3: اختر الفئة (اختياري)
اختر من القائمة المنسدلة:
- **All Categories** - نكات عشوائية
- **General** - نكات عامة
- **Programming** - نكات برمجة
- **Knock-Knock** - نكات knock-knock

### الخطوة 4: انسخ أو شارك
- 📋 **Copy Joke** - انسخ النكتة
- 🔗 **Share** - شارك مع الأصدقاء

### الخطوة 5: قيّم النكتة
اضغط على النجوم (⭐) لتقييم النكتة من 1-5 نجوم

## 🛠️ شرح الكود

### الفئة الرئيسية: `JokeGenerator`

```javascript
class JokeGenerator {
    constructor() {
        // تهيئة المتغيرات والـ API URLs
        this.apiUrl = 'https://official-joke-api.appspot.com/random_joke';
        this.categoryApiUrl = 'https://official-joke-api.appspot.com/jokes/{category}/random';
        
        // ربط عناصر HTML
        this.jokeText = document.getElementById('jokeText');
        // ... بقية العناصر
        
        // تحميل أول نكتة
        this.loadJoke();
    }
}
```

### جلب النكات

```javascript
async loadJoke() {
    try {
        const category = this.categorySelect.value;
        let url = this.apiUrl;

        // إذا اختار المستخدم فئة معينة
        if (category) {
            url = this.categoryApiUrl.replace('{category}', category);
        }

        // جلب من الـ API
        const response = await fetch(url);
        const joke = await response.json();
        
        // عرض النكتة
        this.displayJoke(joke);
    } catch (error) {
        this.showError('Failed to load joke');
    }
}
```

### عرض النكتة

```javascript
displayJoke(joke) {
    if (joke.setup && joke.delivery) {
        // نكتة بها setup و delivery
        this.jokeText.innerHTML = `
            <div>
                <div class="joke-setup">${joke.setup}</div>
                <div class="joke-punchline">${joke.delivery}</div>
            </div>
        `;
    } else {
        // نكتة عادية
        this.jokeText.innerHTML = `<div>${joke.joke}</div>`;
    }
}
```

### نسخ النكتة

```javascript
copyJoke() {
    const jokeText = this.getJokeText();
    navigator.clipboard.writeText(jokeText).then(() => {
        // تغيير نص الزر
        this.copyBtn.textContent = 'Copied! ✓';
    });
}
```

## 💾 حفظ التقييمات

جميع التقييمات تُحفظ محلياً في `localStorage`:

```javascript
saveRating(rating) {
    let ratings = JSON.parse(localStorage.getItem('jokeRatings')) || [];
    ratings.push({
        joke: this.getJokeText(),
        rating: rating,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('jokeRatings', JSON.stringify(ratings));
}
```

## 🎨 التخصيص

### تغيير الألوان

في `joke-generator.html` في قسم `<style>`:

```css
/* لون الخلفية */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* لون الأزرار */
button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### إضافة فئات جديدة

في `joke-generator.html`:

```html
<select id="categorySelect" class="category-select">
    <option value="">All Categories</option>
    <option value="general">General</option>
    <option value="programming">Programming</option>
    <option value="knock-knock">Knock-Knock</option>
    <!-- أضف فئات جديدة هنا -->
    <option value="new-category">New Category</option>
</select>
```

## 🔧 استكشاف الأخطاء

### المشكلة: لا يتم تحميل النكات

**الحل:**
1. تحقق من الاتصال بالإنترنت
2. تأكد من أن الـ API متاح: https://official-joke-api.appspot.com/random_joke
3. تحقق من وحدة التحكم (Console) لرسائل الخطأ

### المشكلة: الزر "نسخ" لا يعمل

**الحل:**
- هذه الميزة تتطلب HTTPS على بعض المتصفحات
- جرب في متصفح آخر

## 📊 الإحصائيات

- 🤖 **API تابعة**: Official Joke API
- 📝 **عدد النكات**: 1000+
- 🚀 **الأداء**: فوري
- 💾 **التخزين**: محلي فقط
- ⚡ **السرعة**: <500ms للطلب

## 🌟 الخطوات المستقبلية

- [ ] إضافة نكات عربية
- [ ] دعم APIs أخرى
- [ ] تصفية النكات حسب مستوى الطرافة
- [ ] قائمة النكات المفضلة
- [ ] تطبيق محمول

## 🤝 المساهمة

هل تريد إضافة مزايا جديدة؟

1. Fork الـ Repository
2. أنشئ فرع جديد
3. أضف تحسيناتك
4. اعمل Push وافتح Pull Request

## 📄 الترخيص

مفتوح المصدر ومتاح للجميع بحرية ✅

## 👨‍💻 المطور

تم إنشاء هذا الـ Joke Generator بواسطة **OtmanMomo**

---

⭐ إذا أعجبك المشروع، لا تنسى أن تعطيه نجمة! ⭐

🔗 **الرابط**: https://github.com/OtmanMomo/AI-Chatbot
