const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Tạo thư mục data nếu chưa có
const fs = require('fs');
if (!fs.existsSync('./data')) fs.mkdirSync('./data');

// Kết nối cơ sở dữ liệu
const db = new sqlite3.Database('./data/database.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    email TEXT,
    childName TEXT,
    childAge TEXT,
    message TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
    // Tạo bảng học sinh
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    ageGroup TEXT,
    className TEXT,
    status TEXT DEFAULT 'active',
    enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    // Bảng lớp học
  db.run(`CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    teacher TEXT,
    studentCount INTEGER DEFAULT 0
  )`);

  // Bảng giáo viên
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    position TEXT,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
 });


// Cấu hình
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => res.render('index', { activePage: 'trang-chu' }));
app.get('/tuyen-sinh', (req, res) => res.render('tuyen-sinh', { activePage: 'tuyen-sinh' }));
app.get('/cong-khai', (req, res) => res.render('cong-khai', { activePage: 'cong-khai' }));
app.get('/thong-ke', (req, res) => res.render('thong-ke', { activePage: 'thong-ke' }));
app.get('/lien-he', (req, res) => res.render('lien-he', { activePage: 'lien-he' }));

// Giới thiệu
app.get('/gioi-thieu-chung', (req, res) => res.render('gioi-thieu-chung', { activePage: 'gioi-thieu' }));
app.get('/co-so-vat-chat', (req, res) => res.render('co-so-vat-chat', { activePage: 'gioi-thieu' }));
app.get('/doi-ngu-giao-vien', (req, res) => res.render('doi-ngu-giao-vien', { activePage: 'gioi-thieu' }));
app.get('/quan-diem-giao-duc', (req, res) => res.render('quan-diem-giao-duc', { activePage: 'gioi-thieu' }));
app.get('/muc-tieu-dao-tao', (req, res) => res.render('muc-tieu-dao-tao', { activePage: 'gioi-thieu' }));


