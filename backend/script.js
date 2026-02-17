app.post("/generate", async (req, res) => {
    const { type, title, platform } = req.body;

    if (!type || !title) {
        return res.json({ error: "الرجاء إدخال نوع المحتوى والعنوان." });
    }

    try {
        // GPT يولّد السيناريو
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "أنت مساعد خبير في صناعة المحتوى للفيديوهات القصيرة." },
                { role: "user", content: `أريد فكرة وسيناريو لفيديو ${type} بعنوان "${title}" مخصص لمنصة ${platform}.` }
            ]
        });

        const aiResponse = completion.choices[0].message.content;

        // توليد فيديو عبر RunwayML
        const videoData = await generateVideo(aiResponse);

        res.json({
            idea: `فكرة الفيديو: ${title}`,
            scenario: aiResponse,
            video: videoData,
            platform,
            status: "success"
        });

    } catch (error) {
        console.error(error);
        res.json({ error: "حدث خطأ أثناء توليد المحتوى." });
    }
});
