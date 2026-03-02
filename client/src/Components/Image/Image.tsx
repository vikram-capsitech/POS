import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
// Ant Design

// ----------------------------------------------------------------------

const Image = forwardRef<HTMLSpanElement, any>(
  ({ disabledEffect = false, effect = 'blur', sx, ...other }, ref) => {
    const content = (
      <LazyLoadImage
        wrapperClassName="wrapper"
        effect={disabledEffect ? undefined : effect}
        placeholderSrc={disabledEffect ? '/assets/transparent.png' : '/assets/placeholder.svg'}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        {...other}
      />
    );

    return (
      <span
        ref={ref}
        style={{
          lineHeight: 1,
          display: 'block',
          overflow: 'hidden',
          position: 'relative',
          ...sx,
        }}
      >
        <div
          className="wrapper"
          style={{
            width: '100%',
            height: '100%',
            backgroundSize: 'cover !important',
          }}
        >
          {content}
        </div>
      </span>);
  }
);

Image.propTypes = {
  sx: PropTypes.object,
  effect: PropTypes.string,
  disabledEffect: PropTypes.bool,
};

export default Image;
