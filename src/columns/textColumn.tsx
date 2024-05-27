import cx from 'classnames'
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFirstRender } from '../hooks/useFirstRender'
import {
  Align,
  CellComponent,
  CellProps,
  Column,
  TextColumnOptions,
} from '../types'

type TextColumnData<T> = {
  placeholder?: string
  align?: Align
  continuousUpdates: boolean
  parseUserInput: (value: string) => T
  formatBlurredInput: (value: T) => string
  formatInputOnFocus: (value: T) => string
}

const TextComponent = React.memo<
  CellProps<string | null, any, TextColumnData<string | null>>
>(
  ({
    active,
    focus,
    cellData,
    align: cellAlign,
    setCellData,
    readonly,
    disabled,
    columnData: {
      placeholder,
      align,
      formatInputOnFocus,
      formatBlurredInput,
      parseUserInput,
      continuousUpdates,
    },
  }) => {
    const ref = useRef<HTMLInputElement>(null)
    const firstRender = useFirstRender()
    const renderAlign = align || cellAlign

    // We create refs for async access so we don't have to add it to the useEffect dependencies
    const asyncRef = useRef({
      cellData,
      formatInputOnFocus,
      formatBlurredInput,
      setCellData,
      parseUserInput,
      continuousUpdates,
      firstRender,
      // Timestamp of last focus (when focus becomes true) and last change (input change)
      // used to prevent un-necessary updates when value was not changed
      value: cellData,
      focusedAt: 0,
      changedAt: 0,
      // This allows us to keep track of whether or not the user blurred the input using the Esc key
      // If the Esc key is used we do not update the row's value (only relevant when continuousUpdates is false)
      escPressed: false,
    })
    asyncRef.current = {
      cellData,
      formatInputOnFocus,
      formatBlurredInput,
      setCellData,
      parseUserInput,
      continuousUpdates,
      firstRender,
      // Keep the same values across renders
      value: asyncRef.current.value,
      focusedAt: asyncRef.current.focusedAt,
      changedAt: asyncRef.current.changedAt,
      escPressed: asyncRef.current.escPressed,
    }

    const isStatic = useMemo(() => {
      return readonly || disabled || !focus
    }, [focus, readonly, disabled])

    useLayoutEffect(() => {
      if (isStatic) {
        return
      }
      // When the cell gains focus we make sure to immediately select the text in the input:
      // - If the user gains focus by typing, it will replace the existing text, as expected
      // - If the user gains focus by clicking or pressing Enter, the text will be preserved and selected
      if (focus) {
        if (ref.current) {
          // Make sure to first format the input
          ref.current.value = asyncRef.current.formatInputOnFocus(
            asyncRef.current.cellData,
          )
          // 选中状态时，再次点击将取消选中并移动光标到文字末尾
          if (ref.current === document.activeElement) {
            const len = ref.current.value?.length || 0
            ref.current.setSelectionRange &&
              ref.current.setSelectionRange(len, len)
          } else {
            ref.current.focus()
            ref.current.select()
          }
        }

        // We immediately reset the escPressed
        asyncRef.current.escPressed = false
        // Save current timestamp
        asyncRef.current.focusedAt = Date.now()
      }
      // When the cell looses focus (by pressing Esc, Enter, clicking away...) we make sure to blur the input
      // Otherwise the user would still see the cursor blinking
      else {
        if (ref.current) {
          // Update the row's value on blur only if the user did not press escape (only relevant when continuousUpdates is false)
          if (
            !asyncRef.current.escPressed &&
            !asyncRef.current.continuousUpdates &&
            !asyncRef.current.firstRender &&
            // Make sure that focus was gained more than 10 ms ago, used to prevent flickering
            asyncRef.current.changedAt >= asyncRef.current.focusedAt
          ) {
            asyncRef.current.setCellData(
              asyncRef.current.parseUserInput(ref.current.value),
            )
          }
          // 修复点击后立即失焦
          if (Date.now() - asyncRef.current.focusedAt > 60) {
            ref.current.blur()
          }
        } else {
          // fix Safari do not fire bulr event
          asyncRef.current.setCellData(
            asyncRef.current.parseUserInput(asyncRef.current.value || ''),
          )
        }
      }
    }, [focus, isStatic])

    useEffect(() => {
      if (isStatic) {
        return
      }
      if (!focus && ref.current) {
        // On blur or when the data changes, format it for display
        ref.current.value = asyncRef.current.formatBlurredInput(cellData)
      }
    }, [focus, cellData, isStatic, ref.current])

    useEffect(() => {
      if (isStatic) {
        // 修复更改后的值input无法正确触发onBlur事件导致值不更新的bug
        const value = asyncRef.current.formatInputOnFocus(
          asyncRef.current.cellData,
        )
        if ((asyncRef.current.value || '') !== value) {
          asyncRef.current.setCellData(
            asyncRef.current.parseUserInput(asyncRef.current.value || ''),
          )
        }
      }
    }, [asyncRef, isStatic])

    return isStatic ? (
      <div
        className={cx(
          'dsg-input',
          renderAlign && `dsg-input-align-${renderAlign}`,
          formatBlurredInput(cellData) ? null : 'dsg-input-empty',
        )}
        dsg-input-placeholder={placeholder}>
        <span>{formatBlurredInput(cellData)}</span>
      </div>
    ) : (
      <input
        // We use an uncontrolled component for better performance
        defaultValue={formatBlurredInput(cellData)}
        className={cx(
          'dsg-input',
          renderAlign && `dsg-input-align-${renderAlign}`,
        )}
        placeholder={active ? placeholder : undefined}
        // Important to prevent any undesired "tabbing"
        tabIndex={-1}
        ref={ref}
        // Make sure that while the cell is not focus, the user cannot interact with the input
        // The cursor will not change to "I", the style of the input will not change,
        // and the user cannot click and edit the input (this part is handled by DataSheetGrid itself)
        style={{ pointerEvents: focus ? 'auto' : 'none' }}
        onChange={(e) => {
          asyncRef.current.value = e.target.value
          asyncRef.current.changedAt = Date.now()
        }}
        onBlur={(e) => {
          // Only update the row's value as the user types if continuousUpdates is true
          if (continuousUpdates) {
            setCellData(parseUserInput(e.target.value))
          }
        }}
        onKeyDown={(e) => {
          const input = e.target as HTMLInputElement
          // Track when user presses the Esc key
          if (e.key === 'Escape') {
            asyncRef.current.escPressed = true
          }
          if (e.key === 'Tab' || e.key === 'Escape') {
            // 修复Tab事件未触发更新实际值的bug
            asyncRef.current.value = input.value
            asyncRef.current.changedAt = Date.now()
            setCellData(parseUserInput(input.value))
          }
        }}
      />
    )
  },
)

