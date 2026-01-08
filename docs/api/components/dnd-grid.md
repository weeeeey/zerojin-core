# DndGrid Usage Guide

`DndGrid`는 선언적인 JSX 문법을 통해 복잡한 분할 레이아웃(Split Layout)을 구성하고, 드래그 앤 드롭(Drag & Drop)을 통해 레이아웃을 실시간으로 변경할 수 있는 React 컴포넌트 라이브러리입니다.

---

## 1. 개요

DndGrid는 다음과 같은 사용자 경험을 제공합니다:

-   **직관적인 레이아웃 정의**: HTML/JSX와 흡사한 구조로 복잡한 그리드를 설명할 수 있습니다.
-   **인터랙티브한 재구조화**: 사용자가 직접 영역을 드래그하여 레이아웃을 바꿀 수 있습니다.
-   **컴포넌트 상태 보존**: 레이아웃이 변경되어도 내부 컴포넌트의 입력값이나 스크롤 위치 등 React 상태가 유지됩니다.

---

## 2. 시작하기

### 설치

```bash
npm install zerojin
```

### AI 도구 활용 (MCP)

#### 설치 방법

해당 프로젝트의 Claude Desktop, Gemini CLI 등 MCP 클라이언트 설정 파일에 다음을 추가하세요:

```json
{
    "mcpServers": {
        "dndgrid": {
            "command": "npx",
            "args": ["-y", "mcp-dndgrid"]
        }
    }
}
```

#### 사용 방법

```bash
dndgrid mcp를 사용해서 Sidebar, CodeEditor, Terminal 컴포넌트로 3-패널 IDE 레이아웃 생성해줘
```

### 생성 결과

```tsx
import {
    DndGridContainer,
    DndGridSplit,
    DndGridItem,
} from 'zerojin/components';

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

| Prop       | 타입        | 기본값   | 설명                              |
| :--------- | :---------- | :------- | :-------------------------------- |
| `width`    | `number`    | **필수** | 전체 그리드의 너비 (px)           |
| `height`   | `number`    | **필수** | 전체 그리드의 높이 (px)           |
| `children` | `ReactNode` | -        | `DndGridSplit` 또는 `DndGridItem` |

### `DndGridSplit`

영역을 두 개로 분할하는 컴포넌트입니다.

| Prop        | 타입                         | 기본값   | 설명                                             |
| :---------- | :--------------------------- | :------- | :----------------------------------------------- |
| `direction` | `'horizontal' \| 'vertical'` | **필수** | 분할 방향 (`horizontal`: 상하, `vertical`: 좌우) |
| `ratio`     | `number`                     | `0.5`    | 첫 번째 자식(Primary)이 차지하는 비율 (0 ~ 1.0)  |
| `children`  | `ReactNode`                  | -        | 정확히 **2개**의 자식 컴포넌트가 필요합니다.     |

**자식 순서:**

-   `vertical`인 경우: 첫 번째 자식이 **왼쪽**, 두 번째 자식이 **오른쪽**
-   `horizontal`인 경우: 첫 번째 자식이 **위쪽**, 두 번째 자식이 **아래쪽**

### `DndGridItem`

실제 콘텐츠를 담는 최소 단위(Leaf Node)입니다.

| Prop       | 타입        | 설명                               |
| :--------- | :---------- | :--------------------------------- |
| `children` | `ReactNode` | 화면에 표시될 실제 사용자 컴포넌트 |

### `ItemDrag`

특정 영역이나 컨텐츠를 통해서만 드래그를 시작하고 싶을 때 사용합니다. 이 컴포넌트는 반드시 `DndGridItem` 내부에 선언되어야 합니다.

#### 주요 활용 방법

#### 방법 1: 아이템 전체를 드래그 영역으로 설정

`ItemDrag`로 `DndGridItemContent`를 감싸면 아이템 내부 어디를 클릭해도 드래그가 가능해집니다.

```tsx
<DndGridItem>
    <ItemDrag>
        <DndGridItemContent>
            <MyComponent />
        </DndGridItemContent>
    </ItemDrag>
