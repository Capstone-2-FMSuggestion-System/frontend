// API Configuration
export const API_URL = 'http://localhost:8000/api';

// ZaloPay Configuration
export const ZALOPAY_CONFIG = {
    appId: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    callbackUrl: 'http://localhost:3000/payment/zalopay/callback',
    apiUrl: 'https://sandbox.zalopay.com.vn/v001/tpe/createorder'
};

// Other Configuration
export const APP_CONFIG = {
    name: 'SM Food Store',
    currency: 'VND',
    currencySymbol: '₫',
    defaultLanguage: 'vi',
    supportedLanguages: ['vi', 'en']
}; 