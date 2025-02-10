import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

class PageTransition extends Component {
  constructor(props) {
    super(props);
    this._location = props.location;
    this._pageVariants = {
      initial: {
        opacity: 0,
        scale: 0.98
      },
      in: {
        opacity: 1,
        scale: 1
      },
      out: {
        opacity: 0,
        scale: 1.02
      }
    };
    this._pageTransition = {
      type: "tween",
      ease: "anticipate",
      duration: 0.5
    };
  }

  render() {
    return (
      <motion.div
        key={this._location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={this._pageVariants}
        transition={this._pageTransition}
      >
        {this.props.children}
      </motion.div>
    );
  }
}

// Name the HOC before exporting
const WithLocationPageTransition = (props) => {
  const location = useLocation();
  return <PageTransition {...props} location={location} />;
};

export default WithLocationPageTransition; 