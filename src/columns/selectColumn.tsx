import React, { FocusEventHandler, FormEventHandler, KeyboardEventHandler, MouseEventHandler, ReactNode, RefCallback, TouchEventHandler, useLayoutEffect, useRef } from 'react'

import Select, { GroupBase, Props, Options, OnChangeValue, ActionMeta, InputActionMeta, FocusDirection, SetValueAction, Theme, OptionsOrGroups, CSSObjectWithLabel } from 'react-select'
import { AriaSelection } from 'react-select/dist/declarations/src/accessibility'
import { FilterOptionOption } from 'react-select/dist/declarations/src/filters'
import { FormatOptionLabelContext } from 'react-select/dist/declarations/src/Select'
import { StylesProps } from 'react-select/dist/declarations/src/styles'
import { CellProps, Column } from '../types'


type Choice = {
  label: string
  value: string
}

type SelectOptions = {
  choices: Choice[]
  disabled?: boolean
}

interface State<Option, IsMulti extends boolean, Group extends GroupBase<Option>> {
  ariaSelection: AriaSelection<Option, IsMulti> | null;
  inputIsHidden: boolean;
  isFocused: boolean;
  focusedOption: Option | null;
  focusedValue: Option | null;
  selectValue: Options<Option>;
  clearFocusValueOnUpdate: boolean;
  prevWasFocused: boolean;
  inputIsHiddenAfterUpdate: boolean | null | undefined;
  prevProps: Props<Option, IsMulti, Group> | void;
}
interface CategorizedGroup<Option, Group extends GroupBase<Option>> {
  type: 'group';
  data: Group;
  options: readonly CategorizedOption<Option>[];
  index: number;
}

interface CategorizedOption<Option> {
  type: 'option';
  data: Option;
  isDisabled: boolean;
  isSelected: boolean;
  label: string;
  value: string;
  index: number;
}

type CategorizedGroupOrOption<Option, Group extends GroupBase<Option>> = CategorizedGroup<Option, Group> | CategorizedOption<Option>;

type SelectRef<Option extends Choice, IsMulti extends boolean, Group extends GroupBase<Option>> =
  JSX.LibraryManagedAttributes<typeof Select, {
    state: State<Option, IsMulti, Group>;
    blockOptionHover: boolean;
    isComposing: boolean;
    commonProps: any;
    initialTouchX: number;
    initialTouchY: number;
    instancePrefix: string;
    openAfterFocus: boolean;
    scrollToFocusedOptionOnUpdate: boolean;
    userIsDragging?: boolean;
    controlRef: HTMLDivElement | null;
    getControlRef: RefCallback<HTMLDivElement>;
    focusedOptionRef: HTMLDivElement | null;
    getFocusedOptionRef: RefCallback<HTMLDivElement>;
    menuListRef: HTMLDivElement | null;
    getMenuListRef: RefCallback<HTMLDivElement>;
    inputRef: HTMLInputElement | null;
    getInputRef: RefCallback<HTMLInputElement>;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props<Option, IsMulti, Group>): void;
    componentWillUnmount(): void;
    onMenuOpen(): void;
    onMenuClose(): void;
    onInputChange(newValue: string, actionMeta: InputActionMeta): void;
    focusInput(): void;
    blurInput(): void;
    focus: () => void;
    blur: () => void;
    openMenu(focusOption: 'first' | 'last'): void;
    focusValue(direction: 'previous' | 'next'): void;
    focusOption(direction?: FocusDirection): void;
    onChange: (newValue: OnChangeValue<Option, IsMulti>, actionMeta: ActionMeta<Option>) => void;
    setValue: (newValue: OnChangeValue<Option, IsMulti>, action: SetValueAction, option?: Option | undefined) => void;
    selectOption: (newValue: Option) => void;
    removeValue: (removedValue: Option) => void;
    clearValue: () => void;
    popValue: () => void;
    getTheme(): Theme;
    getValue: () => Options<Option>;
    cx: (...args: any) => string;
    getCommonProps(): {
      clearValue: () => void;
      cx: (...args: any) => string;
      getStyles: <Key extends keyof StylesProps<Option, IsMulti, Group>>(key: Key, props: StylesProps<Option, IsMulti, Group>[Key]) => CSSObjectWithLabel;
      getValue: () => Options<Option>;
      hasValue: boolean;
      isMulti: IsMulti;
      isRtl: boolean;
      options: OptionsOrGroups<Option, Group>;
      selectOption: (newValue: Option) => void;
      selectProps: Readonly<Props<Option, IsMulti, Group>> & Readonly<{
        children?: React.ReactNode;
      }>;
      setValue: (newValue: OnChangeValue<Option, IsMulti>, action: SetValueAction, option?: Option | undefined) => void;
      theme: Theme;
    };
    getOptionLabel: (data: Option) => string;
    getOptionValue: (data: Option) => string;
    getStyles: <Key extends keyof StylesProps<Option, IsMulti, Group>>(key: Key, props: StylesProps<Option, IsMulti, Group>[Key]) => CSSObjectWithLabel;
    getElementId: (element: 'group' | 'input' | 'listbox' | 'option' | 'placeholder' | 'live-region') => string;
    buildCategorizedOptions: () => CategorizedGroupOrOption<Option, Group>[];
    getCategorizedOptions: () => CategorizedGroupOrOption<Option, Group>[];
    buildFocusableOptions: () => Option[];
    getFocusableOptions: () => Option[];
    ariaOnChange: (value: OnChangeValue<Option, IsMulti>, actionMeta: ActionMeta<Option>) => void;
    hasValue(): boolean;
    hasOptions(): boolean;
    isClearable(): boolean;
    isOptionDisabled(option: Option, selectValue: Options<Option>): boolean;
    isOptionSelected(option: Option, selectValue: Options<Option>): boolean;
    filterOption(option: FilterOptionOption<Option>, inputValue: string): boolean;
    formatOptionLabel(data: Option, context: FormatOptionLabelContext): ReactNode;
    formatGroupLabel(data: Group): React.ReactNode;
    onMenuMouseDown: MouseEventHandler<HTMLDivElement>;
    onMenuMouseMove: MouseEventHandler<HTMLDivElement>;
    onControlMouseDown: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onDropdownIndicatorMouseDown: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onClearIndicatorMouseDown: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onScroll: (event: Event) => void;
    startListeningComposition(): void;
    stopListeningComposition(): void;
    onCompositionStart: () => void;
    onCompositionEnd: () => void;
    startListeningToTouch(): void;
    stopListeningToTouch(): void;
    onTouchStart: ({ touches }: TouchEvent) => void;
    onTouchMove: ({ touches }: TouchEvent) => void;
    onTouchEnd: (event: TouchEvent) => void;
    onControlTouchEnd: TouchEventHandler<HTMLDivElement>;
    onClearIndicatorTouchEnd: TouchEventHandler<HTMLDivElement>;
    onDropdownIndicatorTouchEnd: TouchEventHandler<HTMLDivElement>;
    handleInputChange: FormEventHandler<HTMLInputElement>;
    onInputFocus: FocusEventHandler<HTMLInputElement>;
    onInputBlur: FocusEventHandler<HTMLInputElement>;
    onOptionHover: (focusedOption: Option) => void;
    shouldHideSelectedOptions: () => boolean | IsMulti;
    onKeyDown: KeyboardEventHandler<HTMLDivElement>;
    renderInput(): JSX.Element;
    renderPlaceholderOrValue(): JSX.Element | JSX.Element[] | null;
    renderClearIndicator(): JSX.Element | null;
    renderLoadingIndicator(): JSX.Element | null;
    renderIndicatorSeparator(): JSX.Element | null;
    renderDropdownIndicator(): JSX.Element | null;
    renderMenu(): JSX.Element | null;
    renderFormField(): JSX.Element | undefined;
    renderLiveRegion(): JSX.Element;
  }>;

