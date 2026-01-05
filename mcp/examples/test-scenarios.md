# DndGrid MCP Server - 테스트 시나리오

이 문서는 MCP 서버 기능을 검증하기 위한 포괄적인 테스트 시나리오를 포함합니다.

## 설정

1. MCP 서버 빌드:
```bash
cd mcp
npm install
npm run build
```

2. 예제 설정으로 Claude Desktop 구성
3. Claude Desktop 재시작

## 테스트 시나리오

### 시나리오 1: 사용 가능한 템플릿 목록

**목표**: interactive-builder가 모든 템플릿을 나열할 수 있는지 확인

**단계**:
1. Claude Desktop 열기
2. 질문: "사용 가능한 DndGrid 템플릿 보여줘"

**예상 결과**:
- Claude가 `action: "list-templates"`로 `interactive-builder` 사용
- 응답에 4개 템플릿 모두 포함:
  - IDE Layout
  - Dashboard 2x2
  - Three Column
  - Split View
- 각 템플릿에 다음이 표시됨:
  - ASCII 아트 미리보기
  - 필요한 슬롯
  - 설명

**통과 기준**: 완전한 정보와 함께 4개 템플릿 모두 표시됨

---

### 시나리오 2: IDE Layout 템플릿 적용

**목표**: 템플릿 적용이 올바른 코드를 생성하는지 확인

**단계**:
1. 질문: "FileExplorer, CodeEditor, Terminal 컴포넌트로 IDE 레이아웃 템플릿 적용해줘"

**예상 결과**:
- Claude가 다음과 같이 `apply-template` 사용:
  ```json
  {
    "templateName": "ide-layout",
    "components": {
      "sidebar": "FileExplorer",
      "editor": "CodeEditor",
      "terminal": "Terminal"
    }
  }
  ```
- 생성된 코드에 포함:
  - `"use client";` 지시어 (Next.js App Router용)
  - 올바른 imports
  - 적절히 중첩된 DndGridSplit 컴포넌트
  - 올바른 비율 (0.2 vertical, 0.7 horizontal)
  - 세 컴포넌트 모두 올바르게 배치됨

**통과 기준**: 코드가 컴파일되고 템플릿 구조와 일치함

---

### 시나리오 3: 자연어로부터 레이아웃 생성

**목표**: 자연어 패턴 인식 확인

**단계**:
1. 질문: "UserStats, RevenueChart, ActivityLog, QuickActions로 2x2 대시보드 레이아웃 생성해줘"

**예상 결과**:
- Claude가 다음과 같이 `generate-layout` 사용:
  ```json
  {
    "description": "2x2 dashboard layout...",
    "components": ["UserStats", "RevenueChart", "ActivityLog", "QuickActions"]
  }
  ```
- 감지된 패턴: `dashboard` (2x2 그리드)
- 생성된 코드가 적절한 2x2 그리드 구조 생성
- 4개 컴포넌트 모두 올바르게 배치됨

**통과 기준**: Dashboard 패턴이 인식되고 코드가 올바르게 생성됨

---

### 시나리오 4: 유효한 코드 검증

**목표**: 올바른 코드에 대해 검증이 통과하는지 확인

**단계**:
1. Claude에게 검증 요청:
```typescript
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Layout() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.3}>
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
```

**예상 결과**:
- Claude가 `validate-layout` 사용
- 결과 표시:
  - ✅ 오류 없음
  - ✅ 유효한 구조
  - ✅ 적절한 "use client" 지시어
  - ✅ 올바른 imports
  - 비율이 권장 범위 내에 있다는 경고 가능

**통과 기준**: 오류 없이 검증 통과

---

### 시나리오 5: 잘못된 코드 검증 ("use client" 누락)

**목표**: 검증이 누락된 Next.js 지시어를 감지하는지 확인

**단계**:
1. Claude에게 검증 요청:
```typescript
import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Layout() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.5}>
        <DndGridItem>
          <Panel1 />
        </DndGridItem>
        <DndGridItem>
          <Panel2 />
        </DndGridItem>
      </DndGridSplit>
    </DndGridContainer>
  );
}
```

**예상 결과**:
- 검증 경고: "use client" 지시어 누락

**통과 기준**: 경고가 누락된 지시어를 올바르게 식별함

---

### 시나리오 6: 잘못된 코드 검증 (극단적 비율)

**목표**: 검증이 나쁜 UX 비율을 감지하는지 확인

**단계**:
1. strict 모드로 Claude에게 검증 요청:
```typescript
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function Layout() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.05}>
        <DndGridItem>
          <TinyPanel />
        </DndGridItem>
        <DndGridItem>
          <MainContent />
        </DndGridItem>
      </DndGridSplit>
    </DndGridContainer>
  );
}
```

