import React, { useEffect, useState } from "react";
import { getHistory } from "../api/api";

const Dashboard = () => {
  const [history, setHistory] = useState([]);

  // =====================
  // 🔄 REALTIME FETCH
  // =====================
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 3000); // realtime mỗi 3s

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const data = await getHistory();
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // =====================
  // 📊 SOURCE STATS
  // =====================
  const upload = history.filter(x => x.detection_type === "upload").length;
  const webcam = history.filter(x => x.detection_type === "webcam").length;
  const mobile = history.filter(x => x.detection_type === "mobile").length;

  // =====================
  // 😊 EMOTION STATS
  // =====================
  const emotions = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprised"];

  const emotionCounts = emotions.map(e => ({
    emotion: e,
    count: history.filter(x => x.emotion?.toLowerCase() === e).length
  }));

  // =====================
  // 📊 CHART DATA
  // =====================
  const sourceChart = [
    { name: "Upload", value: upload },
    { name: "Webcam", value: webcam },
    { name: "Mobile", value: mobile }
  ];

  const emotionChart = emotionCounts.map(x => ({
    name: x.emotion,
    value: x.count
  }));

  const total = history.length;

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-5xl font-black text-white">
          Emotion AI Dashboard
        </h1>
        <p className="text-slate-400">
          Realtime analytics system
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid md:grid-cols-4 gap-5">

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-3xl">
          <p className="text-white/80">Total</p>
          <h2 className="text-5xl font-black text-white">{total}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl">
          <p className="text-slate-400">Upload</p>
          <h2 className="text-4xl text-white font-black">{upload}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl">
          <p className="text-slate-400">Webcam</p>
          <h2 className="text-4xl text-white font-black">{webcam}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl">
          <p className="text-slate-400">Mobile</p>
          <h2 className="text-4xl text-white font-black">{mobile}</h2>
        </div>

      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* 📊 Source Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl">
          <h2 className="text-white text-xl font-bold mb-4">
            Detection Source Distribution
          </h2>

          <div className="space-y-3">
            {sourceChart.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-slate-300">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${total ? (item.value / total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 😊 Emotion Chart */}
        <div className="bg-slate-900 p-6 rounded-3xl">
          <h2 className="text-white text-xl font-bold mb-4">
            Emotion Distribution
          </h2>

          <div className="space-y-3">
            {emotionChart.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-slate-300">
                  <span>{item.name}</span>
                  <span>{item.value}</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{
                      width: `${total ? (item.value / total) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= LIVE INDICATOR ================= */}
      

    </div>
  );
};

export default Dashboard;