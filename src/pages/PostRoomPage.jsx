import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, DollarSign, MapPin, CheckSquare, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const inputCls = "w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-400";
const selectCls = "w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer";

const PostRoomPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    type: 'Phòng trọ',
    district: 'Quận 1',
    address: '',
    area: '',
    description: '',
  });
  const [amenities, setAmenities] = useState([]);
  const availableAmenities = ['Máy Lạnh', 'WiFi Miễn Phí', 'Chỗ Để Xe', 'Nội Thất Đầy Đủ', 'Có Ban Công', 'Free Máy Giặt', 'Bảo Vệ 24/7', 'Camera An Ninh'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAmenityChange = (flag) => {
    setAmenities(prev => prev.includes(flag) ? prev.filter(a => a !== flag) : [...prev, flag]);
  };

  // Image handling
  const processFiles = (files) => {
    const newImages = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      newImages.push({ url, name: file.name });
    }
    setImages(prev => [...prev, ...newImages].slice(0, 6)); // max 6 images
  };

  const handleFileInput = (e) => processFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };
  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(async () => {
      try {
        const imageUrls = images.length > 0
          ? images.map(img => img.url)
          : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'];

        const payload = {
          ...formData,
          price: Number(formData.price),
          area: Number(formData.area),
          status: 'Available',
          amenities,
          images: imageUrls,
          image: imageUrls[0],
        };
        await api.post('/rooms', payload);
        setSuccess(true);
        setTimeout(() => navigate('/rooms'), 2500);
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra, vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-14 h-14" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Đăng Phòng Thành Công!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-6 font-medium">
            Phòng của bạn đã được ghi nhận và sẽ sớm xuất hiện trong danh sách tìm kiếm. Đang chuyển hướng...
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full animate-[progress_2.5s_ease-in-out]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Đăng Phòng Trọ Mới</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Thông tin càng đầy đủ, tỉ lệ khách hàng tìm đến càng cao!</p>
          </div>
        </div>

        <hr className="border-slate-100 dark:border-slate-700 my-8" />

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Main Info */}
          <div>
            <h2 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">1. Thông Tin Cơ Bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Tiêu Đề Cho Thuê <span className="text-red-500">*</span></label>
                <input
                  required type="text" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="VD: Phòng Trọ Trung Tâm Mới Xây Có Ban Công"
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Mức Giá Thuê (VNĐ/Tháng) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none" />
                  <input
                    required type="number" name="price" min="0"
                    value={formData.price} onChange={handleChange}
                    placeholder="VD: 5000000"
                    className={`${inputCls} pl-12`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Diện Tích Trọn Gói (m²) <span className="text-red-500">*</span></label>
                <input
                  required type="number" name="area"
                  value={formData.area} onChange={handleChange}
                  placeholder="VD: 45"
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Loại Phòng</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none z-10" />
                  <select name="type" value={formData.type} onChange={handleChange} className={selectCls}>
                    <option value="Phòng trọ">Phòng Trọ Tiêu Chuẩn</option>
                    <option value="Chung Cư Mini">Chung Cư Mini</option>
                    <option value="KTX">Ký Túc Xá (Sleep Box)</option>
                    <option value="Nhà nguyên căn">Nhà Nguyên Căn</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Khu Vực Phân Bổ</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 pointer-events-none z-10" />
                  <select name="district" value={formData.district} onChange={handleChange} className={selectCls}>
                    <option value="Quận 1">Khu Vực Quận 1</option>
                    <option value="Quận 2">Khu Vực Quận 2</option>
                    <option value="Quận 3">Khu Vực Quận 3</option>
                    <option value="Quận 4">Khu Vực Quận 4</option>
                    <option value="Quận 5">Khu Vực Quận 5</option>
                    <option value="Quận 6">Khu Vực Quận 6</option>
                    <option value="Quận 7">Khu Vực Quận 7</option>
                    <option value="Quận 8">Khu Vực Quận 8</option>
                    <option value="Quận 9">Khu Vực Quận 9 (TP Thủ Đức)</option>
                    <option value="Quận 10">Khu Vực Quận 10</option>
                    <option value="Quận 11">Khu Vực Quận 11</option>
                    <option value="Quận 12">Khu Vực Quận 12</option>
                    <option value="Bình Thạnh">Khu Vực Bình Thạnh</option>
                    <option value="Gò Vấp">Khu Vực Gò Vấp</option>
                    <option value="Phú Nhuận">Khu Vực Phú Nhuận</option>
                    <option value="Tân Bình">Khu Vực Tân Bình</option>
                    <option value="Tân Phú">Khu Vực Tân Phú</option>
                    <option value="Thủ Đức">Khu Vực Thủ Đức</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Địa Chỉ Cơ Sở Xác Thực <span className="text-red-500">*</span></label>
                <input
                  required type="text" name="address"
                  value={formData.address} onChange={handleChange}
                  placeholder="VD: 12 Nguyễn Huệ, Phường Bến Nghé..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Description */}
          <div>
            <h2 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">2. Mô Tả Chi Tiết</h2>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Nội Dung Mô Tả Phòng <span className="text-red-500">*</span></label>
              <textarea
                required name="description"
                value={formData.description} onChange={handleChange}
                rows="5"
                placeholder="Nhập vào đây mô tả căn nhà, tiện ích nổi bật, phong thủy, hoặc những lợi thế đặc thù riêng biệt mà dịch vụ bạn mang lại..."
                className={`${inputCls} resize-none`}
              ></textarea>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Amenities */}
          <div>
            <h2 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">3. Tiện Ích Kèm Theo</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {availableAmenities.map(am => (
                <label key={am} className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] ${amenities.includes(am) ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-indigo-300'}`}>
                  <input type="checkbox" className="hidden" checked={amenities.includes(am)} onChange={() => handleAmenityChange(am)} />
                  <div className={`w-5 h-5 rounded-md border-2 mr-3 flex-shrink-0 flex items-center justify-center transition-colors ${amenities.includes(am) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-500'}`}>
                    {amenities.includes(am) && <CheckSquare className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-sm font-bold ${amenities.includes(am) ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-200'}`}>{am}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Image Upload */}
          <div>
            <h2 className="text-base font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">4. Hình Ảnh Phòng (Tối Đa 6 Ảnh)</h2>

            {/* Drop Zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all
                ${dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400'
                }`}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-600 mb-4">
                <ImageIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-bold text-lg mb-1">
                {dragOver ? 'Thả ảnh vào đây!' : 'Kéo & Thả hoặc Bấm Vào Để Chọn Ảnh'}
              </p>
              <p className="text-slate-400 dark:text-slate-400 text-sm font-medium">Hỗ trợ JPG, PNG, WEBP · Tối đa 6 ảnh</p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 aspect-video">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow">Ảnh Bìa</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-indigo-600/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> Đang xử lý...</>
              ) : (
                <><CheckCircle2 className="w-6 h-6" /> Hoàn Tất & Đăng Phòng</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRoomPage;