**예상 결과**:
- 경고: Split ratio 0.05가 너무 작음 (< 0.2)
- 제안: 더 나은 UX를 위해 0.2-0.8 범위 사용

**통과 기준**: 비율 경고가 올바르게 식별됨

---

### 시나리오 7: 레이아웃 성능 분석

**목표**: 분석이 올바른 메트릭을 제공하는지 확인

**단계**:
1. Claude에게 분석 요청:
```typescript
"use client";

import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

export default function ComplexLayout() {
  return (
    <DndGridContainer width={1920} height={1080}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        <DndGridItem><Nav /></DndGridItem>
        <DndGridSplit direction="horizontal" ratio={0.7}>
          <DndGridSplit direction="vertical" ratio={0.6}>
            <DndGridItem><Editor /></DndGridItem>
            <DndGridItem><Preview /></DndGridItem>
          </DndGridSplit>
          <DndGridSplit direction="horizontal" ratio={0.5}>
            <DndGridItem><Console /></DndGridItem>
            <DndGridItem><Terminal /></DndGridItem>
          </DndGridSplit>
        </DndGridSplit>
      </DndGridSplit>
    </DndGridContainer>
  );
}
```

**예상 결과**:
- 메트릭:
  - Items: 5
  - Splits: 4
  - Max Depth: 3
  - Performance: Good
- 모범 사례 확인:
  - ✅ "use client" 존재
  - ✅ 올바른 imports
  - ✅ Container 크기 지정됨
  - ✅ 권장 제한 내에 있음

**통과 기준**: 올바른 메트릭 계산됨

---

### 시나리오 8: Three-Column 레이아웃 생성

**목표**: three-column 패턴 인식 확인

**단계**:
1. 질문: "LeftSidebar, MainEditor, RightPanel로 three-column 레이아웃 생성해줘"

**예상 결과**:
- 감지된 패턴: `three-column`
- 코드가 적절한 비율로 vertical split 사용
- 컴포넌트가 왼쪽에서 오른쪽으로 배치됨

**통과 기준**: Three-column 구조가 올바르게 생성됨

---

### 시나리오 9: 커스텀 레이아웃 생성 (Fallback)

**목표**: 알 수 없는 레이아웃에 대한 커스텀 패턴 fallback 확인

**단계**:
1. 질문: "A, B, C, D, E 5개 컴포넌트를 수직으로 쌓은 레이아웃 생성해줘"

**예상 결과**:
- 패턴: `custom`
- 중첩된 vertical split 사용
- 5개 컴포넌트 모두 적절히 쌓임

**통과 기준**: Fallback 패턴이 올바르게 작동함

---

### 시나리오 10: Architecture Resource 접근

**목표**: resource 접근이 작동하는지 확인

**단계**:
1. 질문: "DndGrid 아키텍처 문서 보여줘"

**예상 결과**:
- Claude가 `dndgrid://docs/architecture` resource 읽기
- 응답에 포함:
  - 핵심 컴포넌트 설명
  - Flat rendering 패턴
  - Binary tree 구조
  - Next.js 호환성 노트
  - 성능 가이드라인

**통과 기준**: 완전한 아키텍처 문서 표시됨

---

### 시나리오 11: Templates Resource 접근

**목표**: templates resource가 JSON 카탈로그를 제공하는지 확인

**단계**:
1. 질문: "템플릿 카탈로그를 JSON으로 보여줘"

**예상 결과**:
- Claude가 `dndgrid://templates/list` resource 읽기
- 4개 템플릿 모두 포함된 JSON 반환
- 각 템플릿에 포함:
  - name
  - description
  - preview
  - slots
  - defaultRatios
  - tree 구조

**통과 기준**: 완전한 템플릿 데이터가 포함된 유효한 JSON 반환됨

---

### 시나리오 12: Best Practices Resource 접근

**목표**: best practices 문서 확인

**단계**:
1. 질문: "DndGrid 성능 모범 사례가 뭐야?"

**예상 결과**:
- Claude가 `dndgrid://docs/best-practices` resource 읽기
- 정보 포함:
  - 성능 제한 (아이템, 깊이, 비율)
  - Next.js 통합 가이드
  - 일반적인 패턴
  - 문제 해결 팁

**통과 기준**: 완전한 모범 사례 가이드 표시됨

---

### 시나리오 13: End-to-End 워크플로우

**목표**: 템플릿 선택부터 검증까지 완전한 워크플로우 테스트

