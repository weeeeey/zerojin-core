# DndGrid MCP Server - 빠른 시작 가이드

5분 안에 DndGrid MCP 서버를 시작하세요.

## 사전 요구사항

-   Node.js 18+ 설치
-   Claude Desktop 앱 설치
-   Terminal 접근 권한

## 1단계: 서버 빌드 (2분)

```bash
cd /path/to/zerojin-core/mcp
npm install
npm run build
```

**예상 출력**:

```
Build complete: dist/index.js (10.14 MB)
```

## 2단계: Claude Desktop 설정 (1분)

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json` 편집

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json` 편집

다음 설정을 추가하세요:

```json
{
    "mcpServers": {
        "dndgrid": {
            "command": "node",
            "args": ["/absolute/path/to/zerojin-core/mcp/dist/index.js"]
        }
    }
}
```

**중요**: `/absolute/path/to/zerojin-core`를 실제 프로젝트 경로로 변경하세요!

**경로 찾기**:

```bash
# zerojin-core 디렉토리에서
pwd
# 출력 결과를 복사하고 /mcp/dist/index.js를 추가
```

## 3단계: Claude Desktop 재시작 (30초)

1. Claude Desktop 완전히 종료
2. 앱 재실행
3. 완전히 로드될 때까지 대기

## 4단계: 서버 테스트 (1분)

새 대화를 열고 다음을 시도하세요:

### 테스트 1: 템플릿 목록

```
사용 가능한 DndGrid 템플릿 보여줘
```

**예상 결과**: Claude가 4개 템플릿 나열 (IDE, Dashboard, Three-Column, Split View)

### 테스트 2: 레이아웃 생성

```
FileExplorer, CodeEditor, Terminal 컴포넌트로 3-패널 IDE 레이아웃 만들어줘
```

**예상 결과**: Claude가 완전한 TypeScript/JSX 코드 생성

### 테스트 3: 문서 접근

```
DndGrid 아키텍처 문서 보여줘
```

**예상 결과**: Claude가 아키텍처 개요 표시

## 준비 완료! 🎉

세 가지 테스트가 모두 통과했다면 MCP 서버가 정상 작동하고 있습니다.

## 일반적인 첫 작업

### Dashboard 생성

```
dashboard-2x2 템플릿을 다음 컴포넌트로 적용해줘:
- UserStats
- RevenueChart
- ActivityLog
- QuickActions
```

### 커스텀 레이아웃 생성

```
다음 구조로 레이아웃 생성해줘:
- 상단 툴바 (10%)
- 왼쪽 사이드바 (20%)
- 메인 에디터 (50%)
- 오른쪽 패널 (20%)
```

### 기존 코드 검증

```
이 DndGrid 코드 검증해줘:
[코드 붙여넣기]
```

### 모범 사례 확인

```
DndGrid 성능 모범 사례가 뭐야?
```

## 문제 해결

### 서버가 로드되지 않음

**증상**: Claude가 DndGrid 명령어를 인식하지 못함

**해결**:

1. 설정 파일 경로가 올바른지 확인
2. `dist/index.js`가 존재하는지 확인 (없으면 다시 빌드)
3. Claude Desktop 재시작
4. Claude Desktop 로그 확인 (Help → View Logs)

### 경로 문제

**증상**: 파일을 찾을 수 없다는 오류

**해결**:

```bash
# 절대 경로 확인
cd /path/to/zerojin-core
pwd
# 이 출력을 설정에 사용하고, /mcp/dist/index.js를 추가
```

### 빌드 오류

**증상**: `npm run build` 실패

**해결**:

```bash
# 정리 후 재빌드
rm -rf node_modules dist
npm install
npm run build
```

## 다음 단계

-   고급 예제는 [USAGE_GUIDE.md](./USAGE_GUIDE.md) 참조
-   완전한 문서는 [README.md](./README.md) 참조
-   코드 샘플은 [examples/](./examples/) 디렉토리 확인
-   테스트는 [test-scenarios.md](./examples/test-scenarios.md) 참조

## 빠른 레퍼런스

### 사용 가능한 Tools

1. **validate-layout** - 코드 오류 검사
2. **analyze-layout** - 성능 메트릭 확인
3. **apply-template** - 내장 템플릿 사용
4. **generate-layout** - 설명으로부터 생성
5. **interactive-builder** - 템플릿 탐색

### 사용 가능한 템플릿

1. **ide-layout** - 3-패널 IDE (사이드바/에디터/터미널)
2. **dashboard-2x2** - 대시보드용 2x2 그리드
3. **three-column** - 왼쪽/가운데/오른쪽 컬럼
4. **split-view** - 단순 50/50 분할

각 템플릿의 상세 정보 (비율, 슬롯 구성, 비주얼)는 [README.md](./README.md#사용-가능한-템플릿)를 참조하세요.

### 사용 가능한 Resources

1. **dndgrid://docs/architecture** - 아키텍처 문서
2. **dndgrid://templates/list** - 템플릿 카탈로그
3. **dndgrid://docs/best-practices** - 모범 사례

## 대화 예시

**사용자**: 사용 가능한 템플릿 보여줘

**Claude**: [4개 템플릿을 미리보기와 함께 나열]

**사용자**: MyFileTree, MyEditor, MyConsole로 IDE 레이아웃 적용해줘

**Claude**: [완전한 코드 생성]

**사용자**: 그 코드를 strict 모드로 검증해줘

**Claude**: [검증 보고서 제공]

**사용자**: 좋아! 이번엔 대시보드 레이아웃으로 하나 더 생성해줘

**Claude**: [대시보드 코드 생성]

## 성능 팁

-   레이아웃을 20개 아이템 이하로 유지
-   중첩을 4 레벨 이하로 제한
-   Next.js App Router에는 "use client" 추가

상세한 성능 가이드라인과 제약사항은 [README.md](./README.md#성능-가이드라인)를 참조하세요.

## 도움말

문제가 발생하면:

1. 이 빠른 시작 가이드 확인
2. [USAGE_GUIDE.md](./USAGE_GUIDE.md) 검토
3. README의 [문제 해결](./README.md#문제-해결) 섹션 참조
4. [테스트 시나리오](./examples/test-scenarios.md) 확인

DndGrid로 즐거운 개발 되세요! 🚀
