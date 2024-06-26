import cx from 'classnames'
import React, { HTMLAttributes, useContext, useMemo } from 'react'
import { SelectionContext } from '../contexts/SelectionContext'

const ScrollableView = React.memo((props: {
  style: React.CSSProperties
} & HTMLAttributes<HTMLDivElement>) => {
  // console.log('ScrollableView')
  const { style, className, ...rest } = props
  const {
    columnWidths,
    headerRowHeight,
    viewWidth,
    viewHeight,
    contentWidth,
    contentHeight,
    hasStickyRightColumn,
    edges,
  } = useContext(SelectionContext)
  if (!columnWidths) {
    return <></>
  }

  return <div
    {...rest}
    className={
      cx('dsg-scrollable-view-container', className)
    }
    style={style}
  >
  <div
    className={cx({
      'dsg-scrollable-view': true,
      'dsg-scrollable-view-y': true,
      'dsg-scrollable-view-t': !edges.top,
      'dsg-scrollable-view-b': !edges.bottom,
    })}
    style={{
      top: headerRowHeight,
      left: 0,
      height: viewHeight ? viewHeight - headerRowHeight : 0,
      width: '100%',
    }}
  />
  <div
    className={cx({
      'dsg-scrollable-view': true,
      'dsg-scrollable-view-x': true,
    })}
    style={{
      top: headerRowHeight,
      left: columnWidths[0],
      height: contentHeight ? contentHeight - headerRowHeight : 0,
      width: contentWidth && viewWidth
      ? contentWidth -
        columnWidths[0] -
        (hasStickyRightColumn
          ? columnWidths[columnWidths.length - 1]
          : 0)
      : `calc(100% - ${
          columnWidths[0] +
          (hasStickyRightColumn
            ? columnWidths[columnWidths.length - 1]
            : 0)
        }px)`,
    }}
  >
    <div
      className={cx({
        'dsg-scrollable-view': true,
        'dsg-scrollable-view-r': !edges.right,
        'dsg-scrollable-view-l': !edges.left,
      })}
      style={{
        top: headerRowHeight,
        left: columnWidths[0],
        height: contentHeight ? contentHeight - headerRowHeight : 0,
        width: contentWidth && viewWidth
        ? viewWidth -
          columnWidths[0] -
          (hasStickyRightColumn
            ? columnWidths[columnWidths.length - 1]
            : 0)
        : `calc(100% - ${
            columnWidths[0] +
            (hasStickyRightColumn
              ? columnWidths[columnWidths.length - 1]
              : 0)
          }px)`,
      }}
    />
  </div>
</div>
})

ScrollableView.displayName = 'ScrollableView'

export {
  ScrollableView
}