import React, { useRef, useState, useEffect } from 'react';
import { predictEmotion } from '../api/api';

const WebcamCapture = ({ onPredictionSuccess }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);

    const startWebcam = async () => {
        setError(null);
        setCameraReady(false);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Trình duyệt không hỗ trợ camera hoặc trang chưa chạy HTTPS/localhost.');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            setStream(mediaStream);
        } catch (err) {
            console.error('Webcam error:', err.name, err.message);

            if (err.name === 'NotAllowedError') {
                setError('Trình duyệt đang chặn camera. Hãy cấp quyền Camera = Allow.');
            } else if (err.name === 'NotFoundError') {
                setError('Không tìm thấy webcam trên thiết bị.');
            } else if (err.name === 'NotReadableError') {
                setError('Webcam đang bị ứng dụng khác sử dụng. Hãy tắt Camera, Zoom, Teams, Meet, OBS rồi thử lại.');
            } else if (!window.isSecureContext) {
                setError('Trang chưa chạy HTTPS/localhost nên không mở được webcam.');
            } else {
                setError(`Không thể mở webcam: ${err.name || 'Error'} - ${err.message}`);
            }
        }
    };

    useEffect(() => {
        if (!stream || !videoRef.current) return;

        const video = videoRef.current;
        video.srcObject = stream;

        const playVideo = async () => {
            try {
                await video.play();
                setCameraReady(true);
            } catch (err) {
                console.error('Video play error:', err);
                setError('Đã lấy được camera nhưng không phát được video. Hãy reload trang và thử lại.');
            }
        };

        playVideo();

        return () => {
            if (video) {
                video.srcObject = null;
            }
        };
    }, [stream]);

    const stopWebcam = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraReady(false);
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) {
            setError('Video chưa sẵn sàng để chụp ảnh.');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setError('Webcam chưa có khung hình. Hãy chờ 1-2 giây rồi chụp lại.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setError('Không thể tạo ảnh từ webcam.');
                    setLoading(false);
                    return;
                }

                const file = new File([blob], 'webcam-capture.jpg', {
                    type: 'image/jpeg'
                });

                /*
                    Dùng base64 trực tiếp từ canvas.
                    Cách này chắc chắn hiển thị được ở frontend,
                    không phụ thuộc backend có trả image_url hay không.
                */
                const capturedImage = canvas.toDataURL('image/jpeg', 0.95);

                // Lưu tạm để Result.jsx vẫn lấy được ảnh nếu props bị mất
                sessionStorage.setItem('last_input_image', capturedImage);

                try {
                    const result = await predictEmotion(file, null, 'webcam');

                    console.log('Backend result:', result);
                    console.log('Captured image:', capturedImage);

                    const fixedResult = {
                        ...result,

                        // Gán nhiều tên field để Result.jsx bắt được ảnh
                        captured_image: capturedImage,
                        preview_image: capturedImage,
                        input_image: capturedImage,
                        image_url: capturedImage,
                        image_path: capturedImage,
                        image: capturedImage
                    };

                    if (onPredictionSuccess) {
                        onPredictionSuccess(fixedResult);
                    }
                } catch (apiErr) {
                    console.error('Predict API error:', apiErr);
                    setError('Chụp được ảnh nhưng gửi lên server thất bại. Kiểm tra backend/API.');
                } finally {
                    setLoading(false);
                }
            }, 'image/jpeg', 0.95);
        } catch (err) {
            console.error('Capture error:', err);
            setError('Không thể chụp ảnh từ webcam.');
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <div className="webcam-container">
            {!stream && (
                <button
                    type="button"
                    onClick={startWebcam}
                    className="btn-webcam"
                >
                    🎥 Kích Hoạt Webcam Máy Tính
                </button>
            )}

            {stream && (
                <div className="webcam-preview">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        controls={false}
                        style={{
                            width: '100%',
                            maxWidth: '640px',
                            minHeight: '360px',
                            borderRadius: '16px',
                            backgroundColor: '#000',
                            objectFit: 'cover'
                        }}
                    />

                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div
                        style={{
                            marginTop: '16px',
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            type="button"
                            onClick={captureImage}
                            disabled={loading || !cameraReady}
                            className="btn-capture"
                        >
                            {loading ? 'Đang phân tích...' : '📸 Chụp & Phân Tích'}
                        </button>

                        <button
                            type="button"
                            onClick={stopWebcam}
                            className="btn-stop"
                        >
                            ⛔ Tắt Webcam
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="error-message">
                    ❌ {error}
                </p>
            )}
        </div>
    );
};

export default WebcamCapture;