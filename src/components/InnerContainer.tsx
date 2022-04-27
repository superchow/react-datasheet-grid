import React, { ReactNode, useContext } from 'react'
import { HeaderRow } from './HeaderRow'
import { SelectionRect } from './SelectionRect'
import cx from 'classnames'
import { HeaderContext } from '../contexts/HeaderContext'

export const InnerContainer = React.forwardRef<
  HTMLDivElement,
  { style: React.CSSProperties, children: ReactNode }
>(({ children, ...rest }, ref) => {
  const {
    contentWidth,
  } = useContext(HeaderContext)
  return (
    <div ref={ref} {...rest}>
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
      <SelectionRect />
    </div>
  )
})

InnerContainer.displayName = 'InnerContainer'
