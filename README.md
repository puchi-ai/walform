# Walrus Form - Trình tạo Form Phi Tập Trung

Walrus Form là một trình tạo form (form builder) cao cấp, hiệu năng cao và bảo mật tuyệt đối, hoạt động trên mạng lưu trữ phi tập trung **Walrus** (thương hiệu hiển thị **Nami Cloud**) và được bảo chứng bởi blockchain **Sui**. 

Dự án sở hữu thiết kế "Apple Glass" (glassmorphism) hiện đại, hỗ trợ đổi chế độ sáng/tối linh hoạt và tùy biến giao diện trực quan cho người dùng.

---

## ✨ Tính năng chính

- **Lưu trữ phi tập trung (Nami Cloud / Walrus)**: Tất cả cấu trúc form và câu trả lời được lưu trữ an toàn dưới dạng các blob phi tập trung.
- **Nộp Form Không Cần Ví (Walletless & Gasless Responses)**: Người dùng phổ thông khi truy cập đường dẫn form công khai (`/f/:id`) có thể điền và nộp câu trả lời hoàn toàn miễn phí, không yêu cầu kết nối ví hay trả phí gas.
- **Xác thực Admin bằng Smart Contract**: Chỉ những địa chỉ ví được đăng ký quyền Quản trị viên (Admin) trong Sui Smart Contract mới có quyền truy cập trang quản trị Dashboard, tạo, chỉnh sửa hoặc xóa form.
- **Đồng nhất Giao diện & Live Preview**: Trình tùy biến giao diện thời gian thực đồng bộ tuyệt đối giữa màn hình chỉnh sửa và màn hình hiển thị chính thức, hỗ trợ phong cách card nhẹ nhàng, tối hoặc kính mờ tinh xảo.
- **Tải lên Tệp tin Phi Tập Trung**: Tích hợp tải lên hình ảnh, video, tài liệu trực tiếp lên kho lưu trữ phi tập trung Nami Cloud.

---

## 🛠 Công nghệ Sử dụng

- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + shadcn/ui.
- **Quản lý trạng thái**: Zustand (useFormStore, useAuthStore, useThemeStore).
- **Backend Proxy**: Express Server (chuyển tiếp và lưu cache an toàn lên S3/Nami Cloud).
- **Smart Contract**: Move (Sui Blockchain) để đánh chỉ mục tìm kiếm và phân quyền admin.

---

## 🚀 Hướng dẫn Chạy ở Local

### 1. Cấu hình biến môi trường (`.env`)
Tạo tệp `.env` tại thư mục gốc của dự án với các thông tin sau:
```env
PORT=3001
VITE_API_URL=http://localhost:3001

# Sui Network & Package Config
VITE_SUI_NETWORK=mainnet
VITE_SUI_PACKAGE_ID=0x... # Điền ID Move Package đã deploy trên Sui

# Cấu hình lưu trữ Nami Cloud (AWS S3)
# Nếu bỏ trống các khóa AWS, Backend sẽ tự động fallback sang lưu trữ ở ổ đĩa cục bộ (server/storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=namicloud-bucket
```

### 2. Khởi chạy Backend Proxy
```bash
# Cài đặt thư viện
npm install

# Khởi chạy Express Backend Server (chạy trên cổng 3001)
npm run backend
```

### 3. Khởi chạy Frontend
Trong một terminal mới, khởi chạy Vite dev server:
```bash
# Khởi chạy React App (chạy trên cổng 3000)
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để sử dụng.

---

## 📦 Hướng dẫn Deploy Production

### Cách 1: Deploy lên Vercel (Khuyên dùng - Full-Stack)
Vercel hỗ trợ đóng gói ứng dụng React tĩnh kèm theo API Node.js (Express serverless function) vô cùng tiện lợi nhờ cấu hình `vercel.json` đã được cài đặt sẵn.

1. **Chuẩn bị mã nguồn**: Đảm bảo dự án đã có tệp `vercel.json` và `api/index.ts`.
2. **Import dự án lên Vercel**: 
   * Truy cập [Vercel Dashboard](https://vercel.com) và import repository của bạn.
3. **Cấu hình biến môi trường trên Vercel**:
   Trong cài đặt dự án (Project Settings -> Environment Variables), hãy nhập đầy đủ các biến môi trường sau:
   * `AWS_ACCESS_KEY_ID`
   * `AWS_SECRET_ACCESS_KEY`
   * `AWS_REGION`
   * `AWS_S3_BUCKET`
   * `VITE_SUI_PACKAGE_ID`
   * `VITE_SUI_NETWORK`
4. **Deploy**: Bấm nút **Deploy**. Vercel sẽ tự động build frontend tĩnh vào thư mục `dist`, đồng thời ánh xạ toàn bộ API `/api/*` về Serverless Node.js backend.

---

### Cách 2: Deploy lên Walrus Site (Phi tập trung hoàn toàn - Chỉ Frontend)
Walrus hỗ trợ lưu trữ các trang web tĩnh trực tiếp trên mạng lưới phi tập trung dưới dạng **Walrus Site**. Do Walrus Site chỉ chạy được mã nguồn client-side tĩnh, bạn cần trỏ API lưu trữ về một máy chủ trung gian đã được deploy ở ngoài (ví dụ: máy chủ API Vercel của bạn ở Cách 1).

#### Bước 1: Build mã nguồn Frontend
Cập nhật biến môi trường `VITE_API_URL` trỏ tới địa chỉ Vercel API của bạn (ví dụ: `https://your-app.vercel.app`), sau đó chạy lệnh build:
```bash
# Biên dịch tối ưu hóa React app
npm run build
```
Mã nguồn tĩnh hoàn chỉnh sẽ được tạo ra tại thư mục `dist/`.

#### Bước 2: Deploy lên Walrus Site bằng CLI
1. Tải và cài đặt công cụ CLI `site-builder` từ Walrus:
   ```bash
   # Tải bản phát hành phù hợp với OS của bạn từ github.com/mystenlabs/walrus
   ```
2. Khởi tạo và liên kết trang web của bạn:
   ```bash
   # Tạo site mới trên Sui network
   site-builder init --network testnet
   ```
3. Đẩy toàn bộ thư mục tĩnh lên Walrus:
   ```bash
   site-builder publish dist
   ```
   Sau khi hoàn tất, Walrus CLI sẽ cung cấp cho bạn một đường dẫn phi tập trung có dạng:
   `https://[walrus-site-object-id].walrus.site` để truy cập ứng dụng của bạn một cách an toàn và không thể bị ngăn chặn!

---

## 🛡 Hướng dẫn Deploy Move Smart Contract (Sui)

Để khởi tạo hoặc cập nhật chỉ mục form và danh sách ví Admin trên Sui blockchain:

1. Chuyển hướng vào thư mục hợp đồng:
   ```bash
   cd contracts/blob_index
   ```
2. Deploy hợp đồng lên Sui network bằng Sui CLI:
   ```bash
   sui client publish --gas-budget 20000000
   ```
3. Lưu lại `Package ID` được sinh ra và cập nhật vào cấu hình `.env` (`VITE_SUI_PACKAGE_ID`).
4. Sử dụng ví Owner để thêm/xóa các địa chỉ ví Admin khác thông qua hàm `register_admin` trên block explorer hoặc script của bạn.
