import React, { useEffect } from 'react'
import {
  Menu,
  Item,
  useContextMenu
} from "react-contexify";
import cx from 'classnames'
import operationTypes, { DELETE_COLS, DELETE_ROWS, DUPLICATE_ROWS } from '../constant'
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

export const ContextMenu = ({
  id,
  event,
  clientX,
  clientY,
  items,
  onShown,
  onHidden
}: ContextMenuComponentProps) => {

  const { show, hideAll } = useContextMenu({
    id
  });

  useEffect(() => {
    if (event) {
      const x = clientX || event.clientX
      const y = clientY || event.clientY
      show(event, {
        position: {
          x,
          y
        }
      })
    } else {
      hideAll()
    }
  }, [id, event, clientX, clientY])

  return <Menu 
    id={id}
    className={cx('dsg-context-menu', `dsg-menu-${id}`)} 
    animation={{ exit: false, enter: false }}
    onShown={onShown}
    onHidden={onHidden}
  >
    {items.map(it => (<Item key={it.type} className="dsg-context-menu-item" onClick={it.action}>{renderItem(it)}</Item>))}
  </Menu>
}

export default ContextMenu
