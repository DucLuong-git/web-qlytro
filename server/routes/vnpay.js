const express = require('express');
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

const router = express.Router();

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// @route   POST /api/vnpay/create_payment_url
// @desc    Tạo URL thanh toán VNPay
router.post('/create_payment_url', (req, res) => {
  try {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let tmnCode = process.env.VNP_TMNCODE || "OXYP3B21"; // Mã ví dụ sandbox
    let secretKey = process.env.VNP_HASHSECRET || "PEXZZSNTMQLFBRWYZXWNWIVKHTIKQEQW";
    let vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = process.env.VNP_RETURNURL || "http://localhost:5173/payment-result"; // Hoặc URL frontend

    let amount = req.body.amount; // VNĐ
    let bankCode = req.body.bankCode;
    let locale = req.body.language || 'vn';
    
    // Nếu dùng giá USD trên UI, nhân với tỉ giá (ví dụ 25,000)
    let amountVND = Number(amount) * 25000;
    
    let currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = req.body.invoiceId || moment(date).format('DDHHmmss');
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan hoa don: ' + (req.body.invoiceId || '');
    vnp_Params['vnp_OrderType'] = 'billpayment';
    vnp_Params['vnp_Amount'] = amountVND * 100; // VNPay yêu cầu nhân 100
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    
    if(bankCode !== null && bankCode !== '' && bankCode !== undefined){
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({ success: true, paymentUrl: vnpUrl });
  } catch (error) {
    console.error('Lỗi khi tạo payment url VNPay:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi kết nối đến VNPay' });
  }
});

// @route   GET /api/vnpay/vnpay_return
// @desc    Xử lý kết quả trả về từ VNPAY (Thường Frontend gọi API này để update Database)
router.get('/vnpay_return', (req, res) => {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNP_HASHSECRET || "PEXZZSNTMQLFBRWYZXWNWIVKHTIKQEQW";

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

    if(secureHash === signed){
        // Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        let invoiceId = vnp_Params['vnp_TxnRef'];
        let rspCode = vnp_Params['vnp_ResponseCode'];
        
        if (rspCode === '00') {
           // THÀNH CÔNG -> Tại đây viết logic update Status của Hoá đơn (Invoice) trong Database
           res.status(200).json({ success: true, message: 'Thanh toán thành công!', invoiceId: invoiceId });
        } else {
           res.status(200).json({ success: false, message: 'Thanh toán thất bại!', rspCode: rspCode });
        }
    } else{
        res.status(200).json({ success: false, message: 'Chữ ký không hợp lệ!' });
    }
});

module.exports = router;
