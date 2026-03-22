import {
    ArrowsClockwise,
    Certificate,
    Flask,
    GraduationCap,
    Leaf,
    ShieldCheck,
} from "@phosphor-icons/react";
import type { ServiceIconKey } from "@/lib/content/service-pages";

export const serviceIconMap = {
    research: Flask,
    transfer: ArrowsClockwise,
    inspection: ShieldCheck,
    monitoring: Leaf,
    iso: Certificate,
    training: GraduationCap,
} as const;

export function getServiceIcon(iconKey: ServiceIconKey) {
    return serviceIconMap[iconKey];
}
