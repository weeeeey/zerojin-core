# DndGrid MCP Server

DndGrid 컴포넌트 라이브러리를 위한 Model Context Protocol (MCP) 서버입니다. AI 기반 도구를 통해 DndGrid 레이아웃을 생성, 분석, 관리할 수 있습니다.

## 주요 기능

### 🛠️ MCP Tools

1. **validate-layout** - DndGrid 코드 구조 및 제약사항 검증
2. **analyze-layout** - 기존 코드 분석 및 성능 권장사항 제공
3. **apply-template** - 사전 정의된 레이아웃 템플릿 적용
4. **generate-layout** - 자연어 설명으로부터 레이아웃 생성
5. **interactive-builder** - 대화형 템플릿 선택 가이드

### 📚 MCP Resources

1. **dndgrid://docs/architecture** - 완전한 DndGrid 아키텍처 문서
2. **dndgrid://templates/list** - 사용 가능한 모든 템플릿 카탈로그
3. **dndgrid://docs/best-practices** - 성능 및 통합 가이드라인

## 설치

```bash
cd mcp
npm install
npm run build
```

## Claude Desktop 설정

Claude Desktop 설정 파일에 다음을 추가하세요:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

`/absolute/path/to/zerojin-core`를 실제 프로젝트 경로로 변경하세요.

## 빠른 시작

### IDE 레이아웃 생성

```typescript
// Claude에게 요청:
// "Sidebar, CodeEditor, Terminal 컴포넌트로 3-패널 IDE 레이아웃 생성해줘"

// 결과:
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Layout() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        <DndGridItem>
          <Sidebar />
        </DndGridItem>
        <DndGridSplit direction="horizontal" ratio={0.7}>
          <DndGridItem>
            <CodeEditor />
          </DndGridItem>
          <DndGridItem>
            <Terminal />
          </DndGridItem>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}
```

### 템플릿 적용

```typescript
// Claude에게 요청:
// "dashboard-2x2 템플릿을 UserStats, SalesChart, ActivityFeed, RecentOrders 컴포넌트로 적용해줘"

// Claude는 apply-template tool을 다음과 같이 사용합니다:
{
  templateName: "dashboard-2x2",
  components: {
    widget1: "UserStats",
    widget2: "SalesChart",
    widget3: "ActivityFeed",
    widget4: "RecentOrders"
  }
}
```

### 기존 코드 검증

```typescript
// Claude에게 요청:
// "이 DndGrid 코드 검증해줘"

// Claude가 validate-layout을 사용하여 검증합니다
// 반환: 오류, 경고, 제안사항
```

## 사용 가능한 템플릿

### IDE Layout
```
┌────┬────────────┐
│    │            │
│ S  │   Editor   │
│ I  │            │
│ D  ├────────────┤
│ E  │  Terminal  │
└────┴────────────┘
```
- **슬롯**: sidebar, editor, terminal
- **비율**: 20% / 56% / 24%

### Dashboard 2x2
```
┌──────┬──────┐
│  W1  │  W2  │
├──────┼──────┤
│  W3  │  W4  │
└──────┴──────┘
```
- **슬롯**: widget1, widget2, widget3, widget4
- **비율**: 동일한 50/50 분할

### Three Column
```
┌───┬────────┬───┐
│   │        │   │
│ L │ Center │ R │
│   │        │   │
└───┴────────┴───┘
```
- **슬롯**: left, center, right
- **비율**: 20% / 60% / 20%

### Split View
```
┌──────────┬──────────┐
│          │          │
│   Left   │   Right  │
│          │          │
└──────────┴──────────┘
```
- **슬롯**: left, right
- **비율**: 50% / 50%

## Tool 레퍼런스

### validate-layout

DndGrid 코드 구조 및 제약사항을 검증합니다.

**파라미터**:
- `code` (string): 검증할 DndGrid 코드
- `strict` (boolean, 선택): 엄격한 성능 검사 활성화

**예제**:
```typescript
{
  code: `<DndGridContainer width={1200} height={800}>...</DndGridContainer>`,
  strict: true
}
```

**반환**: 오류, 경고, 제안사항이 포함된 검증 보고서

### analyze-layout

기존 DndGrid 코드를 성능 메트릭 및 개선 제안과 함께 분석합니다.

**파라미터**:
- `code` (string): 분석할 DndGrid 코드

**예제**:
```typescript
{
  code: `export default function MyLayout() { ... }`
}
```

**반환**:
- 성능 메트릭 (아이템 개수, 깊이, 예상 성능)
- 모범 사례 검사
- 리팩토링 기회

### apply-template

사전 정의된 템플릿을 컴포넌트 이름과 함께 적용합니다.

