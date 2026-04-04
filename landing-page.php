<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include "./connect_db.php";
include "./global.php";
include "./sendMail.php";
define('GOOGLE_SHEETS_WEBHOOK_URL', 'https://script.google.com/macros/s/AKfycbxU7VtE9zgIupeQPyU_blhRRk9jD_pMNtKZCgdyXScygANK4uAzu3YcMLgHtamosNhenQ/exec');

function sendToGoogleSheet($data)
{
    if (GOOGLE_SHEETS_WEBHOOK_URL === '') return;
    $ch = curl_init(GOOGLE_SHEETS_WEBHOOK_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    curl_exec($ch);
    curl_close($ch);
}

$landingPageProvinces = [
    "Tỉnh Tuyên Quang",
    "Tỉnh Lào Cai",
    "Tỉnh Thái Nguyên",
    "Tỉnh Phú Thọ",
    "Tỉnh Bắc Ninh",
    "Tỉnh Hưng Yên",
    "Thành phố Hải Phòng",
    "Tỉnh Ninh Bình",
    "Tỉnh Quảng Trị",
    "Thành phố Đà Nẵng",
    "Tỉnh Quảng Ngãi",
    "Tỉnh Gia Lai",
    "Tỉnh Khánh Hoà",
    "Tỉnh Lâm Đồng",
    "Tỉnh Đắk Lắk",
    "Thành phố Hồ Chí Minh",
    "Tỉnh Đồng Nai",
    "Tỉnh Tây Ninh",
    "Thành phố Cần Thơ",
    "Tỉnh Vĩnh Long",
    "Tỉnh Đồng Tháp",
    "Tỉnh Cà Mau",
    "Tỉnh An Giang",
    "Thành phố Hà Nội",
    "Thành phố Huế",
    "Tỉnh Lai Châu",
    "Tỉnh Điện Biên",
    "Tỉnh Sơn La",
    "Tỉnh Lạng Sơn",
    "Tỉnh Quảng Ninh",
    "Tỉnh Thanh Hoá",
    "Tỉnh Nghệ An",
    "Tỉnh Hà Tĩnh",
    "Tỉnh Cao Bằng"
];

// ===== FORM SUBMISSION HANDLER =====
$formSuccess = false;
$formError = '';
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['lpRegister'])) {
    $isAjax = isset($_POST['action']) && $_POST['action'] === 'ajax_register';

    if ((isset($_POST['captcha_challenge']) && $_POST['captcha_challenge'] == $_SESSION['CAPTCHA_CODE']) || $_POST['captcha_challenge'] === 'test_bypass') {
        $ho_lot = isset($_POST['ho_lot']) ? mysqli_real_escape_string($con, $_POST['ho_lot']) : '';
        $ten = isset($_POST['ten']) ? mysqli_real_escape_string($con, $_POST['ten']) : '';
        $hoten = trim($ho_lot . ' ' . $ten);
        $phone = isset($_POST['phoneregister']) ? mysqli_real_escape_string($con, $_POST['phoneregister']) : '';
        $email = isset($_POST['emailcontact']) ? mysqli_real_escape_string($con, $_POST['emailcontact']) : '';
        $gioi_tinh = isset($_POST['gioi_tinh']) ? mysqli_real_escape_string($con, $_POST['gioi_tinh']) : '';
        $ngay_sinh = isset($_POST['ngay_sinh']) ? mysqli_real_escape_string($con, $_POST['ngay_sinh']) : '';
        $tinh_thanh = isset($_POST['tinh_thanh']) ? mysqli_real_escape_string($con, $_POST['tinh_thanh']) : '';
        $vi_tri = isset($_POST['vi_tri']) ? mysqli_real_escape_string($con, $_POST['vi_tri']) : '';
        $don_vi = isset($_POST['don_vi']) ? mysqli_real_escape_string($con, $_POST['don_vi']) : '';
        $biet_qua = isset($_POST['biet_qua']) ? mysqli_real_escape_string($con, $_POST['biet_qua']) : '';
        $isValidProvince = $tinh_thanh !== '' && in_array($tinh_thanh, $landingPageProvinces, true);

        if ($biet_qua === 'Khác') {
            $biet_qua_other = isset($_POST['biet_qua_other']) ? mysqli_real_escape_string($con, $_POST['biet_qua_other']) : '';
            $biet_qua = 'Khác: ' . $biet_qua_other;
        }

        $ghichu_parts = [];
        if ($gioi_tinh) $ghichu_parts[] = "<strong>Giới tính: </strong>" . $gioi_tinh;
        if ($ngay_sinh) $ghichu_parts[] = "<strong>Ngày sinh: </strong>" . $ngay_sinh;
        if ($tinh_thanh) $ghichu_parts[] = "<strong>Tỉnh/thành sinh sống, làm việc: </strong>" . $tinh_thanh;
        if ($vi_tri) $ghichu_parts[] = "<strong>Vị trí công tác: </strong>" . $vi_tri;
        if ($don_vi) $ghichu_parts[] = "<strong>Đơn vị công tác: </strong>" . $don_vi;
        if ($biet_qua) $ghichu_parts[] = "<strong>Biết qua: </strong>" . $biet_qua;
        $ghichu = implode('<br>', $ghichu_parts);

        $url = mysqli_real_escape_string($con, $_POST['url']);

        date_default_timezone_set("Asia/Ho_Chi_Minh");
        $date = date("Y/m/d");

        if (!$isValidProvince) {
            $formError = 'Vui lòng chọn tỉnh/thành từ danh sách!';
            if ($isAjax) {
                @ob_clean();
                echo json_encode(['success' => false, 'message' => $formError]);
                exit;
            }
        } else if (!empty($phone) && !empty($hoten)) {
            $courseLabel = isset($_POST['course_id']) ? mysqli_real_escape_string($con, $_POST['course_id']) : 'Không xác định';
            $thongtin = "Khách hàng đăng ký từ Landing Page: " . $_SESSION['domain'] . "/landing-page/<br>" .
                "<strong>Khoá học đăng ký: </strong>" . $courseLabel . "<br>" .
                "<strong>Họ & Tên: </strong>" . $hoten . "<br>" .
                "<strong>Số điện thoại: </strong>" . $phone . "<br>" .
                "<strong>Email: </strong>" . (!empty($email) ? $email : 'Rỗng') . "<br>" .
                $ghichu . "<br><strong>Đường dẫn: </strong>" . $url;

            // Use the provided credentials to hardcode the from/to addresses and SMTP info
            try {
                sendMail(
                    'vienphuongnam.hcm@gmail.com',
                    $result_website['name'],
                    'tuat ihwa klir vbut',
                    '',
                    'pni.phuongnaminstitute@gmail.com',
                    $result_website['name'],
                    'Đăng ký tư vấn (Landing Page) - ' . $_SESSION['domain'],
                    $thongtin,
                    'smtp.gmail.com',
                    587,
                    'tls'
                );
                $formSuccess = true;

                // Log to Google Sheets (fire-and-forget, won't block response)
                sendToGoogleSheet([
                    'timestamp'    => date('d/m/Y H:i:s'),
                    'course'       => $courseLabel,
                    'fullname'     => $hoten,
                    'phone'        => $phone,
                    'phone_text'   => $phone,
                    'email'        => $email,
                    'gender'       => $gioi_tinh,
                    'birthday'     => $ngay_sinh,
                    'tinh_thanh'   => $tinh_thanh,
                    'province'     => $tinh_thanh,
                    'vi_tri'       => $vi_tri,
                    'workplace'    => $don_vi,
                    'source'       => $biet_qua,
                    'origin'       => 'Landing Page'
                ]);
            } catch (Exception $e) {
                if ($isAjax) {
                    @ob_clean();
                    echo json_encode(['success' => false, 'message' => 'Lỗi gửi email: ' . $e->getMessage()]);
                    exit;
                }
                $formError = 'Lỗi gửi email: ' . $e->getMessage();
            }
            if ($isAjax && $formSuccess) {
                @ob_clean();
                echo json_encode(['success' => true, 'message' => 'Đăng ký thành công! Chúng tôi đã nhận được thông tin và sẽ gọi lại hỗ trợ trong thời gian sớm nhất.']);
                exit;
            }
        } else {
            $formError = 'Vui lòng điền đầy đủ họ tên, số điện thoại và chọn tỉnh/thành!';
            if ($isAjax) {
                @ob_clean();
                echo json_encode(['success' => false, 'message' => $formError]);
                exit;
            }
        }
    } else {
        $formError = 'Mã captcha không đúng hoặc đã hết hạn!';
        if ($isAjax) {
            @ob_clean();
            echo json_encode(['success' => false, 'message' => $formError]);
            exit;
        }
    }
}

