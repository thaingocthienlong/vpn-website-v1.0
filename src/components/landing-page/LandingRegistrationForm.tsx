"use client";

import { useMemo, useState } from "react";
import { LANDING_PAGE_PROVINCES } from "@/lib/landing-page/constants";

interface LandingRegistrationFormProps {
    campaignId: string;
    programId: string;
    courseId: string;
    privacyUrl: string;
    sourceOptions: string[];
}

export function LandingRegistrationForm({
    campaignId,
    programId,
    courseId,
    privacyUrl,
    sourceOptions,
}: LandingRegistrationFormProps) {
    const [showOther, setShowOther] = useState(false);
    const options = useMemo(() => [...sourceOptions, "Khác"], [sourceOptions]);

    return (
        <>
            <style jsx>{`
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
            `}</style>

            <form id="lp-register-form" method="POST" action="#lp-form" noValidate className="lp-register-grid">
                <input type="hidden" name="campaignId" id="selected-campaign-id" value={campaignId} />
                <input type="hidden" name="programId" id="selected-program-id" value={programId} />
                <input type="hidden" name="course_id" id="selected-course-id" value={courseId} />
                <input type="hidden" name="url" id="selected-source-url" value="" />
                <input type="hidden" name="lpRegister" value="1" />

                <div className="lp-form-group col-span-12">
                    <label className="lp-form-label" htmlFor="lp-email">Email <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <input type="email" id="lp-email" name="emailcontact" className="lp-form-input" placeholder="Nhập địa chỉ email" required autoComplete="email" maxLength={255} />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-8">
                    <label className="lp-form-label" htmlFor="lp-holot">
                        Họ và chữ lót <span className="lp-required" aria-label="bắt buộc">*</span>
                        <span className="lp-sub-label">(Dùng in giấy chứng nhận)</span>
                    </label>
                    <input type="text" id="lp-holot" name="ho_lot" className="lp-form-input" placeholder="VD: Nguyễn Văn" required autoComplete="off" maxLength={100} />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-4">
                    <label className="lp-form-label" htmlFor="lp-ten">
                        Tên <span className="lp-required" aria-label="bắt buộc">*</span>
                        <span className="lp-sub-label" style={{ opacity: 0, userSelect: "none" }}>(Ẩn)</span>
                    </label>
                    <input type="text" id="lp-ten" name="ten" className="lp-form-input" placeholder="VD: A" required autoComplete="off" maxLength={50} />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label">Giới tính <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <div style={{ display: "flex", gap: "20px", padding: "10px 0" }}>
                        {["Nam", "Nữ"].map((gender) => (
                            <label key={gender} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                                <input type="radio" name="gioi_tinh" value={gender} required style={{ accentColor: "var(--lp-gold)", cursor: "pointer" }} />
                                {gender}
                            </label>
                        ))}
                    </div>
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label" htmlFor="lp-ngaysinh">Ngày sinh <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <input type="text" id="lp-ngaysinh" name="ngay_sinh" className="lp-form-input" placeholder="VD: 01/01/1990" required />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label" htmlFor="lp-phone">Số điện thoại <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <input type="tel" id="lp-phone" name="phoneregister" className="lp-form-input" placeholder="Nhập số điện thoại" required autoComplete="tel" maxLength={15} pattern="[0-9\\s\\-\\+]{8,15}" title="Nhập số điện thoại hợp lệ (8-15 ký tự)" />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label" htmlFor="lp-tinhthanh">Tỉnh/Thành phố (sau sáp nhập) đang sinh sống/làm việc <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <select id="lp-tinhthanh" name="tinh_thanh" className="lp-form-input" required defaultValue="">
                        <option value="" disabled>Chọn tỉnh/thành từ danh sách</option>
                        {LANDING_PAGE_PROVINCES.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label" htmlFor="lp-vitri">Vị trí công tác (Khoa/Phòng/Ban) <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <input type="text" id="lp-vitri" name="vi_tri" className="lp-form-input" placeholder="Nhập vị trí công tác" required maxLength={200} />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-6">
                    <label className="lp-form-label" htmlFor="lp-donvi">Đơn vị công tác <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <input type="text" id="lp-donvi" name="don_vi" className="lp-form-input" placeholder="Nhập tên đơn vị công tác" required maxLength={200} />
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-12">
                    <label className="lp-form-label">Quý anh/chị biết đến khoá học thông qua <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <div className="lp-radio-grid">
                        {options.map((option) => {
                            const isOther = option === "Khác";
                            return (
                                <label key={option} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <input
                                        type="radio"
                                        name="biet_qua"
                                        value={option}
                                        required
                                        style={{ accentColor: "var(--lp-gold)", cursor: "pointer" }}
                                        onChange={() => setShowOther(isOther)}
                                    />
                                    {option}
                                </label>
                            );
                        })}
                    </div>
                    <div id="other-text-container" style={{ display: showOther ? "block" : "none", marginTop: "5px", paddingLeft: "25px", marginBottom: "10px" }}>
                        <input type="text" id="lp-other-text" name="biet_qua_other" className="lp-form-input" placeholder="Vui lòng nhập rõ..." required={showOther} />
                    </div>
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-12">
                    <label className="lp-form-label" htmlFor="lp-captcha">Mã xác nhận <span className="lp-required" aria-label="bắt buộc">*</span></label>
                    <div className="lp-captcha-row">
                        <input type="text" id="lp-captcha" name="captcha_challenge" className="lp-form-input" placeholder="Nhập mã captcha" required autoComplete="off" aria-describedby="lp-captcha-img" />
                        <img id="lp-captcha-img" src="/api/landing-page/captcha" alt="CAPTCHA — click để đổi mã" className="lp-captcha-img" title="Click để đổi mã" />
                    </div>
                    <div className="lp-form-error" role="alert"></div>
                </div>

                <div className="lp-form-group col-span-12" style={{ marginTop: "15px" }}>
                    <label className="lp-form-checkbox-label" style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", color: "rgba(255, 255, 255, 0.9)", fontSize: "0.95rem" }}>
                        <input type="checkbox" id="lp-agreement" name="agreement" required style={{ marginTop: "5px", width: "18px", height: "18px", accentColor: "var(--lp-gold)", flexShrink: 0, cursor: "pointer" }} />
                        <span>
                            Tôi đã đọc và đồng ý với <a href={privacyUrl} target="_blank" style={{ color: "var(--lp-gold-light)", textDecoration: "underline" }}>Chính sách bảo mật thông tin</a> của Viện&nbsp;Phương&nbsp;Nam. <span className="lp-required" aria-label="bắt buộc">*</span>
                        </span>
                    </label>
                    <div className="lp-form-error" role="alert" style={{ marginLeft: "28px" }}></div>
                </div>

                <div className="col-span-12">
                    <button type="submit" className="lp-form-submit">
                        <i className="fas fa-paper-plane" aria-hidden="true"></i> Gửi đăng ký
                    </button>
                </div>
            </form>
        </>
    );
}
