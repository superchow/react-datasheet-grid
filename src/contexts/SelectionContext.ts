import React from 'react'
import { SelectionContextType } from '../types'

export const SelectionContext = React.createContext<SelectionContextType>({
  showSelection: true,
  selection: null,
  headerRowHeight: 0,
  activeCell: null,
  rowHeight: 0,
  hasStickyRightColumn: false,
  dataLength: 0,
  edges: {
    top: true,
    left: true,
    bottom: true,
    right: true,
  },
  editing: false,
  isCellDisabled: () => false,
  isCellReadonly: () => false,
  getActiveCellRowData: () => ({
    rowData: null,
    colIndex: 0,
    rowIndex: 0
  }),
  getActiveCellBoundingClientRect: () => undefined,
  getActiveCellRect: () => undefined,
  expandSelection: null,
})
