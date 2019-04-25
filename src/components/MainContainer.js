import './../assets/css/MainContainer.css'
import './../assets/css/CenterContainer.css'

import React, { Component } from 'react';

import MapViewer from './MapViewer';
import AreaOfInterestList from './AreaOfInterestList';
import TimelineViewer from './TimelineViewer';
import TileList from './TileList';
import AddAreaOfInterestModal from './AddAreaOfInterestModal';

export default class MainContainer extends Component {
  state = { show: false };

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

    componentDidMount() {

      
    }

    componentDidUpdate(prevProps, prevState) {
      
    }

    render () {
      return (
        <div className="mainContainer" ref="mainContainer">
          <AddAreaOfInterestModal show={this.state.show} hideModal={this.hideModal}  />
          <AreaOfInterestList addAreaModal={this.showModal} />
          <div className="centerContainer">
            <MapViewer />
            <TimelineViewer />
          </div>
          <TileList />
        </div>
      );
    }
}