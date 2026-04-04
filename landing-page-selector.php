<?php

/**
 * University Selector Page
 * Displays a grid of available universities for the landing page platform.
 * Auto-discovered from cnv/data/*.json files.
 */

// Scan data directory for university JSON files
$dataDir = __DIR__ . '/data/';
$universities = [];

if (is_dir($dataDir)) {
    $files = glob($dataDir . '*.json');
    foreach ($files as $file) {
        $data = json_decode(file_get_contents($file), true);
        if ($data && isset($data['slug'], $data['name'])) {
            $universities[] = [
                'slug' => $data['slug'],
                'name' => $data['name'],
                'shortName' => $data['shortName'] ?? $data['name'],
                'heritage' => $data['heritage'] ?? '',
                'programCount' => isset($data['programs']) ? count($data['programs']) : 0
            ];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="utf-8">
    <title>Viện Phương Nam – <?= $result_website['name'] ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Tuyển sinh 2026.">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Viện Phương Nam – <?= $result_website['name'] ?>">
    <meta property="og:description" content="Tuyển sinh 2026.">
    <meta property="og:locale" content="vi_VN">
    <link rel="shortcut icon" href="<?= $domain ?><?= $result_website['favicon'] ?>" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="<?= $domain ?>/fontend/css/landing-page.css?v=<?= date('dmYH') ?>">
    <style>
        /* ===== University Selector Styles ===== */
        .lp-selector-wrapper {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 24px;
            position: relative;
            z-index: 1;
        }

        .lp-selector-header {
            text-align: center;
            margin-bottom: 56px;
            max-width: 680px;
        }

        .lp-selector-header .lp-section-tag {
            margin-bottom: 20px;
        }

        .lp-selector-header h1 {
            font-size: clamp(1.8rem, 4vw, 2.6rem);
            font-weight: 800;
            color: #fff;
            line-height: 1.3;
            margin: 0 0 16px;
        }

        .lp-selector-header p {
            font-size: 1.05rem;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
            margin: 0;
        }

        /* Selector page has no TOC — override left spacing */
        @media (min-width: 1280px) {
            .lp-page.lp-no-toc {
                padding-left: 0;
            }
        }

        .lp-selector-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            max-width: 900px;
            width: 100%;
        }

        .lp-uni-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 40px 28px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(12px);
            cursor: pointer;
            text-decoration: none;
            color: #fff;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .lp-uni-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.05));
            opacity: 0;
            transition: opacity 0.35s ease;
        }

        .lp-uni-card:hover {
            transform: translateY(-6px);
            border-color: rgba(56, 189, 248, 0.4);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(56, 189, 248, 0.15);
        }

        .lp-uni-card:hover::before {
            opacity: 1;
        }

        .lp-uni-card-icon {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, var(--lp-primary), var(--lp-primary-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            color: #fff;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }

        .lp-uni-card-name {
            font-size: 1.2rem;
            font-weight: 700;
            margin: 0 0 8px;
            position: relative;
            z-index: 1;
        }

        .lp-uni-card-heritage {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
            margin: 0 0 16px;
            position: relative;
            z-index: 1;
        }

        .lp-uni-card-programs {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            color: var(--lp-gold-light);
            background: rgba(234, 179, 8, 0.1);
            padding: 6px 14px;
            border-radius: 20px;
            position: relative;
            z-index: 1;
        }

        .lp-uni-card-arrow {
            position: absolute;
            bottom: 16px;
            right: 16px;
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            z-index: 1;
        }

        .lp-uni-card:hover .lp-uni-card-arrow {
            color: var(--lp-gold-light);
            transform: translateX(4px);
        }

        @media (max-width: 640px) {
            .lp-selector-grid {
                grid-template-columns: 1fr;
            }

            .lp-selector-wrapper {
                padding: 40px 16px;
            }
        }
    </style>
</head>

<body class="lp-page lp-no-toc">
    <canvas id="lp-hero-canvas" aria-hidden="true"></canvas>

    <div class="lp-selector-wrapper">
        <div class="lp-selector-header">
            <div class="lp-section-tag lp-tag-light">
                <i class="fas fa-university" aria-hidden="true"></i> Viện Phương Nam
            </div>
            <h1><span style="color: var(--lp-gold-light);">Tuyển sinh 2026</span></h1>
        </div>

        <div class="lp-selector-grid">
            <?php if (empty($universities)): ?>
                <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                    Chưa có chương trình đào tạo nào được cấu hình.
                </div>
            <?php else: ?>
                <?php foreach ($universities as $uni): ?>
                    <a href="?uni=<?= htmlspecialchars($uni['slug']) ?>" class="lp-uni-card" title="Xem chương trình tại <?= htmlspecialchars($uni['shortName']) ?>">
                        <div class="lp-uni-card-icon">
                            <i class="fas fa-university"></i>
                        </div>
                        <h2 class="lp-uni-card-name"><?= htmlspecialchars($uni['name']) ?></h2>
                        <span class="lp-uni-card-arrow"><i class="fas fa-arrow-right"></i></span>
                    </a>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>


    </div>

    <!-- Particle Canvas Script -->
    <script src="<?= $domain ?>/fontend/js/landing-page.js?v=<?= date('dmYH') ?>"></script>
</body>

</html>