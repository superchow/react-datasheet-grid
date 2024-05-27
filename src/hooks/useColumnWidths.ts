import { useEffect, useMemo, useState } from 'react'
import { Cell, Column, DataSheetRow } from '../types'
import { useDeepEqualState } from './useDeepEqualState'

const getRenderHash = (width: number, columns: Column<any, any, any>[], data: Array<DataSheetRow>, activeCell?: Cell | null) => {
  const colStr = columns.map(({ width, minWidth, maxWidth }) =>
    [width, minWidth, maxWidth].join(',')
  ).join('|')
  const dataHash = data.map(it => it.__hash).join('|')
  const activeCellStr = typeof activeCell === 'object'
    ? activeCell === null
      ? null : 'object'
    : undefined
  const row = activeCell?.row
  return width + colStr + dataHash + activeCellStr + row
}

export const useColumnWidths = (
  data: Array<DataSheetRow>,
  supportColspan: boolean = false,
  columns: Column<any, any, any>[],
  width?: number,
  activeCell?: Cell | null,
) => {
  const [columnWidths, setColumnWidths] = useDeepEqualState<
    number[] | undefined
  >(undefined)
  const [prevWidth, setPrevWidth] = useState(width)
  const [preRenderHash, setPreRenderHash] = useState<string>()

  const { totalWidth, columnRights } = useMemo(() => {
    if (!columnWidths) {
      return { totalWidth: undefined, columnRights: undefined }
    }

    let total = 0

    const columnRights = columnWidths.map((w, i) => {
      total += w
      return i === columnWidths.length - 1 ? Infinity : total
    })

    return {
      columnRights,
      totalWidth: total,
    }
  }, [columnWidths])

  useEffect(() => {
    if (width === undefined) {
      return
    }
    // check diff
    const renderHash = getRenderHash(width, columns, data, activeCell)
    if (preRenderHash !== renderHash) {
      setPreRenderHash(renderHash)
    } else {
      return
    }

    const el = document.createElement('div')

    el.style.display = 'flex'
    el.style.position = 'fixed'
    el.style.width = `${width}px`
    el.style.left = '-999px'
    el.style.top = '-1px'

    let children: HTMLDivElement[] = []
    if (supportColspan && data.length && activeCell) {
      const item = data[activeCell.row]
      children = columns.map((column, i) => {
        const colspan = supportColspan
          ? typeof column.colspan === 'function'
            ? column.colspan(item, activeCell.row)
            : column.colspan ?? 1
          : 1
        const ishide = Boolean(colspan === 0 && (
          typeof column.hideWhenColspanZero === 'function'
            ? column.hideWhenColspanZero(item, activeCell.row)
            : column.hideWhenColspanZero)
        )

        const child = document.createElement('div')
        child.style.display = ishide ? 'none' : 'block'
        child.style.flex = typeof column.width === 'string'
          ? column.width
          : String(column.width * colspan)

        if (colspan !== 1) {
          const mergeColumns = columns.slice(i + 1, i + colspan)
          const mergeMinWidth = mergeColumns.map(it => it.minWidth ?? 0)
            .reduce((pre, cur) => {
              return pre + cur
            }, column.minWidth ?? 0)
          const mergeMaxWidth = mergeColumns.map(it => it.maxWidth ?? 0)
            .reduce((pre, cur) => {
              return pre + cur
            }, column.maxWidth ?? 0)

          child.style.minWidth = `${mergeMinWidth}px`
          child.style.maxWidth = `${mergeMaxWidth}px`
        } else {
          child.style.minWidth = `${column.minWidth}px`
          child.style.maxWidth = `${column.maxWidth}px`
        }
        return child
      })
    } else {
      children = columns.map((column) => {
        const child = document.createElement('div')

        child.style.display = 'block'
        child.style.flex = String(column.width)
        child.style.minWidth = `${column.minWidth}px`
        child.style.maxWidth = `${column.maxWidth}px`

        return child
      })
    }

    children.forEach((child) => el.appendChild(child))
    document.body.insertBefore(el, null)

    setColumnWidths(
      children.map((child) => child.getBoundingClientRect().width)
    )
    setPrevWidth(width)

    el.remove()
  }, [width, columns, supportColspan, data, activeCell, preRenderHash])

  return {
    fullWidth: Math.abs((prevWidth ?? 0) - (totalWidth ?? 0)) < 0.1,
    columnWidths,
    columnRights,
    totalWidth,
  }
}
