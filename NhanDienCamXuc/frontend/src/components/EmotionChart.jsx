import React from "react";

const EmotionChart = ({ scores }) => {

    const getColor = (emotion) => {

        const e = emotion.toLowerCase();

        if (e === "happy")
            return "bg-emerald-500";

        if (e === "sad")
            return "bg-blue-500";

        if (e === "angry")
            return "bg-red-500";

        if (e === "fear")
            return "bg-orange-500";

        if (e === "surprised")
            return "bg-yellow-500";

        if (e === "neutral")
            return "bg-slate-500";

        return "bg-purple-500";
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">

            <h3 className="text-xl font-bold text-white mb-6">
                Phân bố cảm xúc
            </h3>

            <div className="space-y-5">

                {Object.entries(scores).map(([key, value]) => {

                    const label =
                        key.replace("_score", "");

                    const percentage =
                        (value * 100).toFixed(2);

                    return (
                        <div key={key}>

                            <div className="flex justify-between mb-2">

                                <span className="text-slate-300 font-semibold uppercase">
                                    {label}
                                </span>

                                <span className="text-slate-400">
                                    {percentage}%
                                </span>

                            </div>

                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${getColor(
                                        label
                                    )}`}
                                    style={{
                                        width: `${percentage}%`
                                    }}
                                />

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
};

export default EmotionChart;