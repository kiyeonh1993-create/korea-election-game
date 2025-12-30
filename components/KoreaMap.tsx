// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
// @ts-ignore
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

import { PARTIES } from "../app/constants";

// ✅ [수정됨] 100% 작동하는 대한민국 지도 데이터 (South Korea Maps 공식 저장소)
const KOREA_TOPO_JSON =
    "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_topo_simple.json";

interface KoreaMapProps {
    onRegionClick?: (regionName: string) => void;
    regionVotes?: Record<string, { conservative: number; progressive: number }>;
}

const KoreaMap: React.FC<KoreaMapProps> = ({ onRegionClick, regionVotes }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 데이터 로딩 확인용 로직
        fetch(KOREA_TOPO_JSON)
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                return response.json();
            })
            .then((data) => {
                console.log("✅ 지도 데이터 로드 성공!");
                setGeoData(data);
            })
            .catch((err) => {
                console.error("❌ 지도 데이터 로드 실패:", err);
                setError(err.message);
            });
    }, []);

    // 이름 단축 함수 (예: 서울특별시 -> 서울)
    const formatRegionName = (name: string) => {
        if (!name) return "";
        if (name.length <= 2) return name;
        if (name.endsWith("특별시")) return name.replace("특별시", "");
        if (name.endsWith("광역시")) return name.replace("광역시", "");
        if (name.endsWith("특별자치시")) return name.replace("특별자치시", "");
        if (name.endsWith("특별자치도")) return name.replace("특별자치도", "");
        if (name.endsWith("도")) return name;
        if (name === "충청북도") return "충북";
        if (name === "충청남도") return "충남";
        if (name === "전라북도") return "전북";
        if (name === "전라남도") return "전남";
        if (name === "경상북도") return "경북";
        if (name === "경상남도") return "경남";
        if (name === "경기도") return "경기";
        if (name === "강원도") return "강원";
        return name;
    };

    return (
        <div className="w-full h-[600px] bg-slate-50 rounded-xl overflow-hidden flex flex-col items-center justify-center border border-slate-200 relative group">
            {/* 배경 이미지 (은은하게) */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: "url('/map-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "grayscale(100%)"
                }}
            />

            {/* 로딩 및 에러 메시지 */}
            {!geoData && !error && <div className="text-blue-600 font-bold animate-pulse">🇰🇷 지도를 불러오는 중입니다...</div>}
            {error && <div className="text-red-500 font-bold">⚠️ 지도 로딩 실패: {error}</div>}

            {/* 줌 힌트 (모바일) */}
            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-[10px] text-slate-500 font-bold shadow-sm pointer-events-none select-none">
                👋 지도를 확대/이동할 수 있습니다
            </div>

            {/* 지도 렌더링 */}
            {geoData && (
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 5500, // 지도 기본 배율
                        center: [127.5, 36], // 대한민국 중심 좌표
                    }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ZoomableGroup
                        center={[127.5, 36]}
                        minZoom={1}
                        maxZoom={5}
                    >
                        <Geographies geography={geoData}>
                            {({ geographies }: { geographies: any[] }) => (
                                <>
                                    {geographies.map((geo) => {
                                        // 데이터에서 지역 이름 추출
                                        const regionName = geo.properties.name || "알 수 없는 지역";

                                        // 투표 데이터 기반 색상 결정
                                        const votes = regionVotes ? regionVotes[regionName] : undefined;
                                        let fillColor = "#CBD5E1"; // 기본 회색

                                        if (votes) {
                                            const totalVotes = votes.conservative + votes.progressive;
                                            if (totalVotes > 0) {
                                                if (votes.conservative > votes.progressive) {
                                                    fillColor = PARTIES.conservative.color;
                                                } else if (votes.progressive > votes.conservative) {
                                                    fillColor = PARTIES.progressive.color;
                                                } else {
                                                    fillColor = "#8B5CF6"; // 동률 (보라색)
                                                }
                                            }
                                        }

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fillColor}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none", transition: "all 0.2s" },
                                                    hover: { fill: "#F59E0B", outline: "none", cursor: "pointer", zIndex: 10 },
                                                    pressed: { fill: "#D97706", outline: "none" },
                                                }}
                                                onClick={() => onRegionClick && onRegionClick(regionName)}
                                            />
                                        );
                                    })}

                                    {/* 텍스트 라벨 (지도 위에 표시) */}
                                    {geographies.map((geo) => {
                                        const center = geoCentroid(geo);
                                        const regionName = geo.properties.name;
                                        const formattedName = formatRegionName(regionName);

                                        let [x, y] = center;

                                        // 경기도 좌표 조정
                                        if (regionName === '경기도') {
                                            y -= 0.15;
                                            x += 0.1;
                                        }
                                        // 인천 좌표 조정
                                        if (regionName === '인천광역시') {
                                            x -= 0.15;
                                            y += 0.05;
                                        }
                                        // 충남 좌표 조정
                                        if (regionName === '충청남도') {
                                            x -= 0.15;
                                            y += 0.05;
                                        }

                                        return (
                                            <Marker key={`label-${geo.rsmKey}`} coordinates={[x, y]}>
                                                <text
                                                    textAnchor="middle"
                                                    y={1.5}
                                                    style={{
                                                        fontFamily: "Pretendard, sans-serif",
                                                        fontSize: "12px", // 폰트 사이즈 추가 확대 (6px -> 12px)
                                                        fontWeight: "900",
                                                        fill: "#334155", // slate-700
                                                        pointerEvents: "none",
                                                        textShadow: "2px 2px 0 #fff" // 그림자도 확대
                                                    }}
                                                >
                                                    {formattedName}
                                                </text>
                                            </Marker>
                                        );
                                    })}
                                </>
                            )}
                        </Geographies>
                    </ZoomableGroup>
                </ComposableMap>
            )}
        </div>
    );
};

export default KoreaMap;