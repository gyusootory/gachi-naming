// 가치작명소 광고·제휴 자리 설정 (여기만 고치면 앱과 자료 페이지에 바로 적용됩니다)
//
// 보이는 곳은 딱 두 곳입니다. 이름 입력 칸 위·중간이나 계산 중 화면에는 절대 나오지 않습니다.
//   result: 이름 추천·한자 찾기·이름 비교 결과 맨 아래
//   guide : 자료(가이드) 페이지 본문 아래, '다른 작명 가이드' 목록 위
//
// enabled 가 false 이면 아무것도 그리지 않습니다 (빈 상자도 생기지 않음).
// 제휴 링크는 자동으로 rel="sponsored noopener noreferrer" 가 붙고, 새 창으로 열립니다.
// 쿠팡 파트너스처럼 대가성 문구가 필요한 제휴는 disclosureText 에 그 문구를 넣고 showDisclosure 를 true 로 두세요.
//   예) '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.'
// 애드센스를 켜면 개인정보처리방침에 광고 쿠키 안내를 함께 추가해야 합니다.
window.GACHI_MZ = {
  affiliateSlot: {
    enabled: false,
    where: ['result', 'guide'],          // 보일 자리 (하나만 쓰려면 ['guide'] 처럼)
    badge: '제휴 추천',
    title: '',                            // 예: '출산 준비물, 한 번에 챙기기'
    description: '',                      // 예: '신생아 필수 준비물을 모아 둔 목록이에요'
    ctaText: '자세히 보기',
    url: '#',                             // 실제 제휴 링크 (https:// 로 시작)
    showDisclosure: true,
    disclosureText: '이 링크는 제휴 링크로, 구매나 가입이 이루어지면 가치작명소가 일정액의 수수료를 받을 수 있습니다.',
  },
  adsenseSlot: {
    enabled: false,
    clientId: '',                         // 예: 'ca-pub-0000000000000000'
    slotIdResult: '',                     // 결과 화면 아래 광고 단위 ID
    slotIdGuide: '',                      // 자료 페이지 아래 광고 단위 ID
  },
};
