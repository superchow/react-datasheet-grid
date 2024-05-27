import cx from 'classnames'
import React, { useEffect, useMemo } from 'react'
import { Item, Menu, useContextMenu } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'
import operationTypes, {
  DELETE_COLS,
  DELETE_ROWS,
  DUPLICATE_ROWS,
} from '../constant'
import { ContextMenuComponentProps, ContextMenuItem } from '../types'

const renderItem = (item: ContextMenuItem) => {
  if (operationTypes[item.type]) {
    return operationTypes[item.type]
  }

  if (item.type === DELETE_ROWS) {
    return (
      <>
        删除 <b>{item.fromRow}</b> 到 <b>{item.toRow}</b> 行
      </>
    )
  }

  if (item.type === DUPLICATE_ROWS) {
    return (
      <>
        复制 <b>{item.fromRow}</b> 到 <b>{item.toRow}</b> 行
      </>
    )
  }

  if (item.type === DELETE_COLS) {
    return (
      <>
        删除 <b>{item.fromCol}</b> 到 <b>{item.toCol}</b> 列
      </>
    )
  }

  return item.type
}

const emptyRefinement = (array: ContextMenuItem[]) => array

export const ContextMenu = ({
  id,
  event,
  clientX,
  clientY,
  cursorIndex,
  selection,
  items,
  menusRefinement = emptyRefinement,
  onShown,
  onHidden,
}: ContextMenuComponentProps) => {
  const { show, hideAll } = useContextMenu({
    id,
  })

  useEffect(() => {
    if (event) {
      const x = clientX || event.clientX
      const y = clientY || event.clientY
      show({
        event,
        position: {
          x,
          y,
        },
      })
    } else {
      hideAll()
    }
  }, [id, event, clientX, clientY])

  const renderItems = useMemo(() => {
    return menusRefinement(items, cursorIndex, selection)
  }, [items, cursorIndex, selection, menusRefinement])

  return renderItems.length ? (
    <Menu
      id={id}
      className={cx('dsg-context-menu', `dsg-menu-${id}`)}
      animation={{ exit: false, enter: false }}
      onVisibilityChange={(isVisible) => {
        if (!isVisible) {
          onHidden && onHidden()
        } else {
          onShown && onShown()
        }
      }}
    >
      {renderItems.map((it) => (
        <Item
          key={it.type}
          className="dsg-context-menu-item"
          onClick={it.action}
        >
          {renderItem(it)}
        </Item>
      ))}
    </Menu>
  ) : (
    <></>
  )
}

export default ContextMenu