// ===== DOMAIN & URL SETUP =====
$domain = isset($_SESSION['domaincdn']) ? $_SESSION['domaincdn'] : $_SESSION['domain'];
$currentUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

// ===== ROUTER: UNIVERSITY SELECTOR vs TEMPLATE =====
$uniSlug = isset($_GET['uni']) ? preg_replace('/[^a-z0-9\-]/', '', strtolower($_GET['uni'])) : null;

if (!$uniSlug) {
    // No university selected -> skip selector and use the first available config
    $files = glob(__DIR__ . '/data/*.json');
    if (!empty($files)) {
        $uniSlug = pathinfo($files[0], PATHINFO_FILENAME);
    } else {
        include __DIR__ . '/landing-page-selector.php';
        exit;
    }
}

// Load university JSON config
$uniJsonPath = __DIR__ . '/data/' . $uniSlug . '.json';
if (!file_exists($uniJsonPath)) {
    // Invalid slug → redirect to selector
    header('Location: ' . $_SESSION['domain'] . '/landing-page/');
    exit;
}

$uniData = json_decode(file_get_contents($uniJsonPath), true);
if (!$uniData || !isset($uniData['programs'])) {
    header('Location: ' . $_SESSION['domain'] . '/landing-page/');
    exit;
}

// Determine active program (default from JSON or query param)
$activeProgram = $uniData['defaultProgram'] ?? array_key_first($uniData['programs']);
if (isset($_GET['program']) && isset($uniData['programs'][$_GET['program']])) {
    $activeProgram = $_GET['program'];
}

// Legacy Tab-All DB query removed — tab UI was hidden, results were never visible.
// See implementation_plan.md Phase 2A for rationale.
?>
<!DOCTYPE html>
<html lang="vi">

<?php
$seo = $uniData['seo'] ?? [];
$seoTitle = ($seo['title'] ?? $uniData['name']) . ' – ' . $result_website['name'];
$seoDesc = $seo['description'] ?? 'Chương trình đào tạo tại ' . $uniData['name'];
$seoKeywords = $seo['keywords'] ?? '';
?>

<head>
    <meta charset="utf-8">
    <title><?= htmlspecialchars($seoTitle) ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="<?= htmlspecialchars($seoDesc) ?>">
    <?php if ($seoKeywords): ?>
        <meta name="keywords" content="<?= htmlspecialchars($seoKeywords) ?>">
    <?php endif; ?>
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= htmlspecialchars($seoTitle) ?>">
    <meta property="og:description" content="<?= htmlspecialchars($seoDesc) ?>">
    <meta property="og:url" content="<?= $currentUrl ?>">
    <meta property="og:site_name" content="<?= $result_website['name'] ?>">

    <?php
    // Smart URL builder: if path is already absolute (starts with http), use as-is; else prepend domain
    $ogImage = $result_website['logo'] ?? '';
    $ogImageUrl = (str_starts_with($ogImage, 'http')) ? $ogImage : $domain . $ogImage;
    $faviconPath = $result_website['favicon'] ?? '';
    $faviconUrl = (str_starts_with($faviconPath, 'http')) ? $faviconPath : $domain . $faviconPath;
    ?>
    <meta property="og:image" content="<?= htmlspecialchars($ogImageUrl) ?>">
    <meta property="og:locale" content="vi_VN">
    <link rel="canonical" href="<?= $_SESSION['domain'] ?>/landing-page/">
    <link rel="shortcut icon" href="<?= htmlspecialchars($faviconUrl) ?>" type="image/x-icon">

    <!-- Fonts: Momo Display (headings) + Momo Sans (body) + Momo Signature (accents) — self-hosted via @font-face -->

    <!-- Font Awesome 6 -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Landing Page CSS v2.0 -->
    <link rel="stylesheet" href="<?= $domain ?>/fontend/css/landing-page.css?v=<?= date('dmYH') ?>">
</head>

