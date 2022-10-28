import { ColInfo, utils, WorkSheet } from "xlsx";
import { Column, DataSheetRow } from "../types";

export function getSheetCols(rawSheet: WorkSheet): ColInfo[] {
  if (!rawSheet) { return [] }
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
  return cols
}

export function sheetToJson<T extends DataSheetRow>(rawSheet: WorkSheet): T[] {
  if (!rawSheet) { return [] }
  const list = utils.sheet_to_json<T & { __rowNum__: number }>(rawSheet);
  const merges = rawSheet["!merges"];
  const rangeKeys = Object.keys(rawSheet).filter((k) => !k.startsWith("!"));
  if (!merges || !merges.length) {
    return list.map(({ __rowNum__, ...rest }) => (rest as unknown as T));
  } else {
    let ref = rawSheet["!ref"];
    if (!ref) {
      ref = `${rangeKeys[0]}:${rangeKeys[rangeKeys.length - 1]}`;
    }

    const spanData = merges.map((merge) => {
      const { s: start, e: end } = merge;
      const cell = utils.encode_cell(start);
      let rowspan, colspan;
      // 行合并
      if (start.r !== end.r) {
        rowspan = end.r - start.r + 1;
      }
      // 列合并
      if (start.c !== end.c) {
        colspan = end.c - start.c + 1;
      }
      return {
        [cell]: {
          rowspan,
          colspan,
        },
      };
    });
    spanData.forEach((item) => {
      Object.keys(item).forEach((c) => {
        const { colspan, rowspan = 1 } = item[c];
        const [col, row] = c.split("");
        const colTitle = rawSheet[`${col}1`].v;
        const startRowIndex = +row - 2;
        const endRowIndex = startRowIndex + (rowspan || 0);
        const currentRowData = list[startRowIndex];
        const itemRowspan = currentRowData.rowspan || {};
        itemRowspan[colTitle] = rowspan;
        currentRowData.rowspan = itemRowspan;
        for (let index = startRowIndex + 1; index < endRowIndex; index++) {
          const element = list[index];
          const itemRowspan = element.rowspan || {};
          itemRowspan[colTitle] = 0;
          element.rowspan = itemRowspan;
        }
      });
    });

    return list.map(({ __rowNum__, ...rest }) => (rest as unknown as T));
  }
}

/** Output sheetData according to columns */
export function formatDataSheetData<T extends DataSheetRow>(list: T[], columns: Partial<Column<T, any, any>>[]): T[] {
  return list?.map(raw => {
    const row: T = {} as T
    columns.forEach(col => {
      // @ts-ignore
      row[col.title] = raw[col.id!]
    })
    return row
  })
}

export { utils as xlsxUtils };
