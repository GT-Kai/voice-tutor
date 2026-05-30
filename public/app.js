let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const userText = document.getElementById("userText");
const aiReply = document.getElementById("aiReply");
const audioPlayer = document.getElementById("audioPlayer");

startBtn.addEventListener("click", async () => {
  audioChunks = [];

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm",
  });

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    userText.textContent = "正在识别语音...";
    aiReply.textContent = "AI 正在思考...";

    try {
      // 1. 上传录音，转成文字
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      const text = transcribeData.text;

      userText.textContent = text || "没有识别到内容";

      // 2. 发送文字给 AI
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const chatData = await chatRes.json();
      const reply = chatData.reply;

      aiReply.textContent = reply;

      // 3. 把 AI 回复转成语音
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });

      const audioBuffer = await ttsRes.arrayBuffer();
      const audioBlobReply = new Blob([audioBuffer], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlobReply);

      audioPlayer.src = audioUrl;
      audioPlayer.play();
    } catch (error) {
      console.error(error);
      aiReply.textContent = "出错了，请检查后端是否启动、API Key 是否正确。";
    }
  };

  mediaRecorder.start();

  startBtn.disabled = true;
  stopBtn.disabled = false;
  userText.textContent = "正在录音...";
  aiReply.textContent = "请说话。";
});

stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();

  startBtn.disabled = false;
  stopBtn.disabled = true;
});