/** 在前面插入列 */
export const INSERT_COL_BEFORE = 'INSERT_COL_BEFORE'
/** 在后面插入列 */
export const INSERT_COL_AFTER = 'INSERT_COL_AFTER'
/** 删除列 */
export const DELETE_COL = 'DELETE_COL'
/** 删除多列 */
export const DELETE_COLS = 'DELETE_COLS'
/** 合并列 */
export const MERGE_ROWS = 'MERGE_ROWS'
/** 清除合并列 */
export const CLEAR_MERGE_ROWS = 'CLEAR_MERGE_ROWS'



/** 删除行 */
export const DELETE_ROW = 'DELETE_ROW'
/** 删除多行 */
export const DELETE_ROWS = 'DELETE_ROWS'
/** 在上面插入行 */
export const INSERT_ROW_ABOVE = 'INSERT_ROW_ABOVE'
/** 在下面插入行 */
export const INSERT_ROW_BELLOW = 'INSERT_ROW_BELLOW'

/** 复制选中行 */
export const DUPLICATE_ROW = 'DUPLICATE_ROW'
/** 复制选中的多行 */
export const DUPLICATE_ROWS = 'DUPLICATE_ROWS'

// TODO
export default {
  [INSERT_COL_BEFORE]: '在前面插入列',
  [INSERT_COL_AFTER]: '在后面插入列',
  [DELETE_COL]: '删除列',
  [DELETE_COLS]: '',
  [MERGE_ROWS]: '合并列',
  [CLEAR_MERGE_ROWS]: '清除合并列',

  [DELETE_ROW]: '删除选中行',
  [DELETE_ROWS]: '', // '删除 {{fromRow}} 到 {{toRow}} 行',
  [INSERT_ROW_ABOVE]: '在上面插入行',
  [INSERT_ROW_BELLOW]: '在下面插入行',
  [DUPLICATE_ROW]: '复制选中行',
  [DUPLICATE_ROWS]: '' // '复制 {{fromRow}} 到 {{toRow}} 行',

}



 