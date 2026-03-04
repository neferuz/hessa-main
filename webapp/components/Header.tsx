"use client";
import { Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
    const [user, setUser] = useState<{
        first_name?: string;
        last_name?: string;
        photo_url?: string;
        username?: string;
    } | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
            const tgUser = (window as any).Telegram.WebApp.initDataUnsafe?.user;
            if (tgUser) {
                setUser(tgUser);
            }
        }
    }, []);

    const getDisplayName = () => {
        if (!user) return "Юзер";
        if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
        if (user.first_name) return user.first_name;
        if (user.username) return user.username;
        return "Юзер";
    };

    return (
        <header className="flex items-center justify-between px-6 pt-4 pb-2 bg-transparent shrink-0 z-50 relative">
            {/* Left Section: Avatar and Greeting */}
            <div className="flex items-center gap-2.5">
                <Link href="/profile" className="relative active:scale-95 transition-transform group">
                    <div className="w-[38px] h-[38px] rounded-full border border-gray-100/50 overflow-hidden bg-white/50 flex items-center justify-center transition-all">
                        {user?.photo_url ? (
                            <Image
                                src={user.photo_url}
                                alt="User Avatar"
                                width={38}
                                height={38}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={18} className="text-[#8E8E93]" />
                        )}
                    </div>
                </Link>
                <div className="flex flex-col justify-center">
                    <span className="text-[11px] text-[#8E8E93] font-medium leading-none mb-1">
                        Доброе утро
                    </span>
                    <span className="text-[15px] font-bold text-[#1C1C1E] leading-none tracking-tight">
                        {getDisplayName()}
                    </span>
                </div>
            </div>

            {/* Right Section: Circular Notification */}
            <div className="flex items-center">
                <button className="relative w-[36px] h-[36px] bg-transparent rounded-full flex items-center justify-center active:scale-95 hover:bg-gray-50/50 transition-all text-[#1C1C1E] border border-gray-200">
                    <Bell size={17} strokeWidth={1.5} className="text-[#1C1C1E]" />
                    <span className="absolute top-[8px] right-[8px] w-1.5 h-1.5 bg-[#FF3B30] rounded-full ring-[1.5px] ring-white" />
                </button>
            </div>
        </header>
    );
}
