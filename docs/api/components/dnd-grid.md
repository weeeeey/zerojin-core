# DndGrid Usage Guide

`DndGrid`는 선언적인 JSX 문법을 통해 복잡한 분할 레이아웃(Split Layout)을 구성하고, 드래그 앤 드롭(Drag & Drop)을 통해 레이아웃을 실시간으로 변경할 수 있는 React 컴포넌트 라이브러리입니다.

---

## 1. 개요

DndGrid는 다음과 같은 사용자 경험을 제공합니다:
- **직관적인 레이아웃 정의**: HTML/JSX와 흡사한 구조로 복잡한 그리드를 설명할 수 있습니다.
- **인터랙티브한 재구조화**: 사용자가 직접 영역을 드래그하여 레이아웃을 바꿀 수 있습니다.
- **컴포넌트 상태 보존**: 레이아웃이 변경되어도 내부 컴포넌트의 입력값이나 스크롤 위치 등 React 상태가 유지됩니다.

---

## 2. 시작하기

### 설치
(프로젝트 내의 해당 패키지 경로를 참조하세요.)

### 기본 사용법

```tsx
import { DndGridContainer, DndGridSplit, DndGridItem } from 'zerojin/components';

function MyDashboard() {
  return (
    <DndGridContainer width={1200} height={800}>
      <DndGridSplit direction="vertical" ratio={0.2}>
        {/* 사이드바 영역 */}
        <DndGridItem>
          <Sidebar />
        </DndGridItem>

        {/* 메인 콘텐츠 영역 */}
        <DndGridSplit direction="horizontal" ratio={0.7}>
          <DndGridItem>
            <MainEditor />
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

---

## 3. 컴포넌트 API

### `DndGridContainer`
그리드 시스템의 루트 컴포넌트입니다.

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `width` | `number` | **필수** | 전체 그리드의 너비 (px) |
| `height` | `number` | **필수** | 전체 그리드의 높이 (px) |
| `children` | `ReactNode` | - | `DndGridSplit` 또는 `DndGridItem` |

### `DndGridSplit`
영역을 두 개로 분할하는 컴포넌트입니다.

| Prop | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `direction` | `'horizontal' \| 'vertical'` | **필수** | 분할 방향 (`horizontal`: 상하, `vertical`: 좌우) |
| `ratio` | `number` | `0.5` | 첫 번째 자식(Primary)이 차지하는 비율 (0 ~ 1.0) |
| `children` | `ReactNode` | - | 정확히 **2개**의 자식 컴포넌트가 필요합니다. |

**자식 순서:**
- `vertical`인 경우: 첫 번째 자식이 **왼쪽**, 두 번째 자식이 **오른쪽**
- `horizontal`인 경우: 첫 번째 자식이 **위쪽**, 두 번째 자식이 **아래쪽**

### `DndGridItem`
실제 콘텐츠를 담는 최소 단위(Leaf Node)입니다.

| Prop | 타입 | 설명 |
| :--- | :--- | :--- |
| `children` | `ReactNode` | 화면에 표시될 실제 사용자 컴포넌트 |

---

## 4. 주요 특징 및 주의사항

### 상태 보존 (State Preservation)
DndGrid는 내부적으로 **Flat Rendering** 전략을 사용합니다. 드래그 앤 드롭으로 인해 트리의 깊이나 구조가 바뀌어도, `DndGridItem` 내부에 있는 사용자 컴포넌트는 리마운트(Unmount & Remount)되지 않고 상태를 유지합니다.

### Next.js (App Router) 지원
DndGrid는 클라이언트 측 인터랙션을 위해 브라우저 API와 상태 관리(Zustand)를 사용합니다. Next.js 환경에서 사용할 경우, 관련 컴포넌트를 사용하는 페이지나 부모 컴포넌트에 `"use client"` 지시문이 포함되어 있는지 확인하십시오.

---

## 5. 최적의 사용을 위한 가이드

- **중첩 제한**: 기술적으로는 무제한 중첩이 가능하지만, 사용자 경험과 성능을 위해 가급적 **4단계 이하**의 중첩을 권장합니다.
- **고유한 콘텐츠**: 각 `DndGridItem`에는 명확히 구분되는 콘텐츠를 배치하는 것이 가독성이 좋습니다.

---

## 더 알아보기
내부 동작 원리나 상세 구현 방식이 궁금하시다면 [DndGrid Core Architecture](./dnd-core.md) 문서를 참고하세요.
