import { areEqual, ListChildComponentProps } from 'react-window'
import { ListItemData, RowProps } from '../types'
import React, { HTMLAttributes, useCallback, useContext } from 'react'
import cx from 'classnames'
import { Cell } from './Cell'
import { useFirstRender } from '../hooks/useFirstRender'
import { omit } from 'lodash'
import { SelectionContext } from '../contexts/SelectionContext'

const nullfunc = () => null

const RowComponent = React.memo(
  ({
    index,
    style,
    data,
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
  }: RowProps<any> & HTMLAttributes<HTMLTableRowElement>) => {
    const firstRender = useFirstRender()
    const { edges } = useContext(SelectionContext)

    // True when we should render the light version (when we are scrolling)
    const renderLight = isScrolling && firstRender

    const setGivenRowData = useCallback(
      (rowData: any) => {
        setRowData(index, rowData)
      },
      [index, setRowData]
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

    const formatValue = (data: any): string|number|undefined => {
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
            ? rowClassName({ rowData: data, rowIndex: index })
            : null
        )}
        style={style}
        data-key={data.__hash}
        data-value={formatValue(omit(data, '__hash'))}
      >
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

          const renderDisabled =
            disabled === true ||
            (typeof disabled === 'function' &&
              disabled({ rowData: data, rowIndex: index }))
          const renderReadonly =
              readonly === true ||
              (typeof readonly === 'function' &&
                readonly({ rowData: data, rowIndex: index }))

          const hideColspanZero = typeof hideWhenColspanZero === 'function' 
            ? hideWhenColspanZero(data, index)
            : hideWhenColspanZero

          const renderColspan = supportColspan
            ? typeof colspan === 'function' ? colspan(data, index) : colspan
            : 1;
          
          const renderRowspan = supportRowspan
            ? typeof rowspan === 'function' ? rowspan(data, index) : rowspan
            : 1;
          const isHidden = (renderRowspan === 0 || renderColspan === 0)
          const isCellHidden = hideColspanZero && renderColspan === 0

          const cellStyle: React.CSSProperties = {
            height: renderRowspan > 1 ? `${Math.ceil(renderRowspan)}00%` : undefined,
            visibility: isHidden ? 'hidden' : undefined
          }
          if (renderColspan > 1) {
            cellStyle.flexGrow = renderColspan

          } else if (renderColspan < 1) {
            cellStyle.flexGrow = 0
          }
          if (renderColspan !== 1) {
            if ('minWidth' in column) {
              cellStyle.minWidth = column.minWidth * renderColspan
            }
            if ('maxWidth' in column) {
              cellStyle.minWidth = column.maxWidth! * renderColspan
            }
          }
          
          const setKeyData = (value: string | number) => {
            const key = column.id || columnData?.key
            setGivenRowData({ ...data, [key]: value })
          }

          return isCellHidden ? null : (
            <Cell
              key={i}
              gutter={i === 0}
              disabled={renderDisabled}
              stickyRight={hasStickyRightColumn && i === columns.length - 1}
              column={column}
              rowData={data}
              active={active}
              className={cx(
                !renderWhenScrolling && renderLight && 'dsg-cell-light',
                typeof cellClassName === 'function'
                  ? cellClassName({ rowData: data, rowIndex: index })
                  : cellClassName,
                (renderColspan > 1) && 'dsg-cell-colspan',
                (renderRowspan > 1) && 'dsg-cell-rowspan'
              )}
              style={cellStyle}
              colSpan={renderColspan}
              rowSpan={renderRowspan}
              data-key={`${i}-${data.__hash}`}
              data-cell={formatValue({
                row: index,
                col: i
              })}
              data-v={isHidden ? undefined : formatValue(data[columnData?.key])}
            >
              {(renderWhenScrolling || !renderLight) && (
                <Component
                  {...restColumnProps}
                  rowData={data}
                  getContextMenuItems={getContextMenuItems}
                  align={align}
                  disabled={renderDisabled}
                  readonly={renderReadonly}
                  active={activeColIndex === i - 1}
                  columnIndex={i - 1}
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
  },
  (prevProps, nextProps) => {
    const { isScrolling: prevIsScrolling, ...prevRest } = prevProps
    const { isScrolling: nextIsScrolling, ...nextRest } = nextProps

    // When we are scrolling always re-use previous render, otherwise check props
    return nextIsScrolling || (!prevIsScrolling && areEqual(prevRest, nextRest))
  }
)

RowComponent.displayName = 'RowComponent'

export const Row = <T extends any>({
  index,
  style,
  data,
  isScrolling,
}: ListChildComponentProps<ListItemData<T>>) => {
  // Do not render header row, it is rendered by the InnerContainer
  if (index === 0) {
    return null
  }

  const {
    data: datas,
    stopEditing,
    activeCell,
    ...restProps
  } = data

  return (
    <RowComponent
      {...restProps}
      index={index - 1}
      data={datas[index - 1]}
      style={{
        ...style,
        // width: data.contentWidth ? data.contentWidth : '100%',
      }}
      isScrolling={isScrolling}
      active={Boolean(
        index - 1 >= (data.selectionMinRow ?? Infinity) &&
        index - 1 <= (data.selectionMaxRow ?? -Infinity) &&
        data.activeCell
      )}
      activeColIndex={
        data.activeCell?.row === index - 1 ? data.activeCell.col : null
      }
      editing={Boolean(data.activeCell?.row === index - 1 && data.editing)}
      stopEditing={
        data.activeCell?.row === index - 1 && data.editing
          ? data.stopEditing
          : undefined
      }
    />
  )
}