TextComponent.displayName = 'TextComponent'

export const textColumn = createTextColumn<string | null>()

export function createTextColumn<T = string | null>({
  placeholder,
  align,
  continuousUpdates = true,
  deletedValue = (null as unknown) as T,
  parseUserInput = (value) => ((value?.trim() || null) as unknown) as T,
  formatBlurredInput = (value) => String(value ?? ''),
  formatInputOnFocus = (value) => String(value ?? ''),
  formatForCopy = (value) => String(value ?? ''),
  parsePastedValue = (value) =>
    (value.replace(/[\n\r]+/g, ' ').trim() || (null as unknown)) as T,
}: TextColumnOptions<T> = {}): Partial<Column<T, TextColumnData<T>, string>> {
  return {
    component: (TextComponent as unknown) as CellComponent<
      T,
      any,
      TextColumnData<T>
    >,
    columnData: {
      placeholder,
      align,
      continuousUpdates,
      formatInputOnFocus,
      formatBlurredInput,
      parseUserInput,
    },
    deleteValue: () => deletedValue,
    copyValue: ({ rowData }) => formatForCopy(rowData),
    pasteValue: ({ value }) => parsePastedValue(value),
    isCellEmpty: ({ rowData }) => rowData === null || rowData === undefined,
  }
}
