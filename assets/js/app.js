// سنة الفوتر
document.getElementById("year").textContent = new Date().getFullYear();

// معالجة الفورم
const form = document.getElementById("contentForm");
const resultBox = document.getElementById("result");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value.trim();
    const title = document.getElementById("title").value.trim();
    const platform = document.getElementById("platform").value;

    if (!type || !title) {
        resultBox.style.display = "block";
        resultBox.innerHTML = `<p>الرجاء إدخال نوع المحتوى والعنوان.</p>`;
        return;
    }

    resultBox.style.display = "block";
    resultBox.innerHTML = `<p>جاري توليد الفكرة والسيناريو والمحتوى لـ <strong>${platform}</strong>…</p>`;

    // هنا لاحقًا تربط الـ Backend / AI
    // callAgentAPI(type, title, platform);

    // مؤقتًا: محاكاة ردّ ذكي
    setTimeout(() => {
        resultBox.innerHTML = `
            <h3>نتيجة أولية (محاكاة):</h3>
            <p><strong>نوع المحتوى:</strong> ${type}</p>
            <p><strong>العنوان:</strong> ${title}</p>
            <p><strong>المنصة:</strong> ${platform === "tiktok" ? "TikTok" : "Instagram"}</p>
            <hr>
            <p><strong>فكرة مقترحة:</strong> فيديو قصير يشرح "${title}" بأسلوب بسيط وسريع مع أمثلة عملية.</p>
            <p><strong>سيناريو مختصر:</strong></p>
            <ul>
                <li>مقدمة جذابة خلال أول 3 ثواني.</li>
                <li>شرح الفكرة في 3–5 نقاط سريعة.</li>
                <li>خاتمة مع Call To Action (متابعة / تعليق / مشاركة).</li>
            </ul>
            <p>هنا لاحقًا سيتم استبدال هذه النتيجة بردّ فعلي من الذكاء الاصطناعي.</p>
        `;
    }, 1200);
});
