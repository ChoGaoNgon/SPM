# SPM – Hệ thống Quản lý Cơ điện (HTMP)

Tài liệu hướng dẫn **cài đặt, cấu hình và vận hành** hệ thống gồm 2 phần:

| Thành phần | Công nghệ | Thư mục |
|---|---|---|
| **Backend** | Spring Boot 3.5.0 · Java 17 · Maven | `backend/` |
| **Frontend** | React 18 (react-scripts 5 / react-app-rewired) | `frontend/` |

Backend kết nối MySQL (chính + phụ), PostgreSQL (read-only) và Redis (cache). Frontend là SPA gọi REST API của backend.

---

## 1. Yêu cầu môi trường

Cài đặt các phần mềm sau trước khi chạy:

| Phần mềm | Phiên bản khuyến nghị | Ghi chú |
|---|---|---|
| **JDK (Java)** | **17** | Bắt buộc đúng Java 17 (`pom.xml` khai báo `java.version=17`). Kiểm tra: `java -version` |
| **Maven** | 3.9+ | Build backend. Kiểm tra: `mvn -v` |
| **Node.js** | 18 LTS hoặc 20 LTS | Chạy/build frontend. Kiểm tra: `node -v` |
| **npm** | 9+ (đi kèm Node) | Kiểm tra: `npm -v` |
| **MySQL** | 8.x | 2 database: chính + phụ (DB2) |
| **PostgreSQL** | 13+ | DB3 (read-only, có thể tắt) |
| **Redis** | 6+ | Dùng cho cache |

> Có thể dùng nhiều phiên bản Node bằng `nvm` (Windows: `nvm-windows`).

---

## 2. Cấu trúc dự án

```
SPM/
├── backend/                 # Spring Boot
│   ├── src/main/resources/application.yml
│   ├── .env                 # biến môi trường THẬT (không commit)
│   ├── .env.example         # mẫu biến môi trường
│   └── pom.xml
├── frontend/                # React
│   ├── src/
│   ├── .env                 # biến môi trường THẬT (không commit)
│   └── .env.example         # mẫu biến môi trường
├── README.md
└── docs.html                # bản HTML của tài liệu này
```

---

## 3. Thiết lập biến môi trường (`.env`)

Cả backend và frontend đọc cấu hình từ file `.env` đặt tại **thư mục gốc của từng phần** (`backend/.env`, `frontend/.env`).

Cách làm: **copy file mẫu rồi điền giá trị thật**.

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

> ⚠️ **Không commit** file `.env` thật lên Git (chứa mật khẩu, token). Chỉ commit `.env.example`.

### 3.1. Backend – `backend/.env`

Backend dùng thư viện `spring-dotenv`, **tự động nạp** file `.env` nằm cùng thư mục khi khởi động (kể cả khi chạy `java -jar`). Các biến trong `application.yml` được tham chiếu qua cú pháp `${TÊN_BIẾN}`.

| Biến | Ý nghĩa |
|---|---|
| `SPRING_DATASOURCE_URL` / `_USERNAME` / `_PASSWORD` | Kết nối MySQL **chính** |
| `SERVER_PORT` | Cổng backend (mẫu: `8081`; mặc định nếu bỏ trống: `8080`) |
| `DB2_ENABLED`, `DB2_URL`, `DB2_USERNAME`, `DB2_PASSWORD` | MySQL **phụ** (bật/tắt qua `DB2_ENABLED`) |
| `DB3_ENABLED`, `DB3_URL`, `DB3_USERNAME`, `DB3_PASSWORD` | PostgreSQL read-only |
| `JWT_SECRET` | Chuỗi bí mật ký JWT (≥ 32 ký tự ngẫu nhiên) |
| `FILE_UPLOAD_DIR` | Thư mục lưu file upload |
| `BACKEND_LOG_PATH`, `APP_NAME` | Đường dẫn log / tên ứng dụng |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` | Kết nối Redis |
| `MAIL_DEFAULT`, `MAIL_DEFAULT_PASSWORD` | Tài khoản gửi mail (SMTP Office365) |
| `WEB_SOCKET_SERVER`, `WINDOW_SERVER`, `HRM_API` | Các service nội bộ |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | Origin FE được phép gọi (vd `http://localhost:3000`) |

Xem đầy đủ mẫu tại [`backend/.env.example`](backend/.env.example).

### 3.2. Frontend – `frontend/.env`

Biến của React **bắt buộc bắt đầu bằng `REACT_APP_`** và được nhúng lúc **build/start** (đổi `.env` phải khởi động lại `npm start`).

