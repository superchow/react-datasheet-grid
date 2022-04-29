import React, { FC, ReactNode, useCallback, useContext, useMemo, useRef } from 'react'
import { HeaderContext } from '../contexts/HeaderContext'
import cx from 'classnames'
import { Cell } from './Cell'
import { Column, TextColumnOptions } from '../types'

type Title = React.ReactNode | ((props: {
  rawData: string;
  setColumnData: (str: string) => void;
  setEditCol: (value: number) => void;
  focused?: boolean | undefined;
} & Partial<TextColumnOptions<string>>) => JSX.Element)

const EditComponent = React.memo<{
  rawData?: string;
  setColumnData: (str: string) => void;
  setEditCol: (value: number) => void
  focused?: boolean;
} & TextColumnOptions<string>>(({
  rawData,
  focused,
  setColumnData,
  setEditCol,
  placeholder,
  align,
  continuousUpdates = true,
  parseUserInput = (value) => (value?.trim() || null) as unknown as string,
  formatBlurredInput = (value?) => String(value ?? ''),
}) => {
  const ref = useRef<HTMLInputElement>(null)

  return <input
    defaultValue={formatBlurredInput(rawData || '')}
    className={cx('dsg-input', align && `dsg-input-align-${align}`)}
    placeholder={focused ? rawData : placeholder}
    tabIndex={-1}
    autoFocus
    ref={ref}
    style={{ pointerEvents: focused ? 'auto' : 'none' }}
    onBlur={(e) => {
      if (continuousUpdates) {
        setColumnData(parseUserInput(e.target.value))
        setEditCol(-1)
      }
    }}
    onKeyDown={(e) => {
      if (e.key === 'Escape') {
        setEditCol(-1)
      }
    }}
  />
})

export const HeaderRow = React.memo(() => {
  const {
    columns,
    contentWidth,
    height,
    hasStickyRightColumn,
    activeColMin,
    activeColMax,
    editingCol,
    setEditCol,
    setColumns
  } = useContext(HeaderContext)

  const focusedCol = (editingCol !== undefined && editingCol > -1) ? editingCol + 1 : -1

  const isRenderFn = (node: Title) => typeof node === 'function'

  const handleColumnUpdata = useCallback((title: string, index: number) => {
    const newCols = columns.slice(1)
    if (newCols[index - 1]) {
      newCols[index - 1].title = title
    }
    setColumns(newCols, {
      type: 'UPDATE',
      fromColIndex: editingCol,
      toColIndex: editingCol
    })
  }, [columns, setColumns])

  return (
    <tr
      className={cx('dsg-row')}
      style={{
        // width: contentWidth ? contentWidth : '100%',
        height,
      }}
    >
      {columns.map((column, i) => (
        <Cell
          key={i}
          gutter={i === 0}
          stickyRight={hasStickyRightColumn && i === columns.length - 1}
          column={column}
          isHeadCell
          className={cx(
            'dsg-cell-header',
            activeColMin !== undefined &&
            activeColMax !== undefined &&
            activeColMin <= i - 1 &&
            activeColMax >= i - 1 &&
            'dsg-cell-header-active',
            i === focusedCol && 'dsg-cell-header-focus',
            column.headerClassName
          )}
          data-t={column.columnType}
        >
          {i !== focusedCol
            ? <div className="dsg-cell-header-container">{column.title as string}</div>
            : isRenderFn(column.title)
              ? (column.title as FC)({
                rawData: column.title,
                setColumnData: (str: string) => handleColumnUpdata(str, i),
                setEditCol,
                focused: true
              })
              : <EditComponent
                rawData={column.title as string}
                setColumnData={(str) => handleColumnUpdata(str, i)}
                setEditCol={setEditCol}
                focused
              />
          }
        </Cell>
      ))}
    </tr>
  )
})

HeaderRow.displayName = 'HeaderRow'
