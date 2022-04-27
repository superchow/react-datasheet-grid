import React, { useCallback, useRef } from 'react'
import operationTypes, { DELETE_ROW, DELETE_ROWS, DUPLICATE_ROWS } from '../constant'
import { useDocumentEventListener } from '../hooks/useDocumentEventListener'
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

  return item.type
}

export const ContextMenu = ({
  clientX,
  clientY,
  items,
  close,
}: ContextMenuComponentProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const onClickOutside = useCallback(
    (event: MouseEvent) => {
      const clickInside = containerRef.current?.contains(event.target as Node)

      if (!clickInside) {
        close()
      }
    },
    [close]
  )
  useDocumentEventListener('mousedown', onClickOutside)

  return (
    <div
      className="dsg-context-menu"
      style={{ left: clientX + 'px', top: clientY + 'px' }}
      ref={containerRef}
    >
      {items.map((item) => (
        <div
          key={item.type}
          onClick={item.action}
          className="dsg-context-menu-item"
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  )
}

export default ContextMenu
