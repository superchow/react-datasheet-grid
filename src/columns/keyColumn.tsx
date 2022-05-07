import React, { useCallback, useRef } from 'react'
import { CellComponent, Column, KeyColumnData } from '../types'

const KeyComponent: CellComponent<any, KeyColumnData<any, any, any>> = ({
  columnData: { key, original },
  rowData,
  setRowData,
  setCellData,
  ...rest
}) => {
  // We use a ref so useCallback does not produce a new setKeyData function every time the rowData changes
  const rowDataRef = useRef(rowData)
  rowDataRef.current = rowData

  // We wrap the setRowData function to assign the value to the desired key
  const setKeyData = useCallback(
    (value: string | number) => {
      if (setCellData) {
        setCellData(value)
      } else {
        setRowData({ ...rowDataRef.current, [key]: value })
      }
    },
    [key, setRowData, setCellData]
  )

  if (!original.component) {
    return rowDataRef.current[key]
  }

  const Component = original.component

  return (
    <Component
      columnData={original.columnData}
      setRowData={setRowData}
      setCellData={setKeyData}
      // We only pass the value of the desired key, this is why each cell does not have to re-render everytime
      // another cell in the same row changes!
      rowData={rowData[key]}
      {...rest}
    />
  )
}

export const keyColumn = <
  T extends Record<string|number, any>,
  K extends keyof T = keyof T,
  PasteValue = string
>(
  key: K,
  column: Partial<Column<T[K], any, PasteValue>>
): Partial<Column<T[K], KeyColumnData<T[K], any, PasteValue>, PasteValue>> => ({
  id: key as string,
  ...column,
  // We pass the key and the original column as columnData to be able to retrieve them in the cell component
  columnData: { key: key as string, original: column },
  columnType: column.columnType,
  component: KeyComponent,
  // Here we simply wrap all functions to only pass the value of the desired key to the column, and not the entire row
  copyValue: ({ rowData, rowIndex }) =>
    column.copyValue?.({ rowData: rowData[key], rowIndex }) ?? null,
  deleteValue: ({ rowData, rowIndex }) => ({
    ...rowData,
    [key]: column.deleteValue?.({ rowData: rowData[key], rowIndex }) ?? null,
  }),
  pasteValue: ({ rowData, value, rowIndex }) => ({
    ...rowData,
    [key]:
      column.pasteValue?.({ rowData: rowData[key], value, rowIndex }) ?? null,
  }),
  disabled:
    typeof column.disabled === 'function'
      ? ({ rowData, rowIndex }) => {
          return typeof column.disabled === 'function'
            ? column.disabled({ rowData: rowData[key], rowIndex })
            : column.disabled ?? false
        }
      : column.disabled,
  readonly:
      typeof column.readonly === 'function'
        ? ({ rowData, rowIndex }) => {
            return typeof column.readonly === 'function'
              ? column.readonly({ rowData: rowData[key], rowIndex })
              : column.readonly ?? false
          }
        : column.readonly,
  cellClassName:
    typeof column.cellClassName === 'function'
      ? ({ rowData, rowIndex }) => {
          return typeof column.cellClassName === 'function'
            ? column.cellClassName({ rowData: rowData[key], rowIndex })
            : column.cellClassName ?? undefined
        }
      : column.cellClassName,
  isCellEmpty: ({ rowData, rowIndex }) =>
    column.isCellEmpty?.({ rowData: rowData[key], rowIndex }) ?? false,
})
