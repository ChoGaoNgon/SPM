const PhuTro = [
  'Heater',
  'Sensor',
  'Head tip',
  'Check ring',
  'Seal ring',
  'Screw',
  'Quả mỡ',
  'Aptomat',
  'Khởi động từ',
  'Dây nguồn',
  'Relay TG',
  'Vật tư tái sử dụng',
  'Khác',
];

const ThietBi = [
  'Máy ép',
  'Cushion',
  'Tạp chất',
  'Timer',
  'Máy CNC',
  'Bảo dưỡng',
  ' Hot runner',
  'Core dầu',
  'Hot stamping',
  'Heater&Sensor',
  'Robot',
  'Bơm nước/Oil/Chiller',
  'Máy sấy',
  'Máy Nghiền Chậm',
  'Nghiền to',
  'Rỉ dầu & Vỡ nước',
  'Băng tải',
  'Phụ trợ eero',
  'Phòng In',
  'Hệ thống khí nén',
  'Hệ thống Cooling',
  'Khác',
];

const BPPS = ['CĐ', 'KT', 'NVL', 'KHSX', 'SX', 'BD', 'HCNS', 'Kaizen', 'Kho', 'IT', 'QC'];

const Loi = [
  {
    pl_loi: 'Phát sinh',
    ct_loi: ['hỗ trợ nhà cung cấp', 'hỗ trợ bộ phận khác', 'đấu điện khuôn', 'đấu điều khiển khuôn', 'khác'],
  },
  {
    pl_loi: 'Hệ thống',
    ct_loi: [
      'máy nén khí',
      'hệ thống cooling',
      'hệ thống điện',
      'quạt mát nhà xưởng',
      'phòng cháy chữa cháy',
      'cầu công',
      'thang máy',
      'khác',
    ],
  },
  {
    pl_loi: 'Phần cơ',
    ct_loi: ['bazzel, screw', 'truyền động', 'cân bằng máy', 'lắp máy mới', 'cover', 'di chuyển máy', 'khác'],
  },
  {
    pl_loi: 'Phần điện, điều khiển',
    ct_loi: [
      'heater, sensor',
      'mạch điều khiển',
      'điện động lực',
      'điện chiếu sáng',
      'quạt làm mát',
      'motor',
      'nguồn điều khiển',
      'hot controller',
      'lỗi parameter máy',
      'khác',
    ],
  },
  {
    pl_loi: 'Nước, thủy lực, khí',
    ct_loi: ['bộ chia, khóa', 'đường ống', 'van điều khiển', 'bơm thủy lực', 'nguồn core', 'khác'],
  },
];

const ListNV = [
  { ma_nv: 'HP3674', ho_ten: 'Phạm Hoàng An' },
  { ma_nv: 'HP3551', ho_ten: 'Nguyễn Quốc Hùng' },
  { ma_nv: 'HP3550', ho_ten: 'Nguyễn Ngọc Linh' },
  { ma_nv: 'HP3009', ho_ten: 'Nguyễn Anh Đức' },
  { ma_nv: 'HP3008', ho_ten: 'Bùi Tiến Lợi' },
  { ma_nv: 'HP3007', ho_ten: 'Nguyễn Huy Hoàng' },
  { ma_nv: 'HP2544', ho_ten: 'Nguyễn Tiến Dũng' },
  { ma_nv: 'HP2543', ho_ten: 'Nghiêm Ngọc Thanh' },
  { ma_nv: 'HP2300', ho_ten: 'Nguyễn Huy Chiến' },
  { ma_nv: 'HP2299', ho_ten: 'Nguyễn Văn Hoàn' },
  { ma_nv: 'HP2298', ho_ten: 'Nguyễn Văn Duyệt' },
  { ma_nv: 'HP1550', ho_ten: 'Nguyễn Hoàng Sơn' },
  { ma_nv: 'HP1549', ho_ten: 'Lưu Quang Hưng' },
  { ma_nv: 'HP1282', ho_ten: 'Nguyễn Công Trường' },
  { ma_nv: 'HP0628', ho_ten: 'Trần Trung Nam' },
  { ma_nv: 'HP0490', ho_ten: 'Lê Viết Huy' },
  { ma_nv: 'HP0375', ho_ten: 'Nguyễn Văn Thế' },
  { ma_nv: 'HP0249', ho_ten: 'Vũ Hữu Cảnh' },
  { ma_nv: 'HP0200', ho_ten: 'Nguyễn Văn Minh' },
  { ma_nv: 'HP0197', ho_ten: 'Nguyễn Văn Hòa' },
  { ma_nv: 'HP0131', ho_ten: 'Nguyễn Đăng Đại' },
  { ma_nv: 'HP0014', ho_ten: 'Nguyễn Văn Tú' },
];

export { PhuTro, ThietBi, BPPS, ListNV, Loi };