| Biến | Ý nghĩa |
|---|---|
| `REACT_APP_API_URL` | URL REST API backend (vd `http://localhost:8081/api`) |
| `REACT_APP_UPLOAD_URL` | URL thư mục file upload |
| `REACT_APP_SOCKET_HOST` | URL WebSocket server |
| `REACT_APP_SUPERSET_HOST` | Host backend cho báo cáo |
| `REACT_APP_API_FE` | URL chính của frontend |
| `REACT_APP_FRAPPE_HOST`, `REACT_APP_NODE_HOST`, `REACT_APP_FRAPPE_TOKEN` | Tích hợp service Frappe/Node |
| `GENERATE_SOURCEMAP` | `false` để build nhẹ hơn |

Xem đầy đủ mẫu tại [`frontend/.env.example`](frontend/.env.example).

---

## 4. Chạy Backend

### 4.1. Chuẩn bị
- Đảm bảo MySQL / PostgreSQL / Redis đang chạy và đã khai báo đúng trong `backend/.env`.
- `cd backend`

### 4.2. Chế độ phát triển (dev)
```bash
cd backend
mvn spring-boot:run
```

### 4.3. Build ra file JAR (production)
```bash
cd backend
mvn clean package
# Bỏ qua test khi build nhanh:
# mvn clean package -DskipTests
```
File JAR tạo ra tại:
```
backend/target/quanlycodien-0.0.1-SNAPSHOT.jar
```

### 4.4. Chạy JAR
```bash
cd backend
java -jar target/quanlycodien-0.0.1-SNAPSHOT.jar
```
> `spring-dotenv` sẽ tự đọc `backend/.env` nếu bạn chạy lệnh **từ trong thư mục `backend`** (nơi chứa file `.env`).

### 4.5. Chạy như service trên Linux (systemd)

Tạo file `/etc/systemd/system/spm-backend.service`:

```ini
[Unit]
Description=SPM Backend (HTMP)
After=network.target mysql.service redis.service

[Service]
User=htmp
WorkingDirectory=/opt/spm/backend
ExecStart=/usr/bin/java -jar /opt/spm/backend/quanlycodien-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

> `WorkingDirectory` phải là nơi đặt file `.env` để `spring-dotenv` nạp được biến môi trường.

Kích hoạt và quản lý service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable spm-backend      # tự chạy khi khởi động máy
sudo systemctl start spm-backend       # khởi động
sudo systemctl status spm-backend      # xem trạng thái
sudo journalctl -u spm-backend -f      # xem log realtime
```

Backend mặc định phục vụ tại: **http://localhost:8081** (theo `SERVER_PORT` trong `.env.example`).

---

## 5. Chạy Frontend

### 5.1. Cài dependencies (lần đầu / khi đổi package)
```bash
cd frontend
npm install
```

### 5.2. Chế độ phát triển (dev)
```bash
cd frontend
npm run start
```
Ứng dụng chạy tại **http://localhost:3000** và tự reload khi sửa code.

### 5.3. Build production
```bash
cd frontend
npm run build
```
Kết quả build tĩnh nằm ở `frontend/build/`, có thể phục vụ bằng Nginx hoặc bất kỳ web server tĩnh nào.

---

## 6. Cổng & URL mặc định

| Dịch vụ | URL | Cấu hình tại |
|---|---|---|
| Backend API | http://localhost:8081 | `SERVER_PORT` (backend `.env`) |
| Frontend | http://localhost:3000 | mặc định react-scripts |
| Redis | localhost:6379 | `REDIS_PORT` |

> Frontend gọi backend qua `REACT_APP_API_URL`; đảm bảo giá trị này trỏ đúng cổng backend, và cổng frontend nằm trong `CORS_ALLOWED_ORIGIN_PATTERNS` của backend.

---

## 7. Quy trình chạy nhanh (tóm tắt)

```bash
# 1. Cấu hình biến môi trường
cp backend/.env.example  backend/.env    && $EDITOR backend/.env
cp frontend/.env.example frontend/.env   && $EDITOR frontend/.env

# 2. Backend
cd backend
mvn clean package
java -jar target/quanlycodien-0.0.1-SNAPSHOT.jar
# (đảm bảo MySQL/PostgreSQL/Redis đã chạy)

# 3. Frontend (terminal khác)
cd frontend
npm install
npm run start
```

---

## 8. Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân / cách xử lý |
|---|---|
| Backend báo lỗi kết nối DB khi khởi động | Sai `SPRING_DATASOURCE_*` hoặc DB chưa chạy. Kiểm tra `.env` và service MySQL. |
| Biến `.env` không được nạp khi chạy JAR | Chạy `java -jar` **từ đúng thư mục chứa `.env`** (hoặc set `WorkingDirectory` trong systemd). |
| Frontend gọi API bị lỗi CORS | Thêm origin của FE vào `CORS_ALLOWED_ORIGIN_PATTERNS` ở backend `.env`. |
| Sửa `.env` frontend không có tác dụng | Biến `REACT_APP_*` chỉ nạp lúc start/build → **khởi động lại** `npm run start`. |
| `mvn` báo sai phiên bản Java | Đảm bảo `JAVA_HOME` trỏ tới JDK 17. |
