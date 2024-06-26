import React from 'react'
import { WorkSheet } from 'xlsx'

export type ColumnWidth = string | number

export type DataSheetRow = {
  rowspan?: {
    [k: string]: number
  }
  colspan?: {
    [k: string]: number
  }
  [k: string]: any
}

export type Cell = {
  col: number
  row: number
}

export type Align = 'left' | 'center' | 'right'

export type Selection = { min: Cell; max: Cell }

export type CellProps<U, T, C> = {
  originalRowData: T
  cellData: U
  rowIndex: number
  columnKey: string
  columnIndex: number
  active: boolean
  focus: boolean
  align?: Align
  disabled: boolean
  readonly: boolean
  columnData: C
  setRowData: (rowData: T) => void
  setCellData: (cellData: U) => void
  stopEditing: (opts?: { nextRow: boolean }) => void
  insertRowBelow: () => void
  duplicateRow: () => void
  deleteRow: () => void
  getContextMenuItems: () => ContextMenuItem[]
}

export type CellComponent<U, T, C> = (
  props: Omit<CellProps<U, T, C>, 'originalRowData' | 'cellData'> & {
    rowData: T
  } & Record<string, any>,
) => JSX.Element

export type ColumnType = 's' | 'n' | 'd' | 'f' | 'b' | 'o'

export type TextColumnOptions<T> = {
  placeholder?: string
  align?: Align
  // When true, data is updated as the user types, otherwise it is only updated on blur. Default to true
  continuousUpdates?: boolean
  // Value to use when deleting the cell
  deletedValue?: T
  // Parse what the user types
  parseUserInput?: (value: string) => T
  // Format the value of the input when it is blurred
  formatBlurredInput?: (value: T) => string
  // Format the value of the input when it gets focused
  formatInputOnFocus?: (value: T) => string
  // Format the value when copy
  formatForCopy?: (value: T) => string
  // Parse the pasted value
  parsePastedValue?: (value: string) => T
}

export type KeyColumnData<K, C, P> = {
  key: string
  original: Partial<Column<K, C, P>>
}

// TODO
export type RenderTitleProps<T extends string | number | boolean = any> = {
  id: string | undefined
  title?: T
  setColumnData: (str: string) => void
  setEditCol: (value: number) => void
  focused?: boolean
} & Partial<TextColumnOptions<string>>
export type RenderTitle<T extends string | number | boolean = any> = (
  props: RenderTitleProps<T>,
) => React.ReactNode

export type Column<T, C, PasteValue, U = any, P = any> = {
  id?: string
  headerClassName?: string
  title?: React.ReactNode
  renderTitle?: RenderTitle
  width: ColumnWidth
  minWidth: number
  maxWidth?: number
  /** @todo */
  hideWhenColspanZero?: boolean | ((data: T, rowIndex: number) => boolean)
  colspan?: number | ((data: T, rowIndex: number) => number)
  /** support rowspan, default is true */
  supportRowspan?: boolean
  rowspan?: number | ((data: T, rowIndex: number) => number)
  align?: Align
  renderWhenScrolling: boolean
  component: CellComponent<P, T, C>
  columnType?: ColumnType
  columnData?: C
  // refuse keycode
  disableKeys: boolean
  /** 禁止头部编辑 */
  disableHeadEditable?: boolean
  /** disable ColumnOperation */
  disableColumnOperation?: boolean | Array<'INSERT_COL_BEFORE' | 'INSERT_COL_AFTER' | 'DELETE_COL'>
  /** disable Column's rowspanOperation */
  disableRowOperation?: boolean
  disabled: boolean | ((opt: { rowData: T; rowIndex: number }) => boolean)
  readonly?: boolean | ((opt: { rowData: T; rowIndex: number }) => boolean)
  cellClassName?:
    | string
    | ((opt: { rowData: T; rowIndex: number }) => string | undefined)
  keepFocus: boolean
  deleteValue: (opt: { rowData: T; rowIndex: number }) => T
  copyValue: (opt: { rowData: T; rowIndex: number }) => any
  pasteValue: (opt: { rowData: T; value: PasteValue; rowIndex: number }) => T
  prePasteValues: (values: string[]) => PasteValue[] | Promise<PasteValue[]>
  isCellEmpty: (opt: { rowData: T; rowIndex: number }) => boolean
  getContainer?: string | HTMLElement | (() => HTMLElement)
  [k: `config-${string}`]: U
}

