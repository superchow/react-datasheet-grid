import React, { useMemo } from 'react'
import { CellProps, Column, SimpleColumn } from '../types'

const defaultComponent = () => <></>
const defaultIsCellEmpty = () => false
const identityRow = <T extends any>({ rowData }: { rowData: T }) => rowData
const defaultCopyValue = () => null
const defaultGutterComponent = ({ rowIndex }: CellProps<any, any>) => (
  <>{rowIndex + 1}</>
)
const cellAlwaysEmpty = () => true
const defaultPrePasteValues = (values: string[]) => values

export const useColumns = <T extends any>(
  columns: Partial<Column<T, any, any>>[],
  gutterColumn?: SimpleColumn<T, any> | false,
  stickyRightColumn?: SimpleColumn<T, any>
): Column<T, any, any>[] => {
  return useMemo<Column<T, any, any>[]>(() => {

    const partialColumns: Partial<Column<T, any, any>>[] = [
      gutterColumn === false
        ? {
            width: 0,
            minWidth: 0,
            component: () => <></>,
            headerClassName: 'dsg-hidden-cell',
            cellClassName: 'dsg-hidden-cell',
            isCellEmpty: cellAlwaysEmpty,
          }
        : {
            ...gutterColumn,
            width: gutterColumn?.width ?? '0 0 40px',
            minWidth: gutterColumn?.minWidth ?? 0,
            title: gutterColumn?.title ?? (
              <div className="dsg-corner-indicator" />
            ),
            component: gutterColumn?.component ?? defaultGutterComponent,
            isCellEmpty: cellAlwaysEmpty,
          },
      ...columns,
    ]

    if (stickyRightColumn) {
      partialColumns.push({
        ...stickyRightColumn,
        width: stickyRightColumn.width ?? '0 0 40px',
        minWidth: stickyRightColumn.minWidth ?? 0,
        isCellEmpty: cellAlwaysEmpty,
      })
    }

    return partialColumns.map<Column<T, any, any>>((column) => ({
      ...column,
      width: column.width ?? 1,
      minWidth: column.minWidth ?? 100,
      renderWhenScrolling: column.renderWhenScrolling ?? true,
      component: column.component ?? defaultComponent,
      disableKeys: column.disableKeys ?? false,
      disabled: column.disabled ?? false,
      keepFocus: column.keepFocus ?? false,
      deleteValue: column.deleteValue ?? identityRow,
      copyValue: column.copyValue ?? defaultCopyValue,
      pasteValue: column.pasteValue ?? identityRow,
      prePasteValues: column.prePasteValues ?? defaultPrePasteValues,
      isCellEmpty: column.isCellEmpty ?? defaultIsCellEmpty,
    }))
  }, [gutterColumn, stickyRightColumn, columns])
}
