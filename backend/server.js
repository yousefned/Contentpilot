require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// 1) توليد السيناريو عبر GPT
async function generateScenario(title, platform) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "أنت مساعد خبير في صناعة الفيديوهات القصيرة." },
                { role: "user", content: `أريد سيناريو فيديو بعنوان "${title}" مخصص لمنصة ${platform}. اجعله قصيرًا، جذابًا، مع تقسيم لمشاهد وصوتيات.` }
            ]
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// 2) تحويل النص إلى صوت (TTS باستخدام gTTS عبر بايثون)
async function textToSpeech(text, outputFile) {
    return new Promise((resolve, reject) => {
        const command = `python3 -m gtts-cli "${text}" --lang ar --output ${outputFile}`;
        exec(command, (error) => {
            if (error) reject(error);
            else resolve(outputFile);
        });
    });
}

// 3) جلب صور مجانية من Pexels API
async function fetchImages(query) {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`, {
        headers: { "Authorization": process.env.PEXELS_API_KEY }
    });
    const data = await response.json();
    return data.photos.map(photo => photo.src.large);
}

// 4) دمج الصوت + الصور + نصوص (Captions) باستخدام ffmpeg
async function createVideo(audioFile, images, captions, outputFile) {
    return new Promise((resolve, reject) => {
        // نحفظ أول صورة مؤقتًا
        const imagePath = path.join(__dirname, "temp.jpg");
        fetch(images[0]).then(res => {
            const dest = fs.createWriteStream(imagePath);
            res.body.pipe(dest).on("finish", () => {
                // دمج الصوت مع الصورة + إضافة نصوص
                const command = `ffmpeg -loop 1 -i ${imagePath} -i ${audioFile} -vf "drawtext=text='${captions}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-50" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -shortest ${outputFile}`;
                exec(command, (error) => {
                    if (error) reject(error);
                    else resolve(outputFile);
                });
            });
        });
    });
}

// نقطة API الرئيسية
app.post("/generate", async (req, res) => {
    const { title, platform } = req.body;

    if (!title) {
        return res.json({ error: "الرجاء إدخال عنوان الفيديو." });
    }

    try {
        // 1) توليد السيناريو
        const scenario = await generateScenario(title, platform);

        // 2) تحويل السيناريو إلى صوت
        const audioFile = path.join(__dirname, "output.mp3");
        await textToSpeech(scenario, audioFile);

        // 3) جلب صور مناسبة
        const images = await fetchImages(title);

        // 4) إنشاء فيديو احترافي
        const videoFile = path.join(__dirname, "output.mp4");
        await createVideo(audioFile, images, scenario, videoFile);

        // 5) إرجاع النتيجة
        res.json({
            idea: `فيديو قصير حول "${title}"`,
            scenario,
            audio: "/output.mp3",
            video: "/output.mp4",
            platform,
            status: "success"
        });

    } catch (error) {
        console.error(error);
        res.json({ error: "حدث خطأ أثناء توليد الفيديو." });
    }
});

// تشغيل الخادم
app.listen(3000, () => {
    console.log("ContentPilot backend running on http://localhost:3000");
});
