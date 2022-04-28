import cx from 'classnames'
import React, { useContext } from 'react'
import { SelectionContext } from '../contexts/SelectionContext'

const ScrollableView = () => {
  const {
    dataLength,
    rowHeight,
    columnWidths,
    headerRowHeight,
    viewHeight,
    contentWidth,
    edges,
  } = useContext(SelectionContext)
  if (!columnWidths) {
    return <></>
  }
  return <div
    className="dsg-scrollable-view-container"
    style={{
      height: dataLength * rowHeight + headerRowHeight,
      width: contentWidth ? contentWidth : '100%',
    }}
  >
  <div
    className={cx({
      'dsg-scrollable-view': true,
      'dsg-scrollable-view-t': !edges.top,
      'dsg-scrollable-view-r': !edges.right,
      'dsg-scrollable-view-b': !edges.bottom,
      'dsg-scrollable-view-l': !edges.left,
    })}
    style={{
      top: headerRowHeight,
      left: 0,
      height: viewHeight ? viewHeight - headerRowHeight : 0,
      width: '100%',
    }}
  />
</div>
}

export {
  ScrollableView
}