export type ListItemData<T extends DataSheetRow> = {
  /** 原始数据 */
  orginSheetData: T[]
  /** 包装数据 */
  data: T[]
  contentWidth?: number
  columns: Column<T, any, string>[]
  hasStickyRightColumn: boolean
  activeCell: Cell | null
  selectionMinRow?: number
  selectionMaxRow?: number
  editing: boolean
  setRowData: (rowIndex: number, item: T) => void
  setRowsData: (startRowIndex: number, items: T[]) => void
  deleteRows: (rowMin: number, rowMax?: number) => void
  duplicateRows: (rowMin: number, rowMax?: number) => void
  insertRowAfter: (row: number, count?: number) => void
  stopEditing?: (opts?: { nextRow?: boolean }) => void
  getContextMenuItems: () => ContextMenuItem[]
  supportRowspan?: boolean
  /** @todo */
  supportColspan?: boolean
  rowClassName?:
    | string
    | ((opt: { rowData: T; rowIndex: number }) => string | undefined)
}

export type HeaderContextType<T> = {
  columns: Column<T, any, string>[]
  contentWidth?: number
  hasStickyRightColumn: boolean
  height: number
  activeColMin?: number
  activeColMax?: number
  editingCol: number
  setEditCol: (val: number) => void
  setColumns: (
    columns: Partial<Column<T, any, any>>[],
    operation: ColumnOperation,
  ) => void
}

export type RectType = {
  height: number
  width: number
  left: number
  top: number
}

export type SelectionContextType = {
  showSelection: boolean
  columnRights?: number[]
  columnWidths?: number[]
  columnRowTops?: number[]
  columnRowHeights?: number[]
  activeCell: Cell | null
  selection: Selection | null
  dataLength: number
  rowHeight: number
  hasStickyRightColumn: boolean
  editing: boolean
  isCellDisabled: (cell: Cell) => boolean
  isCellReadonly: (cell: Cell) => boolean
  getActiveCellRowData: (cell: Cell) => {
    rowData: any
    colIndex: number
    rowIndex: number
  }
  getActiveCellBoundingClientRect: () => DOMRect | undefined
  getActiveCellRect: () => RectType | undefined
  headerRowHeight: number
  viewWidth?: number
  viewHeight?: number
  contentWidth?: number
  contentHeight?: number
  edges: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  expandSelection: number | null
}

export type RowProps<T extends DataSheetRow> = Omit<
  ListItemData<T>,
  'data' | 'activeCell'
> & {
  index: number
  record: T
  style: React.CSSProperties
  isScrolling?: boolean
  active: boolean
  activeColIndex: number | null
}

export type SimpleColumn<T, C> = Partial<Column<T, C, string>>

export type AddRowsComponentProps = {
  addRows: (count?: number) => void
}

export type ContextMenuItem =
  | {
      type:
        | 'INSERT_COL_BEFORE'
        | 'INSERT_COL_AFTER'
        | 'DELETE_COL'
        | 'INSERT_ROW_ABOVE'
        | 'INSERT_ROW_BELLOW'
        | 'DELETE_ROW'
        | 'DUPLICATE_ROW'
      action: () => void
    }
  | {
      type: 'DELETE_ROWS' | 'DUPLICATE_ROWS' | 'MERGE_ROWS' | 'CLEAR_MERGE_ROWS'
      action: () => void
      fromRow: number
      toRow: number
    }
  | {
      type: 'DELETE_COLS'
      action: () => void
      fromCol: number
      toCol: number
    }

