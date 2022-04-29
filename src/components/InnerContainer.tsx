import React, { ReactNode, useContext, useMemo } from 'react'
import { HeaderRow } from './HeaderRow'
import { SelectionRect } from './SelectionRect'
import cx from 'classnames'
import { SelectionContext } from '../contexts/SelectionContext'
import { ScrollableView } from './scrollableView'

export const InnerContainer = React.forwardRef<
  HTMLDivElement,
  { style: React.CSSProperties, children: ReactNode }
>(({ children, style, ...rest }, ref) => {
  const { showSelection, contentWidth, viewHeight, contentHeight } = useContext(SelectionContext)

  const coverStyle = useMemo(() => {
    const mergeStyle = {
      ...style,
      width: contentWidth ? contentWidth : '100%',
    }
    if (viewHeight && contentHeight) {
      if (contentHeight < viewHeight) {
        return {
          ...mergeStyle,
          height: contentHeight + 1
        }
      }
    }
    return mergeStyle
  }, [style, viewHeight, contentHeight, contentWidth])

  return (
    <>
      <div ref={ref} style={style} {...rest}>
        <table className='dsg-table' style={{
          width: contentWidth
        }}>
          <thead className={cx('dsg-row', 'dsg-row-header')}>
            <HeaderRow />
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
        <ScrollableView style={coverStyle} />
      </div>
      {showSelection && <div className='dsg-container-cover' style={coverStyle} >
        <SelectionRect />
      </div>}
    </>
  )
})

InnerContainer.displayName = 'InnerContainer'