**단계**:
1. "사용 가능한 템플릿 보여줘"
2. "MetricsCard, ChartWidget, TableWidget, ActivityWidget로 dashboard-2x2 템플릿 적용해줘"
3. "strict 모드로 생성된 코드 검증해줘"

**예상 결과**:
- 세 단계 모두 성공적으로 실행됨
- 템플릿이 올바르게 적용됨
- 오류 없이 검증 통과

**통과 기준**: 완전한 워크플로우가 원활하게 작동함

---

### 시나리오 14: 오류 처리 - 잘못된 템플릿 이름

**목표**: 적절한 오류 처리 확인

**단계**:
1. 질문: "'invalid-template' 템플릿 적용해줘"

**예상 결과**:
- 오류 메시지: Template "invalid-template" not found
- 사용 가능한 템플릿 목록 표시

**통과 기준**: 유용한 정보가 포함된 명확한 오류 메시지

---

### 시나리오 15: 오류 처리 - 누락된 템플릿 슬롯

**목표**: 슬롯 검증 확인

**단계**:
1. 질문: "FileExplorer 컴포넌트만으로 IDE 레이아웃 템플릿 적용해줘"

**예상 결과**:
- 오류: Missing component mappings for slots: editor, terminal
- 필요한 슬롯 표시

**통과 기준**: 슬롯 검증이 올바르게 작동함

## 성능 테스트

### 테스트 1: 대규모 레이아웃 생성

**목표**: 복잡한 레이아웃에서의 성능 확인

**단계**:
1. 15개 컴포넌트로 레이아웃 생성
2. 성능 메트릭 분석
3. 높은 아이템 개수에 대한 경고 확인

**예상 결과**:
- 코드가 성공적으로 생성됨
- 경고: 권장 제한(20 아이템)에 근접
- 구조 단순화 제안

---

### 테스트 2: 깊은 중첩 검증

**목표**: 깊이 제한 경고 확인

**단계**:
1. 5 깊이 레벨로 수동으로 중첩된 레이아웃 생성
2. strict 모드로 검증

**예상 결과**:
- 경고: Max depth 5가 제한(6)에 근접
- 중첩 줄이기 제안

## 통합 테스트

### 테스트 1: Next.js App Router 통합

**목표**: 생성된 코드가 Next.js App Router에서 작동하는지 확인

**단계**:
1. IDE 레이아웃 생성
2. Next.js app 디렉토리에 복사
3. Next.js dev 서버 실행
4. 오류 없음 확인

**예상 결과**:
- 오류 없이 코드 컴파일됨
- "use client" 지시어 작동
- 레이아웃이 올바르게 렌더링됨

---

### 테스트 2: Framework 파라미터

**목표**: framework 파라미터가 출력에 영향을 주는지 확인

**단계**:
1. `framework: "nextjs-pages"`로 레이아웃 생성
2. "use client" 지시어 없음 확인

**예상 결과**:
- Pages Router 버전에는 "use client" 없음
- App Router 버전(기본값)에는 "use client" 있음

## 회귀 테스트

코드 변경 후, 다음을 확인하기 위해 위의 모든 시나리오를 실행하세요:
- 중단 변경 없음
- 모든 tool이 여전히 작동
- 모든 resource 접근 가능
- 오류 처리 변경 없음
- 성능 메트릭 정확

## 테스트 자동화

다음에 대한 자동화 테스트 구현 고려:
- Input schema 검증 (Zod)
- Tool 출력 형식 일관성
- Resource 가용성
- 패턴 인식 정확도
- 코드 생성 정확성

## 수동 테스트 체크리스트

- [ ] 5개 tool 모두 독립적으로 작동
- [ ] 3개 resource 모두 접근 가능
- [ ] 템플릿 적용 정확
- [ ] 자연어 생성 정확
- [ ] 검증이 오류 감지
- [ ] 분석이 올바른 메트릭 제공
- [ ] Interactive builder 유용
- [ ] 오류 메시지 명확
- [ ] 성능이 제한 내에 있음
- [ ] Next.js 호환성 확인됨

## 알려진 제한사항

1. 패턴 인식은 휴리스틱 기반 (ML 아님)
2. 자연어 이해가 사전 정의된 패턴으로 제한됨
3. 런타임 레이아웃 수정 지원 안 됨
4. 정적 코드 생성만 가능
5. Binary tree 구조로 제한됨

## 향후 테스트 시나리오

- 멀티 프레임워크 지원 (React, Vue 등)
- 커스텀 템플릿 생성
- 레이아웃 마이그레이션 도구
- 실시간 레이아웃 미리보기
- Drag-and-drop 비주얼 빌더 통합
