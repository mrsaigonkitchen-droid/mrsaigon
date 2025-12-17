import type { SectionKind } from '../types';

interface Template {
  id: string;
  name: string;
  description: string;
  data: Record<string, unknown>;
}

interface TemplatePickerProps {
  kind: SectionKind;
  onSelect: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

// ATH Construction/Renovation Templates
const TEMPLATES: Partial<Record<SectionKind, Template[]>> = {
  HERO: [
    {
      id: 'hero-construction',
      name: 'Hero Cải Tạo Nhà',
      description: 'Banner chính cho dịch vụ cải tạo',
      data: {
        title: 'Anh Thợ Xây - Cải Tạo Nhà Chuyên Nghiệp',
        subtitle: 'Biến ngôi nhà cũ thành không gian sống mơ ước với dịch vụ cải tạo uy tín',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
        ctaText: 'Nhận Báo Giá Miễn Phí',
        ctaLink: '/bao-gia',
      },
    },
    {
      id: 'hero-renovation',
      name: 'Hero Sửa Chữa',
      description: 'Banner cho dịch vụ sửa chữa nhà',
      data: {
        title: 'Sửa Chữa Nhà Nhanh Chóng - Uy Tín',
        subtitle: 'Đội ngũ thợ lành nghề, thi công đúng tiến độ, giá cả hợp lý',
        imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
        ctaText: 'Liên Hệ Ngay',
        ctaLink: '/lien-he',
      },
    },
  ],

  TESTIMONIALS: [
    {
      id: 'testimonials-customers',
      name: 'Đánh Giá Khách Hàng',
      description: 'Phản hồi từ khách hàng đã sử dụng dịch vụ',
      data: {
        title: 'Khách Hàng Nói Gì Về Chúng Tôi',
        subtitle: 'Đánh giá thực từ khách hàng đã sử dụng dịch vụ',
        testimonials: [
          {
            name: 'Anh Minh',
            role: 'Chủ nhà tại Quận 7',
            avatar: 'https://i.pravatar.cc/150?img=12',
            rating: 5,
            content: 'Đội ngũ làm việc rất chuyên nghiệp, đúng tiến độ và chất lượng thi công tốt. Rất hài lòng!',
          },
          {
            name: 'Chị Hương',
            role: 'Chủ căn hộ tại Quận 2',
            avatar: 'https://i.pravatar.cc/150?img=5',
            rating: 5,
            content: 'Giá cả hợp lý, thợ làm việc cẩn thận. Sẽ giới thiệu cho bạn bè.',
          },
        ],
      },
    },
  ],

  STATS: [
    {
      id: 'stats-achievements',
      name: 'Thành Tựu',
      description: 'Số liệu nổi bật của công ty',
      data: {
        title: 'Thành Tựu Của Chúng Tôi',
        subtitle: 'Những con số nói lên tất cả',
        stats: [
          { icon: 'ri-home-smile-line', value: 500, label: 'Công Trình Hoàn Thành', suffix: '+' },
          { icon: 'ri-user-smile-line', value: 1000, label: 'Khách Hàng Hài Lòng', suffix: '+' },
          { icon: 'ri-calendar-check-line', value: 10, label: 'Năm Kinh Nghiệm', suffix: '+' },
          { icon: 'ri-star-line', value: 4.9, label: 'Đánh Giá Trung Bình', prefix: '⭐' },
        ],
      },
    },
  ],

  CTA: [
    {
      id: 'cta-quote',
      name: 'CTA Báo Giá',
      description: 'Kêu gọi khách hàng nhận báo giá',
      data: {
        title: 'Sẵn Sàng Cải Tạo Ngôi Nhà Của Bạn?',
        subtitle: 'Liên hệ ngay để nhận báo giá miễn phí và tư vấn chuyên nghiệp',
        primaryButton: { text: 'Nhận Báo Giá Ngay', link: '/bao-gia' },
        secondaryButton: { text: 'Xem Dự Án', link: '/du-an' },
      },
    },
  ],

  FEATURES: [
    {
      id: 'features-services',
      name: 'Dịch Vụ Cải Tạo',
      description: 'Các dịch vụ cải tạo nhà',
      data: {
        title: 'Dịch Vụ Của Chúng Tôi',
        subtitle: 'Giải pháp cải tạo nhà toàn diện',
        features: [
          { icon: 'ri-paint-brush-line', title: 'Sơn Tường', description: 'Sơn mới, sửa chữa tường hư hỏng' },
          { icon: 'ri-layout-grid-line', title: 'Ốp Lát', description: 'Ốp gạch, lát sàn chuyên nghiệp' },
          { icon: 'ri-drop-line', title: 'Chống Thấm', description: 'Xử lý chống thấm, chống dột' },
          { icon: 'ri-flashlight-line', title: 'Điện Nước', description: 'Sửa chữa, lắp đặt hệ thống điện nước' },
        ],
        layout: 'grid',
      },
    },
  ],

  CONTACT_INFO: [
    {
      id: 'contact-full',
      name: 'Thông Tin Liên Hệ Đầy Đủ',
      description: 'Địa chỉ, SĐT, email và giờ làm việc',
      data: {
        title: 'Liên Hệ & Địa Chỉ',
        phone: '+84 123 456 789',
        email: 'contact@anhthoxay.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        hours: [
          { day: 'Thứ 2 - Thứ 6', time: '08:00 - 18:00' },
          { day: 'Thứ 7', time: '08:00 - 12:00' },
        ],
        mapEmbedUrl: '',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/anhthoxay' },
          { platform: 'zalo', url: 'https://zalo.me/anhthoxay' },
        ],
      },
    },
  ],

  RICH_TEXT: [
    {
      id: 'richtext-about',
      name: 'Giới Thiệu Công Ty',
      description: 'Nội dung giới thiệu về công ty',
      data: {
        content: `# Về Anh Thợ Xây

Chúng tôi là đơn vị chuyên cung cấp dịch vụ cải tạo, sửa chữa nhà ở với hơn 10 năm kinh nghiệm.

## Cam Kết Của Chúng Tôi

- **Chất lượng**: Thi công đúng tiêu chuẩn, vật liệu chính hãng
- **Tiến độ**: Hoàn thành đúng hẹn, không kéo dài
- **Giá cả**: Báo giá minh bạch, không phát sinh

## Liên Hệ

Hotline: 0123 456 789
Email: contact@anhthoxay.com`,
      },
    },
  ],
};

export function TemplatePicker({ kind, onSelect, onClose }: TemplatePickerProps) {
  const templates = TEMPLATES[kind] || [];

  if (templates.length === 0) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-gray-400 mb-4">Chưa có template cho loại section này.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <i className="ri-sparkling-line" style={{ fontSize: '20px', color: '#f5d393' }} />
                Chọn Template
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Bắt đầu với template có sẵn cho {kind.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template.data);
                  onClose();
                }}
                className="group relative bg-gray-900 border border-gray-700 rounded-lg p-6 text-left hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <i className="ri-star-line" style={{ fontSize: '20px', color: 'white' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <i className="ri-flashlight-line" style={{ fontSize: '14px' }} />
                  <span>Nhấn để sử dụng template</span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
