// 개발자 모드 활성화 스크립트
// 브라우저 콘솔에서 실행하거나 북마클릿으로 사용

(function() {
    // localStorage에 개발자 모드 활성화 플래그 설정
    localStorage.setItem('LONGRISE_DEV_MODE', 'enabled');

    // 페이지 새로고침
    window.location.reload();

    console.log('개발자 모드가 활성화되었습니다. 페이지가 새로고침됩니다.');
})();