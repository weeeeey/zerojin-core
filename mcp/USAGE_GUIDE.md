# DndGrid MCP Server - 사용 가이드

이 가이드는 Claude Desktop에서 DndGrid MCP 서버를 사용하는 실전 예제를 제공합니다.

## 목차

1. [설정](#설정)
2. [Tool 사용 예제](#tool-사용-예제)
3. [Resource 접근 예제](#resource-접근-예제)
4. [일반적인 워크플로우](#일반적인-워크플로우)
5. [고급 패턴](#고급-패턴)

## 설정

### 1. MCP Server 빌드

```bash
cd mcp
npm install
npm run build
```

### 2. Claude Desktop 설정

Claude Desktop 설정 파일 편집:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "dndgrid": {
      "command": "node",
      "args": ["/Users/your-username/path/to/zerojin-core/mcp/dist/index.js"]
    }
  }
}
```

### 3. Claude Desktop 재시작

MCP 서버를 로드하기 위해 Claude Desktop을 재시작하세요.

### 4. 설치 확인

Claude에게 물어보세요:
```
사용 가능한 DndGrid MCP tools 목록 보여줄 수 있어?
```

## Tool 사용 예제

### 1. interactive-builder: 템플릿 탐색

**사용 사례**: 사용 가능한 레이아웃 템플릿을 확인하고 싶습니다.

**대화**:
```
사용자: 사용 가능한 DndGrid 템플릿 보여줘

Claude: [action="list-templates"로 interactive-builder 사용]
```

**결과**: Claude가 ASCII 아트 미리보기 및 필요한 컴포넌트 슬롯과 함께 4개 템플릿을 모두 보여줍니다.

---

### 2. apply-template: 템플릿으로 빠른 레이아웃 생성

**사용 사례**: 표준 2x2 대시보드 레이아웃이 필요합니다.

**대화**:
```
사용자: UserStats, RevenueChart, ActivityLog, QuickActions 컴포넌트로 대시보드 레이아웃 만들어줘

Claude: [apply-template 사용]
{
  templateName: "dashboard-2x2",
  components: {
    widget1: "UserStats",
    widget2: "RevenueChart",
    widget3: "ActivityLog",
    widget4: "QuickActions"
  },
  width: 1400,
  height: 900
}
```

**생성된 코드**:
```typescript
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Dashboard() {
  return (
    <DndGridContainer width={1400} height={900}>
      <DndGridSplit direction="horizontal" ratio={0.5}>
        <DndGridSplit direction="vertical" ratio={0.5}>
          <DndGridItem>
            <UserStats />
          </DndGridItem>
          <DndGridItem>
            <RevenueChart />
          </DndGridItem>
        </DndGridSplit>
        <DndGridSplit direction="vertical" ratio={0.5}>
          <DndGridItem>
            <ActivityLog />
          </DndGridItem>
          <DndGridItem>
            <QuickActions />
          </DndGridItem>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}
```

---

### 3. generate-layout: 자연어 생성

**사용 사례**: 특정 레이아웃을 생각하고 있지만 어떤 템플릿과도 일치하지 않습니다.

**대화**:
```
사용자: FileTree는 왼쪽에 25%, CodeEditor는 중앙에 50%, PropertyPanel은 오른쪽에 25%로 레이아웃 만들어줘

Claude: [generate-layout 사용]
{
  description: "three column layout with file tree, code editor, and property panel",
  components: ["FileTree", "CodeEditor", "PropertyPanel"],
  containerWidth: 1600,
  containerHeight: 1000
}
```

**결과**: Claude가 설명과 일치하는 커스텀 3-컬럼 레이아웃을 생성합니다.

---

### 4. validate-layout: 기존 코드 검증

**사용 사례**: 기존 DndGrid 코드가 있고 문제를 확인하고 싶습니다.

**대화**:
```
사용자: 이 DndGrid 코드 검증해줘:

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function MyLayout() {
  return (
    <DndGridContainer width={800} height={600}>
      <DndGridSplit direction="vertical" ratio={0.1}>
        <DndGridItem>
          <Sidebar />
        </DndGridItem>
        <DndGridItem>
          <MainContent />
        </DndGridItem>
      </DndGridSplit>
    </DndGridContainer>
  );
}

Claude: [strict=true로 validate-layout 사용]
```

**결과**:
```
검증 결과:

경고:
1. Split ratio 0.1이 너무 작습니다 (< 0.2). 더 나은 UX를 위해 0.2-0.8 범위 사용을 고려하세요
2. "use client" 지시어 누락 (Next.js App Router에 필요)

제안사항:
- 더 나은 사용성을 위해 왼쪽 패널 비율을 최소 0.2로 증가시키세요
- Next.js App Router를 사용 중이라면 파일 상단에 "use client"; 추가하세요
```

---

### 5. analyze-layout: 성능 분석

**사용 사례**: 레이아웃의 성능 특성을 이해하고 싶습니다.

**대화**:
```
사용자: 내 DndGrid 레이아웃 성능 분석해줘:

"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function ComplexLayout() {
  return (
    <DndGridContainer width={1920} height={1080}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        <DndGridItem><Nav /></DndGridItem>
        <DndGridSplit direction="horizontal" ratio={0.3}>
          <DndGridSplit direction="vertical" ratio={0.5}>
            <DndGridItem><Panel1 /></DndGridItem>
            <DndGridItem><Panel2 /></DndGridItem>
          </DndGridSplit>
          <DndGridSplit direction="vertical" ratio={0.6}>
            <DndGridItem><Editor /></DndGridItem>
            <DndGridSplit direction="vertical" ratio={0.5}>
              <DndGridItem><Console /></DndGridItem>
              <DndGridItem><Terminal /></DndGridItem>
            </DndGridSplit>
          </DndGridSplit>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}

Claude: [analyze-layout 사용]
```

**결과**:
```
레이아웃 분석:

성능 메트릭:
- Items: 6
- Splits: 5
- Max Depth: 3
- 예상 성능: Good

모범 사례:
✅ "use client" 지시어 존재
✅ Imports 올바름
✅ Container 크기 지정됨
✅ 아이템 개수가 권장 제한 내에 있음 (< 20)
✅ 깊이가 권장 제한 내에 있음 (< 4)

리팩토링 기회:
- 더 나은 유지보수성을 위해 중첩된 오른쪽 패널을 별도 컴포넌트로 추출하는 것을 고려하세요
```

## Resource 접근 예제

### 1. 아키텍처 문서 읽기

**대화**:
```
사용자: DndGrid 아키텍처 문서 보여줘

Claude: [dndgrid://docs/architecture resource 읽기]
```

**결과**: Claude가 다음을 포함한 완전한 아키텍처 문서를 표시합니다:
- 핵심 컴포넌트 개요
- Flat rendering 패턴 설명
- Binary tree 구조
- Next.js 호환성 노트
- 성능 가이드라인

---

### 2. 사용 가능한 템플릿 목록

**대화**:
```
사용자: DndGrid에서 사용 가능한 템플릿은 뭐야?

Claude: [dndgrid://templates/list resource 읽기]
```

**결과**: Claude가 모든 템플릿의 메타데이터, 슬롯, tree 구조가 포함된 JSON 카탈로그를 보여줍니다.

---

### 3. 모범 사례 접근

**대화**:
```
사용자: DndGrid 성능 모범 사례가 뭐야?

Claude: [dndgrid://docs/best-practices resource 읽기]
```

**결과**: Claude가 성능 가이드라인, 일반적인 패턴, 문제 해결 팁을 제공합니다.

## 일반적인 워크플로우

### 워크플로우 1: 처음부터 새 레이아웃 만들기

**1단계**: 템플릿 탐색
```
사용자: 사용 가능한 DndGrid 템플릿 보여줘
```

**2단계**: 템플릿 선택
```
사용자: IDE 레이아웃 템플릿에 대해 더 알려줘
```

**3단계**: 컴포넌트와 함께 적용
```
사용자: MyFileExplorer, MyCodeEditor, MyTerminal로 IDE 레이아웃 적용해줘
```

**4단계**: 생성된 코드 검증
```
사용자: strict 모드로 생성된 코드 검증해줘
```

---

### 워크플로우 2: 기존 레이아웃 개선

**1단계**: 현재 코드 분석
```
사용자: 내 DndGrid 레이아웃 분석해줘: [코드 붙여넣기]
```

**2단계**: 제안사항 검토
```
Claude가 성능 메트릭과 제안사항 제공
```

**3단계**: 개선 요청
```
사용자: 제안된 개선사항을 적용해서 레이아웃 다시 생성해줘
```

**4단계**: 새 코드 검증
```
사용자: 새 코드 검증해줘
```

---

### 워크플로우 3: 커스텀 레이아웃 디자인

**1단계**: 레이아웃 설명
```
사용자: 상단 툴바(10%), 왼쪽 사이드바(20%), 메인 에디터(50%), 오른쪽 패널(20%), 하단 콘솔(나머지 공간)로 레이아웃 필요해
```

**2단계**: 설명으로부터 생성
```
Claude: [패턴 인식과 함께 generate-layout 사용]
```

**3단계**: 필요시 조정
```
사용자: 툴바가 너무 작아, 15%로 만들어줘
```

**4단계**: 완료 및 검증
```
사용자: strict 모드로 이 레이아웃 검증해줘
```

## 고급 패턴

### 패턴 1: 중첩 IDE 레이아웃

**목표**: 여러 중첩 패널이 있는 복잡한 IDE 생성

**접근 방식**:
```typescript
// 상세한 설명과 함께 generate-layout 사용
{
  description: "IDE layout with file tree (15%), split editor area (70%: main 60%, preview 40%), and split bottom panel (15%: console 50%, terminal 50%)",
  components: ["FileTree", "MainEditor", "Preview", "Console", "Terminal"],
  containerWidth: 1920,
  containerHeight: 1080
}
```

---

### 패턴 2: 반응형 대시보드

**목표**: 다양한 크기에서 잘 작동하는 대시보드 생성

**접근 방식**:
```typescript
// dashboard-2x2 템플릿으로 시작
// 일관된 레이아웃을 위해 권장 비율(0.5) 사용
// 위젯을 단순하게 유지하고 깊은 중첩 피하기
{
  templateName: "dashboard-2x2",
  components: {
    widget1: "MetricsCard",
    widget2: "ChartWidget",
    widget3: "TableWidget",
    widget4: "ActivityWidget"
  },
  width: 1200,  // 데스크톱 우선 디자인
  height: 800
}
```

---

### 패턴 3: E2E 테스트 설정

**목표**: CI/CD 파이프라인에서 레이아웃 검증

**스크립트**:
```typescript
// test-layout.ts
import { ASTParser } from './utils/ast-parser';
import { Validator } from './utils/validator';
import fs from 'fs';

const code = fs.readFileSync('./src/app/layout.tsx', 'utf-8');
const parser = new ASTParser();
const validator = new Validator();

const layout = parser.parse(code);
if (!layout) {
  console.error('Failed to parse layout');
  process.exit(1);
}

const result = validator.validate(layout, true); // strict mode
if (result.errors.length > 0) {
  console.error('Validation errors:', result.errors);
  process.exit(1);
}

console.log('Layout validation passed!');
```

---

### 패턴 4: 템플릿 커스터마이징

**목표**: 프로젝트용 커스텀 템플릿 생성

**접근 방식**:
1. `generate-layout`을 사용하여 기본 구조 생성
2. 생성된 코드 분석
3. 패턴과 비율 추출
4. 재사용을 위해 프로젝트 템플릿으로 저장

**예제**:
```
사용자: 우리 표준 관리자 페이지용 레이아웃 생성해줘: header (8%), sidebar (18%), content (64%), inspector (10%)

Claude: [레이아웃 생성]

사용자: 이것을 "admin-layout" 템플릿으로 저장해줘

Claude: [생성된 tree 구조를 BUILTIN_TEMPLATES에 복사할 수 있습니다]
```

## 팁과 트릭

### 1. 개발 중 엄격한 검증 사용

성능 이슈를 조기에 발견하기 위해 개발 중에는 항상 `strict: true`로 레이아웃을 검증하세요:

```
사용자: strict 모드 활성화해서 내 레이아웃 검증해줘
```

### 2. 템플릿으로 시작

일반적인 패턴의 경우, 처음부터 생성하는 것보다 항상 내장 템플릿으로 시작하세요:

```
사용자: 3-컬럼 레이아웃 필요해
Claude: three-column 템플릿이 완벽해요! 적용해드릴게요...
```

### 3. 생성된 레이아웃 반복 개선

첫 번째 생성에서 완벽을 기대하지 마세요. 반복하세요:

```
사용자: 레이아웃 생성해줘...
Claude: [생성]
사용자: 왼쪽 패널 더 넓게 만들어줘
Claude: [조정하여 재생성]
사용자: 완벽해! 이제 검증해줘
```

### 4. 분석을 통한 학습

모범 사례를 배우기 위해 `analyze-layout`을 사용하세요:

```
사용자: 내가 찾은 이 잘 작동하는 레이아웃 분석해줘
Claude: [왜 잘 작동하는지에 대한 인사이트 제공]
```

### 5. Tool 조합 사용

최상의 결과를 위해 tool들을 조합해서 사용하세요:

```
1. interactive-builder → 옵션 탐색
2. apply-template 또는 generate-layout → 코드 생성
3. validate-layout → 이슈 확인
4. analyze-layout → 성능 이해
```

## 문제 해결

### 이슈: 생성된 코드가 컴파일되지 않음

**해결책**: Next.js App Router를 사용 중인지 확인하고 "use client" 지시어가 있는지 확인하세요:
```
사용자: 이 코드 검증하고 Next.js 호환성 확인해줘
```

---

### 이슈: 레이아웃 성능이 나쁨

**해결책**: strict 모드로 분석하고 검증하세요:
```
사용자: 내 레이아웃에서 성능 이슈 찾아줘
Claude: [너무 많은 아이템이나 너무 깊은 중첩 식별]
사용자: 중첩 레벨을 줄여서 다시 생성해줘
```

---

### 이슈: 어떤 템플릿을 사용할지 모르겠음

**해결책**: interactive-builder 사용:
```
사용자: 사이드바와 메인 콘텐츠가 있는 레이아웃 필요해
Claude: [관련 템플릿을 보여주기 위해 interactive-builder 사용]
```

## 다음 단계

- 완전한 tool 레퍼런스는 [README](./README.md) 참조
- 더 많은 코드 샘플은 [examples/](./examples/) 확인
- resource를 통해 내장된 아키텍처 문서 읽기
- Claude Desktop에서 다양한 패턴 실험

DndGrid로 즐거운 개발 되세요!
