"use client";

import { useState, useEffect } from "react";
import KoreaMap from "../components/KoreaMap";
import VoteModal from "../components/VoteModal";
import { PARTIES, REGION_DATA } from "./constants";

export default function Home() {
  // 1. 상태 관리 (투표권, 지역별 득표수, 선택된 지역)
  const [remainingVotes, setRemainingVotes] = useState(10);
  const [regionVotes, setRegionVotes] = useState<Record<string, { conservative: number; progressive: number }>>({});
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. 초기화 (저장된 투표 기록이 있으면 불러오기 가능 - 여기선 생략)
  // 지도 클릭 시 실행되는 함수
  const handleRegionClick = (regionName: string) => {
    console.log("지역 클릭됨:", regionName); // 디버깅용

    // 데이터에 있는 지역 이름인지 확인 (ex: 서울특별시)
    // 데이터 키와 지도 이름이 약간 다를 수 있어서 보정
    let targetRegion = regionName;
    if (!REGION_DATA[targetRegion]) {
      // 이름 매칭 시도 (예: Seoul -> 서울특별시) - 지금은 단순화
      // 만약 데이터가 없으면 기본값 생성
    }

    setSelectedRegion(targetRegion);
    setIsModalOpen(true); // 팝업 열기!
  };

  // 3. 투표 실행 함수
  const handleVote = (partyId: "conservative" | "progressive", count: number = 1) => {
    if (remainingVotes < count || !selectedRegion) return;

    // 표 깎기
    setRemainingVotes((prev) => prev - count);

    // 해당 지역 득표수 올리기
    setRegionVotes((prev) => {
      const current = prev[selectedRegion] || { conservative: 0, progressive: 0 };
      return {
        ...prev,
        [selectedRegion]: {
          ...current,
          [partyId]: current[partyId] + count,
        },
      };
    });
  };

  // 4. 경합 지역 계산 (표 차이가 3표 이내인 곳)
  const swingStates = Object.entries(regionVotes).filter(([region, votes]) => {
    const diff = Math.abs(votes.conservative - votes.progressive);
    const total = votes.conservative + votes.progressive;
    return total > 0 && diff <= 3; // 표가 있고 격차가 3표 이내
  });

  // 5. 랭킹 데이터 계산 (투표율 높은 순)
  const rankingList = Object.entries(regionVotes)
    .map(([region, votes]) => ({
      region,
      conservative: votes.conservative,
      progressive: votes.progressive,
      total: votes.conservative + votes.progressive
    }))
    .sort((a, b) => b.total - a.total); // 내림차순 정렬

  // 6. 전국 투표 합계 계산
  const totalConservative = Object.values(regionVotes).reduce((sum, v) => sum + v.conservative, 0);
  const totalProgressive = Object.values(regionVotes).reduce((sum, v) => sum + v.progressive, 0);
  const totalVotes = totalConservative + totalProgressive;

  // 퍼센트 계산 (0으로 나누기 방지)
  const consPercent = totalVotes === 0 ? 50 : (totalConservative / totalVotes) * 100;
  const progPercent = totalVotes === 0 ? 50 : (totalProgressive / totalVotes) * 100;

  const [activeTab, setActiveTab] = useState<"swing" | "ranking">("swing");

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 헤더: 뉴스룸 스타일 */}
      <header className="bg-slate-900 text-white p-4 shadow-2xl relative z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-[10px] font-black tracking-widest px-2 py-1 rounded-sm animate-pulse">LIVE</span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter ml-1">
              2026 대한민국 정치 지형도 <span className="text-yellow-500">: 지역 점령전</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-slate-400 font-bold mb-0.5">남은 투표권</div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm transition-all duration-300 ${i < remainingVotes ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-100" : "bg-slate-800 scale-90"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-black text-white tabular-nums">{remainingVotes}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 전국 투표 현황 게이지 (다크 테마 뉴스룸 스타일) */}
      <div className="bg-slate-800 border-b-4 border-slate-900 shadow-xl relative z-10">
        <div className="max-w-6xl mx-auto py-6 px-4">
          {totalVotes === 0 ? (
            <div className="h-16 bg-slate-700/50 rounded-lg border border-slate-600 border-dashed flex items-center justify-center text-slate-400 text-sm font-bold gap-2">
              <span className="animate-bounce">🗳️</span> 아직 투표가 진행되지 않았습니다. 투표를 시작하세요!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-end px-1">
                <div className="text-red-500 font-black flex flex-col items-start leading-none">
                  <span className="text-xs opacity-70 mb-1">국민의힘</span>
                  <span className="text-3xl tracking-tighter shadow-red-500/20 drop-shadow-lg">{totalConservative.toLocaleString()}</span>
                </div>

                <div className="flex flex-col items-center pb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">TOTAL VOTES</span>
                </div>

                <div className="text-blue-500 font-black flex flex-col items-end leading-none">
                  <span className="text-xs opacity-70 mb-1">더불어민주당</span>
                  <span className="text-3xl tracking-tighter shadow-blue-500/20 drop-shadow-lg">{totalProgressive.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-6 flex rounded-sm overflow-hidden bg-slate-700 shadow-inner relative">
                {/* 중앙선 (눈금) */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-900/50 z-20 transform -translate-x-1/2"></div>

                <div
                  style={{ width: `${consPercent}%` }}
                  className="bg-gradient-to-r from-red-700 to-red-500 relative transition-all duration-700 ease-out"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                </div>
                <div
                  style={{ width: `${progPercent}%` }}
                  className="bg-gradient-to-l from-blue-700 to-blue-500 relative transition-all duration-700 ease-out"
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                </div>
              </div>

              <div className="flex justify-between text-xs font-bold text-slate-400 mt-1 px-1">
                <span>{consPercent.toFixed(1)}%</span>
                <span>{progPercent.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 왼쪽: 지도 영역 (2칸 차지) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-slate-200 p-1 relative overflow-hidden group">
          {/* 장식용 헤더 바 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-200 opacity-50"></div>

          <KoreaMap onRegionClick={handleRegionClick} regionVotes={regionVotes} />

          <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 text-xs shadow-2xl flex flex-col gap-2 ring-1 ring-black/5">
            <div className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-1">Map Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm ring-1 ring-red-200"></div> <span className="font-bold text-slate-600">국민의힘 우세</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm ring-1 ring-blue-200"></div> <span className="font-bold text-slate-600">더불어민주당 우세</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8B5CF6] rounded-full shadow-sm ring-1 ring-purple-200"></div> <span className="font-bold text-slate-600">동률 (접전)</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 현황판 (1칸 차지) */}
        <div className="space-y-6">
          {/* 정보 카드: 선거 뉴스룸 버전 */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-2xl relative overflow-hidden text-slate-300">
            {/* 배경 데코레이션 */}
            <div className="absolute top-0 right-0 p-20 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <h4 className="font-black text-white text-lg mb-6 flex items-center gap-2 relative z-10 border-b border-slate-700 pb-3">
              <span className="text-blue-500">ℹ️</span> 유권자 가이드
            </h4>
            <ul className="text-sm space-y-4 relative z-10">
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">01.</span>
                <span>매일 <strong>10장의 전략 투표권</strong>이 지급됩니다.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">02.</span>
                <span>지도를 클릭해 <strong>지역별 판세</strong>를 확인하세요.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">03.</span>
                <span>자정(00:00)에 <strong>투표권이 초기화</strong>됩니다.</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800 relative z-10">
              <p className="text-[10px] text-slate-500 font-medium italic text-center">
                "2026 지방선거 시뮬레이터 v1.0"
              </p>
            </div>
          </div>

          {/* 탭 네비게이션 카드 */}
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            {/* 카드 헤더 */}
            <div className="bg-slate-50 border-b border-slate-200 p-1 flex">
              <button
                onClick={() => setActiveTab("swing")}
                className={`flex-1 py-3 text-sm font-black transition-all rounded-lg flex items-center justify-center gap-2 ${activeTab === "swing" ? "bg-white text-slate-800 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
              >
                🔥 초접전 지역
              </button>
              <div className="w-1"></div>
              <button
                onClick={() => setActiveTab("ranking")}
                className={`flex-1 py-3 text-sm font-black transition-all rounded-lg flex items-center justify-center gap-2 ${activeTab === "ranking" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"}`}
              >
                🏆 투표 열기
              </button>
            </div>

            {/* 컨텐츠 영역 */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
              {/* 설명 박스 */}
              <div className="mb-4 text-xs font-medium text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {activeTab === "swing" ? (
                  <p>🔥 <strong>초접전 지역</strong>은 표 차이가 <span className="text-red-500 font-bold underline decoration-2">3표 이내</span>인 곳입니다. 당신의 한 표가 승패를 바꿀 수 있습니다.</p>
                ) : (
                  <p>🏆 <strong>투표 열기 랭킹</strong>은 현재 가장 많은 유권자가 참여한 지역을 보여줍니다.</p>
                )}
              </div>

              {activeTab === "swing" && (
                <>
                  {swingStates.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                      <span className="text-4xl text-slate-200">❄️</span>
                      <p className="text-sm font-bold">현재 초접전 지역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                      {swingStates.map(([region, votes]) => (
                        <div key={region} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition shadow-sm group">
                          <span className="font-bold text-slate-700 group-hover:text-black transition">{region}</span>
                          <div className="flex gap-3 text-xs font-black items-center bg-slate-50 px-2 py-1 rounded-md">
                            <span className="text-red-600">{votes.conservative}</span>
                            <span className="text-slate-300 text-[10px]">VS</span>
                            <span className="text-blue-600">{votes.progressive}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "ranking" && (
                <>
                  {rankingList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                      <span className="text-4xl text-slate-200">📊</span>
                      <p className="text-sm font-bold">투표 기록이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                      {rankingList.slice(0, 10).map((item, index) => (
                        <div key={item.region} className="flex flex-col p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-300 transition shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${index < 3 ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span>
                              <span className="font-bold text-slate-800 text-sm">{item.region}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{item.total.toLocaleString()}표</span>
                          </div>

                          <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div style={{ width: `${(item.conservative / item.total) * 100}%` }} className="bg-red-500 h-full" />
                            <div style={{ width: `${(item.progressive / item.total) * 100}%` }} className="bg-blue-500 h-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-slate-200 py-6 text-center text-slate-500 text-xs font-medium border-t border-slate-300">
        <p>© 2025 Antigravity Election Lab. All rights reserved.</p>
        <p className="mt-1">이 시뮬레이션은 어쩌구 저쩌구...</p>
      </footer>

      {/* 팝업 모달 (투표소) */}
      <VoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        regionName={selectedRegion || ""}
        regionInfo={selectedRegion ? REGION_DATA[selectedRegion] : null}
        votes={selectedRegion ? (regionVotes[selectedRegion] || { conservative: 0, progressive: 0 }) : { conservative: 0, progressive: 0 }}
        onVote={handleVote}
        remainingVotes={remainingVotes}
      />
    </main>
  );
}