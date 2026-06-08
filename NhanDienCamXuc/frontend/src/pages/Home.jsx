import React, { useState, useEffect, useRef } from 'react';
import UploadImage from '../components/UploadImage';
import WebcamCapture from '../components/WebcamCapture';
import Result from './Result';

import { checkSessionStatus } from '../api/api';

const MAX_PHONE_SEND = 5;

const Home = () => {
    const [inputType, setInputType] = useState('upload');

    const [sessionId, setSessionId] = useState(() => {
        return localStorage.getItem('phone_qr_session_id') || null;
    });

    const [predictionResult, setPredictionResult] = useState(null);

    const [phoneReceiveCount, setPhoneReceiveCount] = useState(() => {
        return Number(localStorage.getItem('phone_qr_receive_count') || 0);
    });

    const [phoneStatus, setPhoneStatus] = useState('Đang chờ xử lý...');

    const intervalRef = useRef(null);
    const lastResultSignatureRef = useRef(null);

    const createSessionId = () => {
        return 'ss_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    };

    useEffect(() => {
        if (inputType === 'phone' && !sessionId) {
            const newSessionId = createSessionId();

            setSessionId(newSessionId);
            localStorage.setItem('phone_qr_session_id', newSessionId);
            localStorage.setItem('phone_qr_receive_count', '0');

            setPhoneReceiveCount(0);
            setPhoneStatus('Đang chờ xử lý...');
            lastResultSignatureRef.current = null;
        }
    }, [inputType, sessionId]);

    useEffect(() => {
        if (sessionId) {
            localStorage.setItem('phone_qr_session_id', sessionId);
        }
    }, [sessionId]);

    useEffect(() => {
        localStorage.setItem('phone_qr_receive_count', String(phoneReceiveCount));
    }, [phoneReceiveCount]);

    useEffect(() => {
        if (!sessionId) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        intervalRef.current = setInterval(async () => {
            try {
                if (phoneReceiveCount >= MAX_PHONE_SEND) {
                    setPhoneStatus(`QR này đã nhận đủ ${MAX_PHONE_SEND} ảnh. Hãy tạo QR mới.`);
                    return;
                }

                const res = await checkSessionStatus(sessionId);

                console.log('Phone polling:', res);

                if (!res) {
                    setPhoneStatus(`Đang chờ xử lý... (${phoneReceiveCount}/${MAX_PHONE_SEND})`);
                    return;
                }

                const isCompleted =
                    res.status === 'completed' ||
                    res.session_status === 'completed' ||
                    res.status === 'done' ||
                    res.status === 'success';

                const finalData =
                    res.result ||
                    res.data ||
                    res.prediction ||
                    (isCompleted ? res : null);

                if (isCompleted && finalData) {
                    const signature = JSON.stringify(finalData);

                    if (signature !== lastResultSignatureRef.current) {
                        lastResultSignatureRef.current = signature;

                        setPhoneReceiveCount((prev) => {
                            const newCount = Math.min(prev + 1, MAX_PHONE_SEND);
                            setPhoneStatus(`Đã nhận ảnh ${newCount}/${MAX_PHONE_SEND} từ điện thoại.`);
                            return newCount;
                        });

                        setPredictionResult(finalData);
                    } else {
                        setPhoneStatus(`Đang chờ ảnh mới... (${phoneReceiveCount}/${MAX_PHONE_SEND})`);
                    }
                } else {
                    setPhoneStatus(`Đang chờ xử lý... (${phoneReceiveCount}/${MAX_PHONE_SEND})`);
                }
            } catch (err) {
                console.error('Lỗi Polling:', err);
                setPhoneStatus('Lỗi polling. Kiểm tra backend/API.');
            }
        }, 2000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [sessionId, phoneReceiveCount]);

    const handleReset = () => {
        setPredictionResult(null);

        if (inputType === 'phone') {
            setInputType('phone');
        } else {
            setInputType('upload');
        }
    };

    const handleCreateNewQr = () => {
        const oldSessionId = sessionId;
        const newSessionId = createSessionId();

        setSessionId(newSessionId);
        setPhoneReceiveCount(0);
        setPhoneStatus('Đang chờ xử lý...');
        setPredictionResult(null);
        setInputType('phone');

        localStorage.setItem('phone_qr_session_id', newSessionId);
        localStorage.setItem('phone_qr_receive_count', '0');

        if (oldSessionId) {
            localStorage.removeItem(`phone_send_count_${oldSessionId}`);
        }

        localStorage.removeItem(`phone_send_count_${newSessionId}`);
        lastResultSignatureRef.current = null;
    };

    /*
      Đây là phần quan trọng nhất để đọc IP động.

      Nếu bạn mở web bằng:
      https://192.168.1.8:5173

      thì QR tự tạo:
      https://192.168.1.8:5173/?session=...

      Nếu IP đổi, QR tự đổi theo.
    */
    const mobileLink = sessionId
        ? `${window.location.origin}/?session=${sessionId}`
        : '';

    const qrCodeUrl = mobileLink
        ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileLink)}`
        : null;

    const phoneLocked = phoneReceiveCount >= MAX_PHONE_SEND;

    if (predictionResult) {
        return (
            <div>
                <Result
                    data={predictionResult}
                    result={predictionResult}
                    onReset={handleReset}
                    onAnalyzeNew={handleReset}
                />

                {inputType === 'phone' && (
                    <div
                        style={{
                            position: 'fixed',
                            right: '24px',
                            bottom: '24px',
                            zIndex: 9999,
                            background: '#111827',
                            color: '#ffffff',
                            border: '1px solid #334155',
                            borderRadius: '16px',
                            padding: '14px 18px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                            maxWidth: '340px'
                        }}
                    >
                        <div style={{ fontWeight: 800, marginBottom: '6px' }}>
                            📱 Phone QR
                        </div>

                        <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                            {phoneStatus}
                        </div>

                        <div style={{ marginTop: '8px', color: '#fbbf24', fontWeight: 700 }}>
                            {phoneReceiveCount}/{MAX_PHONE_SEND} ảnh
                        </div>

                        <button
                            type="button"
                            onClick={handleReset}
                            style={{
                                marginTop: '10px',
                                marginRight: '8px',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: '#ffffff',
                                background: '#2563eb',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Quay lại Phone
                        </button>

                        <button
                            type="button"
                            onClick={handleCreateNewQr}
                            style={{
                                marginTop: '10px',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                color: '#ffffff',
                                background: '#9333ea',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            QR mới
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 flex flex-col justify-start pb-12">
            <div className="text-center my-12 px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent leading-tight">
                    NHẬN DIỆN CẢM XÚC
                </h1>
                <p className="text-slate-400 text-base md:text-lg font-medium max-w-2xl mx-auto">
                    Chọn phương thức để phân tích ảnh
                </p>
            </div>

            <div className="flex gap-4 justify-center mb-8 px-4 flex-wrap">
                <button
                    onClick={() => setInputType('upload')}
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm border transition ${
                        inputType === 'upload'
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                >
                    📁 Upload Ảnh
                </button>

                <button
                    onClick={() => setInputType('webcam')}
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm border transition ${
                        inputType === 'webcam'
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                >
                    🎥 Webcam
                </button>

                <button
                    onClick={() => setInputType('phone')}
                    className={`px-6 py-3.5 rounded-xl font-bold text-sm border transition ${
                        inputType === 'phone'
                            ? 'bg-blue-600 text-white border-blue-400'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                >
                    📱 Phone
                </button>
            </div>

            <div className="max-w-4xl w-full mx-auto px-4">
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    {inputType === 'upload' && (
                        <UploadImage
                            onPredictionSuccess={(data) => setPredictionResult(data)}
                        />
                    )}

                    {inputType === 'webcam' && (
                        <WebcamCapture
                            onPredictionSuccess={(data) => setPredictionResult(data)}
                        />
                    )}

                    {inputType === 'phone' && (
                        <div className="text-center">
                            <h3 className="text-white text-xl font-bold mb-2">
                                Quét QR bằng điện thoại
                            </h3>

                            <p className="text-slate-400 mb-2">
                                Mở camera điện thoại để gửi ảnh
                            </p>

                            <p className="text-slate-400 mb-6">
                                QR này dùng tối đa{' '}
                                <span className="text-amber-400 font-bold">
                                    {MAX_PHONE_SEND}
                                </span>{' '}
                                lần.
                            </p>

                            {qrCodeUrl ? (
                                <div className="bg-white inline-block p-4 rounded-2xl mb-6">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Code"
                                        className="w-44 h-44"
                                    />
                                </div>
                            ) : (
                                <div className="text-slate-500 mb-6 h-44 flex items-center justify-center">
                                    Đang tạo mã QR...
                                </div>
                            )}

                            <div
                                className={`font-bold text-sm ${
                                    phoneLocked ? 'text-red-500' : 'text-amber-500 animate-pulse'
                                }`}
                            >
                                {phoneStatus}
                            </div>

                            <div className="mt-3 text-slate-300 font-bold">
                                Đã nhận: {phoneReceiveCount}/{MAX_PHONE_SEND}
                            </div>

                            <div className="mt-5 flex justify-center gap-3 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleCreateNewQr}
                                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition"
                                >
                                    🔄 Tạo QR mới
                                </button>
                            </div>

                            {mobileLink && (
                                <div className="mt-5 text-xs text-slate-500 break-all">
                                    Link: {mobileLink}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;