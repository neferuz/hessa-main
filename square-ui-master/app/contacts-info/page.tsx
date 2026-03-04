"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MapPin, Save, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Language = "RU" | "UZ" | "EN";

export default function ContactsInfoAdminPage() {
    const [lang, setLang] = useState<Language>("RU");
    const [contactsInfo, setContactsInfo] = useState({
        latitude: 41.2995,
        longitude: 69.2401,
        address: "",
        address_uz: "",
        address_en: "",
        phone: "",
        email: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchContactsInfo();
    }, []);

    const fetchContactsInfo = async () => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/content?t=${Date.now()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            if (data.contacts_info) {
                setContactsInfo(data.contacts_info);
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Get current data to merge
            const currentRes = await fetch(`http://127.0.0.1:8000/api/content?t=${Date.now()}`);
            if (!currentRes.ok) throw new Error("Failed to fetch current data");
            const currentData = await currentRes.json();

            // 2. Prepare payload
            // Ensure numbers are numbers
            const payloadInfo = {
                ...contactsInfo,
                latitude: Number(contactsInfo.latitude),
                longitude: Number(contactsInfo.longitude)
            };

            const payload = {
                ...currentData,
                contacts_info: payloadInfo
            };

            // 3. Send POST request
            const res = await fetch("http://127.0.0.1:8000/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Данные успешно сохранены!");
                // Refresh local state to ensure it matches server
                const updatedData = await res.json();
                if (updatedData.contacts_info) {
                    setContactsInfo(updatedData.contacts_info);
                }
            } else {
                const errorData = await res.json().catch(() => null);
                console.error("Save error:", errorData);
                toast.error(`Ошибка при сохранении: ${res.status}`);
            }
        } catch (err) {
            console.error(err);
            toast.error("Ошибка при сохранении");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    const currentAddress = lang === 'RU' ? contactsInfo.address : (lang === 'UZ' ? contactsInfo.address_uz : contactsInfo.address_en);

    const handleAddressChange = (val: string) => {
        if (lang === 'RU') setContactsInfo({ ...contactsInfo, address: val });
        else if (lang === 'UZ') setContactsInfo({ ...contactsInfo, address_uz: val });
        else setContactsInfo({ ...contactsInfo, address_en: val });
    };

    return (
        <SidebarProvider className="bg-sidebar">
            <DashboardSidebar />
            <div className="h-svh overflow-hidden lg:p-2 w-full">
                <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background relative border-border/40">
                    <DashboardHeader
                        title={
                            <div className="flex items-center gap-2">
                                <MapPin className="size-5 text-primary" />
                                <h1 className="text-base font-bold tracking-tight">Контакты и Координаты</h1>
                            </div>
                        }
                        description="Управление адресом, телефоном, email и координатами для карты"
                        actions={
                            <div className="flex items-center gap-4">
                                {/* Language Switcher */}
                                <div className="bg-muted/30 p-1 rounded-xl flex items-center border border-border">
                                    {(['RU', 'UZ', 'EN'] as Language[]).map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLang(l)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all min-w-[50px] relative",
                                                lang === l
                                                    ? "text-primary-foreground bg-primary"
                                                    : "text-muted-foreground hover:bg-background/20 hover:text-foreground"
                                            )}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>

                            </div>
                        }
                    />
                    <div className="w-full overflow-y-auto overflow-x-hidden p-6 h-full bg-muted/30">
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Contact Info (Common) */}
                            <div className="bg-background rounded-2xl p-6 border border-border/40">
                                <h2 className="text-lg font-semibold mb-4 text-foreground">Общая информация</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Телефон</label>
                                        <input
                                            type="text"
                                            value={contactsInfo.phone}
                                            onChange={(e) => setContactsInfo({ ...contactsInfo, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                            placeholder="+998 90 123 45 67"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
                                        <input
                                            type="email"
                                            value={contactsInfo.email}
                                            onChange={(e) => setContactsInfo({ ...contactsInfo, email: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                            placeholder="info@hessa.uz"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address (Multilingual) */}
                            <div className="bg-background rounded-2xl p-6 border border-border/40">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-foreground">Адрес ({lang})</h2>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Мультиязычное поле</span>
                                </div>

                                {contactsInfo && (
                                    <textarea
                                        value={lang === 'RU' ? contactsInfo.address : (lang === 'UZ' ? contactsInfo.address_uz : contactsInfo.address_en) || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setContactsInfo(prev => ({
                                                ...prev,
                                                [lang === 'RU' ? 'address' : (lang === 'UZ' ? 'address_uz' : 'address_en')]: val
                                            }));
                                        }}
                                        className="w-full px-4 py-3 bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] text-foreground resize-none"
                                        rows={4}
                                        placeholder={`Введите адрес на ${lang === 'RU' ? 'русском' : (lang === 'UZ' ? 'узбекском' : 'английском')}...`}
                                    />
                                )}
                            </div>

                            {/* Coordinates */}
                            <div className="bg-background rounded-2xl p-6 border border-border/40">
                                <h2 className="text-lg font-semibold mb-4 text-foreground">Координаты карты</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Используются для отображения карты Google Maps на странице контактов.
                                    <br />
                                    <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Открыть Google Maps для поиска координат
                                    </a>
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                            Широта (Latitude)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={contactsInfo.latitude}
                                            onChange={(e) => setContactsInfo({ ...contactsInfo, latitude: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-muted-foreground">
                                            Долгота (Longitude)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={contactsInfo.longitude}
                                            onChange={(e) => setContactsInfo({ ...contactsInfo, longitude: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-background border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Floating Save Button */}
                <motion.div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 p-2 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className={cn(
                                "h-11 px-8 bg-primary text-primary-foreground rounded-full font-semibold text-sm",
                                "hover:bg-primary/90 transition-all flex items-center gap-2",
                                "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            )}
                        >
                            {saving ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                            {saving ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </SidebarProvider>
    );
}
