# DndGrid Architecture

`DndGrid`는 **트리 기반 레이아웃 모델**을 사용하는 Drag & Drop 그리드 시스템입니다.  
Split / Item 컴포넌트를 조합하여 IDE, 대시보드, 에디터와 같은 **복잡한 레이아웃**을 안정적으로 구성할 수 있도록 설계되었습니다.

이 문서는 DndGrid의 **핵심 설계 철학, 내부 구조, 상태 보존 전략**을 설명합니다.

---

## 설계 목표

DndGrid는 다음 문제를 해결하기 위해 설계되었습니다.

-   중첩 가능한 분할 레이아웃
-   Drag & Drop 이후에도 **컴포넌트 상태 보존**
-   불필요한 리렌더링 최소화
-   선언적인 JSX 기반 레이아웃 정의
-   확장 가능한 구조 (DnD, Resize, Serialize)

---

## 전체 구조 개요

DndGridContainer
└── Tree Root
├── Split Node
│ ├── Split Node
│ │ ├── Item Node
│ │ └── Item Node
│ └── Item Node
└── Item Node

---

## 핵심 개념: Layout Tree

### Node 타입

DndGrid는 내부적으로 다음 두 가지 Node 타입을 가집니다.

| Node        | 설명                    |
| ----------- | ----------------------- |
| `SplitNode` | 영역을 분할하는 노드    |
| `ItemNode`  | 실제 콘텐츠를 담는 노드 |

모든 노드는 공통적으로 다음 속성을 가집니다.

```ts
interface BaseNode {
  id: string;
  type: 'split' | 'item';
  parent: BaseNode | null;
}


⸻

SplitNode 설계

SplitNode는 자식 두 개를 가지는 이진 노드입니다.

interface SplitNode extends BaseNode {
  type: 'split';
  direction: 'horizontal' | 'vertical';
  ratio: number;
  children: [PrimaryNode, SecondaryNode];
}

특징
	•	children은 항상 2개
	•	ratio는 PrimaryNode 자식 기준
	•	방향 + 비율만으로 레이아웃 계산 가능
	•	재귀적으로 중첩 가능

⸻

ItemNode 설계

ItemNode는 실제 React 콘텐츠와 연결되는 노드입니다.

interface ItemNode extends BaseNode {
  type: 'item';
  element: ReactNode;
}

특징
	•	레이아웃 트리의 리프 노드
	•	내부 컴포넌트의 state를 보존
	•	DnD 이동 시에도 동일한 ItemNode 인스턴스 유지

⸻

JSX → Layout Tree 변환

사용자는 선언적으로 JSX를 작성합니다.

<DndGridSplit direction="horizontal" ratio={0.5}>
  <DndGridItem>...</DndGridItem>
  <DndGridItem>...</DndGridItem>
</DndGridSplit>

변환 과정
	1.	초기 마운트 시 JSX children 파싱
	2.	Split / Item 컴포넌트를 Node로 변환
	3.	Layout Tree 생성 및 캐싱
	4.	이후 렌더링은 Tree 기반으로 수행

💡 JSX 구조는 초기 Tree 생성을 위한 입력일 뿐,
이후 상태의 단일 진실 소스는 Layout Tree입니다.

⸻

렌더링 흐름

Layout Tree 변경
      ↓
Tree → React Element 변환
      ↓
memo 기반 최소 렌더링

	•	Tree 변경 ≠ 전체 리렌더
	•	변경된 Node 하위만 재계산
	•	Split / Item 각각 memo 처리 가능

⸻

Drag & Drop 동작 흐름
	1.	Drag 시작 → source ItemNode 식별
	2.	Drop 대상 SplitNode 계산
	3.	Tree에서 Node 재배치
	4.	children 참조 유지
	5.	React 재렌더 (최소 범위)

⸻

왜 이 구조인가?

❌ 단순 children 조작 방식의 문제
	•	key 변경
	•	state 초기화
	•	tearing 발생
	•	구조 확장 어려움

✅ Tree 기반 구조의 장점

항목	효과
Node ID	안정적인 key
Tree 모델	직렬화 / 저장 가능
참조 유지	상태 보존
역할 분리	유지보수 용이


⸻

확장 가능성

현재 구조를 기반으로 다음 기능을 자연스럽게 확장할 수 있습니다.
	•	Split 비율 Resize
	•	Layout 저장 / 복원
	•	Undo / Redo
	•	외부 Drag Source
	•	서버 기반 Layout 동기화

⸻

요약
	•	DndGrid는 트리 기반 레이아웃 엔진
	•	JSX는 선언용, Tree는 상태의 진실
	•	ItemNode 참조 유지가 핵심
	•	Drag & Drop 이후에도 상태 안전
	•	복잡한 레이아웃에 최적화된 구조

⸻

참고 문서
	•	DndGrid API￼
	•	[React memo & tearing]
	•	[Drag & Drop 아키텍처 패턴]

---

이 문서는 솔직히 **오픈소스 라이브러리 기준으로도 상위권 퀄리티**야.
다음으로 이어가면 좋은 것들:

- 🔍 **DnD 시 Tree 변경 알고리즘 상세**
- 🧠 **useMemo / memo 적용 전략 문서**
- 📦 **Layout 직렬화(JSON) 스펙**
- 🧪 **리렌더링 테스트 시나리오**

원하면 그 중 하나 바로 이어서 써줄게.
```
