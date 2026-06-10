import React, { useEffect, useState } from "react";
import { getHistory, BACKEND_URL } from "../api/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = (item) => {
    if (!item?.image_url) return "";

    return item.image_url.startsWith("http")
      ? item.image_url
      : `${BACKEND_URL}${item.image_url}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  };

  const formatEmotion = (emotion) => {
    if (!emotion) return "Unknown";

    const map = {
      angry: "Angry",
      disgusted: "Disgusted",
      disgust: "Disgusted",
      fearful: "Fearful",
      fear: "Fearful",
      happy: "Happy",
      neutral: "Neutral",
      sad: "Sad",
      surprised: "Surprised",
      surprise: "Surprised",
    };

    const key = String(emotion).toLowerCase();
    return map[key] || emotion;
  };

  const getEmotionIcon = (emotion) => {
    const key = String(emotion || "").toLowerCase();

    const icons = {
      angry: "😠",
      disgusted: "🤢",
      disgust: "🤢",
      fearful: "😨",
      fear: "😨",
      happy: "😊",
      neutral: "😐",
      sad: "😢",
      surprised: "😲",
      surprise: "😲",
    };

    return icons[key] || "🤖";
  };

  const formatConfidence = (value) => {
    if (value === undefined || value === null) return "0";

    const numberValue =
      typeof value === "number" ? value : parseFloat(value) || 0;

    if (numberValue <= 1) {
      return (numberValue * 100).toFixed(2);
    }

    return numberValue.toFixed(2);
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8 text-white">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-sm font-bold mb-4">
          📊 Emotion Analysis History
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Lịch sử phân tích
            </h1>

            <p className="text-slate-400 mt-3 max-w-2xl">
              Danh sách các lần hệ thống đã nhận diện cảm xúc khuôn mặt.
              Bấm vào từng ảnh để xem chi tiết kết quả phân tích.
            </p>
          </div>

          <button
            onClick={loadHistory}
            className="w-fit px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold shadow-lg shadow-blue-900/30 transition"
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* LOADING */}
        {loading && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-10 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-300 font-semibold">
              Đang tải lịch sử phân tích...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && history.length === 0 && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-10 text-center">
            <div className="text-5xl mb-4">📭</div>

            <h2 className="text-2xl font-black mb-2">
              Chưa có lịch sử phân tích
            </h2>

            <p className="text-slate-400">
              Sau khi bạn phân tích ảnh hoặc webcam, kết quả sẽ được hiển thị tại đây.
            </p>
          </div>
        )}

        {/* GRID */}
        {!loading && history.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => {
              const confidence = formatConfidence(item.confidence);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="group cursor-pointer bg-slate-900/70 border border-slate-800 hover:border-blue-400/50 rounded-3xl overflow-hidden shadow-xl shadow-black/20 hover:-translate-y-1 hover:shadow-blue-950/30 transition-all duration-300"
                >
                  <div className="relative h-60 bg-slate-950 overflow-hidden">
                    <img
                      src={imageUrl(item)}
                      alt={item.emotion}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-sm font-bold">
                      {getEmotionIcon(item.emotion)} {formatEmotion(item.emotion)}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-300">Độ tin cậy</span>
                        <span className="font-black text-blue-200">
                          {confidence}%
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500"
                          style={{
                            width: `${Math.min(Number(confidence), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-white font-black text-xl capitalize mb-2">
                      {getEmotionIcon(item.emotion)} {formatEmotion(item.emotion)}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Confidence:{" "}
                        <span className="text-slate-200 font-bold">
                          {confidence}%
                        </span>
                      </p>

                      <p className="text-slate-500">
                        Thời gian: {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-slate-950 w-full max-w-5xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-red-500 text-white border border-white/10 font-black transition"
            >
              ×
            </button>

            <div className="grid md:grid-cols-2">
              {/* IMAGE */}
              <div className="bg-slate-900 p-5 flex items-center justify-center">
                <img
                  src={imageUrl(selected)}
                  alt={selected.emotion}
                  className="rounded-2xl w-full max-h-[560px] object-contain border border-slate-800"
                />
              </div>

              {/* INFO */}
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200 text-sm font-bold mb-5">
                  Chi tiết kết quả
                </div>

                <h2 className="text-3xl md:text-4xl font-black capitalize mb-3">
                  {getEmotionIcon(selected.emotion)}{" "}
                  {formatEmotion(selected.emotion)}
                </h2>

                <p className="text-slate-400 mb-8">
                  Kết quả nhận diện cảm xúc được lưu lại từ lần phân tích trước.
                </p>

                <div className="space-y-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <p className="text-slate-500 text-sm mb-1">Độ tin cậy</p>
                    <p className="text-2xl font-black text-blue-300">
                      {formatConfidence(selected.confidence)}%
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <p className="text-slate-500 text-sm mb-1">Thời gian</p>
                    <p className="text-lg font-bold text-slate-200">
                      {formatDate(selected.created_at)}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <p className="text-slate-500 text-sm mb-1">
                      Kiểu nhận diện
                    </p>
                    <p className="text-lg font-bold text-slate-200">
                      {selected.detection_type || "Không xác định"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-2xl font-black transition shadow-lg shadow-blue-950/40"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;