/**
 * Utility để xử lý việc upload ảnh lên Cloudinary
 */

import { v4 as uuidv4 } from 'uuid';

// Thông tin cấu hình Cloudinary từ biến môi trường
const CLOUDINARY_CLOUD_NAME = "dkleeailh";
const CLOUDINARY_API_KEY = "171326873511271";
const CLOUDINARY_API_SECRET = "aIwwnuXsnlhQYM0VsavcR_l56kQ-xyWr9RuJ97OCqUl4";
const CLOUDINARY_UPLOAD_PRESET = "data_fm";
const CLOUDINARY_FOLDER = "fm_suggestion_system";

// Thay thế URL để sử dụng unsigned upload
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} oldImageUrl - Optional URL of existing image to replace
 * @returns {Promise<{url: string, publicId: string}>} Object containing the URL and public ID of the uploaded image
 */
export const uploadImageToCloudinary = async (file, oldImageUrl = null) => {
  try {
    // Check if file exists and is valid
    if (!file) {
      throw new Error('Không có file hình ảnh được chọn');
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
    }

    // Check file type
    if (!file.type.match('image.*')) {
      throw new Error('Chỉ hỗ trợ file hình ảnh');
    }

    // Create a safe filename
    const fileName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    
    // Create a unique public ID for the image
    // Format: folder/filename-uuid
    const uniqueId = uuidv4().substring(0, 8);
    const publicId = `${CLOUDINARY_FOLDER}/${fileName.split('.')[0]}-${uniqueId}`;

    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_API_KEY);

    // Add optional parameters
    formData.append('folder', CLOUDINARY_FOLDER); // Ensure the image goes to the right folder
    formData.append('resource_type', 'image');

    // Upload to Cloudinary
    console.log('Đang tải ảnh lên Cloudinary...');
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    // Handle response based on status
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lỗi tải lên Cloudinary:', errorData);
      
      // Handle specific error codes
      if (response.status === 400) {
        throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin tải lên');
      } else if (response.status === 401) {
        throw new Error('Không có quyền tải lên. Vui lòng kiểm tra cấu hình API');
      } else if (response.status === 403) {
        throw new Error('Không được phép thực hiện hành động này');
      } else if (response.status === 404) {
        throw new Error('Không tìm thấy dịch vụ tải lên');
      } else if (response.status === 429) {
        throw new Error('Đã vượt quá giới hạn tải lên. Vui lòng thử lại sau');
      } else if (response.status === 500) {
        throw new Error('Lỗi máy chủ Cloudinary. Vui lòng thử lại sau');
      } else {
        throw new Error(errorData.error?.message || 'Lỗi không xác định khi tải lên Cloudinary');
      }
    }

    // Parse successful response
    const imageData = await response.json();
    
    console.log('Tải lên Cloudinary thành công:', {
      url: imageData.secure_url,
      publicId: imageData.public_id
    });

    // Return URL and public ID
    return {
      url: imageData.secure_url,
      publicId: imageData.public_id
    };
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên Cloudinary:', error);

    // Handle network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      throw new Error('Lỗi kết nối mạng khi tải lên. Vui lòng kiểm tra kết nối internet và thử lại');
    }

    // Handle invalid signature errors (possible API key/secret issues)
    if (error.message.includes('signature') || error.message.includes('Invalid API Key')) {
      throw new Error('Lỗi xác thực API Cloudinary. Vui lòng kiểm tra cấu hình API');
    }

    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<boolean>} True if deletion was successful
 * 
 * Note: This should actually be handled by your backend API,
 * as it requires the API Secret which should never be exposed in frontend code.
 * This function is provided for reference only.
 */
export const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return true;

  try {
    // Extract public ID from URL
    // Example URL: https://res.cloudinary.com/ddzks3jtb/image/upload/v1677654321/fm_suggestion_system/product-12345678.jpg
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicIdParts = urlParts.slice(urlParts.length - 2); // Get folder and filename
    const publicId = publicIdParts.join('/').split('.')[0]; // Remove file extension

    console.log('Đang xóa ảnh từ Cloudinary:', publicId);

    // This part should be handled by your backend!
    // Never expose your API Secret in frontend code
    /*
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = generateSignature(`public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.result === 'ok';
    */

    // Instead, call your backend API to handle deletion
    console.log('Cần gọi API backend để xóa ảnh với ID:', publicId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa ảnh từ Cloudinary:', error);
    return false;
  }
};

export default {
  uploadImageToCloudinary,
  deleteImageFromCloudinary
}; 