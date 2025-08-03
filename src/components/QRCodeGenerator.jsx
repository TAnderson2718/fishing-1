import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const QRCodeGenerator = ({ 
  data, 
  size = 200, 
  title = "二维码",
  showDownload = true,
  showCopy = true,
  className = ""
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    generateQRCode();
  }, [data, size]);

  const generateQRCode = async () => {
    if (!data) {
      setError('没有数据可生成二维码');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 生成二维码到canvas
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, JSON.stringify(data), {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // 生成数据URL用于下载
      const dataUrl = canvas.toDataURL('image/png');
      setQrCodeUrl(dataUrl);
      setLoading(false);
    } catch (err) {
      console.error('生成二维码失败:', err);
      setError('生成二维码失败');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
        <p className="text-sm text-gray-600">生成二维码中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center p-4 ${className}`}>
        <div className="text-red-600 text-center">
          <p className="font-medium">生成失败</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateQRCode}
          className="mt-2 btn-secondary text-sm"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {(showDownload || showCopy) && (
        <div className="flex space-x-3 mt-4">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              下载
            </button>
          )}
          
          {showCopy && (
            <button
              onClick={handleCopyData}
              className={`btn-secondary flex items-center text-sm ${
                copied ? 'bg-green-100 text-green-700' : ''
              }`}
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  已复制
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                  复制数据
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 数据预览 */}
      <details className="mt-4 w-full max-w-md">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          查看二维码数据
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono break-all">
          {JSON.stringify(data, null, 2)}
        </div>
      </details>
    </div>
  );
};

export default QRCodeGenerator;
