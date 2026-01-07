# Changelog

All notable changes to the DndGrid MCP Server will be documented in this file.

## [0.2.0] - 2026-01-07

### Breaking Changes
- **ItemDrag 래퍼 필수**: 생성되는 모든 DndGridItem에 ItemDrag 래퍼 포함 (DndGrid v2.0 API 호환)
- Import 문에 ItemDrag 컴포넌트 추가

### Changed
- `generateItemJSX()` 메서드: ItemDrag 레이어 추가
- 생성되는 컴포넌트 구조:
  ```tsx
  <DndGridItem>
    <ItemDrag>
      <DndGridItemContent>
        <YourComponent />
      </DndGridItemContent>
    </ItemDrag>
  </DndGridItem>
  ```

### Documentation
- Architecture 리소스에 ItemDrag 사용법 추가
- Best Practices 리소스에 올바른 컴포넌트 구조 가이드 추가

### Migration Guide
기존 사용자는 다음 중 하나를 선택:
1. **권장**: MCP 서버를 업데이트하고 레이아웃 코드 재생성
2. 기존 코드의 모든 `DndGridItemContent`를 `ItemDrag`로 감싸기:
   ```tsx
   // 변경 전
   <DndGridItem>
     <DndGridItemContent>...</DndGridItemContent>
   </DndGridItem>

   // 변경 후
   <DndGridItem>
     <ItemDrag>
       <DndGridItemContent>...</DndGridItemContent>
     </ItemDrag>
   </DndGridItem>
   ```

## [0.1.3] - 2026-01-07

### Fixed
- Container width/height 파라미터에 픽셀 단위만 허용하도록 검증 강화
- CSS 단위 사용 금지 명시 (100vw, 100vh 등)

### Documentation
- width/height는 number 타입만 허용함을 명확히 문서화
- Best Practices에 픽셀 단위 필수 사용 섹션 추가

## [0.1.0] - 2026-01-05

### Added
- 초기 DndGrid MCP Server 구현
- 5개 MCP 툴:
  - `validate-layout`: 레이아웃 구조 검증
  - `analyze-layout`: 기존 코드 분석 및 개선 제안
  - `apply-template`: 사전 정의된 템플릿 적용
  - `generate-layout`: 자연어로부터 레이아웃 생성
  - `interactive-builder`: 대화형 레이아웃 빌더
- 3개 MCP 리소스:
  - `dndgrid://docs/architecture`: DndGrid 아키텍처 문서
  - `dndgrid://templates/list`: 사용 가능한 템플릿 목록
  - `dndgrid://docs/best-practices`: 성능 및 통합 가이드
- 4개 내장 템플릿:
  - `ide-layout`: IDE 스타일 (사이드바 + 에디터 + 터미널)
  - `dashboard-2x2`: 2x2 대시보드 그리드
  - `three-column`: 3컬럼 레이아웃
  - `split-view`: 2분할 뷰