// PHẦN NÀY XỬ LÝ CÁC TAB NHỎ NHƯ BÉ ...
// --- Route cho trang chi tiết bài viết ---
app.get('/bai-viet-chi-tiet', (req, res) => {
  try {
    const baiVietId = req.query.id; // Lấy ID từ query parameter ?id=...

    if (!baiVietId) {
      return res.status(400).send('Yêu cầu không hợp lệ: Thiếu ID bài viết.');
    }

    // --- PHẦN MÔ PHỎNG DỮ LIỆU BÀI VIẾT ---
    // Trong thực tế, bạn sẽ truy vấn cơ sở dữ liệu ở đây.
    const duLieuBaiViet = {
      'khoi-la-tuan-1': {
        tieu_de: 'Khối Lá - Tuần 1: Đồ dùng, Trang phục học sinh lớp Một',
        noi_dung: `<p>Chào mừng tuần học mới!</p>
                   <p><strong>Chủ đề:</strong> Trường Tiểu học (2 tuần)</p>
                   <p><strong>Tuần 1:</strong> Đồ dùng, trang phục học sinh lớp Một (từ 12/05 đến 16/05/2025)</p>
                   <h3>Chi tiết hoạt động trong tuần:</h3>
                   <ul>
                     <li><strong>Thứ Hai:</strong> Hướng dẫn trẻ làm quen với đồ dùng học tập, học cách bảo quản đồ dùng.</li>
                     <li><strong>Thứ Ba:</strong> Thảo luận về trang phục phù hợp khi đi học lớp Một, trò chơi đóng vai "Tôi đi học".</li>
                     <li><strong>Thứ Tư:</strong> Vẽ tranh về hình ảnh mình khi đi học lớp Một.</li>
                     <li><strong>Thứ Năm:</strong> Ca múa chủ đề "Tôi yêu mái trường mầm non".</li>
                     <li><strong>Thứ Sáu:</strong> Tổng kết tuần, nhận xét.</li>
                   </ul>
                   <blockquote>Mục tiêu tuần này là giúp các bé chuẩn bị tâm lý và kiến thức cơ bản cho việc làm quen với môi trường lớp Một.</blockquote>`,
        ngay_dang: '25/07/2025',
        tac_gia: 'Thầy Nguyễn Văn A',
        hinh_anh: '/images/khoi-la-tuan-1.jpg'
      },
      'thuc-don-tuan-1': {
        tieu_de: 'Thực đơn tuần 1 (12/05 - 16/05/2025)',
        noi_dung: `<p>Thực đơn tuần này được xây dựng đảm bảo dinh dưỡng, đa dạng và hấp dẫn cho các bé.</p>
                   <h3>Chi tiết các bữa ăn:</h3>
                   <ul>
                     <li>
                       <strong>Thứ 2:</strong> Cơm, thịt kho, rau luộc, canh bí. Tráng miệng: Chuối.
                       <em>(Giàu protein, vitamin, chất xơ)</em>
                     </li>
                     <li>
                       <strong>Thứ 3:</strong> Mì xào, chả giò, canh chua. Tráng miệng: Cam.
                       <em>(Cung cấp năng lượng, vitamin C)</em>
                     </li>
                     <li>
                       <strong>Thứ 4:</strong> Cơm, cá kho, rau xào, canh cải. Tráng miệng: Sữa chua.
                       <em>(Canxi, DHA cho sự phát triển xương và trí não)</em>
                     </li>
                     <li>
                       <strong>Thứ 5:</strong> Bún bò, rau sống. Tráng miệng: Dưa hấu.
                       <em>(Thanh mát, dễ tiêu hóa)</em>
                     </li>
                     <li>
                       <strong>Thứ 6:</strong> Cơm, gà xào sả ớt, canh bầu. Tráng miệng: Bánh Flan.
                       <em>(Chất đạm từ thịt gia cầm, vitamin từ rau)</em>
                     </li>
                   </ul>
                   <p><strong>Lưu ý:</strong> Thực đơn có thể thay đổi linh hoạt theo mùa và tình hình thực tế. Nhà trường cam kết sử dụng nguyên liệu tươi ngon, đảm bảo vệ sinh an toàn thực phẩm.</p>`,
        ngay_dang: '09/05/2025',
        tac_gia: 'Bếp trưởng',
        hinh_anh: '/images/thuc-don-tuan-1.jpg'
      },
      'meo-giao-tiep': {
        tieu_de: '🗣️ Mẹo giao tiếp hiệu quả với con',
        noi_dung: `<p>Giao tiếp hiệu quả với con là chìa khóa để xây dựng mối quan hệ thân thiết và hiểu con hơn. Dưới đây là một số mẹo giúp ba mẹ dễ dàng kết nối với bé:</p>
                   <h3>1. Lắng nghe tích cực</h3>
                   <p>Khi con nói, hãy dành sự chú ý hoàn toàn cho con. Tránh vừa nghe điện thoại hay xem TV. Nhìn vào mắt con, gật đầu và phản hồi lại để con biết bạn đang lắng nghe.</p>
                   <h3>2. Dùng ngôn ngữ cơ thể</h3>
                   <p>Mỉm cười, cúi người xuống ngang tầm với con, chạm nhẹ tay hoặc ôm con khi cần thiết. Những hành động này giúp con cảm thấy được yêu thương và an toàn.</p>
                   <h3>3. Đặt câu hỏi mở</h3>
                   <p>Thay vì hỏi "Con có vui không?", hãy hỏi "Con thích nhất điều gì hôm nay?". Câu hỏi mở khuyến khích con chia sẻ nhiều hơn.</p>
                   <h3>4. Tránh phán xét</h3>
                   <p>Khi con chia sẻ, hãy tránh phản ứng tiêu cực hoặc la mắng ngay lập tức. Hãy cố gắng hiểu suy nghĩ của con trước.</p>
                   <h3>5. Dành thời gian chất lượng</h3>
                   <p>Dành thời gian chơi cùng con, đọc sách cùng con mỗi ngày. Đây là cơ hội tuyệt vời để giao tiếp và gắn bó.</p>`,
        ngay_dang: '15/05/2025',
        tac_gia: 'Ban tư vấn phụ huynh',
        hinh_anh: '/images/meo-giao-tiep.jpg'
      },
      'khoi-la-tuan-3': {
        tieu_de: 'Khối Lá - Tuần 3: Bác Hồ kính yêu',
        noi_dung: `<p><strong>Chủ đề:</strong> Quê Hương - Thủ đô Bắc Ninh (3 tuần)</p>
                   <p><strong>Tuần 3:</strong> Bác Hồ kính yêu (từ ngày 05/05 đến 09/05/2025)</p>
                   <h3>Chi tiết hoạt động trong tuần:</h3>
                   <ul>
                     <li><strong>Thứ Hai:</strong> Kể chuyện "Bác Hồ và những chú bé không áo". Trò chơi vận động "Ai nhanh hơn".</li>
                     <li><strong>Thứ Ba:</strong> Học hát "Ca ngợi Tổ quốc". Vẽ tranh Bác Hồ.</li>
                     <li><strong>Thứ Tư:</strong> Xem phim hoạt hình ngắn về Bác Hồ. Thảo luận nhóm.</li>
                     <li><strong>Thứ Năm:</strong> Đóng vai "Bác Hồ trong lớp học". Học thuộc thơ về Bác.</li>
                     <li><strong>Thứ Sáu:</strong> Tổng kết tuần. Triển lãm tranh vẽ Bác Hồ.</li>
                   </ul>
                   <blockquote>Tuần này giúp các bé hiểu thêm về Bác Hồ, hình ảnh người cha già của dân tộc, nuôi dưỡng tình yêu đất nước.</blockquote>`,
        ngay_dang: '08/05/2025',
        tac_gia: 'Thầy Nguyễn Văn A',
        hinh_anh: '/images/khoi-la-tuan-3.jpg'
      }
      // --- Thêm dữ liệu cho các ID khác ở đây ---
    };
    // --- HẾT PHẦN MÔ PHỎNG DỮ LIỆU ---

    const baiViet = duLieuBaiViet[baiVietId];

    if (!baiViet) {
      // Trả về trang lỗi 404 nếu không tìm thấy bài viết
      // Giả định bạn có template error.ejs
      return res.status(404).render('error', {
        message: 'Không tìm thấy bài viết.',
        error: { status: 404 },
        activePage: 'trang-chu' // Thêm activePage
      });
    }

    // Render trang chi tiết với dữ liệu bài viết
    // Sử dụng template 'chi-tiet-bai-viet.ejs'
    res.render('chi-tiet-bai-viet', {
      activePage: 'trang-chu', // Hoặc trang phù hợp
      baiViet: baiViet // Truyền dữ liệu bài viết vào template
    });

  } catch (error) {
    console.error("Lỗi khi xử lý yêu cầu chi tiết bài viết:", error);
    res.status(500).send('Đã xảy ra lỗi trên máy chủ.');
  }
});
// --- Kết thúc Route cho trang chi tiết bài viết ---



