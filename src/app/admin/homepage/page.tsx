import React from "react";
import AdminHomepageClient from "./AdminHomepageClient";

export const metadata = {
    title: "Manage Homepage Layout | Admin",
};

export default function AdminHomepage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Trang chủ / Homepage Layout</h1>
            <p className="text-slate-600 mb-8 max-w-2xl">
                Manage the sections that appear on the homepage. You can enable/disable sections, change their order, and edit specific content within them such as background videos or featured items.
            </p>
            <AdminHomepageClient />
        </div>
    );
}
