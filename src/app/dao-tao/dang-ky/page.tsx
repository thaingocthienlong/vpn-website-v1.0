"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, CheckCircle2, User, BookOpen, ClipboardCheck, Phone, Mail, Building2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Sample courses for selection
const courses = [
    {
        id: "1", title: "An toàn Lao động Nhóm 3", schedules: [
            { id: "s1", date: "15/02/2024", type: "Tại Viện" },
            { id: "s2", date: "01/03/2024", type: "Online" },
        ]
    },
    {
        id: "2", title: "ISO 9001:2015", schedules: [
            { id: "s3", date: "20/02/2024", type: "Tại Viện" },
        ]
    },
    {
        id: "3", title: "Kỹ năng Lãnh đạo", schedules: [
            { id: "s4", date: "25/02/2024", type: "Online" },
            { id: "s5", date: "10/03/2024", type: "Tại Viện" },
        ]
    },
];

// Form data interface per FEATURES_SPEC TR-03
interface FormData {
    // Step 1 - Personal Info
    fullName: string;
    email: string;
    phone: string;
    company: string;
    // Step 2 - Course Selection
    courseId: string;
    scheduleId: string;
    notes: string;
    // Step 3 - Terms
    agreeTerms: boolean;
}

const initialFormData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    company: "",
    courseId: "",
    scheduleId: "",
    notes: "",
    agreeTerms: false,
};

