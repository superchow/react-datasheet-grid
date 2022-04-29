import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  CellComponent,
  checkboxColumn,
  Column,
  DataSheetGrid,
  DataSheetGridRef,
  dateColumn,
  floatColumn,
  intColumn,
  keyColumn,
  SimpleColumn,
  textColumn,
} from 'react-datasheet-grid'
import 'react-datasheet-grid/dist/style.css'
import { ColumnOperation, DataSheetRow, Operation } from 'react-datasheet-grid/types';
import objHash from 'object-hash';
import deepEqual from 'fast-deep-equal'
import { ColInfo, utils, WorkSheet } from 'xlsx';


const CollCell: CellComponent<DataSheetRow, any> | undefined = ({ rowData, focus, stopEditing }) => {
  useEffect(() => {
    if (focus) {
      stopEditing({ nextRow: false })
    }
  }, [focus, stopEditing])

  return (
    <span style={{ paddingLeft: 10 }}>
      {rowData.rowspan ? '👇' : '👉️'} {rowData.name}
    </span>
  )
}

const TreeDataTable = () => {

  const ref = useRef<DataSheetGridRef>(null)
  const [headKeys, setHeadKeys] = useState<ColInfo[]>([])
  const [gutterColumn, setGutterColumn] = useState<SimpleColumn<DataSheetRow, any> | false | undefined>(undefined)

  const rawSheet = useMemo<WorkSheet>(() => {
    return {
      "!rows": [],
      "!cols": [],
      "A1": {
        "t": "z",
        "v": ""
      },
      "B1": {
        "t": "s",
        "v": "name"
      },
      "C1": {
        "t": "s",
        "v": "First name"
      },
      "D1": {
        "t": "s",
        "v": "Last name"
      },
      "E1": {
        "t": "n",
        "v": "Salary"
      },
      "A2": {
        "t": "z",
        "v": ""
      },
      "B2": {
        "t": "s",
        "v": "Senior Integration Producer"
      },
      "C2": {
        "t": "s",
        "v": "Elton"
      },
      "D2": {
        "t": "s",
        "v": "Chou"
      },
      "E2": {
        "t": "n",
        "v": 5685
      },
      "A3": {
        "t": "z",
        "v": ""
      },
      "C3": {
        "t": "s",
        "v": "Daniella"
      },
      "D3": {
        "t": "s",
        "v": "Zulauf"
      },
      "E3": {
        "t": "n",
        "v": 2793
      },
      "A4": {
        "t": "z",
        "v": ""
      },
      "C4": {
        "t": "s",
        "v": "Jackie"
      },
      "D4": {
        "t": "s",
        "v": "Mraz"
      },
      "E4": {
        "t": "n",
        "v": 2892
      },
      "A5": {
        "t": "z",
        "v": ""
      },
      "B5": {
        "t": "s",
        "v": "Senior Directives Assistant"
      },
      "C5": {
        "t": "z",
        "v": ""
      },
      "D5": {
        "t": "z",
        "v": ""
      },
      "E5": {
        "t": "n",
        "v": 2618
      },
      "A6": {
        "t": "z",
        "v": ""
      },
      "C6": {
        "t": "s",
        "v": "Lucienne"
      },
      "D6": {
        "t": "s",
        "v": "Mohr"
      },
      "E6": {
        "t": "n",
        "v": 2618
      },
      "!merges": [
        {
          "s": {
            "r": 1,
            "c": 1
          },
          "e": {
            "r": 3,
            "c": 1
          }
        },
        {
          "s": {
            "r": 4,
            "c": 1
          },
          "e": {
            "r": 5,
            "c": 1
          }
        }
      ],
      "!ref": "A1:E6",
      "!fullref": "A1:E6"
    }
  }, [])

  const rawData = useMemo(() => {
    const merges = rawSheet['!merges']
    const rangeKeys = Object.keys(rawSheet).filter(k => !k.startsWith('!'))
    let cols = rawSheet['!cols']
    if (!cols || !cols.length) {
      cols = rangeKeys.filter(k => /^[a-z]1$/i.test(k)).map(k => {
        return {
          hidden: false,
          DBF: {
            name: rawSheet[k].v,
            type: rawSheet[k].t,
          }
        }
      })
    }

    setHeadKeys(cols)

    const list = utils.sheet_to_json<DataSheetRow & { __rowNum__: number }>(rawSheet)
    if (!merges || !merges.length) {
      return list.map(({ __rowNum__, ...rest }) => (rest))
    } else {
      let ref = rawSheet['!ref']
      if (!ref) {
        ref = `${rangeKeys[0]}:${rangeKeys[rangeKeys.length - 1]}`
      }

      const spanData = merges.map(merge => {
        const { s: start, e: end } = merge
        const cell = utils.encode_cell(start)
        let rowspan, colspan
        // rowspan
        if (start.r !== end.r) {
          rowspan = end.r - start.r + 1
        }
        // colspan
        if (start.c !== end.c) {
          colspan = end.c - start.c + 1
        }
        return {
          [cell]: {
            rowspan,
            colspan
          }
        }
      })
      spanData.forEach(item => {
        Object.keys(item).forEach(c => {
          const { colspan, rowspan = 1 } = item[c]
          const [col, row] = c.split('')
          const colTitle = rawSheet[`${col}1`].v
          const startRowIndex = +row - 2
          const endRowIndex = startRowIndex + (rowspan || 0)
          const currentRowData = list[startRowIndex]
          const itemRowspan = currentRowData.rowspan || {}
          itemRowspan[colTitle] = rowspan
          currentRowData.rowspan = itemRowspan
          for (let index = startRowIndex + 1; index < endRowIndex; index++) {
            const element = list[index];
            const itemRowspan = element.rowspan || {}
            itemRowspan[colTitle] = 0
            element.rowspan = itemRowspan
          }

        })
      })

      return list.map(({ __rowNum__, ...rest }) => (rest))
    }
  }, [rawSheet])


  const [jsonData, setJsonData] = useState<DataSheetRow[]>(rawData)

  // @ts-ignore
  const columns = useMemo<Column<DataSheetRow, any, any>[]>(() => {
    return headKeys.filter(it => it.hidden !== true).map(colInfo => {
      const id = colInfo.DBF?.name!
      const columnType = colInfo.DBF?.type || 's'
      const column = {
        n: intColumn,
        d: dateColumn,
        s: textColumn,
        f: floatColumn,
        b: checkboxColumn
      }[columnType]
      return column ? ({
        ...keyColumn(id, column as any),
        columnType,
        title: id,
        align: 'center',
        rowspan: (data: DataSheetRow) => (data.rowspan ? data.rowspan[id] >= 0 ? data.rowspan[id] : 1 : 1),
      } as Column<DataSheetRow, any, any>) : undefined
    }).filter(it => it)
  }, [headKeys])

  const createRow = useCallback(() => {
    const emptyRow: DataSheetRow = {
      rowspan: {}
    }
    headKeys.forEach(colInfo => {
      const id = colInfo.DBF?.name
      const columnType = colInfo.DBF?.type
      if (id) {
        emptyRow[id] = columnType === 's' 
          ? ''
          : undefined
      }
    })
    return emptyRow
  }, [headKeys])
  const handleOnChange = (rows: DataSheetRow[], operations: Operation[]) => {
    const rowsCopy: ({
      _markDelete?: boolean
    }&DataSheetRow)[] = [...jsonData]
    for (const operation of operations) {
      if (operation.type === 'UPDATE') {
        const changeRows = rows.slice(operation.fromRowIndex, operation.toRowIndex)
        changeRows.forEach(({__hash,...it}) => {
          const targetRowIndex = rowsCopy.findIndex(row => deepEqual(objHash.MD5(row), __hash))
          if (targetRowIndex > -1) {
            rowsCopy[targetRowIndex] = {
              ...it
            }
          }
        })
        setJsonData(rowsCopy)
      } else if (operation.type === 'DELETE') {
        const deletedRows = jsonData
          .slice(operation.fromRowIndex, operation.toRowIndex)
          .reverse()

        for (const deletedRow of deletedRows) {
          const rowIndex = jsonData.findIndex(it => deepEqual(deletedRow, it))
          // mark delete row
          rowsCopy[rowIndex]._markDelete = true
          if (deletedRow.rowspan) {
            Object.keys(deletedRow.rowspan).forEach(key => {
              const keyRowspan = deletedRow.rowspan![key]
              if (keyRowspan > 1) {
                const startIndex = rowIndex + 1
                const endIndex = rowIndex + keyRowspan
                for (let index = startIndex; index < endIndex; index++) {
                  const element = jsonData[index];
                  const cellRowspan = element.rowspan || {}
                  cellRowspan[key] = 1
                  rowsCopy[index] = {
                    ...element,
                    rowspan: cellRowspan
                  }
                }
              } else if (keyRowspan === 0)  {
                // look up
                const parentRow = rowsCopy.slice(0, rowIndex).reverse().find(it => {
                  return it.rowspan && it.rowspan[key] > 1
                })
                if (parentRow) {
                  parentRow.rowspan![key] -= 1
                }
              }
            })
          }
        }

        setJsonData(rowsCopy.filter(it => it._markDelete !== true))
      } else if (operation.type === 'CREATE') {
        const count = operation.toRowIndex - operation.fromRowIndex
        const addRows = rows.slice(operation.fromRowIndex, operation.toRowIndex)
        if (!operation.fromRowIndex) {
          setJsonData([
            ...addRows,
            ...rowsCopy.slice(operation.fromRowIndex),
          ])
          return
        }
        const { __hash, ...breakRow } = rowsCopy[operation.fromRowIndex - 1]
        const rowIndex = jsonData.findIndex(it => deepEqual(it, breakRow))

        // merge rows
        if (breakRow.rowspan) {
          Object.keys(breakRow.rowspan).forEach(key => {
            breakRow.rowspan = breakRow.rowspan || {}
            const keyRowspan = breakRow.rowspan![key]
            if (keyRowspan > 1) {
              breakRow.rowspan![key] += count
              addRows.forEach(it => it.rowspan![key] = 0)
            } else if (keyRowspan === 0) {
              // new row rowspan
              const nextRow = rowsCopy[rowIndex + 1] 
              if (nextRow) {
                if (nextRow.rowspan && nextRow.rowspan![key] === 0) {
                  // find parent
                  const parentRow = rowsCopy.slice(0, rowIndex).reverse().find(it => {
                    return it.rowspan && it.rowspan[key] > 1
                  })
                  if (parentRow) {
                    parentRow.rowspan![key] += count
                    addRows.forEach(it => it.rowspan![key] = 0)
                  }
                }
              }
            }
          })
        }

        setJsonData([
          ...rowsCopy.slice(0, operation.fromRowIndex),
          ...addRows,
          ...rowsCopy.slice(operation.fromRowIndex),
        ])
      }
    }

  }

  const [key, setKey] = useState(objHash.MD5(columns))

  useLayoutEffect(() => {
    console.log(columns)
    setKey(objHash.MD5(columns))
  }, [columns])

  const handleOnColumnsChange = (newColumns: Partial<Column<DataSheetRow, any, any>>[], operation: ColumnOperation) => {
    if (operation.type === 'CREATE') {
      const addColumn = newColumns[operation.fromColIndex]
      setHeadKeys([
        ...headKeys.slice(0, operation.toColIndex),
        {
          DBF: {
            name: addColumn.id
          }
        },
        ...headKeys.slice(operation.toColIndex)
      ])
    } else if (operation.type === 'DELETE') {
      setHeadKeys([
        ...headKeys.slice(0, operation.fromColIndex + 1),
        ...headKeys.slice(operation.toColIndex + 2)
      ])
    }
  }
  // useEffect(() => {
  //   if (ref?.current) {
  //     const table = ref.current.target?.querySelector('table')
  //     if (table) {
  //       const copyTable = table.cloneNode(true) as HTMLTableElement
  //       copyTable.querySelectorAll<HTMLTableCellElement>('tr>td, tr>th').forEach(td => {
  //         if (td.style.visibility === 'hidden') {
  //           td.remove()
  //         }
  //       })
  //       console.log(utils.table_to_sheet(copyTable, {
  //         raw: false
  //       }))
  //     }

  //   }
  // }, [ref])

  return (
    <>
      <h2>Collapsible rows</h2>
      <DataSheetGrid<DataSheetRow>
        key={key}
        ref={ref}
        data-key={key}
        value={jsonData}
        createRow={createRow}
        onChange={handleOnChange}
        supportRowspan
        lockColumns={false}
        gutterColumn={gutterColumn}
        columns={columns}
        onColumnsChange={handleOnColumnsChange}
      />
    </>
  )
}

export default TreeDataTable
