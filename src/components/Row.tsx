import cx from 'classnames'
import deepEqual from 'fast-deep-equal'
import { cloneDeep, omit } from 'lodash'
import React, { HTMLAttributes, useCallback, useContext } from 'react'
import { areEqual, ListChildComponentProps } from 'react-window'
import { SelectionContext } from '../contexts/SelectionContext'
import { useFirstRender } from '../hooks/useFirstRender'
import { DataSheetRow, ListItemData, RowProps } from '../types'
import { Cell } from './Cell'

const nullfunc = () => null

const RowComponent = <T extends DataSheetRow>({
  index,
  style,
  record,
  isScrolling,
  columns,
  hasStickyRightColumn,
  active,
  activeColIndex,
  editing,
  setRowData,
  deleteRows,
  insertRowAfter,
  duplicateRows,
  stopEditing,
  getContextMenuItems,
  rowClassName,
  supportRowspan,
  supportColspan,
  className,
  contentWidth,
  selectionMinRow,
  selectionMaxRow,
  ...restProps
}: RowProps<T> & HTMLAttributes<HTMLTableRowElement>) => {
  const firstRender = useFirstRender()
  const { edges } = useContext(SelectionContext)

  // True when we should render the light version (when we are scrolling)
  const renderLight = isScrolling && firstRender

  const setGivenRowData = useCallback(
    (rowData: T) => {
      setRowData(index, rowData)
    },
    [index, setRowData],
  )

  const deleteGivenRow = useCallback(() => {
    deleteRows(index)
  }, [deleteRows, index])

  const duplicateGivenRow = useCallback(() => {
    duplicateRows(index)
  }, [duplicateRows, index])

  const insertAfterGivenRow = useCallback(() => {
    insertRowAfter(index)
  }, [insertRowAfter, index])

  const formatValue = (data: any): string | number | undefined => {
    const dataType = typeof data
    if (['string', 'number', 'bigint', 'symbol'].includes(dataType)) {
      return data
    } else if (dataType === 'boolean') {
      return data ? 'TRUE' : 'FALSE'
    } else if (dataType === 'object' && data !== null) {
      return JSON.stringify(data)
    } else if (dataType === 'function') {
      return data.toString()
    } else {
      return data
    }
  }

  return (
    <tr
      {...restProps}
      className={cx(
        'dsg-row',
        `dsg-row-${index}`,
        className,
        !edges.left && 'dsg-row-l',
        !edges.right && 'dsg-row-r',
        typeof rowClassName === 'string' ? rowClassName : null,
        typeof rowClassName === 'function'
          ? rowClassName({ rowData: record, rowIndex: index })
          : null,
      )}
      style={style}
      data-key={record.__hash}
      data-value={formatValue(omit(record, '__hash'))}>
      {columns.map((column, i) => {
        const {
          component: Component,
          disabled,
          readonly,
          hideWhenColspanZero = false,
          colspan = 1,
          rowspan = 1,
          columnData,
          renderWhenScrolling,
          cellClassName,
          align,
          ...restColumnProps
        } = column

        const columnKey =  column.id || columnData?.key

        const renderDisabled =
          disabled === true ||
          (typeof disabled === 'function' &&
            disabled({ rowData: record, rowIndex: index }))
        const renderReadonly =
          readonly === true ||
          (typeof readonly === 'function' &&
            readonly({ rowData: record, rowIndex: index }))

        const hideColspanZero =
          typeof hideWhenColspanZero === 'function'
            ? hideWhenColspanZero(record, index)
            : hideWhenColspanZero

        const renderColspan = supportColspan
          ? typeof colspan === 'function'
            ? colspan(record, index)
            : colspan
          : 1

        const renderRowspan = supportRowspan
          ? typeof rowspan === 'function'
            ? rowspan(record, index)
            : rowspan
          : 1
        const isHidden = renderRowspan === 0 || renderColspan === 0
        const isCellHidden = hideColspanZero && renderColspan === 0

        const cellStyle: React.CSSProperties = {
          height:
            renderRowspan > 1 ? `${Math.ceil(renderRowspan)}00%` : undefined,
          visibility: isHidden ? 'hidden' : undefined,
        }
        if (renderColspan > 1) {
          cellStyle.flexGrow = renderColspan
        } else if (renderColspan < 1) {
          cellStyle.flexGrow = 0
        }
        if (renderColspan !== 1) {
          const mergeColumns = columns.slice(i + 1, i + renderColspan)
          const mergeMinWidth = mergeColumns
            .map((it) => it.minWidth ?? 0)
            .reduce((pre, cur) => {
              return pre + cur
            }, column.minWidth ?? 0)
          const mergeMaxWidth = mergeColumns
            .map((it) => it.maxWidth ?? 0)
            .reduce((pre, cur) => {
              return pre + cur
            }, column.maxWidth ?? 0)

          cellStyle.minWidth = mergeMinWidth
          cellStyle.maxWidth = mergeMaxWidth
          // if ('minWidth' in column) {
          //   cellStyle.minWidth = column.minWidth * renderColspan
          // }
          // if ('maxWidth' in column) {
          //   cellStyle.maxWidth = column.maxWidth! * renderColspan
          // }
        }

        const setKeyData = (value: string | number) => {
          setGivenRowData({ ...record, [columnKey]: value })
        }

        return isCellHidden ? null : (
          <Cell
            key={i}
            gutter={i === 0}
            disabled={renderDisabled}
            readonly={renderReadonly}
            stickyRight={hasStickyRightColumn && i === columns.length - 1}
            column={column}
            rowData={record}
            active={active}
            className={cx(
              !renderWhenScrolling && renderLight && 'dsg-cell-light',
              typeof cellClassName === 'function'
                ? cellClassName({ rowData: record, rowIndex: index })
                : cellClassName,
              renderColspan > 1 && 'dsg-cell-colspan',
              renderRowspan > 1 && 'dsg-cell-rowspan',
              isHidden && 'dsg-cell-hidden',
              active && 'dsg-cell-active',
            )}
            style={cellStyle}
            colSpan={renderColspan}
            rowSpan={renderRowspan}
            data-key={`${i}-${record.__hash}`}
            data-cell={formatValue({
              row: index,
              col: i,
            })}
            data-column={columnKey}
            data-v={
              isHidden ? undefined : formatValue(record[columnKey])
            }>
            {(renderWhenScrolling || !renderLight) && (
              <Component
                {...restColumnProps}
                originalRowData={record}
                rowData={record}
                getContextMenuItems={getContextMenuItems}
                align={align}
                disabled={renderDisabled}
                readonly={renderReadonly}
                active={activeColIndex === i - 1}
                columnIndex={i - 1}
                columnKey={columnKey}
                rowIndex={index}
                focus={activeColIndex === i - 1 && editing}
                deleteRow={deleteGivenRow}
                duplicateRow={duplicateGivenRow}
                stopEditing={
                  activeColIndex === i - 1 && editing && stopEditing
                    ? stopEditing
                    : nullfunc
                }
                insertRowBelow={insertAfterGivenRow}
                setRowData={setGivenRowData}
                setCellData={setKeyData}
                columnData={columnData}
              />
            )}
          </Cell>
        )
      })}
    </tr>
  )
}