export type ContextMenuComponentProps = {
  id: string | number
  event?: MouseEvent
  clientX?: number
  clientY?: number
  cursorIndex?: Cell
  selection?: Selection | null
  items: ContextMenuItem[]
  menusRefinement?: ContextMenuPasteHandle
  onShown?: () => void
  onHidden?: () => void
}

export interface ContextMenuPasteHandle {
  (
    array: ContextMenuItem[],
    cursorIndex?: Cell,
    selection?: Selection | null,
  ): ContextMenuItem[]
}

export type Operation = {
  type: 'UPDATE' | 'DELETE' | 'CREATE'
  fromRowIndex: number
  toRowIndex: number
}
export type ColumnOperation = {
  type: 'DELETE' | 'CREATE' | 'UPDATE'
  fromColIndex: number
  toColIndex: number
}

export type DataSheetGridProps<T> = {
  id?: number | string
  value?: T[]
  style?: React.CSSProperties
  className?: string
  rowClassName?:
    | string
    | ((opt: { rowData: T; rowIndex: number }) => string | undefined)
  supportRowspan?: boolean
  /** @todo */
  supportColspan?: boolean
  onChange?: (value: T[], operations: Operation[]) => void
  /** @default true */
  lockColumns?: boolean
  createCol?: (
    operation: ColumnOperation,
    sequence?: number,
  ) => Partial<Column<T, any, any>>
  columns?: Partial<Column<T, any, any>>[]
  onColumnsChange?: (
    columns: Partial<Column<T, any, any>>[],
    operation: ColumnOperation,
  ) => void
  gutterColumn?: SimpleColumn<T, any> | false
  stickyRightColumn?: SimpleColumn<T, any>
  widthModel?: 'full'
  height?: number
  rowHeight?: number
  /** Head editable
   * @default false
   */
  headerEditable?: boolean
  headerRowHeight?: number
  rowKey?: string | ((rowData: T, index: number, data: T[]) => string)
  addRowsComponent?: (props: AddRowsComponentProps) => JSX.Element
  createRow?: () => T
  duplicateRow?: (opts: { rowData: T; rowIndex: number }) => T
  autoAddRow?: boolean
  autoAddColumn?: boolean
  /** @default false */
  lockRows?: boolean
  showAddRows?: boolean
  addRowsPostion?: 'top' | 'bottom'
  disableContextMenu?: boolean
  /** 外部处理 contextMenus 列表 */
  contextMenusPaster?: ContextMenuPasteHandle
  disableExpandSelection?: boolean
  contextMenuComponent?: (props: ContextMenuComponentProps) => JSX.Element
  onFocus?: (opts: { cell: CellWithId }) => void
  onBlur?: (opts: { cell: CellWithId }) => void
  onActiveCellChange?: (opts: { cell: CellWithId | null }) => void
  onSelectionChange?: (opts: { selection: SelectionWithId | null }) => void
  showSelection?: boolean
  [key: `data-${string}`]: string
}

type CellWithIdInput = {
  col: number | string
  row: number
}

type SelectionWithIdInput = { min: CellWithIdInput; max: CellWithIdInput }

export type CellWithId = {
  colId?: string
  col: number
  row: number
}

export type SelectionWithId = { min: CellWithId; max: CellWithId }

export type DataSheetGridRef = {
  activeCell: CellWithId | null
  selection: SelectionWithId | null
  setActiveCell: (activeCell: CellWithIdInput | null) => void
  setSelection: (selection: SelectionWithIdInput | null) => void
  target: HTMLDivElement | null
  getTable: () => HTMLTableElement | undefined
  getSheet: () => WorkSheet | undefined
  getTableData: () => Record<string | number, any>[] | null
}
