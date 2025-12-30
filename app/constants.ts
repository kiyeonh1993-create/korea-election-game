// app/constants.ts

export const PARTIES = {
    conservative: {
        id: "conservative",
        name: "국민의힘",
        color: "#E61E2B",
        // ✅ 요청하신 나무위키 SVG 링크로 교체
        logo: "https://i.namu.wiki/i/GihISJrck5BSgfDOXfqxuXU0H0B0Nw2Mwz4AYpRrwYVfZv6jRXXJQO_Xja-HbxiJn8lDMNS2IrBe_-AB_zIlB0DJdcW3h8PiK_yYUCJysy8Lyo7AeGGx7XJfnXzUUODKWTO_rEzV2-_chN4NLIe_JA.svg",
    },
    progressive: {
        id: "progressive",
        name: "더불어민주당",
        color: "#004EA2",
        // ✅ 요청하신 나무위키 SVG 링크로 교체
        logo: "https://i.namu.wiki/i/As5DSm_v6rIhQ_jweX9aG2hU1w7h9Dgwvrc0vl0PLHV0_ho5XjPmdY-kiRrPNdqY4sLlqoYmG3RqTXSWdbszIb_MmngwtzxDs1ntjpBbmmxNe9efsC8vWrAb9X9O2vdtXI8dRO74eQGmnsqrRe5fDA.svg",
    },
    independent: {
        id: "independent",
        name: "무소속",
        color: "#808080",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/200px-Question_mark_%28black%29.svg.png",
    },
};

export const REGION_DATA: Record<string, any> = {
    "서울특별시": { name: "오세훈", title: "서울시장", party: "conservative", prev_name: "박원순", prev_party: "progressive" },
    "부산광역시": { name: "박형준", title: "부산시장", party: "conservative", prev_name: "오거돈", prev_party: "progressive" },
    "대구광역시": { name: "홍준표", title: "대구시장", party: "conservative", prev_name: "권영진", prev_party: "conservative" },
    "인천광역시": { name: "유정복", title: "인천시장", party: "conservative", prev_name: "박남춘", prev_party: "progressive" },
    "광주광역시": { name: "강기정", title: "광주시장", party: "progressive", prev_name: "이용섭", prev_party: "progressive" },
    "대전광역시": { name: "이장우", title: "대전시장", party: "conservative", prev_name: "허태정", prev_party: "progressive" },
    "울산광역시": { name: "김두겸", title: "울산시장", party: "conservative", prev_name: "송철호", prev_party: "progressive" },
    "세종특별자치시": { name: "최민호", title: "세종시장", party: "conservative", prev_name: "이춘희", prev_party: "progressive" },
    "경기도": { name: "김동연", title: "경기도지사", party: "progressive", prev_name: "이재명", prev_party: "progressive" },
    "강원도": { name: "김진태", title: "강원도지사", party: "conservative", prev_name: "최문순", prev_party: "progressive" },
    "충청북도": { name: "김영환", title: "충북지사", party: "conservative", prev_name: "이시종", prev_party: "progressive" },
    "충청남도": { name: "김태흠", title: "충남지사", party: "conservative", prev_name: "양승조", prev_party: "progressive" },
    "전라북도": { name: "김관영", title: "전북지사", party: "progressive", prev_name: "송하진", prev_party: "progressive" },
    "전라남도": { name: "김영록", title: "전남지사", party: "progressive", prev_name: "이낙연", prev_party: "progressive" },
    "경상북도": { name: "이철우", title: "경북지사", party: "conservative", prev_name: "김관용", prev_party: "conservative" },
    "경상남도": { name: "박완수", title: "경남지사", party: "conservative", prev_name: "김경수", prev_party: "progressive" },
    "제주특별자치도": { name: "오영훈", title: "제주지사", party: "progressive", prev_name: "원희룡", prev_party: "conservative" },
};