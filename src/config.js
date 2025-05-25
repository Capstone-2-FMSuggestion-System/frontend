// API Configuration
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// PayOS Configuration
export const PAYOS_CONFIG = {
  clientId: "8beadbae-a0e7-4923-b5e9-f49fcadd3ca4",
  apiKey: "760cfb21-3d78-428e-b556-3a41060d8a42",
  callbackUrl: "http://localhost:3000/payment/payos/callback",
  apiUrl: "https://payosapi.com/transaction",
};

// Company Information
export const COMPANY_INFO = {
  name: "SM Food Store",
  slogan: "Nâng tầm ẩm thực Việt",
  founded: 2025,
  address: "Đai Học Duy Tân, Đà Nẵng, Việt Nam",
  phone: "+84 032 933 0318",
  email: "chauquang132003@gmail.com",
  socialMedia: {
    facebook: "https://facebook.com/smfoodstore",
    instagram: "https://instagram.com/smfoodstore",
    twitter: "https://twitter.com/smfoodstore",
  },
};

// Other Configuration
export const APP_CONFIG = {
  name: COMPANY_INFO.name,
  currency: "VND",
  currencySymbol: "₫",
  defaultLanguage: "vi",
  supportedLanguages: ["vi", "en"],
};
