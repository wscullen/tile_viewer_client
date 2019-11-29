import './../assets/css/AreaOfInterestList.scss'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Icon from 'antd/es/icon'
import { List, Radio, Popconfirm, message, Button } from 'antd'

import { AreaOfInterest } from '../store/aoi/types'

interface AppProps {
  addAreaModal: Function
  activeTab: number
  handleTabChange: Function
  areasOfInterest: AreaOfInterest[]
  activeAoi: string
  activateAoi: Function
  removeAoi: Function
}

interface DefaultAppState {
  popoverOpen: boolean[]
}

const defaultState: DefaultAppState = {
  popoverOpen: [],
}

export default class AreaOfInterestList extends React.Component<AppProps, DefaultAppState> {
  constructor(props: any) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = defaultState
  }

  toggle = (mainIdx: number) => {
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
            <h3>Areas of Interest</h3>
            <Button
              className="addAoiButton"
              onClick={e => {
                this.props.addAreaModal()
              }}
              type="primary"
              icon="plus"
            />
          </div>
          <div className="bottomRow">
            <Radio.Group
              defaultValue="0"
              buttonStyle="solid"
              size="large"
              onChange={e => {
                console.log(e)
                this.props.handleTabChange(parseInt(e.target.value))
              }}
            >
              <Radio.Button value="0">
                <Icon type="global" />
                <span className="radioButtonLabel">Map</span>
              </Radio.Button>
              <Radio.Button value="1">
                <Icon type="tool" />
                <span className="radioButtonLabel">Jobs</span>
              </Radio.Button>
              <Radio.Button value="2">
                <Icon type="info-circle" />
                <span className="radioButtonLabel">Details</span>
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
        <List
          // locale={{ emptyText: 'xxx' }}
          itemLayout="horizontal"
          dataSource={this.props.areasOfInterest}
          renderItem={(aoi: AreaOfInterest) => {
            let aoiClassName = ''
            const text = 'Are you sure to delete this AoI?'

            if (aoi.name === this.props.activeAoi) {
              aoiClassName += ' activeAoi'
            }

            return (
              <List.Item onClick={() => this.props.activateAoi(aoi.name)} className={aoiClassName}>
                <List.Item.Meta
                  // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                  title={aoi.name}
                />
                <Popconfirm
                  placement="topLeft"
                  title={text}
                  onConfirm={() => this.props.removeAoi(aoi.name)}
                  okText="Delete"
                >
                  <Button icon="delete" />
                </Popconfirm>
              </List.Item>
            )
          }}
        />
        {/* <ul>
          {this.props.areasOfInterest.map((ele, idx) => {
            let aoiClassName = 'aoiListItem'

            if (ele.name === this.props.activeAoi) {
              aoiClassName += ' activeAOI'
            }

            // if (idx % 2 === 0) {
            //   aoiClassName += ' altBackground'
            // }

            return (
              <li id={'listItem' + idx} key={ele.name}>
                <div className={aoiClassName} onClick={() => this.props.activateAoi(ele.name)}>
                  <span className="sectionLabel">{ele.name}</span>
                  <div>
                    <Popup
                      trigger={
                        <Button
                          className="aoiActionButton removeAction"
                          onClick={event => {
                            console.log('trying to remove aoi, inside aoi list')

                            event.stopPropagation()
                          }}
                        >
                          <Icon type="times"></Icon>
                        </Button>
                      }
                      flowing
                      hoverable
                      on={['click']}
                      position="right center"
                    >
                      <p className="deleteWarning">Permanently delete this area of interest?</p>
                      <div className="aoiDeleteButtons">
                        <Button
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
                        </Button>
                      </div>
                    </Popup>
                  </div>
                </div>
              </li>
            )
          })}
        </ul> */}
      </div>
    )
  }
}
