"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PARTIES } from "../app/constants";
import { motion, AnimatePresence } from "framer-motion";

interface VoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    regionName: string;
    regionInfo: any;
    votes: { conservative: number; progressive: number };
    onVote: (partyId: "conservative" | "progressive", count?: number) => void;
    remainingVotes: number;
}

export default function VoteModal({
    isOpen,
    onClose,
    regionName,
    regionInfo,
    votes,
    onVote,
    remainingVotes,
}: VoteModalProps) {
    const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; color: string; text: string }[]>([]);

    if (!isOpen) return null;

    // 정당 정보 찾기 helper
    const getPartyInfo = (partyKey: string) => {
        return Object.values(PARTIES).find((p) => p.id === partyKey) || PARTIES.independent;
    };

    const currentParty = getPartyInfo(regionInfo?.party);
    const previousParty = getPartyInfo(regionInfo?.prev_party);

    const isChange = regionInfo?.party !== regionInfo?.prev_party;

    const handleVoteClick = (partyId: "conservative" | "progressive", e: React.MouseEvent<HTMLButtonElement>, count: number = 1) => {
        if (remainingVotes < count) return;

        onVote(partyId, count);

        // Animation
        const rect = e.currentTarget.getBoundingClientRect();
        // Randomize x slightly
        const randomX = (Math.random() - 0.5) * 40;
        const x = e.clientX - rect.left + randomX;
        const y = e.clientY - rect.top;

        const partyColor = PARTIES[partyId].color;

        const newText = {
            id: Date.now(),
            x,
            y,
            color: partyColor,
            text: count > 1 ? `+${count}` : "+1"
        };

        setFloatingTexts((prev) => [...prev, newText]);

        setTimeout(() => {
            setFloatingTexts((prev) => prev.filter((item) => item.id !== newText.id));
        }, 1000);
    };

    const totalVotes = votes.conservative + votes.progressive;
    const consRatio = totalVotes === 0 ? 0 : ((votes.conservative / totalVotes) * 100).toFixed(1);
    const progRatio = totalVotes === 0 ? 0 : ((votes.progressive / totalVotes) * 100).toFixed(1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative">

                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>

                {/* 헤더 */}
                <div className="pt-8 pb-2 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {regionName}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">지역 점령전 투표</p>
                </div>

                {/* 본문 */}
                <div className="px-6 pb-6 overflow-y-auto max-h-[80vh] custom-scrollbar">

                    {/* 1. 현직 카드 */}
                    <div className="mt-4 border-2 border-sky-200 bg-sky-50/30 rounded-2xl p-6 flex flex-col items-center text-center relative">
                        <div className="flex items-center justify-center mb-3">
                            {/* 로고 (텍스트 제거됨) */}
                            <div className="h-14 w-48 relative">
                                <Image
                                    src={currentParty.logo}
                                    alt={currentParty.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="text-xl font-bold text-slate-900">{regionInfo?.name}</div>
                            <div className="text-sm text-slate-500">{regionInfo?.title}</div>
                        </div>

                        <span className="bg-sky-100 text-sky-600 text-[10px] font-bold px-3 py-1 rounded-full">
                            현재
                        </span>
                    </div>

                    {/* 화살표 & 뱃지 */}
                    <div className="flex flex-col items-center -my-3 relative z-10 gap-1">
                        <div className="text-slate-300 text-lg">↓</div>
                        {isChange ? (
                            <span className="bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                정권 교체 지역! 🔄
                            </span>
                        ) : (
                            <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                                정권 유지 (아성) 🏰
                            </span>
                        )}
                    </div>

                    {/* 2. 전직 박스 */}
                    <div className="mt-4 bg-slate-100 rounded-xl p-4 text-center">
                        <div className="text-[10px] text-slate-400 font-bold mb-1">전직</div>
                        <div className="text-sm text-slate-600 font-medium">
                            {regionInfo?.prev_name} <span className="text-slate-400">({previousParty.name})</span>
                        </div>
                    </div>

                    {/* 3. 투표 현황 */}
                    <div className="mt-8 mb-6">
                        <h4 className="text-xs font-bold text-slate-500 mb-3">현재 투표 현황</h4>

                        {/* 보수 바 */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-red-600">보수 진영</span>
                                <span className="text-slate-800">{consRatio}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${consRatio}%` }} className="h-full bg-red-600 rounded-full transition-all duration-500" />
                            </div>
                        </div>

                        {/* 진보 바 */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-blue-600">진보 진영</span>
                                <span className="text-slate-800">{progRatio}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div style={{ width: `${progRatio}%` }} className="h-full bg-blue-600 rounded-full transition-all duration-500" />
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-slate-400 font-medium">
                            총 투표 수: <span className="text-slate-600 font-bold">{totalVotes}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-6"></div>

                    {/* 4. 투표 섹션 */}
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-700 mb-4">어느 진영에 투표하시겠습니까?</p>

                        <div className="space-y-3">
                            <button
                                onClick={(e) => handleVoteClick("conservative", e)}
                                disabled={remainingVotes <= 0}
                                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition flex justify-center items-center relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10">보수 진영 투표</span>
                                {/* Background Hover Effect */}
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                                {/* Animation Container */}
                                <AnimatePresence>
                                    {floatingTexts.filter(t => t.color === PARTIES.conservative.color).map((text) => (
                                        <motion.span
                                            key={text.id}
                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 0, y: -40, scale: 1.5 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute pointer-events-none text-2xl font-black"
                                            style={{ left: "50%", top: "50%", color: "#fff", zIndex: 100, textShadow: "0px 2px 4px rgba(0,0,0,0.3)" }}
                                        >
                                            {text.text}
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </button>

                            <button
                                onClick={(e) => handleVoteClick("progressive", e)}
                                disabled={remainingVotes <= 0}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition flex justify-center items-center relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="relative z-10">진보 진영 투표</span>
                                {/* Background Hover Effect */}
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                                {/* Animation Container */}
                                <AnimatePresence>
                                    {floatingTexts.filter(t => t.color === PARTIES.progressive.color).map((text) => (
                                        <motion.span
                                            key={text.id}
                                            initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 0, y: -40, scale: 1.5 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute pointer-events-none text-2xl font-black"
                                            style={{ left: "50%", top: "50%", color: "#fff", zIndex: 100, textShadow: "0px 2px 4px rgba(0,0,0,0.3)" }}
                                        >
                                            {text.text}
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </button>
                        </div>

                        {/* MAX Buttons Small */}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <button
                                onClick={(e) => handleVoteClick("conservative", e, remainingVotes)}
                                disabled={remainingVotes <= 0}
                                className="text-[10px] text-slate-400 hover:text-red-600 font-bold underline decoration-dotted transition"
                            >
                                [보수] 남은 표 모두 걸기 (x{remainingVotes})
                            </button>
                            <button
                                onClick={(e) => handleVoteClick("progressive", e, remainingVotes)}
                                disabled={remainingVotes <= 0}
                                className="text-[10px] text-slate-400 hover:text-blue-600 font-bold underline decoration-dotted transition"
                            >
                                [진보] 남은 표 모두 걸기 (x{remainingVotes})
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}