// Xử lý form
app.post('/register', (req, res) => {
  const { name, phone, email, childName, childAge, message } = req.body;
  const stmt = db.prepare(`INSERT INTO registrations (name, phone, email, childName, childAge, message) VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(name, phone, email, childName, childAge, message);
  stmt.finalize();

  // Gửi email xác nhận (nếu có .env)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Cảm ơn bạn đã đăng ký Sunflower Kids!',
      text: `Xin chào ${name}!\nCảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ trong 24h.\n\nSunflower Kids`
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) console.log("Lỗi gửi email:", err);
    });
  }

  res.send(`
    <div style="text-align:center; padding:100px; font-family:'Comic Sans MS', cursive; background:#fffaf7;">
      <h2 style="color:#27ae60;">🎉 Đăng ký thành công!</h2>
      <p>Cảm ơn bạn, <strong>${name}</strong>! Chúng tôi sẽ liên hệ lại sớm.</p>
      <a href="/tuyen-sinh" style="color:#e67e22; text-decoration:none; font-weight:bold;">← Quay lại</a>
    </div>
  `);
});

// Admin: Xem danh sách
app.get('/admin', (req, res) => {
  db.all(`SELECT * FROM registrations ORDER BY createdAt DESC`, (err, rows) => {
    if (err) return res.send("Lỗi");
    let html = `
      <div style="padding:30px; font-family:Arial;">
        <h1 style="color:#d35400;">📋 Danh sách đăng ký</h1>
        <a href="/" style="color:#3498db; text-decoration:none;">← Trang chủ</a>
        <table border="1" cellpadding="10" style="width:100%; margin-top:20px; border-collapse:collapse;">
          <tr style="background:#f8f9fa;">
            <th>ID</th><th>Phụ huynh</th><th>SĐT</th><th>Email</th><th>Tên bé</th><th>Tuổi</th><th>Thời gian</th>
          </tr>
    `;
    rows.forEach(r => {
      html += `<tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.phone}</td>
        <td>${r.email || ''}</td>
        <td>${r.childName}</td>
        <td>${r.childAge}</td>
        <td>${r.createdAt}</td>
      </tr>`;
    });
    html += `</table></div>`;
    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📌 Truy cập:`);
  console.log(`   • http://localhost:${PORT}`);
  console.log(`   • http://localhost:${PORT}/tuyen-sinh`);
  console.log(`   • http://localhost:${PORT}/admin`);
  console.log(`\n💡 Dừng server: Nhấn Ctrl + C\n`);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ✉️ Xử lý form Liên hệ
app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  // 1. Gửi mail đến bạn (quản trị viên)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Mail gửi đến bạn
    const mailToAdmin = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `📩 Liên hệ mới từ ${name}`,
      text: `
        Họ tên: ${name}
        Email: ${email}
        SĐT: ${phone || 'Không có'}
        Tin nhắn: ${message}
        
        Thời gian: ${new Date().toLocaleString()}
      `
    };

    // Mail tự động trả lời (auto-reply)
    const mailToUser = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Cảm ơn bạn đã liên hệ với Sunflower Kids!',
      html: `
        <h2>Xin chào ${name}!</h2>
        <p>Cảm ơn bạn đã liên hệ với <strong>Sunflower Kids</strong>.</p>
        <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng <strong>24 giờ</strong>.</p>
        <p>Nếu cần gấp, vui lòng gọi: <strong>0901 234 567</strong></p>
        <p>Trân trọng,<br><strong>Đội ngũ Sunflower Kids</strong></p>
      `
    };

    // Gửi cả 2 email
    transporter.sendMail(mailToAdmin, (err, info) => {
      if (err) console.log("Lỗi gửi mail đến admin:", err);
      else console.log("Mail đến admin đã gửi:", info.response);
    });

    transporter.sendMail(mailToUser, (err, info) => {
      if (err) console.log("Lỗi tự động trả lời:", err);
      else console.log("Tự động trả lời đã gửi:", info.response);
    });
  }

  // Trả về trang cảm ơn
  res.send(`
    <div style="text-align: center; padding: 100px; font-family: 'Comic Sans MS', cursive;">
      <h2 style="color: #27ae60;">✅ Gửi thành công!</h2>
      <p>Cảm ơn bạn, <strong>${name}</strong>! Chúng tôi đã nhận được tin nhắn.</p>
      <p>Một email xác nhận đã được gửi đến <strong>${email}</strong>.</p>
      <a href="/lien-he" style="color: #e67e22; text-decoration: none; font-weight: bold;">← Gửi thêm tin nhắn</a>
    </div>
  `);
});