export const SelectComponent = React.memo(
  ({
    active,
    rowData,
    setCellData,
    focus,
    stopEditing,
    columnData,
  }: CellProps<string | null, SelectOptions>) => {
    const ref = useRef<SelectRef<Choice, false, GroupBase<Choice>>>(null)

    const asyncRef = useRef({
      focusedAt: 0,
      escPressed: false
    })

    asyncRef.current = {
      // Keep the same values across renders
      focusedAt: asyncRef.current.focusedAt,
      escPressed: asyncRef.current.escPressed,
    }

    const forceBlur = () => {
      ref.current?.blur()
      stopEditing({ nextRow: false })
    }

    useLayoutEffect(() => {
      if (focus) {
        if (ref.current) {
          if (ref.current.state.isFocused && ref.current.focusedOptionRef) {
            forceBlur()
          } else {
            ref.current.focus()
          }
        }
        asyncRef.current.escPressed = false
        asyncRef.current.focusedAt = Date.now()
      } else {
        if (Date.now() - asyncRef.current.focusedAt > 60 || ref.current?.state.isFocused) {
          ref.current?.blur()
        }
      }
    }, [focus])

    return (
      <Select
        ref={(ref as any)}
        styles={{
          container: (provided) => ({
            ...provided,
            flex: 1,
            alignSelf: 'stretch',
            pointerEvents: focus ? undefined : 'none',
          }),
          control: (provided) => ({
            ...provided,
            height: '100%',
            border: 'none',
            boxShadow: 'none',
            background: 'none',
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            opacity: 0,
          }),
          indicatorsContainer: (provided) => ({
            ...provided,
            opacity: active ? 1 : 0,
          }),
          placeholder: (provided) => ({
            ...provided,
            opacity: active ? 1 : 0,
          }),
        }}
        isDisabled={columnData.disabled}
        value={
          columnData.choices.find(({ value }) => value === rowData) ?? null
        }
        menuPortalTarget={document.body}
        menuIsOpen={focus}
        onChange={(data) => {
          setCellData(data?.value ?? null)
          setTimeout(stopEditing, 0)
        }}
        onMenuClose={() => stopEditing({ nextRow: false })}
        options={columnData.choices}
      />
    )
  }
)

export const selectColumn = (
  options: SelectOptions
): Partial<Column<string | null, SelectOptions, string>> => ({
  component: SelectComponent as any,
  columnData: options,
  disableKeys: true,
  keepFocus: false,
  disabled: options.disabled,
  deleteValue: () => null,
  copyValue: ({ rowData }) =>
    options.choices.find((choice) => choice.value === rowData)?.label ?? null,
  pasteValue: ({ value }) =>
    options.choices.find((choice) => choice.label === value)?.value ?? null,
})

