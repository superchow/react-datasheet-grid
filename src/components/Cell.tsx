import React, { FC, TdHTMLAttributes } from 'react'
import cx from 'classnames'
import { Column } from '../types'

export const Cell: FC<{
  gutter: boolean
  stickyRight: boolean
  disabled?: boolean
  readonly?: boolean
  column: Column<any, any, any>
  className: string
  isHeadCell?: boolean
  rowData?: any;
  active?: boolean
  children?: React.ReactNode,
} & TdHTMLAttributes<HTMLTableDataCellElement>> = ({
  children,
  gutter,
  stickyRight,
  column,
  active,
  disabled,
  readonly,
  className,
  isHeadCell,
  rowData,
  style,
  ...rest
}) => {

  return (
    <td
      {...rest}
      className={cx(
        'dsg-cell',
        column.align && `dsg-cell-${column.align}`,
        gutter && 'dsg-cell-gutter',
        disabled && 'dsg-cell-disabled',
        readonly && 'dsg-cell-readonly',
        gutter && active && 'dsg-cell-gutter-active',
        stickyRight && 'dsg-cell-sticky-right',
        className
      )}
      style={{
        flex: String(column.width),
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        ...style
      }}
    >
      {children}
    </td>
  )
}