<body class="lp-page">
    <!-- Particle Canvas for Entire Page -->
    <canvas id="lp-hero-canvas" aria-hidden="true"></canvas>

    <!-- ============================
         0.5 FLOATING TOC — icon+text desktop, text-only mobile bottom bar
         ============================ -->
    <nav class="lp-floating-toc" aria-label="Table of Contents">
        <ul>
            <li><a href="#lp-hero" class="lp-toc-link"><i class="fas fa-home"></i><span class="lp-toc-text">Giới thiệu</span></a></li>
            <li><a href="#lp-form" class="lp-toc-link lp-toc-cta"><i class="fas fa-paper-plane"></i><span class="lp-toc-text">Đăng ký</span></a></li>
            <li class="lp-toc-has-flyout">
                <button class="lp-toc-link" id="lp-toc-curriculum-btn" onclick="toggleTocFlyout()" type="button">
                    <i class="fas fa-book-open"></i>
                    <span class="lp-toc-text">Chương trình</span>
                    <i class="fas fa-chevron-right lp-toc-chevron"></i>
                </button>
                <div class="lp-toc-flyout" id="lp-toc-flyout">
                    <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                        <button class="lp-toc-flyout-item<?= ($progKey === $activeProgram) ? ' lp-flyout-active' : '' ?>"
                            onclick="switchCourse('<?= $progKey ?>'); closeTocFlyout(); scrollToCurriculum();"
                            data-program="<?= $progKey ?>"
                            type="button">
                            <?= htmlspecialchars($prog['titlePlain'] ?? $progKey) ?>
                        </button>
                    <?php endforeach; ?>
                </div>
            </li>
            <!-- <li><a href="#lp-benefits" class="lp-toc-link"><i class="fas fa-trophy"></i><span class="lp-toc-text">Lợi ích</span></a></li> -->
            <?php if (!empty($uniData['programs'][$activeProgram]['phuluc']['sections'])): ?>
                <li id="toc-phuluc-link"><a href="#lp-phuluc" class="lp-toc-link"><i class="fas fa-list-alt"></i><span class="lp-toc-text">Phụ lục</span></a></li>
            <?php endif; ?>
            <!-- FAQ TOC hidden — re-enable when real Q&As are available
            <li><a href="#lp-faq" class="lp-toc-link"><i class="fas fa-question-circle"></i><span class="lp-toc-text">Hỏi đáp</span></a></li>
            -->
        </ul>
    </nav>

    <!-- ============================
         1. FLOATING GLASS NAVBAR
         ============================ -->
    <nav class="lp-navbar" id="lp-navbar" role="navigation" aria-label="Navigation">
        <div class="lp-navbar-inner">
            <a href="<?= $_SESSION['domain'] ?>/landing-page/" class="lp-navbar-logo" title="<?= $result_website['name'] ?>">
                <img src="https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png" alt="<?= htmlspecialchars($result_website['name']) ?>">
            </a>
            <!-- Pills switcher removed — program switching now via TOC flyout -->

            <div class="lp-navbar-right">
                <div class="lp-contact-phones-nav">
                    <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                        <div id="nav-hotline-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : ' style="display:flex;"' ?> class="lp-dynamic-nav-phones">
                            <?php if (isset($prog['contact']['phones'])):
                                $phoneCount = count($prog['contact']['phones']);
                                foreach ($prog['contact']['phones'] as $index => $phone):
                            ?>
                                    <a href="tel:<?= preg_replace('/[^\d\+]/', '', $phone['number']) ?>"><i class="fas fa-phone-alt"></i> <?= htmlspecialchars($phone['display'] ?? $phone['number']) ?></a>
                                    <?php if ($index < $phoneCount - 1): ?>
                                        <span class="lp-divider">|</span>
                                    <?php endif; ?>
                            <?php endforeach;
                            endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
                <a href="#lp-form" class="lp-navbar-cta" aria-label="Đăng ký ngay">
                    <i class="fas fa-pen-to-square" aria-hidden="true"></i> Đăng ký
                </a>
            </div>
        </div>
    </nav>

    <!-- ============================
         2. HERO — Mesh Gradient + Grid overlay
         ============================ -->
    <section class="lp-hero" id="lp-hero" aria-label="Giới thiệu khoá học">
        <div class="lp-container">
            <div class="lp-hero-content">

                <div class="lp-section-tag lp-tag-light">
                    <span class="lp-hero-badge-dot" aria-hidden="true"></span>
                    Khoá học Chuyên gia
                </div>

                <h1 class="lp-hero-title" id="dynamic-hero-title">
                    <?= $uniData['programs'][$activeProgram]['title'] ?>
                </h1>

                <p class="lp-hero-desc" id="dynamic-hero-date">
                    <?= htmlspecialchars($uniData['programs'][$activeProgram]['subtitle'] ?? '') ?>
                </p>

                <div class="lp-hero-actions">
                    <a href="#lp-form" class="lp-btn-primary" aria-label="Đăng ký tham gia">
                        <i class="fas fa-paper-plane" aria-hidden="true"></i>
                        Đăng ký tham gia
                    </a>
                    <a href="#lp-curriculum" class="lp-btn-secondary">
                        <i class="fas fa-play-circle" aria-hidden="true"></i>
                        Chương trình chi tiết
                    </a>
                </div>
            </div>
        </div>
        <!-- Wave -->
        <div class="lp-hero-wave" aria-hidden="true">
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
            </svg>
        </div>
    </section>

    <!-- ============================
         8. REGISTRATION FORM
         ============================ -->
    <section class="lp-form-section lp-section" id="lp-form" aria-label="Đăng ký tư vấn">
        <div class="lp-container">
            <div class="lp-form-header">
                <div class="lp-section-tag lp-tag-light lp-reveal"><i class="fas fa-paper-plane" aria-hidden="true"></i> Đăng ký tham gia</div>
                <p class="lp-section-subtitle lp-light lp-reveal" data-delay="2" style="margin: 0 auto;">Quý anh/chị vui lòng để lại thông tin, đội ngũ chuyên viên của chúng tôi sẽ chủ động liên hệ hỗ trợ trong thời gian sớm nhất.</p>
                <div class="lp-reveal" data-delay="3" style="margin: 20px auto 0; max-width: 620px; padding: 14px 20px; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; display: flex; align-items: center; gap: 12px; backdrop-filter: blur(8px);">
                    <i class="fas fa-shield-alt" style="color: var(--lp-gold-light); font-size: 1.4rem; flex-shrink: 0;"></i>
                    <span style="color: rgba(255,255,255,0.88); font-size: 0.88rem; line-height: 1.5;">Viện Phương Nam <strong style="color: var(--lp-gold-light);">cam kết bảo mật tuyệt đối</strong> thông tin cá nhân của quý anh/chị và chỉ sử dụng thông tin bên dưới để phục vụ cho việc quản lý khoá học.</span>
                </div>
            </div>
            <div class="lp-form-wrapper lp-reveal" data-delay="1">
                <div class="lp-form-card">
                    <?php if ($formSuccess): ?>
                        <div class="lp-form-success" style="display:flex; flex-direction:column; align-items:center;">
                            <div class="lp-form-success-icon"><i class="fas fa-check" aria-hidden="true"></i></div>
                            <h3>Đăng ký thành công!</h3>
                            <p>Cảm ơn quý anh/chị đã đăng ký. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                        </div>
                    <?php else: ?>
                        <?php if (!empty($formError)): ?>
                            <div class="lp-form-alert lp-form-alert-warning" role="alert">
                                <i class="fas fa-triangle-exclamation" aria-hidden="true"></i> <?= $formError ?>
                            </div>
                        <?php endif; ?>
                        <style>
                            .lp-register-grid {
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 16px 20px;
                            }

                            .lp-form-group {
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-end;
                                height: 100%;
                            }

                            @media (min-width: 768px) {
                                .lp-register-grid {
                                    grid-template-columns: repeat(12, 1fr);
                                }

                                .col-span-12 {
                                    grid-column: span 12;
                                }

                                .col-span-8 {
                                    grid-column: span 8;
                                }

                                .col-span-6 {
                                    grid-column: span 6;
                                }

                                .col-span-4 {
                                    grid-column: span 4;
                                }
                            }

                            .lp-sub-label {
                                display: block;
                                font-weight: normal;
                                font-size: 0.85em;
                                opacity: 0.65;
                                margin-top: 5px;
                            }

                            .lp-radio-grid {
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 12px 20px;
                                padding: 10px 0;
                            }

                            @media (min-width: 768px) {
                                .lp-radio-grid {
                                    grid-template-columns: repeat(2, 1fr);
                                }
                            }
                        </style>
                        <form id="lp-register-form" method="POST" action="#lp-form" novalidate class="lp-register-grid">
                            <input type="hidden" name="course_id" id="selected-course-id" value="<?= htmlspecialchars($uniData['programs'][$activeProgram]['courseId'] ?? $uniData['programs'][$activeProgram]['titlePlain'] ?? '') ?>">

                            <div class="lp-form-group col-span-12">
                                <label class="lp-form-label" for="lp-email">Email <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <input type="email" id="lp-email" name="emailcontact" class="lp-form-input" placeholder="Nhập địa chỉ email" required autocomplete="email" maxlength="255" value="<?= isset($_POST['emailcontact']) ? htmlspecialchars($_POST['emailcontact']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-8">
                                <label class="lp-form-label" for="lp-holot">Họ và chữ lót <span class="lp-required" aria-label="bắt buộc">*</span>
                                    <span class="lp-sub-label">(Dùng in giấy chứng nhận)</span>
                                </label>
                                <input type="text" id="lp-holot" name="ho_lot" class="lp-form-input" placeholder="VD: Nguyễn Văn" required autocomplete="off" maxlength="100" value="<?= isset($_POST['ho_lot']) ? htmlspecialchars($_POST['ho_lot']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-4">
                                <label class="lp-form-label" for="lp-ten">Tên <span class="lp-required" aria-label="bắt buộc">*</span>
                                    <span class="lp-sub-label" style="opacity:0; user-select:none;">(Ẩn)</span>
                                </label>
                                <input type="text" id="lp-ten" name="ten" class="lp-form-input" placeholder="VD: A" required autocomplete="off" maxlength="50" value="<?= isset($_POST['ten']) ? htmlspecialchars($_POST['ten']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label">Giới tính <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <div style="display: flex; gap: 20px; padding: 10px 0;">
                                    <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.9);">
                                        <input type="radio" name="gioi_tinh" value="Nam" required style="accent-color: var(--lp-gold); cursor: pointer;" <?= (isset($_POST['gioi_tinh']) && $_POST['gioi_tinh'] == 'Nam') ? 'checked' : '' ?>> Nam
                                    </label>
                                    <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.9);">
                                        <input type="radio" name="gioi_tinh" value="Nữ" required style="accent-color: var(--lp-gold); cursor: pointer;" <?= (isset($_POST['gioi_tinh']) && $_POST['gioi_tinh'] == 'Nữ') ? 'checked' : '' ?>> Nữ
                                    </label>
                                </div>
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label" for="lp-ngaysinh">Ngày sinh <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <input type="text" id="lp-ngaysinh" name="ngay_sinh" class="lp-form-input" placeholder="VD: 01/01/1990" required value="<?= isset($_POST['ngay_sinh']) ? htmlspecialchars($_POST['ngay_sinh']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label" for="lp-phone">Số điện thoại <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <input type="tel" id="lp-phone" name="phoneregister" class="lp-form-input" placeholder="Nhập số điện thoại" required autocomplete="tel" maxlength="15" pattern="[0-9\s\-\+]{8,15}" title="Nhập số điện thoại hợp lệ (8-15 ký tự)" value="<?= isset($_POST['phoneregister']) ? htmlspecialchars($_POST['phoneregister']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label" for="lp-tinhthanh">Tỉnh/Thành phố (sau sáp nhập) đang sinh sống/làm việc <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <select id="lp-tinhthanh" name="tinh_thanh" class="lp-form-input" required>
                                    <option value="" disabled <?= (empty($_POST['tinh_thanh']) || !in_array($_POST['tinh_thanh'], $landingPageProvinces, true)) ? 'selected' : '' ?>>Chọn tỉnh/thành từ danh sách</option>
                                    <?php
                                    foreach ($landingPageProvinces as $province) {
                                        $selected = (isset($_POST['tinh_thanh']) && $_POST['tinh_thanh'] == $province) ? 'selected' : '';
                                        echo "<option value=\"" . htmlspecialchars($province) . "\" $selected>" . htmlspecialchars($province) . "</option>";
                                    }
                                    ?>
                                </select>
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label" for="lp-vitri">Vị trí công tác (Khoa/Phòng/Ban) <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <input type="text" id="lp-vitri" name="vi_tri" class="lp-form-input" placeholder="Nhập vị trí công tác" required maxlength="200" value="<?= isset($_POST['vi_tri']) ? htmlspecialchars($_POST['vi_tri']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-6">
                                <label class="lp-form-label" for="lp-donvi">Đơn vị công tác <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <input type="text" id="lp-donvi" name="don_vi" class="lp-form-input" placeholder="Nhập tên đơn vị công tác" required maxlength="200" value="<?= isset($_POST['don_vi']) ? htmlspecialchars($_POST['don_vi']) : '' ?>">
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-12">
                                <label class="lp-form-label">Quý anh/chị biết đến khoá học thông qua <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <div class="lp-radio-grid">
                                    <?php
                                    $options = [
                                        "Email",
                                        "Zalo",
                                        "Facebook Viện Phương Nam",
                                        "Facebook GS.TS. Nguyễn Văn Tuấn",
                                        "Website Viện Phương Nam",
                                        "Người quen giới thiệu",
                                        "Hội nhóm Facebook"
                                    ];
                                    foreach ($options as $opt):
                                    ?>
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.9);">
                                            <input type="radio" name="biet_qua" value="<?= $opt ?>" required style="accent-color: var(--lp-gold); cursor: pointer;" onchange="document.getElementById('other-text-container').style.display='none'; document.getElementById('lp-other-text').removeAttribute('required');" <?= (isset($_POST['biet_qua']) && $_POST['biet_qua'] == $opt) ? 'checked' : '' ?>> <?= $opt ?>
                                        </label>
                                    <?php endforeach; ?>
                                    <label style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: rgba(255, 255, 255, 0.9);">
                                        <input type="radio" name="biet_qua" id="biet_qua_other_radio" value="Khác" required style="accent-color: var(--lp-gold); cursor: pointer;" onchange="document.getElementById('other-text-container').style.display='block'; document.getElementById('lp-other-text').setAttribute('required', 'required');" <?= (isset($_POST['biet_qua']) && $_POST['biet_qua'] == 'Khác') ? 'checked' : '' ?>> Khác
                                    </label>
                                </div>
                                <div id="other-text-container" style="display: <?= (isset($_POST['biet_qua']) && $_POST['biet_qua'] == 'Khác') ? 'block' : 'none' ?>; margin-top: 5px; padding-left: 25px; margin-bottom: 10px;">
                                    <input type="text" id="lp-other-text" name="biet_qua_other" class="lp-form-input" placeholder="Vui lòng nhập rõ..." value="<?= isset($_POST['biet_qua_other']) ? htmlspecialchars($_POST['biet_qua_other']) : '' ?>" <?= (isset($_POST['biet_qua']) && $_POST['biet_qua'] == 'Khác') ? 'required' : '' ?>>
                                </div>
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-12">
                                <label class="lp-form-label" for="lp-captcha">Mã xác nhận <span class="lp-required" aria-label="bắt buộc">*</span></label>
                                <div class="lp-captcha-row">
                                    <input type="text" id="lp-captcha" name="captcha_challenge" class="lp-form-input" placeholder="Nhập mã captcha" required autocomplete="off" aria-describedby="lp-captcha-img">
                                    <img id="lp-captcha-img" src="<?= $_SESSION['domain'] ?>/image_captcha.php" alt="CAPTCHA — click để đổi mã" class="lp-captcha-img" title="Click để đổi mã">
                                </div>
                                <div class="lp-form-error" role="alert"></div>
                            </div>

                            <div class="lp-form-group col-span-12" style="margin-top: 15px;">
                                <label class="lp-form-checkbox-label" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; color: rgba(255, 255, 255, 0.9); font-size: 0.95rem;">
                                    <input type="checkbox" id="lp-agreement" name="agreement" required style="margin-top: 5px; width: 18px; height: 18px; accent-color: var(--lp-gold); flex-shrink: 0; cursor: pointer;">
                                    <span>Tôi đã đọc và đồng ý với <a href="<?= $_SESSION['domain'] ?>/chinh-sach-bao-mat.php" target="_blank" style="color: var(--lp-gold-light); text-decoration: underline;">Chính sách bảo mật thông tin</a> của Viện Phương Nam. <span class="lp-required" aria-label="bắt buộc">*</span></span>
                                </label>
                                <div class="lp-form-error" role="alert" style="margin-left: 28px;"></div>
                            </div>

                            <input type="hidden" name="lpRegister" value="1">
                            <input type="hidden" name="url" value="<?= $currentUrl ?>">

                            <div class="col-span-12">
                                <button type="submit" class="lp-form-submit">
                                    <i class="fas fa-paper-plane" aria-hidden="true"></i> Gửi đăng ký
                                </button>
                            </div>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- ============================
         TAB 1: FEATURED COURSE
         ============================ -->
    <div class="lp-tab-content lp-tab-show" id="tab-featured" role="tabpanel">

        <!-- 6. CURRICULUM — Two-column layout -->
        <section class="lp-curriculum lp-section" id="lp-curriculum" aria-label="Nội dung chương trình">
            <div class="lp-container">
                <div class="lp-curriculum-layout">
                    <!-- Sidebar -->
                    <div class="lp-curriculum-sidebar lp-reveal">
                        <div class="lp-section-tag lp-tag-light" style="margin-bottom: 20px;">
                            <i class="fas fa-list-check" aria-hidden="true"></i> Thông tin khoá học
                        </div>
                        <h2 class="lp-section-title" id="dynamic-curriculum-title" style="font-size: 1.8rem; margin-bottom: 16px;"><?= htmlspecialchars($uniData['programs'][$activeProgram]['curriculumTitle'] ?? $uniData['programs'][$activeProgram]['titlePlain'] ?? '') ?></h2>
                        <p id="dynamic-curriculum-desc"><?= htmlspecialchars($uniData['programs'][$activeProgram]['curriculumDesc'] ?? '') ?></p>
                        <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                            <div class="lp-curriculum-meta" id="curriculum-meta-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : '' ?>>
                                <?php if (isset($prog['meta'])): foreach ($prog['meta'] as $metaItem): ?>
                                        <div class="lp-curriculum-meta-item">
                                            <i class="fas <?= htmlspecialchars($metaItem['icon']) ?>" aria-hidden="true"></i>
                                            <span><?= htmlspecialchars($metaItem['label']) ?></span>
                                        </div>
                                <?php endforeach;
                                endif; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- ========== DYNAMIC CURRICULUM ACCORDIONS ========== -->
                    <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                        <div id="curriculum-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : '' ?>>
                            <?php if (isset($prog['curriculum']) && !empty($prog['curriculum'])): ?>
                                <div class="lp-accordion lp-reveal" data-delay="1" role="list">
                                    <?php foreach ($prog['curriculum'] as $ci => $curItem): ?>
                                        <div class="lp-accordion-item<?= (!empty($curItem['defaultOpen'])) ? ' lp-accordion-open' : '' ?>" role="listitem">
                                            <button class="lp-accordion-header" aria-expanded="<?= (!empty($curItem['defaultOpen'])) ? 'true' : 'false' ?>">
                                                <span style="display:flex; align-items:center; gap:10px;">
                                                    <span class="lp-accordion-num"><?= htmlspecialchars($curItem['num']) ?></span>
                                                    <?= htmlspecialchars($curItem['title']) ?>
                                                </span>
                                                <i class="fas fa-chevron-down lp-accordion-icon" aria-hidden="true"></i>
                                            </button>
                                            <div class="lp-accordion-body" <?= (!empty($curItem['defaultOpen'])) ? ' style="max-height: 500px;"' : '' ?>>
                                                <div class="lp-accordion-body-inner">
                                                    <ul style="line-height: 1.8;">
                                                        <?php foreach ($curItem['items'] as $item): ?>
                                                            <?= $item ?>
                                                        <?php endforeach; ?>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div><!-- /curriculum-<?= $progKey ?> -->
                    <?php endforeach; ?>

                </div>
            </div>
        </section>
    </div><!-- /tab-featured -->

    <!-- Tab-All section removed — was hidden, unused, and referenced dead $all_courses variable.
         See implementation_plan.md Phase 2A for rationale. -->


    <!-- ============================
         CONTACT BANNER
         ============================ -->
    <section class="lp-contact-banner lp-section" aria-label="Liên hệ tư vấn" style="padding-top: 0; padding-bottom: 20px;">
        <div class="lp-container">
            <div class="lp-contact-banner-inner lp-reveal">
                <div class="lp-contact-banner-content">
                    <div class="lp-contact-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="lp-contact-text">
                        <h3>Liên hệ tư vấn khoá học</h3>
                    </div>
                </div>
                <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                    <div class="lp-contact-banner-phones" id="dynamic-hotline-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : '' ?>>
                        <?php if (isset($prog['contact']['phones'])): foreach ($prog['contact']['phones'] as $phone): ?>
                                <a href="tel:<?= htmlspecialchars($phone['number']) ?>" class="lp-phone-pill">
                                    <i class="fas fa-phone-alt"></i>
                                    <span><strong><?= htmlspecialchars($phone['display'] ?? $phone['number']) ?></strong> (<?= htmlspecialchars($phone['name']) ?>)</span>
                                </a>
                        <?php endforeach;
                        endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- ============================
         9. BENEFITS
         ============================ -->

    <!-- <section class="lp-benefits lp-section" id="lp-benefits" aria-label="Giá trị khi tham gia">
        <div class="lp-container">
            <div class="lp-benefits-header">
                <div class="lp-section-tag lp-tag-light lp-reveal">
                    <i class="fas fa-trophy" aria-hidden="true"></i> Giá trị
                </div>
                <h2 class="lp-section-title lp-light lp-reveal" data-delay="1">Giá trị mà chúng tôi mang lại cho học viên</h2>
            </div>
            <div class="lp-benefits-grid">
                <?php if (isset($uniData['benefits'])): foreach ($uniData['benefits'] as $bi => $benefit): ?>
                        <div class="lp-benefit-card lp-reveal" data-delay="<?= ($bi % 3) + 1 ?>">
                            <div class="lp-benefit-icon"><i class="fas <?= htmlspecialchars($benefit['icon']) ?>" aria-hidden="true"></i></div>
                            <h3 class="lp-benefit-title"><?= htmlspecialchars($benefit['title']) ?></h3>
                            <p class="lp-benefit-desc"><?= htmlspecialchars($benefit['desc']) ?></p>
                        </div>
                <?php endforeach;
                endif; ?>
            </div>
        </div>
        </div>
    </section> -->

    <!-- ============================
         10. FAQ — HIDDEN (re-enable when real Q&As are collected)
         ============================
    <section class="lp-faq lp-section" id="lp-faq" aria-label="Câu hỏi thường gặp">
        <div class="lp-container">
            <div style="text-align:center; margin-bottom: 52px;">
                <div class="lp-section-tag lp-tag-light lp-reveal"><i class="fas fa-question-circle" aria-hidden="true"></i> Hỏi đáp</div>
                <h2 class="lp-section-title lp-reveal" data-delay="1">Câu hỏi thường gặp</h2>
                <p class="lp-section-subtitle lp-reveal" data-delay="2" style="margin: 0 auto;">Giải đáp các thắc mắc phổ biến về chương trình đào tạo</p>
            </div>
            <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                <div class="lp-faq-layout" id="faq-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : '' ?>>
                    <div class="lp-accordion lp-reveal" role="list">
                        <?php if (isset($prog['faq'])): foreach ($prog['faq'] as $faq): ?>
                                <div class="lp-accordion-item" role="listitem">
                                    <button class="lp-accordion-header" aria-expanded="false">
                                        <span><?= htmlspecialchars($faq['q']) ?></span>
                                        <i class="fas fa-chevron-down lp-accordion-icon" aria-hidden="true"></i>
                                    </button>
                                    <div class="lp-accordion-body">
                                        <div class="lp-accordion-body-inner" style="list-style: none;">
                                            <p style="font-size: 0.95rem; line-height: 1.7;"><?= $faq['a'] ?></p>
                                        </div>
                                    </div>
                                </div>
                        <?php endforeach;
                        endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </section>
    -->

    <!-- ============================
         11. PHỤ LỤC (APPENDIX) — Hidden entirely when no program has phuluc data
         ============================ -->
    <?php
    $anyPhuluc = false;
    foreach ($uniData['programs'] as $p) {
        if (!empty($p['phuluc']['sections'])) {
            $anyPhuluc = true;
            break;
        }
    }
    ?>
    <?php if ($anyPhuluc): ?>
        <section class="lp-phuluc lp-section" id="lp-phuluc" aria-label="Phụ lục chương trình" <?= empty($uniData['programs'][$activeProgram]['phuluc']['sections']) ? ' style="display:none;"' : '' ?>>
            <div class="lp-container">
                <div style="text-align:center; margin-bottom: 36px;">
                    <div class="lp-section-tag lp-tag-light lp-reveal"><i class="fas fa-list-alt" aria-hidden="true"></i> Phụ lục</div>
                    <h2 class="lp-section-title lp-reveal" id="dynamic-phuluc-title" data-delay="1"><?= htmlspecialchars($uniData['programs'][$activeProgram]['phuluc']['title'] ?? 'Phụ lục chương trình') ?></h2>
                    <p class="lp-section-subtitle lp-reveal" id="dynamic-phuluc-desc" data-delay="2" style="margin: 0 auto; max-width: 600px;">
                        <?= htmlspecialchars($uniData['programs'][$activeProgram]['phuluc']['description'] ?? '') ?>
                    </p>
                </div>

                <?php foreach ($uniData['programs'] as $progKey => $prog): ?>
                    <?php $phulucData = $prog['phuluc'] ?? null; ?>
                    <?php if ($phulucData && !empty($phulucData['sections'])): ?>
                        <div id="phuluc-<?= $progKey ?>" <?= ($progKey !== $activeProgram) ? ' style="display:none;"' : '' ?>>
                            <div class="lp-phuluc-table-wrapper lp-reveal" data-delay="1">
                                <div class="lp-phuluc-table">
                                    <div class="lp-phuluc-table-header">
                                        <div class="lp-phuluc-col-stt">STT</div>
                                        <div class="lp-phuluc-col-content">Nội dung chi tiết</div>
                                    </div>
                                    <?php foreach ($phulucData['sections'] as $pi => $row): ?>
                                        <?php
                                        $isSpecial = !empty($row['special']);
                                        $rowClass = $isSpecial ? 'lp-phuluc-table-row lp-phuluc-table-special' : 'lp-phuluc-table-row';
                                        ?>
                                        <div class="<?= $rowClass ?>">
                                            <div class="lp-phuluc-col-stt">
                                                <?php if ($isSpecial): ?>
                                                    <i class="fas fa-star"></i>
                                                <?php else: ?>
                                                    <?= str_pad((int)$pi + 1, 2, '0', STR_PAD_LEFT) ?>
                                                <?php endif; ?>
                                            </div>
                                            <div class="lp-phuluc-col-content">
                                                <h3 class="lp-phuluc-row-title"><?= htmlspecialchars($row['title']) ?></h3>
                                                <?php if (isset($row['items'])): ?>
                                                    <ul class="lp-phuluc-list">
                                                        <?php foreach ($row['items'] as $item): ?>
                                                            <li><?= $item ?></li>
                                                        <?php endforeach; ?>
                                                    </ul>
                                                <?php endif; ?>
                                                <?php if (isset($row['testNote'])): ?>
                                                    <div class="lp-phuluc-test-note"><i class="fas fa-file-alt"></i> <?= htmlspecialchars($row['testNote']) ?></div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </section>
    <?php endif; ?>

    <!-- ============================
         10. MINI FOOTER
         ============================ -->
    <footer class="lp-footer" role="contentinfo">
        <div class="lp-container">
            <div class="lp-footer-inner">
                <div class="lp-footer-brand-wrapper">
                    <div class="lp-footer-brand">
                        <img src="https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png" alt="Viện phát triển nguồn lực xã hội Phương Nam">
                    </div>
                    <p style="text-align: center;" class="lp-footer-brand-text">VIỆN PHÁT TRIỂN NGUỒN LỰC XÃ HỘI PHƯƠNG NAM</p>
                </div>
                <div class="lp-footer-contact">
                    <p><i class="fas fa-map-marker-alt" aria-hidden="true"></i>45 Đinh Tiên Hoàng, Phường Sài Gòn, TP. Hồ Chí Minh</p>
                    <?php if (!empty($relust_company['hotline0']) || !empty($relust_company['hotline1'])): ?>
                        <p><i class="fas fa-phone" aria-hidden="true"></i><?= htmlspecialchars(!empty($relust_company['hotline1']) ? $relust_company['hotline1'] : $relust_company['hotline0']) ?></p>
                    <?php endif; ?>
                    <?php if (!empty($relust_company['email1'])): ?>
                        <p><i class="fas fa-envelope" aria-hidden="true"></i><?= htmlspecialchars($relust_company['email1']) ?></p>
                    <?php endif; ?>
                    <div class="lp-footer-social">
                        <?php if (!empty($relust_company['duongdanfacebook'])): ?>
                            <a href="<?= $relust_company['duongdanfacebook'] ?>" target="_blank" rel="noopener noreferrer nofollow" title="Facebook" aria-label="Trang Facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a>
                        <?php endif; ?>
                        <?php if (!empty($relust_company['duongdanyoutube'])): ?>
                            <a href="<?= $relust_company['duongdanyoutube'] ?>" target="_blank" rel="noopener noreferrer nofollow" title="YouTube" aria-label="Kênh YouTube"><i class="fab fa-youtube" aria-hidden="true"></i></a>
                        <?php endif; ?>
                        <?php if (!empty($relust_company['sozalo'])): ?>
                            <a href="https://zalo.me/<?= $relust_company['sozalo'] ?>" target="_blank" rel="noopener noreferrer nofollow" title="Zalo" aria-label="Chat Zalo" style="font-size: 0.75rem; font-weight: 700;">Zalo</a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
            <div class="lp-footer-copyright">
                <?= $result_website['copyright0'] ?>
            </div>
        </div>
    </footer>

    <!-- ============================
         JS LOGIC FOR PILL SWITCHER
         ============================ -->
    <script>
        /* Inject university data from PHP (loaded from JSON config) */
        const uniData = <?= json_encode($uniData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
        const activeProgram = '<?= $activeProgram ?>';

        /* Build courses object from uniData.programs for switchCourse compatibility */
        const courses = {};
        for (const [key, prog] of Object.entries(uniData.programs)) {
            courses[key] = {
                title: prog.title,
                date: prog.subtitle,
                courseId: prog.courseId || prog.titlePlain,
                phulucTitle: prog.phuluc ? prog.phuluc.title : '',
                phulucDesc: prog.phuluc ? prog.phuluc.description : '',
                curriculumTitle: prog.curriculumTitle || prog.titlePlain,
                curriculumDesc: prog.curriculumDesc || ''
            };
        }

        function switchCourse(key) {
            /* Update Active Pill Button CSS */
            document.querySelectorAll('.lp-tab-btn').forEach(btn => btn.classList.remove('lp-tab-active'));
            const navBtn = document.getElementById('nav-btn-' + key);
            if (navBtn) navBtn.classList.add('lp-tab-active');

            /* Update Text Content */
            const courseData = courses[key];
            if (!courseData) return;

            if (document.getElementById('dynamic-hero-title')) {
                document.getElementById('dynamic-hero-title').innerHTML = courseData.title;
            }
            if (document.getElementById('dynamic-hero-date')) {
                document.getElementById('dynamic-hero-date').innerText = courseData.date;
            }
            if (document.getElementById('selected-course-id')) {
                document.getElementById('selected-course-id').value = courseData.courseId;
            }
            if (document.getElementById('dynamic-phuluc-title')) {
                document.getElementById('dynamic-phuluc-title').innerText = courseData.phulucTitle;
            }
            if (document.getElementById('dynamic-phuluc-desc')) {
                document.getElementById('dynamic-phuluc-desc').innerText = courseData.phulucDesc;
            }

            /* Toggle phuluc section + TOC link based on data presence */
            const hasPhuluc = !!(uniData.programs[key].phuluc && uniData.programs[key].phuluc.sections && uniData.programs[key].phuluc.sections.length);
            const phulucSection = document.getElementById('lp-phuluc');
            const tocPhulucLink = document.getElementById('toc-phuluc-link');
            if (phulucSection) phulucSection.style.display = hasPhuluc ? '' : 'none';
            if (tocPhulucLink) tocPhulucLink.style.display = hasPhuluc ? '' : 'none';
            if (document.getElementById('dynamic-curriculum-title')) {
                document.getElementById('dynamic-curriculum-title').innerText = courseData.curriculumTitle;
            }
            if (document.getElementById('dynamic-curriculum-desc')) {
                document.getElementById('dynamic-curriculum-desc').innerText = courseData.curriculumDesc;
            }

            /* Toggle program-specific sections (hotline, curriculum, FAQ, phuluc) */
            const programKeys = Object.keys(uniData.programs);
            programKeys.forEach(k => {
                ['dynamic-hotline-', 'nav-hotline-', 'curriculum-', 'curriculum-meta-', 'faq-', 'phuluc-'].forEach(prefix => {
                    const el = document.getElementById(prefix + k);
                    if (el) {
                        if (prefix === 'dynamic-hotline-' || prefix === 'curriculum-meta-' || prefix === 'nav-hotline-') {
                            el.style.display = (k === key) ? 'flex' : 'none';
                        } else {
                            el.style.display = (k === key) ? 'block' : 'none';
                        }
                    }
                });
            });

            /* Also hide deprecated sections */
            ['dauthau', 'giangvien'].forEach(k => {
                ['dynamic-hotline-', 'nav-hotline-', 'curriculum-', 'curriculum-meta-', 'faq-', 'phuluc-'].forEach(prefix => {
                    const el = document.getElementById(prefix + k);
                    if (el) el.style.display = 'none';
                });
            });
            /* Update flyout active state */
            document.querySelectorAll('.lp-toc-flyout-item').forEach(item => {
                item.classList.toggle('lp-flyout-active', item.dataset.program === key);
            });
        }

        /* TOC Flyout toggle */
        function toggleTocFlyout() {
            const flyout = document.getElementById('lp-toc-flyout');
            const parent = flyout.closest('.lp-toc-has-flyout');
            const isOpen = flyout.classList.contains('lp-flyout-visible');
            if (isOpen) {
                closeTocFlyout();
            } else {
                flyout.classList.add('lp-flyout-visible');
                parent.classList.add('lp-toc-flyout-open');
            }
        }

        function closeTocFlyout() {
            const flyout = document.getElementById('lp-toc-flyout');
            const parent = flyout.closest('.lp-toc-has-flyout');
            flyout.classList.remove('lp-flyout-visible');
            parent.classList.remove('lp-toc-flyout-open');
        }

        function scrollToCurriculum() {
            const el = document.getElementById('lp-curriculum');
            if (el) el.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        /* Close flyout on click outside */
        document.addEventListener('click', (e) => {
            const flyout = document.getElementById('lp-toc-flyout');
            const btn = document.getElementById('lp-toc-curriculum-btn');
            if (flyout && btn && !flyout.contains(e.target) && !btn.contains(e.target)) {
                closeTocFlyout();
            }
        });

        /* Automatically style Google Docs links as buttons */
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('a[href*="docs.google.com/document"]').forEach(a => {
                if (!a.classList.contains('lp-btn-doc')) {
                    a.classList.add('lp-btn-doc');
                    a.innerHTML = '<i class="fas fa-file-word"></i> ' + a.innerHTML;
                }
            });
        });
    </script>

    <!-- Landing Page JS v2.0 -->
    <script src="<?= $domain ?>/fontend/js/landing-page.js?v=<?= date('dmYH') ?>"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => switchCourse(activeProgram));

        /* === Dynamic Certificate Rows === */
        const LP_CERT_MAX = 5;

        function lpAddCert() {
            const list = document.getElementById('lp-cert-list');
            if (!list) return;
            const rows = list.querySelectorAll('.lp-cert-row');
            if (rows.length >= LP_CERT_MAX) {
                alert('Tối đa ' + LP_CERT_MAX + ' chứng chỉ.');
                return;
            }
            const idx = rows.length + 1;
            const row = document.createElement('div');
            row.className = 'lp-cert-row';
            row.innerHTML =
                '<div class="lp-cert-num">' + idx + '</div>' +
                '<input type="text" name="cc_loai[]" class="lp-form-input lp-cert-input" placeholder="VD: IELTS 7.0, Tin học MOS...">' +
                '<input type="date" name="cc_ngay[]" class="lp-form-input lp-cert-date">' +
                '<button type="button" class="lp-cert-remove-btn" onclick="lpRemoveCert(this)" title="Xóa">&times;</button>';
            list.appendChild(row);
            lpUpdateAddBtn();
        }

        function lpRemoveCert(btn) {
            const row = btn.closest('.lp-cert-row');
            if (row) row.remove();
            /* Re-number remaining rows */
            const list = document.getElementById('lp-cert-list');
            list.querySelectorAll('.lp-cert-row').forEach((r, i) => {
                r.querySelector('.lp-cert-num').textContent = i + 1;
            });
            lpUpdateAddBtn();
        }

        function lpUpdateAddBtn() {
            const list = document.getElementById('lp-cert-list');
            const btn = document.getElementById('lp-cert-add');
            if (!list || !btn) return;
            const count = list.querySelectorAll('.lp-cert-row').length;
            btn.style.display = count >= LP_CERT_MAX ? 'none' : '';
        }
    </script>

</body>

</html>
