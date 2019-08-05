import './../assets/css/AreaOfInterestList.css'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Button, Popover, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap'

export default class AreaOfInterestList extends React.Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = {
      popoverOpen: [],
    }
  }

  toggle = mainIdx => {
    const popoverOpen = [...this.state.popoverOpen]
    popoverOpen.map((ele, idx) => {
      if (idx !== mainIdx) {
        popoverOpen[idx] = false
      }
    })
    popoverOpen[mainIdx] = !popoverOpen[mainIdx]
    this.setState({
      popoverOpen,
    })
  }

  render() {
    return (
      <div className="areaOfInterestList">
        <div className="header">
          <div className="topRow">
            <h5 className="sectionLabel title is-5">AoI List</h5>
            <button className="addAreaButton myButton" onClick={this.props.addAreaModal}>
              <FontAwesomeIcon icon="plus" />
            </button>
          </div>
          <div className="bottomRow">
            <div className="tabs is-toggle is-fullwidth">
              <ul>
                <li
                  id="0"
                  className={this.props.activeTab === 0 ? 'is-active' : ''}
                  onClick={this.props.handleTabChange}
                >
                  <a>
                    <span className="icon is-small">
                      <FontAwesomeIcon icon="globe-americas" />
                    </span>
                    <span>Map</span>
                  </a>
                </li>
                <li
                  id="1"
                  className={this.props.activeTab === 1 ? 'is-active' : ''}
                  onClick={this.props.handleTabChange}
                >
                  <a>
                    <span className="icon is-small">
                      <FontAwesomeIcon icon="toolbox" />
                    </span>
                    <span>Jobs</span>
                  </a>
                </li>
                <li
                  id="2"
                  className={this.props.activeTab === 2 ? 'is-active' : ''}
                  onClick={this.props.handleTabChange}
                >
                  <a>
                    <span className="icon is-small">
                      <FontAwesomeIcon icon="info-circle" />
                    </span>
                    <span>Details</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <ul>
          {this.props.areasOfInterest.map((ele, idx) => {
            let aoiClassName = 'aoiListItem'

            if (ele.name === this.props.activeAOI) {
              aoiClassName += ' activeAOI'
            }

            if (idx % 2 === 0) {
              aoiClassName += ' altBackground'
            }

            return (
              <li id={'listItem' + idx} key={ele.name} name={ele.name}>
                <div className={aoiClassName} onClick={() => this.props.activateAOI(ele.name)}>
                  <div>{ele.name}</div>
                  <div>
                    <button
                      className="aoiActionButton removeAction"
                      onClick={event => {
                        console.log('trying to remove aoi, inside aoi list')
                        console.log(idx)
                        this.toggle(idx)
                        event.stopPropagation()

                        // props.removeAoI(ele.name)
                      }}
                    >
                      <FontAwesomeIcon icon="times-circle" />
                    </button>
                  </div>
                </div>
                <Popover placement="right" isOpen={this.state.popoverOpen[idx]} target={'listItem' + idx}>
                  <PopoverBody className="aoiDeletePopover">
                    <p className="deleteWarning">Permanently delete this area of interest?</p>
                    <div className="aoiDeleteButtons">
                      <button
                        className="cancelButton"
                        onClick={event => {
                          console.log('cancel clicked')
                          console.log(idx)
                          this.toggle(idx)
                          event.stopPropagation()
                          // props.removeAoI(ele.name)
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="deleteButton"
                        onClick={event => {
                          console.log('trying to remove aoi, inside aoi list')
                          console.log(idx)
                          this.toggle(idx)
                          event.stopPropagation()
                          this.props.removeAoi(ele.name)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </PopoverBody>
                </Popover>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}