**파라미터**:
- `templateName` (string): 사용할 템플릿 ('ide-layout', 'dashboard-2x2', 'three-column', 'split-view')
- `components` (object): 템플릿 슬롯과 컴포넌트 이름 매핑
- `width` (number, 선택): Container 너비 (기본값: 1200)
- `height` (number, 선택): Container 높이 (기본값: 800)
- `framework` (string, 선택): 대상 프레임워크 (기본값: 'nextjs-app')

**예제**:
```typescript
{
  templateName: "ide-layout",
  components: {
    sidebar: "FileExplorer",
    editor: "CodeEditor",
    terminal: "Terminal"
  },
  width: 1400,
  height: 900
}
```

### generate-layout

자연어 설명으로부터 DndGrid 레이아웃을 생성합니다.

**파라미터**:
- `description` (string): 원하는 레이아웃에 대한 자연어 설명
- `components` (array): 배치할 컴포넌트 이름 목록
- `containerWidth` (number, 선택): Container 너비 (기본값: 1200)
- `containerHeight` (number, 선택): Container 높이 (기본값: 800)
- `framework` (string, 선택): 대상 프레임워크 (기본값: 'nextjs-app')

**예제**:
```typescript
{
  description: "사이드바, 에디터, 터미널이 있는 3-패널 IDE 레이아웃",
  components: ["Sidebar", "CodeEditor", "Terminal"],
  containerWidth: 1200,
  containerHeight: 800
}
```

**지원되는 패턴**:
- IDE layout (3개 컴포넌트: 사이드바 + 에디터 + 하단 패널)
- Dashboard/Grid (4개 컴포넌트: 2x2 그리드)
- Three column (3개 컴포넌트: 왼쪽 + 가운데 + 오른쪽)
- Split view (2개 컴포넌트: 왼쪽/오른쪽 또는 위/아래)
- Custom (대체: 수직 스택)

### interactive-builder

템플릿 선택을 위한 대화형 가이드입니다.

**파라미터**:
- `action` (string): 수행할 작업 ('list-templates', 'select-template', 'help')
- `templateName` (string, 선택): 템플릿 이름 ('select-template'용)

**예제**:
```typescript
// 모든 템플릿 나열
{ action: "list-templates" }

// 특정 템플릿 상세 정보
{ action: "select-template", templateName: "ide-layout" }

// 도움말 표시
{ action: "help" }
```

## Resource 레퍼런스

### dndgrid://docs/architecture

다음을 포함한 완전한 DndGrid 아키텍처 문서:
- 핵심 컴포넌트 (Container, Split, Item)
- Flat rendering 패턴
- Binary tree 구조
- Next.js 호환성
- 성능 가이드라인

### dndgrid://templates/list

다음을 포함한 모든 내장 템플릿의 JSON 카탈로그:
- 템플릿 메타데이터
- 슬롯 요구사항
- 기본 비율
- Tree 구조

### dndgrid://docs/best-practices

다음을 다루는 모범 사례 가이드:
- 성능 최적화 (아이템 개수, 깊이 제한)
- Split 비율 권장사항
- Next.js 통합 (App Router vs Pages Router)
- 일반적인 패턴
- 문제 해결

## 성능 가이드라인

### 권장 제한
- **아이템**: 최적 성능을 위해 < 20개
- **깊이**: < 4 레벨 권장
- **Split 비율**: 0.2 - 0.8 범위

### 최대 제한
- **아이템**: < 50개 (절대 최대)
- **깊이**: < 6 레벨 (절대 최대)

## Next.js 통합

### App Router (Next.js 13+)
모든 DndGrid 컴포넌트에 `"use client"` 지시어 필요:

```typescript
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';
```

### Pages Router
지시어 불필요 - 컴포넌트가 직접 작동합니다.

## 문제 해결

### Drag-and-Drop 중 State 초기화

**문제**: 아이템을 드래그할 때 컴포넌트 state가 초기화됨

**해결책**: DndGrid 컴포넌트를 사용하는 모든 파일에 `"use client"` 지시어 추가

### 성능 문제

**문제**: 느린 drag-and-drop 또는 렌더링

**해결책**:
- 아이템 개수 줄이기 (20개 이하 유지)
- 중첩 깊이 줄이기 (4 레벨 이하 유지)
- 컴포넌트 구조 단순화
- 복잡한 아이템에 lazy loading 고려

### 검증 오류

`validate-layout` tool을 `strict: true`로 사용하여 상세한 성능 경고 및 제안을 받으세요.

## 개발

```bash
# 의존성 설치
npm install

# 서버 빌드
npm run build

# 개발 모드 (watch)
npm run dev
```

## 라이선스

MIT

## 지원

문제나 질문이 있으면 DndGrid 문서를 참조하거나 MCP tools를 사용하여 도움을 받으세요.
