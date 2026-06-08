import React, { useState } from 'react';
import { predictEmotion } from '../api/api';

const UploadImage = ({ onPredictionSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const data = await predictEmotion(
            file,
            null,
            "upload"
            );
            onPredictionSuccess(data); // Đẩy dữ liệu lên cha xử lý
        } catch (err) {
            setError(err.response?.data?.detail || "Không thể trích xuất hoặc nhận diện khuôn mặt.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <label style={{ display: 'block', maxWidth: '450px', margin: '0 auto', padding: '40px 20px', border: '2px dashed #3b82f6', borderRadius: '12px', cursor: 'pointer', background: '#eff6ff', transition: '0.2s' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📁</span>
                <span style={{ color: '#1d4ed8', fontWeight: 'bold', fontSize: '16px' }}>Bấm vào đây để chọn tập tin ảnh</span>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 0 0' }}>Chấp nhận định dạng JPG, JPEG, PNG</p>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={loading} />
            </label>
            
            {loading && <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#3b82f6' }}>⌛ Đang đẩy ảnh lên Server xử lý mô hình CNN...</p>}
            {error && <p style={{ marginTop: '20px', color: '#ef4444', fontWeight: 'bold' }}>❌ Lỗi: {error}</p>}
        </div>
    );
};

export default UploadImage;