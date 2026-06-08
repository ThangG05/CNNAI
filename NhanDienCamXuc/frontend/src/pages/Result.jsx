import React from 'react';

const ResultDisplay = ({
    result,
    prediction,
    data,
    onAnalyzeNew,
    onReset
}) => {
    /*
        Hỗ trợ nhiều kiểu props:
        - result
        - prediction
        - data
        Vì project của bạn có thể truyền tên khác nhau.
    */
    const finalResult = result || prediction || data || {};

    const storedImage = sessionStorage.getItem('last_input_image');

    const imageSrc =
        storedImage ||
        finalResult?.captured_image ||
        finalResult?.preview_image ||
        finalResult?.input_image ||
        finalResult?.image_url ||
        finalResult?.image_path ||
        finalResult?.image ||
        finalResult?.uploaded_image ||
        finalResult?.file_url ||
        null;

    console.log('ResultDisplay đang chạy');
    console.log('Ảnh lấy từ sessionStorage:', storedImage);
    console.log('Ảnh sẽ hiển thị:', imageSrc);
    console.log('Dữ liệu kết quả:', finalResult);

    const getMainEmotion = () => {
        return (
            finalResult?.emotion ||
            finalResult?.dominant_emotion ||
            finalResult?.main_emotion ||
            finalResult?.label ||
            finalResult?.prediction ||
            finalResult?.predicted_emotion ||
            'Unknown'
        );
    };

    const getConfidence = () => {
        const value =
            finalResult?.confidence ??
            finalResult?.score ??
            finalResult?.probability ??
            finalResult?.max_probability;

        if (value === undefined || value === null) return null;

        if (typeof value === 'number') {
            if (value <= 1) {
                return `${(value * 100).toFixed(2)}%`;
            }

            return `${value.toFixed(2)}%`;
        }

        return value;
    };

    const getEmotionDistribution = () => {
        const emotions =
            finalResult?.emotions ||
            finalResult?.probabilities ||
            finalResult?.scores ||
            finalResult?.distribution ||
            finalResult?.emotion_scores ||
            finalResult?.all_predictions ||
            finalResult?.percentages ||
            {};

        if (Array.isArray(emotions)) {
            const converted = {};

            emotions.forEach((item) => {
                if (Array.isArray(item) && item.length >= 2) {
                    converted[item[0]] = item[1];
                } else if (item?.label && item?.score !== undefined) {
                    converted[item.label] = item.score;
                } else if (item?.emotion && item?.probability !== undefined) {
                    converted[item.emotion] = item.probability;
                } else if (item?.name && item?.value !== undefined) {
                    converted[item.name] = item.value;
                }
            });

            return converted;
        }

        if (typeof emotions === 'object' && emotions !== null) {
            return emotions;
        }

        return {};
    };

    const formatEmotionName = (emotion) => {
        if (!emotion) return 'Unknown';

        const map = {
            angry: 'Angry',
            disgusted: 'Disgusted',
            disgust: 'Disgusted',
            fearful: 'Fearful',
            fear: 'Fearful',
            happy: 'Happy',
            neutral: 'Neutral',
            sad: 'Sad',
            surprised: 'Surprised',
            surprise: 'Surprised'
        };

        const key = String(emotion).toLowerCase();
        return map[key] || String(emotion);
    };

    const formatPercent = (value) => {
        let rawValue = value;

        if (typeof value === 'object' && value !== null) {
            rawValue =
                value?.score ??
                value?.probability ??
                value?.value ??
                value?.percent ??
                0;
        }

        const numberValue =
            typeof rawValue === 'number'
                ? rawValue
                : parseFloat(rawValue) || 0;

        if (numberValue <= 1) {
            return numberValue * 100;
        }

        return numberValue;
    };

    const mainEmotion = getMainEmotion();
    const confidence = getConfidence();
    const emotions = getEmotionDistribution();

    const handleAnalyzeNew = () => {
        sessionStorage.removeItem('last_input_image');

        if (onAnalyzeNew) {
            onAnalyzeNew();
            return;
        }

        if (onReset) {
            onReset();
            return;
        }

        window.location.reload();
    };

    return (
        <div
            className="result-page"
            style={{
                padding: '36px 40px',
                color: '#ffffff'
            }}
        >
            <div
                className="result-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '36px',
                    gap: '20px'
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: '38px',
                            margin: '0 0 8px',
                            fontWeight: 800
                        }}
                    >
                        Kết Quả Phân Tích
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            color: '#9fb5d1',
                            fontSize: '16px'
                        }}
                    >
                        Phân tích cảm xúc khuôn mặt bằng AI
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAnalyzeNew}
                    className="btn-analyze-new"
                    style={{
                        border: 'none',
                        borderRadius: '14px',
                        padding: '14px 22px',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #2563eb, #9333ea)'
                    }}
                >
                    🔄 Phân Tích Mới
                </button>
            </div>

            <div
                className="result-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px'
                }}
            >
                <div
                    className="result-card"
                    style={{
                        background: '#111827',
                        border: '1px solid #24324a',
                        borderRadius: '22px',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            padding: '24px',
                            borderBottom: '1px solid #24324a'
                        }}
                    >
                        <h2
                            style={{
                                margin: '0 0 10px',
                                fontSize: '24px'
                            }}
                        >
                            Hình Ảnh Đầu Vào
                        </h2>
                        <p
                            style={{
                                margin: 0,
                                color: '#9fb5d1'
                            }}
                        >
                            Ảnh được sử dụng để nhận diện cảm xúc
                        </p>
                    </div>

                    <div
                        className="input-image-box"
                        style={{
                            padding: '24px'
                        }}
                    >
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt="Ảnh đầu vào"
                                onError={(e) => {
                                    console.error('Không load được ảnh:', imageSrc);
                                    e.currentTarget.style.display = 'none';
                                }}
                                style={{
                                    width: '100%',
                                    maxHeight: '360px',
                                    objectFit: 'contain',
                                    borderRadius: '16px',
                                    display: 'block',
                                    backgroundColor: '#020617',
                                    border: '1px solid #334155'
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    minHeight: '180px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#f87171',
                                    border: '1px dashed #475569',
                                    borderRadius: '16px'
                                }}
                            >
                                Không có ảnh đầu vào để hiển thị.
                            </div>
                        )}
                    </div>

                    <div
                        className="main-emotion-box"
                        style={{
                            margin: '0 24px 24px',
                            padding: '24px',
                            background: '#0f172a',
                            border: '1px solid #24324a',
                            borderRadius: '20px'
                        }}
                    >
                        <p
                            style={{
                                color: '#9fb5d1',
                                letterSpacing: '1px',
                                fontSize: '13px',
                                fontWeight: 700,
                                margin: '0 0 12px'
                            }}
                        >
                            CẢM XÚC CHỦ ĐẠO
                        </p>

                        <h2
                            style={{
                                margin: '0 0 18px',
                                fontSize: '36px',
                                color: '#a855f7'
                            }}
                        >
                            {formatEmotionName(mainEmotion)}
                        </h2>

                        {confidence && (
                            <>
                                <p
                                    style={{
                                        margin: '0 0 8px',
                                        color: '#9fb5d1'
                                    }}
                                >
                                    Độ tin cậy mô hình
                                </p>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '26px'
                                    }}
                                >
                                    {confidence}
                                </h3>
                            </>
                        )}
                    </div>
                </div>

                <div
                    className="result-card"
                    style={{
                        background: '#111827',
                        border: '1px solid #24324a',
                        borderRadius: '22px',
                        padding: '24px'
                    }}
                >
                    <h2
                        style={{
                            margin: '0 0 26px',
                            fontSize: '24px'
                        }}
                    >
                        Phân bố cảm xúc
                    </h2>

                    {Object.keys(emotions).length > 0 ? (
                        Object.entries(emotions).map(([emotion, value]) => {
                            const percent = formatPercent(value);

                            return (
                                <div
                                    key={emotion}
                                    style={{
                                        marginBottom: '24px'
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '10px',
                                            color: '#dbeafe'
                                        }}
                                    >
                                        <strong>
                                            {formatEmotionName(emotion).toUpperCase()}
                                        </strong>
                                        <span>{percent.toFixed(2)}%</span>
                                    </div>

                                    <div
                                        style={{
                                            width: '100%',
                                            height: '12px',
                                            borderRadius: '999px',
                                            background: '#1f2937',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${Math.min(percent, 100)}%`,
                                                height: '100%',
                                                borderRadius: '999px',
                                                background: 'linear-gradient(90deg, #ef4444, #8b5cf6)'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p
                            style={{
                                color: '#fbbf24'
                            }}
                        >
                            Không có dữ liệu phân bố cảm xúc.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultDisplay;