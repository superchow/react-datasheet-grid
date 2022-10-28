import React, { useContext, useMemo } from 'react'
import { SelectionContext } from '../contexts/SelectionContext'
import cx from 'classnames'

const buildSquare = (
  top: number | string,
  right: number | string,
  bottom: number | string,
  left: number | string
) => {
  return [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
    [left, top],
  ]
}

const buildClipPath = (
  top: number,
  right: number,
  bottom: number,
  left: number
) => {
  const values = [
    ...buildSquare(0, '100%', '100%', 0),
    ...buildSquare(top, right, bottom, left),
  ]

  return `polygon(evenodd, ${values
    .map((pair) =>
      pair
        .map((value) =>
          typeof value === 'number' && value !== 0 ? value + 'px' : value
        )
        .join(' ')
    )
    .join(',')})`
}

export const SelectionRect = React.memo(() => {
  const {
    showSelection,
    columnWidths,
    columnRights,
    headerRowHeight,
    columnRowHeights,
    selection,
    rowHeight,
    activeCell,
    hasStickyRightColumn,
    dataLength,
    contentWidth,
    isCellDisabled,
    isCellReadonly,
    getActiveCellRect,
    editing,
    expandSelection,
  } = useContext(SelectionContext)
  if (!showSelection) {
    return <></>
  }

  const activeCellIsDisabled = activeCell ? isCellDisabled(activeCell) : false
  const activeCellIsReadonly = activeCell ? isCellReadonly(activeCell) : false

  const selectionIsDisabled = useMemo(() => {
    if (!selection) {
      return activeCellIsDisabled
    }

    for (let col = selection.min.col; col <= selection.max.col; ++col) {
      for (let row = selection.min.row; row <= selection.max.row; ++row) {
        if (!isCellDisabled({ col, row })) {
          return false
        }
      }
    }

    return true
  }, [activeCellIsDisabled, isCellDisabled, selection])

  if (!columnWidths || !columnRights) {
    return null
  }

  const extraPixelV = (rowI: number): number => {
    return rowI < dataLength - 1 ? 1 : 0
  }

  const extraPixelH = (colI: number): number => {
    return colI < columnWidths.length - (hasStickyRightColumn ? 3 : 2) ? 1 : 0
  }
  const extraHeight = (row: number): number => {
    if (!columnRowHeights || !columnRowHeights.length) {
      return 0
    }
    if (columnRowHeights[row]) {
      return columnRowHeights[row]
    } else {
      return columnRowHeights.slice(0, row).reverse().find(a => a > 0)!
    }
  }

  const activeClientRect = getActiveCellRect()
  const activeCellRect = activeCell && activeClientRect && {
    width: activeClientRect.width + extraPixelH(activeCell.col),
    height: extraHeight(activeCell.row) + extraPixelV(activeCell.row),
    left: activeClientRect.left,
    top: activeClientRect.top,
  }

  const selectionRect = selection && {
    width:
      columnWidths
        .slice(selection.min.col + 1, selection.max.col + 2)
        .reduce((a, b) => a + b, 0) + extraPixelH(selection.max.col),
    height:
      rowHeight * (selection.max.row - selection.min.row + 1) +
      extraPixelV(selection.max.row),
    left: columnRights[selection.min.col],
    top: rowHeight * selection.min.row + headerRowHeight,
  }

  const minSelection = selection?.min || activeCell
  const maxSelection = selection?.max || activeCell

  const expandRowsIndicator = maxSelection &&
    expandSelection !== null && {
      left: columnRights[maxSelection.col] + columnWidths[maxSelection.col + 1],
      top: rowHeight * (maxSelection.row + 1) + headerRowHeight,
      transform: `translate(-${
        maxSelection.col < columnWidths.length - (hasStickyRightColumn ? 3 : 2)
          ? 50
          : 100
      }%, -${maxSelection.row < dataLength - 1 ? 50 : 100}%)`,
    }

  const expandRowsRect = minSelection &&
    maxSelection &&
    expandSelection !== null && {
      width:
        columnWidths
          .slice(minSelection.col + 1, maxSelection.col + 2)
          .reduce((a, b) => a + b, 0) + extraPixelH(maxSelection.col),
      height:
        rowHeight * expandSelection +
        extraPixelV(maxSelection.row + expandSelection) -
        1,
      left: columnRights[minSelection.col],
      top: rowHeight * (maxSelection.row + 1) + headerRowHeight + 1,
    }

  return (
    <>
      {(selectionRect || activeCellRect) && (
        <div
          className="dsg-selection-col-marker-container"
          style={{
            left: selectionRect?.left ?? activeCellRect?.left,
            width: selectionRect?.width ?? activeCellRect?.width,
            height: dataLength * rowHeight + headerRowHeight,
          }}
        >
          <div
            className={cx(
              'dsg-selection-col-marker',
              selectionIsDisabled && 'dsg-selection-col-marker-disabled'
            )}
            style={{ top: headerRowHeight }}
          />
        </div>
      )}
      {(selectionRect || activeCellRect) && (
        <div
          className="dsg-selection-row-marker-container"
          style={{
            top: selectionRect?.top ?? activeCellRect?.top,
            height: selectionRect?.height ?? activeCellRect?.height,
            width: contentWidth ? contentWidth : '100%',
          }}
        >
          <div
            className={cx(
              'dsg-selection-row-marker',
              selectionIsDisabled && 'dsg-selection-row-marker-disabled'
            )}
            style={{ left: columnWidths[0] }}
          />
        </div>
      )}
      {activeCellRect && activeCell && !activeCellIsReadonly && !!activeClientRect.width && (
        <div
          className={cx('dsg-active-cell', {
            'dsg-active-cell-focus': editing,
            'dsg-active-cell-disabled': activeCellIsDisabled,
            'dsg-active-cell-readonly': activeCellIsReadonly
          })}
          style={activeCellRect}
          data-cell={JSON.stringify(activeCell)}
        />
      )}
      {selectionRect && activeCellRect && (
        <div
          className={cx(
            'dsg-selection-rect',
            selectionIsDisabled && 'dsg-selection-rect-disabled'
          )}
          style={{
            ...selectionRect,
            clipPath: buildClipPath(
              activeCellRect.top - selectionRect.top,
              activeCellRect.left - selectionRect.left,
              activeCellRect.top + activeCellRect.height - selectionRect.top,
              activeCellRect.left + activeCellRect.width - selectionRect.left
            ),
          }}
        />
      )}
      {expandRowsRect && (
        <div className={cx('dsg-expand-rows-rect')} style={expandRowsRect} />
      )}
      {expandRowsIndicator && !activeCellIsReadonly && (
        <div
          className={cx(
            'dsg-expand-rows-indicator',
            selectionIsDisabled && 'dsg-expand-rows-indicator-disabled'
          )}
          style={expandRowsIndicator}
        />
      )}
    </>
  )
})

SelectionRect.displayName = 'SelectionRect'
