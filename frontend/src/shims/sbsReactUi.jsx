import PropTypes from 'prop-types';

/**
 * Lightweight compatibility shim for layout primitives used by SBS React UI.
 * Keeps implementation local while preserving requested import API.
 */
export function OuterLayout({ children, className = '', ...rest }) {
  return (
    <div className={`sbs-outer-layout ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

OuterLayout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

/**
 * Inner shell for centered content.
 */
export function InnerLayout({
  children,
  className = '',
  size = 'medium',
  align = 'center',
  dataTestId,
  ...rest
}) {
  const mappedProps = dataTestId ? { 'data-test-id': dataTestId, ...rest } : rest;

  return (
    <div
      className={`sbs-inner-layout sbs-inner-layout--${size} sbs-inner-layout--${align} ${className}`.trim()}
      {...mappedProps}
    >
      {children}
    </div>
  );
}

InnerLayout.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  dataTestId: PropTypes.string,
};

/**
 * Responsive content container.
 */
export function Container({ children, className = '', visibleBorder = false, ...rest }) {
  return (
    <section
      className={`sbs-container ${visibleBorder ? 'sbs-container--border' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </section>
  );
}

Container.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  visibleBorder: PropTypes.bool,
};
