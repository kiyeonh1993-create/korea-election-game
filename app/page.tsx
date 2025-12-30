"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import KoreaMap from "../components/KoreaMap";
import VoteModal from "../components/VoteModal";
import { PARTIES } from "./constants";

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [votes, setVotes] = useState<Record<string, { conservative: number; progressive: number }>>({});
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. 초기 데이터 불러오기 및 실시간 구독 설정
  useEffect(() => {
    const fetchInitialVotes = async () => {
      const { data, error } = await supabase.from("votes").select("*");
      if (data) {
        const voteMap = data.reduce((acc: any, curr: any) => {
          acc[curr.region_name] = {
            conservative: curr.conservative_count,
            progressive: curr.progressive_count,
          };
          return acc;
        }, {});
        setVotes(voteMap);
      }
      setLoading(false);
    };

    fetchInitialVotes();

    // 2. Supabase Realtime 설정 (누군가 투표하면 즉시 반영)
    const channel = supabase
      .channel("realtime-votes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "votes" },
        (payload) => {
          const updated = payload.new;
          setVotes((prev) => ({
            ...prev,
            [updated.region_name]: {
              conservative: updated.conservative_count,
              progressive: updated.progressive_count,
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRegionClick = (regionName: string) => {
    setSelectedRegion(regionName);
    setIsModalOpen(true);
  };

  const handleVote = async (partyId: "conservative" | "progressive") => {
    if (!selectedRegion) return;

    const column = partyId === "conservative" ? "conservative_count" : "progressive_count";

    // 데이터베이스 값 1 증가시키기
    const { error } = await supabase.rpc("increment_vote", {
      table_name: "votes",
      region_name_param: selectedRegion,
      column_name: column
    });

    if (error) {
      // RPC가 없는 경우를 대비한 일반 업데이트 방식
      const currentVote = votes[selectedRegion] || { conservative: 0, progressive: 0 };
      const newValue = partyId === "conservative"
        ? currentVote.conservative + 1
        : currentVote.progressive + 1;

      await supabase
        .from("votes")
        .update({ [column]: newValue })
        .eq("region_name", selectedRegion);
    }

    setIsModalOpen(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">전국 전황 파악 중...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            2026 대한민국 정치 지형도
          </h1>
          <p className="text-slate-500 font-bold">전국의 유권자들이 실시간으로 땅을 넓히고 있습니다!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <KoreaMap onRegionClick={handleRegionClick} regionVotes={votes} />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold border-b pb-4">실시간 점령 현황</h2>
            <div className="space-y-4">
              {Object.entries(votes).map(([name, v]) => {
                const total = v.conservative + v.progressive;
                const conPer = total === 0 ? 50 : (v.conservative / total) * 100;
                const proPer = total === 0 ? 50 : (v.progressive / total) * 100;

                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{name}</span>
                      <span>총 {total}표</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div style={{ width: `${conPer}%`, backgroundColor: PARTIES.conservative.color }} />
                      <div style={{ width: `${proPer}%`, backgroundColor: PARTIES.progressive.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <VoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        regionName={selectedRegion || ""}
        onVote={handleVote}
      />
    </main>
  );
}