// 🔢 API: Lấy số liệu thống kê chuyên nghiệp
app.get('/api/stats', (req, res) => {
  const data = {};

  // 1. Tổng học sinh
  db.get(`SELECT COUNT(*) as count FROM students`, (err, row) => {
    if (err) return res.status(500).send("Lỗi database");
    data.totalStudents = row.count;

    // 2. Học sinh theo độ tuổi
    db.all(`SELECT ageGroup, COUNT(*) as count FROM students GROUP BY ageGroup`, (err, rows) => {
      if (err) return res.status(500).send("Lỗi database");
      data.ageGroups = rows.map(r => ({ label: r.ageGroup, value: r.count }));

      // 3. Tình trạng học tập
      db.all(`SELECT status, COUNT(*) as count FROM students GROUP BY status`, (err, rows) => {
        if (err) return res.status(500).send("Lỗi database");
        data.studentStatus = rows.map(r => ({ label: r.status, value: r.count }));

        // 4. Số lớp học
        db.get(`SELECT COUNT(*) as count FROM classes`, (err, row) => {
          if (err) return res.status(500).send("Lỗi database");
          data.totalClasses = row.count;

          // 5. Số giáo viên
          db.get(`SELECT COUNT(*) as count FROM teachers`, (err, row) => {
            if (err) return res.status(500).send("Lỗi database");
            data.totalTeachers = row.count;

            // 6. Tỷ lệ giáo viên / học sinh
            data.ratio = data.totalTeachers > 0 
              ? (data.totalStudents / data.totalTeachers).toFixed(1)
              : "0";

            // Gửi dữ liệu về frontend
            res.json(data);
          });
        });
      });
    });
  });
});