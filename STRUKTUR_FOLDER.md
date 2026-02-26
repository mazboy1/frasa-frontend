# 📁 Struktur Folder Proyek Frasa Frontend

Dokumentasi lengkap struktur dan organisasi folder proyek Frasa Frontend.

## 📋 Daftar Isi
- [Struktur Umum](#struktur-umum)
- [Penjelasan Setiap Folder](#penjelasan-setiap-folder)
- [File Konfigurasi](#file-konfigurasi)

---

## 🏗️ Struktur Umum

```
frasa-frontend/
├── public/                 # File statis publik
├── src/                    # Source code utama
├── index.html              # File HTML utama
├── package.json            # Konfigurasi npm dependencies
├── vite.config.js          # Konfigurasi Vite
├── tailwind.config.js      # Konfigurasi Tailwind CSS
├── postcss.config.js       # Konfigurasi PostCSS
├── vercel.json             # Konfigurasi Vercel deployment
└── README.md               # Dokumentasi proyek
```

---

## 📂 Penjelasan Setiap Folder

### 📌 `/public`
Folder untuk file statis yang tidak diproses bundle oleh Vite.
```
public/
└── data.json               # Data statis atau initial data
```

### 📌 `/src`
Folder utama untuk semua source code aplikasi React.

#### **`/src/assets`**
Folder untuk menyimpan semua file aset (gambar, ikon, dll).
```
src/assets/
├── dashboard/              # Gambar untuk halaman dashboard
├── Error/                  # Gambar untuk halaman error
├── gallary/                # Gambar untuk gallery
├── home/                   # Gambar untuk halaman home
└── user/                   # Gambar untuk user-related pages
```

#### **`/src/components`**
Folder untuk React components yang dapat digunakan ulang.
```
src/components/
├── DebugAuth.jsx           # Component untuk debug auth
├── DebugRole.jsx           # Component untuk debug role
├── ErrorBoundary.jsx       # Error Boundary component
├── PrivateRoute.jsx        # Protected route component
├── SectioniTitle.jsx       # Section title component
├── Spinner.jsx             # Loading spinner component
├── headers/
│   └── NavBar.jsx          # Navigation bar component
└── Social/
    └── GoogleLogin.jsx     # Google login button component
```

#### **`/src/config`**
Folder untuk file konfigurasi aplikasi.
```
src/config/
└── firebase.init.js        # Inisialisasi Firebase
```

#### **`/src/hooks`**
Folder untuk custom React hooks.
```
src/hooks/
├── useAuth.jsx             # Hook untuk autentikasi
├── useAxiosFetch.jsx       # Hook untuk fetch dengan axios
├── useAxiosSecure.jsx      # Hook untuk axios dengan interceptor
├── useScroll.jsx           # Hook untuk scroll detection
└── useUser.jsx             # Hook untuk data user
```

#### **`/src/layout`**
Folder untuk layout components (layout utama aplikasi).
```
src/layout/
├── DashboardLayout.jsx     # Layout untuk dashboard
└── MainLayout.jsx          # Layout utama aplikasi
```

#### **`/src/pages`**
Folder untuk halaman-halaman aplikasi, terstruktur berdasarkan fitur.

**`/src/pages/Classes`**
```
src/pages/Classes/
├── Classes.jsx             # Halaman daftar semua kelas
└── SingleClass.jsx         # Halaman detail satu kelas
```

**`/src/pages/Dashboard`**
Dashboard dengan sub-role (Admin, Instructor, Student).

```
src/pages/Dashboard/
├── Dashboard.jsx           # Halaman utama dashboard
├── Admin/                  # Dashboard admin
│   ├── AdminHome.jsx       # Home admin
│   ├── AdminStats.jsx      # Statistik admin
│   ├── FeedbackForm.jsx    # Form feedback
│   ├── ManageClasses.jsx   # Kelola kelas
│   ├── ManageUsers.jsx     # Kelola user
│   └── UpdateUser.jsx      # Update data user
├── Instructor/             # Dashboard instructor
│   ├── AddClass.jsx        # Tambah kelas baru
│   ├── ApprovedCourse.jsx  # Kelas yang disetujui
│   ├── InstructorCP.jsx    # Control panel instructor
│   ├── MyClasses.jsx       # Kelas saya
│   ├── PendingCourse.jsx   # Kelas menunggu approval
│   └── UpdateClass.jsx     # Update data kelas
└── Student/                # Dashboard student
    ├── StudentCP.jsx       # Control panel student
    ├── SelectedClass.jsx   # Kelas yang dipilih
    ├── Apply/
    │   └── AsInstructor.jsx# Apply menjadi instructor
    ├── Enroll/
    │   ├── CoursesStudy.jsx# Kursus yang sedang dipelajari
    │   └── EnrolledClasses.jsx # Kelas yang sudah didaftar
    └── Payment/
        ├── Payment.jsx     # Halaman pembayaran
        ├── Payment.css     # Style pembayaran
        ├── CheckoutPayment.jsx # Checkout payment
        └── History/
            └── MyPaymentHistory.jsx # Riwayat pembayaran
```

**`/src/pages/Home`**
```
src/pages/Home/
├── Home.jsx                # Halaman utama
├── Footer/
│   └── Footer.jsx          # Footer component
├── Gallery/
│   └── Gallery.jsx         # Gallery halaman home
├── Hero/
│   ├── Hero.jsx            # Hero section
│   ├── Hero2.jsx           # Hero section variant 2
│   └── HeroContainer.jsx   # Container hero
└── PopularClasses/
    ├── Card.jsx            # Card component untuk kelas
    └── PopularClasses.jsx  # Section kelas populer
    └── PopularTeacher/
        └── PopularTeacher.jsx # Section guru populer
```

**`/src/pages/Instructors`**
```
src/pages/Instructors/
└── Instructors.jsx         # Halaman daftar semua instructor
```

**`/src/pages/User`**
```
src/pages/User/
├── Login.jsx               # Halaman login
└── Register.jsx            # Halaman registrasi
```

#### **`/src/routes`**
Folder untuk routing configuration.
```
src/routes/
├── DashboardNavigate.jsx   # Navigation routing untuk dashboard
└── router.jsx              # Konfigurasi routing utama
```

#### **`/src/utilities`**
Folder untuk utility functions dan helper functions.
```
src/utilities/
├── debugTools.js           # Tools untuk debugging
├── safeData.js             # Utility untuk safe data handling
└── providers/
    └── AuthProvider.jsx    # Context provider untuk authentication
```

#### **`/src/index.css`**
File CSS global untuk styling seluruh aplikasi.

#### **`/src/main.jsx`**
File entry point React aplikasi.

---

## ⚙️ File Konfigurasi

| File | Fungsi |
|------|--------|
| `package.json` | Mendeskripsikan project metadata dan dependencies |
| `vite.config.js` | Konfigurasi Vite build tool |
| `tailwind.config.js` | Konfigurasi Tailwind CSS |
| `postcss.config.js` | Konfigurasi PostCSS untuk processing CSS |
| `vercel.json` | Konfigurasi untuk deployment di Vercel |
| `index.html` | Template HTML entry point |

---

## 🎯 Ringkasan Hirarki

```
Root (frasa-frontend)
│
├── 📁 public/              → File statis
├── 📁 src/                 → Source code utama
│   ├── 📁 assets/          → Gambar dan media
│   ├── 📁 components/      → Reusable components
│   ├── 📁 config/          → Konfigurasi aplikasi
│   ├── 📁 hooks/           → Custom React hooks
│   ├── 📁 layout/          → Layout components
│   ├── 📁 pages/           → Halaman aplikasi
│   │   ├── Classes/
│   │   ├── Dashboard/      → Admin, Instructor, Student
│   │   ├── Home/           → With Footer, Gallery, Hero, etc
│   │   ├── Instructors/
│   │   └── User/
│   ├── 📁 routes/          → Routing config
│   ├── 📁 utilities/       → Helper functions & providers
│   ├── 📄 index.css        → Global styles
│   └── 📄 main.jsx         → Entry point
│
├── 📄 Configuration files  → .js, .json files
└── 📄 Documentation       → README, etc
```

---

## 💡 Catatan Penting

1. **Components**: Komponen yang dapat digunakan di berbagai halaman disimpan di folder `/src/components`
2. **Pages**: Setiap halaman/fitur utama memiliki foldernya sendiri untuk organisasi yang baik
3. **Hooks**: Custom hooks terpusat di satu folder untuk reusability
4. **Utilities**: Fungsi-fungsi helper dan providers untuk shared logic
5. **Assets**: Diorganisir berdasarkan section/fitur untuk kemudahan maintenance

---

**Last Updated**: 27 Februari 2026
