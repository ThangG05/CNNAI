import React, { useEffect, useState } from "react";
import { getHistory, BACKEND_URL } from "../api/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const imageUrl = (item) =>
    item.image_url?.startsWith("http")
      ? item.image_url
      : `${BACKEND_URL}${item.image_url}`;

  // ===================== FIX TIME =====================
  const formatDate = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };


  return (
    <div className="p-6">

      {/* TITLE */}
      <h1 className="text-4xl font-black text-white mb-8">
        Lịch sử phân tích
      </h1>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="cursor-pointer bg-slate-900/60 hover:bg-slate-800 transition border border-slate-800 rounded-3xl overflow-hidden"
          >
            <img
              src={imageUrl(item)}
              alt={item.emotion}
              className="w-full h-56 object-cover"
            />

            <div className="p-5">
              <h3 className="text-white font-bold text-xl capitalize">
                {item.emotion}
              </h3>

              <p className="text-slate-400">
                Confidence: {item.confidence}%
              </p>

              {/* ================= FIXED HERE ================= */}
              <p className="text-slate-500 text-sm mt-2">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-slate-900 w-full max-w-4xl rounded-3xl p-6 border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >

            {/* IMAGE + INFO */}
            <div className="grid md:grid-cols-2 gap-6">

              <img
                src={imageUrl(selected)}
                className="rounded-2xl w-full"
              />

              <div className="space-y-3">

                <h2 className="text-3xl font-black text-white capitalize">
                  {selected.emotion}
                </h2>

                <p className="text-slate-400">
                  Confidence: {selected.confidence}%
                </p>

                {/* ================= FIXED HERE ================= */}
                <p className="text-slate-500 text-sm">
                  {formatDate(selected.created_at)}
                </p>

                <p className="text-slate-400">
                  Type: {selected.detection_type}
                </p>

              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold"
            >
              Đóng
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default History;