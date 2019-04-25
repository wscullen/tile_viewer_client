import './../assets/css/Modal.css';

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Modal = ({ handleClose, show, children }) => {
    
  const showHideClassName = show ? "modal display-block" : "modal display-none";
  
    return (
      <div className={showHideClassName}>
        <section className="modal-main">
          {children}
          <button className="close-button" onClick={handleClose}><FontAwesomeIcon className='fa-icon-black' icon="window-close"/></button>
        </section>
      </div>
    );
  };

export default Modal;