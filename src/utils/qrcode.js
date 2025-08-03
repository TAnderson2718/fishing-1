import QRCode from 'qrcode';

// 生成二维码
export const generateQRCode = async (text, options = {}) => {
  try {
    const defaultOptions = {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    const qrCodeDataURL = await QRCode.toDataURL(text, qrOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// 生成订单二维码数据
export const generateOrderQRData = (order) => {
  return JSON.stringify({
    orderId: order.id,
    customerId: order.customerId,
    activityId: order.activityId,
    date: order.date,
    time: order.time,
    timestamp: Date.now()
  });
};

// 解析二维码数据
export const parseQRData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

// 验证二维码数据
export const validateQRData = (qrData, expectedOrderId) => {
  const data = parseQRData(qrData);
  if (!data) return false;
  
  return data.orderId === expectedOrderId;
};
