import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { StaffCard } from '@/components/cards/StaffCard';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'OrgStructure' });
    return {
        title: t('metaTitle', { default: 'Cơ cấu tổ chức - Viện Phương Nam' }),
        description: t('metaDescription', { default: 'Cơ cấu tổ chức và ban lãnh đạo Viện Nghiên cứu Khoa học và Phát triển Phương Nam.' }),
    };
}

export default async function OrgStructurePage({ params: { locale } }: { params: { locale: string } }) {
    // 1. Fetch all NON-ADVISORY staff
    const staffList = await prisma.staff.findMany({
        where: {
            isActive: true,
            staffType: {
                name: { in: ['Ban Lãnh Đạo Viện', 'Cán Bộ Quản Lý', 'Chuyên viên'] }
            }
        },
        include: {
            staffType: true,
            department: true,
            avatar: true
        },
        orderBy: [
            { sortOrder: 'asc' }
        ]
    });

    if (!staffList.length) {
        return notFound();
    }

    // 2. Identify Top Leadership (No Department) - Viện Trưởng
    const topLeaders = staffList.filter(s => !s.departmentId);

    // 3. Group by Department following the global sortOrder of the departments
    const departmentsList = await prisma.department.findMany({
        where: {
            id: { in: [...new Set(staffList.map(s => s.departmentId).filter((id): id is string => id !== null))] }
        },
        orderBy: { sortOrder: 'asc' }
    });

    const departmentGroups = departmentsList.map(dept => ({
        department: dept,
        staff: staffList.filter(s => s.departmentId === dept.id)
    })).filter(group => group.staff.length > 0);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Hero / Header */}
            <div className="py-12 md:py-20 relative">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
                        Cơ cấu tổ chức
                    </h1>
                    <p className="text-slate-800 max-w-2xl mx-auto text-lg">
                        Đội ngũ cán bộ, nhân viên Viện Phương Nam.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 space-y-20">

                {/* Lãnh Đạo Cấp Cao Nhất (Viện Trưởng) */}
                {topLeaders.length > 0 && (
                    <section>
                        <div className="text-center mb-10">
                            <span className="inline-block py-1 px-3 rounded-full glass-badge text-blue-700 text-sm font-bold uppercase tracking-wider mb-2">
                                Ban Lãnh Đạo
                            </span>
                            <h2 className="text-3xl font-bold text-slate-800">
                                Lãnh Đạo Viện
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
                            {topLeaders.map(person => (
                                <StaffCard
                                    key={person.id}
                                    person={person}
                                    variant="large"
                                    className={topLeaders.length === 1 ? 'md:col-start-2 lg:col-start-2' : ''}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Các Phòng Ban / Trung Tâm */}
                <div className="space-y-16">
                    {departmentGroups.map(({ department, staff }) => (
                        <section key={department.id} className="pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold mb-8 text-slate-800 border-l-4 border-blue-400 pl-4 uppercase">
                                {department.name}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {staff.map(person => (
                                    <StaffCard key={person.id} person={person} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
