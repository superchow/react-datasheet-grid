import { Cell, Column } from '../types'
import { useEffect, useMemo, useState } from 'react'
import { useDeepEqualState } from './useDeepEqualState'

export const useColumnHeights = (
  data: Array<any>,
  supportRowspan: boolean = false,
  columns: Column<any, any, any>[],
  rowHeight: number,
  headerRowHeight: number,
  activeCell?: Cell|null,
  container?: HTMLElement|null,
  height?: number
) => {
  const [columnHeights, setColumnHeights] = useDeepEqualState<
    number[] | undefined
  >(undefined)
  const [prevHeight, setPrevHeight] = useState(height)

  const { totalHeight, columnRowTops } = useMemo(() => {
    if (!columnHeights) {
      return { totalHeight: undefined, columnRowTops: undefined }
    }

    const total = columnHeights.reduce((prv, current) => {
      return prv + current
    }, headerRowHeight)

    const columnRowTops: number[] = []
    columnHeights.forEach((w, i) => {
      if (i === 0) {
        columnRowTops.push(0)
      } else {
        const preH = columnHeights.slice(0, i).reduce((a, b) => a + b)
        const theoryTop = rowHeight * i
        columnRowTops.push(theoryTop < preH ? columnRowTops[i - 1] : Math.min(preH, theoryTop))
      }
    })

    return {
      columnRowTops: columnRowTops.map(a => a + headerRowHeight),
      totalHeight: total,
    }
  }, [columnHeights, rowHeight, headerRowHeight])


  useEffect(() => {
    if (height === undefined) {
      return
    }
    const len = data.length
    if (!container || !activeCell) {
      const columnsData = new Array(len).fill(rowHeight, 0, len - 1)
      setColumnHeights(columnsData.map((h, i) => (h * (1 + i))))
      return
    }
    const list: number[][] = []
    data.forEach((item) => {
      const colData:number[] = []
      columns.forEach(column => {
        const rowspan = supportRowspan 
          ? typeof column.rowspan === 'function'
            ? column.rowspan(item)
            : column.rowspan || 1
          : 1
        colData.push(rowHeight * rowspan)
      })
      list.push(colData)
    })
    
    const reslut: number[] = new Array(len)
    list
      .map((item) => item[activeCell.col + 1])
      .forEach((item, row) => {
        if (reslut[row] !== undefined) {
          return
        }
        if (item > rowHeight) {
          const rowspan = Math.ceil(item / rowHeight)
          reslut[row] = item
          reslut.fill(0, row + 1, row + rowspan)
        } else {
          reslut[row] = item
        }
      })
      
    setColumnHeights(reslut)
    
    setPrevHeight(height)
  }, [height, activeCell])

  return {
    fullHeight: Math.abs((prevHeight ?? 0) - (totalHeight ?? 0)) < 0.1,
    columnHeights,
    columnRowTops,
    totalHeight,
  }
}
