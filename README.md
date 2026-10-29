# Hệ thống quản lý món ăn — FoodManager

Bài thi thực hành tổng hợp học phần **Điện toán đám mây**.

- Sinh viên: Nguyễn Khánh Bằng
- MSSV: 236582
- Repository: `236582_NguyenKhanhBang`

## 1. Đề tài

Xây dựng và triển khai hệ thống quản lý món ăn trên nền tảng đám mây, gồm frontend React, backend API Node.js/Express và cơ sở dữ liệu MongoDB Atlas. Mã nguồn được quản lý bằng Git/GitHub, ứng dụng được đóng gói bằng Docker, đẩy image lên Docker Hub và triển khai trên Render.

Chức năng chính: xem danh sách, xem chi tiết, thêm, sửa, xóa và tìm kiếm món ăn theo tên, loại món ăn hoặc ẩm thực/vùng miền.

## 2. Công nghệ sử dụng

- Frontend: React + Vite
- Backend: Node.js + Express
- Cơ sở dữ liệu: MongoDB Atlas, collection `foods`
- Quản lý mã nguồn: Git + GitHub
- Đóng gói: Docker + Docker Hub
- Triển khai: Render

## 3. Quy ước đặt tên

| Tài nguyên | Tên |
|---|---|
| GitHub repository | `236582_NguyenKhanhBang` |
| MongoDB database | `236582_NguyenKhanhBang` |
| MongoDB collection | `foods` |
| Docker Hub backend image | `236582nguyenkhanhbang/backend` |
| Docker Hub frontend image | `236582nguyenkhanhbang/frontend` |
| Render backend service | `api-236582` |
| Render frontend service | `web-236582` |

## 4. Cấu trúc dự án

```text
236582_NguyenKhanhBang/
├── frontend/          # React + Vite
│   └── src/
│       ├── App.jsx
│       └── App.css
├── backend/           # Node.js + Express API
├── README.md
└── .gitignore
```

## 5. Dữ liệu món ăn

Mỗi món ăn gồm các trường: `foodId` (mã món, không trùng), `name`, `category`, `cuisine`, `ingredients`, `price`, `quantity`, `description`, `imageUrl`.

## 6. Hướng dẫn cài đặt và chạy chương trình

### Backend

```bash
cd backend
npm install
npm start
```

Backend cần tệp `.env` (không đưa lên GitHub), ví dụ theo mẫu `.env.example`:

```text
PORT=5000
MONGODB_URI=<chuỗi kết nối MongoDB Atlas>
```

Kiểm tra backend: `GET /health`
API món ăn: `GET/POST /api/foods`, `GET/PUT/DELETE /api/foods/:id`, tìm kiếm: `GET /api/foods?search=pho`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Địa chỉ backend được cấu hình bằng biến môi trường `VITE_API_URL` để thay đổi được khi triển khai lên đám mây.

## 7. Docker

_Hướng dẫn chạy backend và frontend bằng Docker sẽ được cập nhật ở Câu 5 và Câu 6._

## 8. Liên kết triển khai

| Thông tin | Đường dẫn |
|---|---|
| GitHub | _Cập nhật sau Câu 1_ |
| Docker Hub backend | _Cập nhật sau Câu 5_ |
| Docker Hub frontend | _Cập nhật sau Câu 6_ |
| Render frontend | _Cập nhật sau Câu 7_ |
| Render backend API | _Cập nhật sau Câu 8_ |
| MongoDB Atlas database | `236582_NguyenKhanhBang` / collection `foods` 
### Backend (Câu 5)

Image đã build và đẩy lên Docker Hub: https://hub.docker.com/r/khanhbang151/backend

Build image tại máy:

    cd backend
    docker build -t khanhbang151/backend:latest .

Chạy container (cần file backend/.env chứa PORT và MONGODB_URI):

    docker run -d --name foodmanager-backend -p 5001:5000 --env-file .env khanhbang151/backend:latest

Kiểm tra hoạt động: http://localhost:5001/health

### Frontend (Câu 6)

_Cập nhật ở Câu 6._
|