</DndGridItem>
```

#### 방법 2: 특정 버튼/영역을 드래그 핸들로 설정

직접적인 드래그 요소(핸들)를 제어하고 싶을 때 사용합니다. 특정 버튼만 `ItemDrag`로 감싸고, 실제 콘텐츠는 별도로 배치합니다.

```tsx
<DndGridItem>
    <ItemDrag>
        <button>drag 버튼</button>
    </ItemDrag>
    <DndGridItemContent>
        <MyComponent />
    </DndGridItemContent>
</DndGridItem>
```

### `DndGridItemContent`

DragGridItem 내부에 있어야 하는 컴포넌트로 렌더링 될 ui를 감싸는 형태입니다.

---

## 4. 스타일링 및 커스터마이징

### Drop Indicator 커스터마이징

DndGrid는 `data-drop-quadrant` attribute를 사용하여 드롭 위치를 표시합니다. 드래그 중인 아이템이 다른 아이템 위로 hover할 때, 자동으로 사분면(top, left, right, bottom)을 감지하여 시각적 피드백을 제공합니다.

#### 기본 동작

기본적으로 드롭 가능한 영역에 box-shadow가 표시됩니다:

```css
/* 기본 스타일 (자동 적용) */
.dnd-grid-item[data-drop-quadrant='top'] {
    box-shadow: inset 0 10px 10px -5px rgba(0, 0, 0, 0.3);
}
```

#### 방법 1: CSS 오버라이드

글로벌 CSS 파일에서 기본 스타일을 오버라이드할 수 있습니다:

```css
/* 상단 사분면 - 파란색 테두리로 변경 */
.dnd-grid-item[data-drop-quadrant='top'] {
    border-top: 3px solid #3b82f6 !important;
    box-shadow: none !important;
}

/* 좌측 사분면 - 그라디언트 배경 */
.dnd-grid-item[data-drop-quadrant='left'] {
    background: linear-gradient(
        to right,
        rgba(59, 130, 246, 0.2),
        transparent
    ) !important;
    box-shadow: none !important;
}

/* 우측 사분면 - 두꺼운 빨간 테두리 */
.dnd-grid-item[data-drop-quadrant='right'] {
    border-right: 4px solid #ef4444 !important;
    box-shadow: none !important;
}

/* 하단 사분면 - 점선 테두리 */
.dnd-grid-item[data-drop-quadrant='bottom'] {
    border-bottom: 3px dashed #f59e0b !important;
    box-shadow: none !important;
}
```

#### 방법 2: dropIndicatorClassName Prop

특정 아이템에만 커스텀 스타일을 적용하려면 `dropIndicatorClassName` prop을 사용하세요:

```tsx
<DndGridItem dropIndicatorClassName="custom-drop-style">
    <YourComponent />
</DndGridItem>
```

```css
.custom-drop-style[data-drop-quadrant] {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.6);
    background: rgba(34, 197, 94, 0.1);
}

.custom-drop-style[data-drop-quadrant='top'] {
    border-top: 2px solid #22c55e;
}
```

#### 사분면별 Attribute 값

| 사분면 | Attribute 값                  | 기본 스타일                                  |
| ------ | ----------------------------- | -------------------------------------------- |
| 상단   | `data-drop-quadrant="top"`    | `inset 0 10px 10px -5px rgba(0, 0, 0, 0.3)`  |
| 좌측   | `data-drop-quadrant="left"`   | `inset 10px 0 10px -5px rgba(0, 0, 0, 0.3)`  |
| 우측   | `data-drop-quadrant="right"`  | `inset -10px 0 10px -5px rgba(0, 0, 0, 0.3)` |
| 하단   | `data-drop-quadrant="bottom"` | `inset 0 -10px 10px -5px rgba(0, 0, 0, 0.3)` |

#### 애니메이션 추가

부드러운 transition이나 애니메이션을 추가할 수 있습니다:

```css
.dnd-grid-item[data-drop-quadrant] {
    transition: all 200ms ease-in-out;
}

/* 펄스 효과 */
.dnd-grid-item[data-drop-quadrant='top'] {
    animation: pulse-top 1s ease-in-out infinite;
}