const RowMemoComponent = React.memo(RowComponent, (prevProps, nextProps) => {
  const { isScrolling: prevIsScrolling, ...prevRest } = prevProps
  const { isScrolling: nextIsScrolling, ...nextRest } = nextProps

  // When we are scrolling always re-use previous render, otherwise check props
  return nextIsScrolling || (!prevIsScrolling && areEqual(prevRest, nextRest))
}) as <T extends DataSheetRow>(props: RowProps<T> & HTMLAttributes<HTMLTableRowElement>) => React.ReactElement



const InterRow = <T extends DataSheetRow>({
  index,
  style,
  data,
  isScrolling,
}: ListChildComponentProps<ListItemData<T>>) => {
  const {
    data: datas,
    stopEditing,
    activeCell,
    setRowData,
    setRowsData,
    ...restProps
  } = data

  const setEffectRowData = useCallback(
    (rowIndex: number, item: T) => {
      const oldData = datas[rowIndex]
      const effectKeys = Object.keys(item).filter(
        (key) => !deepEqual(oldData[key], item[key]),
      )
      const effectColKeys: string[] = restProps.columns
        .filter((col) => {
          const key = col.id || col.columnData?.key
          const hasKey = effectKeys.includes(key)
          if (!hasKey) return false
          const rowspan = oldData.rowspan ? oldData.rowspan[key] ?? 1 : 1
          return rowspan > 1
        })
        .map((col) => col.id || col.columnData?.key)

      if (!effectColKeys.length) {
        setRowData(rowIndex, item)
      } else {
        const effectLen = Math.max(
          ...effectColKeys.map((key) =>
            oldData.rowspan ? oldData.rowspan[key] ?? 1 : 1,
          ),
        )
        const effectItems = datas
          .slice(rowIndex, rowIndex + effectLen)
          .map((cell, idx) => {
            const newCell = cloneDeep(cell)
            effectColKeys.forEach((k) => {
              const rowspan = oldData.rowspan ? oldData.rowspan[k] ?? 1 : 1
              // Prevent out of bounds modification
              if (idx < rowspan) {
                // @ts-ignore
                newCell[k] = item[k]
              }
            })
            return newCell
          })
        setRowsData(rowIndex, effectItems)
      }
    },
    [setRowData, setRowsData, datas, restProps],
  )

  return (
    <RowMemoComponent
      {...restProps}
      index={index - 1}
      record={datas[index - 1]}
      style={{
        ...style,
        minWidth: data.contentWidth ? data.contentWidth : '100%',
      }}
      isScrolling={isScrolling}
      active={Boolean(
        index - 1 >= (data.selectionMinRow ?? Infinity) &&
          index - 1 <= (data.selectionMaxRow ?? -Infinity) &&
          data.activeCell,
      )}
      activeColIndex={
        data.activeCell?.row === index - 1 ? data.activeCell.col : null
      }
      editing={Boolean(data.activeCell?.row === index - 1 && data.editing)}
      setRowsData={setRowsData}
      setRowData={setEffectRowData}
      stopEditing={
        data.activeCell?.row === index - 1 && data.editing
          ? data.stopEditing
          : undefined
      }
    />
  )
}

export const Row = <T extends DataSheetRow>(
  props: ListChildComponentProps<ListItemData<T>>,
) => {
  if (props.index === 0 || !props.data.data[props.index - 1]) {
    return null
  }
  return <InterRow {...props} />
}
