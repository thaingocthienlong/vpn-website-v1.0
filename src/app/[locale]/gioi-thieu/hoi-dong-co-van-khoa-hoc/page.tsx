import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { StaffCard } from '@/components/cards/StaffCard';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'AdvisoryBoard' });
    return {
        title: t('metaTitle', { default: 'Hội đồng Cố vấn Khoa học - Viện Phương Nam' }),
        description: t('metaDescription', { default: 'Hội đồng Cố vấn Khoa học Viện Nghiên cứu Khoa học và Phát triển Phương Nam gồm các chuyên gia đầu ngành.' }),
    };
}

export default async function AdvisoryBoardPage({ params: { locale } }: { params: { locale: string } }) {
    // 1. Fetch only ADVISORY staff
    const staffList = await prisma.staff.findMany({
        where: {
            isActive: true,
            department: {
                slug: 'ban-co-van'
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

    // 2. Group by Department following the global sortOrder of the departments
    // Specifically related to advisory board
    const advisoryDeptIds = [...new Set(staffList.map(s => s.departmentId).filter((id): id is string => id !== null))];
    const departmentsList = await prisma.department.findMany({
        where: {
            id: { in: advisoryDeptIds }
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
                    <span className="inline-block py-1 px-3 rounded-full glass-badge text-cyan-300 text-sm font-bold uppercase tracking-wider mb-4">
                        Chuyên Gia
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
                        Hội đồng Cố vấn Khoa học
                    </h1>
                    <p className="text-slate-800 max-w-2xl mx-auto text-lg">
                        Tập hợp các Giáo sư, Tiến sĩ, chuyên gia đầu ngành đồng hành cùng sự phát triển của Viện Phương Nam.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 space-y-16">

                {/* Advisory Departments */}
                {departmentGroups.map(({ department, staff }) => (
                    <section key={department.id} className="pt-8 border-t border-slate-200 first:border-t-0 first:pt-0">
                        <h2 className="text-2xl font-bold mb-8 text-slate-800 border-l-4 border-cyan-400 pl-4 uppercase">
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
    );
}