export default function RegistrationPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const selectedCourse = courses.find(c => c.id === formData.courseId);

    const validateStep1 = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.fullName || formData.fullName.length < 2) {
            newErrors.fullName = "Vui lòng nhập họ tên (tối thiểu 2 ký tự)";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ";
        }

        const phoneRegex = /^(0|84|\+84)?[0-9]{9,10}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.courseId) {
            newErrors.courseId = "Vui lòng chọn khóa học";
        }

        if (!formData.scheduleId) {
            newErrors.scheduleId = "Vui lòng chọn lịch học";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "Vui lòng đồng ý với điều khoản để tiếp tục";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        let isValid = false;

        if (step === 1) isValid = validateStep1();
        else if (step === 2) isValid = validateStep2();
        else if (step === 3) isValid = validateStep3();

        if (isValid) {
            if (step < 3) {
                setStep(step + 1);
                setErrors({});
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Error submitting registration:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));

        // Clear error
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        // Clear schedule when course changes
        if (name === "courseId") {
            setFormData(prev => ({ ...prev, scheduleId: "" }));
        }
    };

    // Step indicators
    const steps = [
        { num: 1, label: "Thông tin cá nhân", icon: User },
        { num: 2, label: "Chọn khóa học", icon: BookOpen },
        { num: 3, label: "Xác nhận", icon: ClipboardCheck },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-12">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-800 mb-4">
                                Đăng ký{" "}
                                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    khóa học
                                </span>
                            </h1>
                            <p className="text-slate-800">
                                Hoàn thành 3 bước đơn giản để đăng ký tham gia khóa đào tạo
                            </p>
                        </div>
                    </div>
                </section>

                {/* Form Section */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto">
                            {isSuccess ? (
                                /* Success State */
                                <div className="bg-white shadow-sm rounded-3xl p-12 text-center border border-emerald-500/20">
                                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-heading font-bold text-slate-800 mb-4">
                                        Đăng ký thành công!
                                    </h2>
                                    <p className="text-slate-800 mb-8">
                                        Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Link href="/dao-tao">
                                            <Button variant="outline">Xem khóa học khác</Button>
                                        </Link>
                                        <Link href="/">
                                            <Button>Về trang chủ</Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Step Indicators */}
                                    <div className="flex justify-between mb-12 relative">
                                        {/* Progress line */}
                                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-white -z-10" />
                                        <div
                                            className="absolute top-6 left-0 h-0.5 bg-blue-600 -z-10 transition-all"
                                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                                        />

                                        {steps.map((s) => {
                                            const Icon = s.icon;
                                            const isActive = step === s.num;
                                            const isCompleted = step > s.num;

                                            return (
                                                <div key={s.num} className="flex flex-col items-center">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                            ? "bg-blue-600 text-white"
                                                            : isActive
                                                                ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                                                : "bg-white text-slate-500"
                                                            }`}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        ) : (
                                                            <Icon className="w-6 h-6" />
                                                        )}
                                                    </div>
                                                    <span className={`text-sm mt-2 font-medium ${isActive ? "text-blue-600" : "text-slate-500"
                                                        }`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Form Content */}
                                    <div className="bg-white shadow-sm rounded-3xl p-8 border border-slate-200">
                                        {/* Step 1: Personal Info */}
                                        {step === 1 && (
                                            <div className="space-y-6">
                                                <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                                    Thông tin cá nhân
                                                </h2>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        <User className="w-4 h-4 inline mr-2" />
                                                        Họ và tên <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? "border-red-400" : "border-slate-200"
                                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-white placeholder:text-slate-400`}
                                                        placeholder="Nguyễn Văn A"
                                                    />
                                                    {errors.fullName && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        <Mail className="w-4 h-4 inline mr-2" />
                                                        Email <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-400" : "border-slate-200"
                                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-white placeholder:text-slate-400`}
                                                        placeholder="email@example.com"
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        <Phone className="w-4 h-4 inline mr-2" />
                                                        Số điện thoại <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? "border-red-400" : "border-slate-200"
                                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-white placeholder:text-slate-400`}
                                                        placeholder="0901 234 567"
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        <Building2 className="w-4 h-4 inline mr-2" />
                                                        Công ty/Tổ chức
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="company"
                                                        value={formData.company}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-slate-800 placeholder:text-slate-400"
                                                        placeholder="Tên công ty (không bắt buộc)"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Course Selection */}
                                        {step === 2 && (
                                            <div className="space-y-6">
                                                <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                                    Chọn khóa học
                                                </h2>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        Khóa học <span className="text-red-400">*</span>
                                                    </label>
                                                    <select
                                                        name="courseId"
                                                        value={formData.courseId}
                                                        onChange={handleChange}
                                                        className={`w-full px-4 py-3 rounded-xl border ${errors.courseId ? "border-red-400" : "border-slate-200"
                                                            } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-white`}
                                                    >
                                                        <option value="" className="bg-slate-800 text-slate-800">-- Chọn khóa học --</option>
                                                        {courses.map((course) => (
                                                            <option key={course.id} value={course.id} className="bg-slate-800 text-slate-800">
                                                                {course.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors.courseId && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.courseId}</p>
                                                    )}
                                                </div>

                                                {selectedCourse && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-800 mb-3">
                                                            Lịch học <span className="text-red-400">*</span>
                                                        </label>
                                                        <div className="space-y-3">
                                                            {selectedCourse.schedules.map((schedule) => (
                                                                <label
                                                                    key={schedule.id}
                                                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.scheduleId === schedule.id
                                                                        ? "border-blue-500 bg-blue-500/10"
                                                                        : "border-slate-200 hover:border-slate-200"
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="scheduleId"
                                                                        value={schedule.id}
                                                                        checked={formData.scheduleId === schedule.id}
                                                                        onChange={handleChange}
                                                                        className="w-4 h-4 text-blue-600"
                                                                    />
                                                                    <div>
                                                                        <div className="font-medium text-slate-800">
                                                                            {schedule.date}
                                                                        </div>
                                                                        <div className="text-sm text-slate-800">
                                                                            {schedule.type}
                                                                        </div>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                        {errors.scheduleId && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.scheduleId}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-800 mb-2">
                                                        Ghi chú
                                                    </label>
                                                    <textarea
                                                        name="notes"
                                                        value={formData.notes}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white text-slate-800 placeholder:text-slate-400"
                                                        placeholder="Yêu cầu đặc biệt, câu hỏi..."
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Confirmation */}
                                        {step === 3 && (
                                            <div className="space-y-6">
                                                <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                                    Xác nhận thông tin
                                                </h2>

                                                {/* Summary */}
                                                <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 space-y-4">
                                                    <div className="flex justify-between py-2 border-b border-white/5">
                                                        <span className="text-slate-800">Họ tên:</span>
                                                        <span className="font-medium text-slate-800">{formData.fullName}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-white/5">
                                                        <span className="text-slate-800">Email:</span>
                                                        <span className="font-medium text-slate-800">{formData.email}</span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-white/5">
                                                        <span className="text-slate-800">Số điện thoại:</span>
                                                        <span className="font-medium text-slate-800">{formData.phone}</span>
                                                    </div>
                                                    {formData.company && (
                                                        <div className="flex justify-between py-2 border-b border-white/5">
                                                            <span className="text-slate-800">Công ty:</span>
                                                            <span className="font-medium text-slate-800">{formData.company}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between py-2 border-b border-white/5">
                                                        <span className="text-slate-800">Khóa học:</span>
                                                        <span className="font-medium text-slate-800">
                                                            {selectedCourse?.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-slate-800">Lịch học:</span>
                                                        <span className="font-medium text-slate-800">
                                                            {selectedCourse?.schedules.find(s => s.id === formData.scheduleId)?.date}{" "}
                                                            ({selectedCourse?.schedules.find(s => s.id === formData.scheduleId)?.type})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Terms */}
                                                <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer ${errors.agreeTerms ? "border-red-400 bg-red-500/10" : "border-slate-200"
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        name="agreeTerms"
                                                        checked={formData.agreeTerms}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-blue-600 mt-0.5"
                                                    />
                                                    <span className="text-sm text-slate-800">
                                                        Tôi đồng ý với{" "}
                                                        <a href="#" className="text-blue-400 hover:underline">điều khoản dịch vụ</a>
                                                        {" "}và{" "}
                                                        <a href="#" className="text-blue-400 hover:underline">chính sách bảo mật</a>
                                                        {" "}của Viện.
                                                    </span>
                                                </label>
                                                {errors.agreeTerms && (
                                                    <p className="text-red-500 text-sm">{errors.agreeTerms}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Navigation Buttons */}
                                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                                            {step > 1 ? (
                                                <Button variant="outline" onClick={handleBack}>
                                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                                    Quay lại
                                                </Button>
                                            ) : (
                                                <Link href="/dao-tao">
                                                    <Button variant="outline">
                                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                                        Hủy
                                                    </Button>
                                                </Link>
                                            )}

                                            <Button onClick={handleNext} disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    "Đang xử lý..."
                                                ) : step === 3 ? (
                                                    <>
                                                        Hoàn tất đăng ký
                                                        <CheckCircle2 className="w-4 h-4 ml-2" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Tiếp tục
                                                        <ArrowRight className="w-4 h-4 ml-2" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