@keyframes pulse-top {
    0%,
    100% {
        box-shadow: inset 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    }
    50% {
        box-shadow: inset 0 15px 15px -5px rgba(0, 0, 0, 0.5);
    }
}
```

#### Tailwind CSS 통합

Tailwind CSS의 data attribute variant를 사용할 수 있습니다:

```tsx
<DndGridItem
    dropIndicatorClassName="
        data-[drop-quadrant=top]:border-t-4
        data-[drop-quadrant=top]:border-blue-500
        data-[drop-quadrant=left]:border-l-4
        data-[drop-quadrant=left]:border-green-500
        data-[drop-quadrant=right]:border-r-4
        data-[drop-quadrant=right]:border-red-500
        data-[drop-quadrant=bottom]:border-b-4
        data-[drop-quadrant=bottom]:border-orange-500
    "
>
    <YourComponent />
</DndGridItem>
```

#### 접근성 고려사항

색상만으로 의존하지 말고 패턴이나 텍스처를 함께 사용하세요:

```css
.dnd-grid-item[data-drop-quadrant='top'] {
    box-shadow: inset 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(59, 130, 246, 0.1) 10px,
        rgba(59, 130, 246, 0.1) 20px
    );
}
```

#### 고급 예제: 테마별 스타일

CSS Variables를 활용하면 테마별로 쉽게 스타일을 변경할 수 있습니다:

```css
/* Light Theme */
[data-theme='light'] .dnd-grid-item[data-drop-quadrant] {
    --drop-indicator-color: rgba(0, 0, 0, 0.3);
}

/* Dark Theme */
[data-theme='dark'] .dnd-grid-item[data-drop-quadrant] {
    --drop-indicator-color: rgba(255, 255, 255, 0.4);
}

.dnd-grid-item[data-drop-quadrant='top'] {
    box-shadow: inset 0 10px 10px -5px var(--drop-indicator-color);
}

.dnd-grid-item[data-drop-quadrant='left'] {
    box-shadow: inset 10px 0 10px -5px var(--drop-indicator-color);
}

.dnd-grid-item[data-drop-quadrant='right'] {
    box-shadow: inset -10px 0 10px -5px var(--drop-indicator-color);
}

.dnd-grid-item[data-drop-quadrant='bottom'] {
    box-shadow: inset 0 -10px 10px -5px var(--drop-indicator-color);
}
```

#### DndGridItem Props

| Prop                     | 타입        | 기본값      | 설명                                      |
| ------------------------ | ----------- | ----------- | ----------------------------------------- |
| `children`               | `ReactNode` | -           | 화면에 표시될 실제 사용자 컴포넌트        |
| `className`              | `string`    | `undefined` | 아이템 컨테이너에 추가할 CSS 클래스       |
| `dropIndicatorClassName` | `string`    | `undefined` | drop indicator에 추가할 커스텀 CSS 클래스 |
| `allowDrop`              | `boolean`   | `true`      | 이 아이템을 드롭 대상으로 허용할지 여부   |

---

## 5. 주요 특징 및 주의사항

### 상태 보존 (State Preservation)

DndGrid는 내부적으로 **Flat Rendering** 전략을 사용합니다. 드래그 앤 드롭으로 인해 트리의 깊이나 구조가 바뀌어도, `DndGridItem` 내부에 있는 사용자 컴포넌트는 리마운트(Unmount & Remount)되지 않고 상태를 유지합니다.

### Next.js (App Router) 지원

DndGrid는 클라이언트 측 인터랙션을 위해 브라우저 API와 상태 관리(Zustand)를 사용합니다. Next.js 환경에서 사용할 경우, 관련 컴포넌트를 사용하는 페이지나 부모 컴포넌트에 `"use client"` 지시문이 포함되어 있는지 확인하십시오.

---

## 6. 최적의 사용을 위한 가이드

-   **중첩 제한**: 기술적으로는 무제한 중첩이 가능하지만, 사용자 경험과 성능을 위해 가급적 **4단계 이하**의 중첩을 권장합니다.
-   **고유한 콘텐츠**: 각 `DndGridItem`에는 명확히 구분되는 콘텐츠를 배치하는 것이 가독성이 좋습니다.

---

## 트러블 슈팅

-   [dnd-grid-trouble](/api/components/dnd-grid-trouble)
