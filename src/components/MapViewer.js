import './../assets/css/MapViewer.css'

import React, { Component } from 'react';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import ImageLayer from 'ol/layer/Image';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import Static from 'ol/source/ImageStatic';
import {DragBox, Select, defaults as InteractionDefaults} from 'ol/interaction';
import {platformModifierKeyOnly} from 'ol/events/condition';

import {Fill, Stroke, Style, Text} from 'ol/style';

import imgNotFound from '../assets/img/notfound.png'

const middleCanada = [-97.02, 55.72];
const middleCanadaWebMercatorProj = fromLonLat(middleCanada);

export default class MapViewer extends Component {

  static defaultProps = {
    tiles: [],
    currentDate: null,
    currentAOIName: null
}

  constructor(props) {
    super(props);

    this.getMeta = this.getMeta.bind(this)

    this.state = {
      currentInstance: this,
      featuresHovered: []
    };
  }

    componentDidMount() {

      var style = new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new Stroke({
          color: '#319FD3',
          width: 1
        }),
        text: new Text({
          font: '12px Calibri,sans-serif',
          fill: new Fill({
            color: '#000'
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 3
          })
        })
      });

      // var vectorLayer = new VectorLayer({
      //   source: new VectorSource({
      //     url: 'data/geojson/countries.geojson',
      //     format: new GeoJSON()
      //   }),
      //   style: function(feature) {
      //     style.getText().setText(feature.get('name'));
      //     return style;
      //   }
      // });

      // var map = new Map({
      //   layers: [vectorLayer],
      //   target: 'map',
      //   view: new View({
      //     center: [0, 0],
      //     zoom: 1
      //   })
      // });



        var raster = new TileLayer({
            source: new OSM()
          });


          var featureOverlay = new VectorLayer({
            source: new VectorSource(),
            map: map,
            style: this.getStyle(undefined, 'highlight')
          });

          featureOverlay.setZIndex(99999)

          var map = new Map({
            layers: [raster, featureOverlay],
            target: 'map',
            view: new View({
              center: middleCanadaWebMercatorProj,
              zoom: 3.5
            }),
            interactions : InteractionDefaults({doubleClickZoom :false})
          });

          map.on('pointermove', (evt) => {
            if (evt.dragging) {
              return;
            }
            console.log('POINTER MOVE EVENT')
            console.log(evt)
            var pixel = map.getEventPixel(evt.originalEvent);

            this.displayFeatureInfo(pixel, evt.pointerEvent.ctrlKey, evt.pointerEvent.shiftKey);
          });

          // var selectSingleClick = new Select(
          //   {
          //     filter: (feature, layer) => {
          //       console.log('inside the filter function')
          //       console.log(layer)
          //       console.log(layer.get('name'))
          //       console.log(layer.get('name') !== 'currentAoiFootprint')
          //       if (layer.get('name') !== 'currentAoiFootprint')
          //         return true

          //       return false
          //     },
          //     multi: true
          //   }
          // );

          // this.setState({
          //   mapSelect: selectSingleClick
          // })

          // map.addInteraction(selectSingleClick);

          // selectSingleClick.on('select', (e) => {
          //   console.log(e.target.getFeatures())

          //   let layersSelected = []
          //   let features = e.target.getFeatures()

          //   features.forEach((feature) => {
          //     let layer = e.target.getLayer(feature)
          //     layersSelected.push(layer)
          //   })

          //   console.log(layersSelected)
          //   let tileNames = []
          //   for (let layer of layersSelected) {
          //     tileNames.push(layer.get('tile_name'))
          //   }

          //   this.props.tileSelected(tileNames, e.target)
          // });

        // TODO: Need to refactor how the vector layer is created (create 1 vector layer with many features
        //       instead of many vector layers each with 1 feature) before this can be implemented properly
        // // a DragBox interaction used to select features by drawing boxes
        var dragBox = new DragBox({
          condition: platformModifierKeyOnly
        });

        map.addInteraction(dragBox);

        dragBox.on('boxend', () => {
          // features that intersect the box are added to the collection of
          // selected features
          let selectedFeatures = []
          var extent = dragBox.getGeometry().getExtent();
          this.state.tileLayer.getSource().forEachFeatureIntersectingExtent(extent, function(feature) {
            selectedFeatures.push(feature.getId());
          });
          console.log('dragbox selected features')
          this.props.tileSelected(selectedFeatures)
          console.log(selectedFeatures)

        });

        map.on('click', this.handleMapClick.bind(this));

        // const height = this.mapViewer.clientHeight;
        // const width = this.mapViewer.clientWidth;

        // map.setSize([width, height])

        // console.log(height)
        // console.log(width)
        console.log('map div height')

        // save map and layer references to local state
        this.setState({
          map: map,
          activeAOI: this.props.activeAOI,
          featureOverlay
        //   featuresLayer: featuresLayer
        });

      }

      displayFeatureInfo (pixel, ctrlKey, shiftKey) {
        const map = this.state.map
        console.log(ctrlKey)
        console.log(shiftKey)
        let featureOverlay = this.state.featureOverlay
        featureOverlay.getSource().clear()

        map.forEachFeatureAtPixel(pixel, (feature, layer) => {
          console.log(layer)
          if (layer.get('name') === 'tileLayer') {
            layer.setZIndex(100)
            let featureClone = feature.clone()
            featureClone.setStyle(this.getStyle(featureClone, 'highlighted'))
            featureClone.setId(feature.getId())
            featureOverlay.getSource().addFeature(featureClone)
            featureOverlay.setZIndex(999999)
            console.log(feature)
            console.log(featureClone)
            let name = feature.getId() + ': ' + feature.get('name');
            console.log(name)
          }

        });
        const featuresHovered = featureOverlay.getSource().getFeatures().map((feat) => feat.getId())

        this.setState({
          featuresHovered
        });
      }

      async getMeta(tile) {
        console.log('fetching meta for image')
        console.log(tile)
        return new Promise((resolve, reject) => {
            console.log(tile)
            console.log('inside promise')
            let img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = (() => {
              console.log('is img onload callback ever run??!')
              console.log(img)
              resolve({img, tile})
            });

            img.onerror = () => {
              console.log('problem loading image')
              tile.properties.lowres_preview_url = imgNotFound
              resolve({img, tile});
            }
            console.log(tile.properties.lowres_preview_url)
            img.src = tile.properties.lowres_preview_url;
        });
    }

      // pass new features from props into the OpenLayers layer object
      componentDidUpdate(prevProps, prevState) {
        // Programmatically set selected features NOT WORKING TODO: fix this
        console.log(prevState)
        console.log(this.state)


        console.log('inside component will update')

        if (prevProps === this.props) {
          console.log('========================== prev props the same as new props')

          console.log(prevProps)
          console.log(this.props)
          return
        }

        console.log('=========================== props have changed')
        console.log(prevProps)
        console.log(this.props)
        this.updateAllStyle()

        // let layersToSelect = []

        // if (prevProps.currentlySelectedTiles !== this.props.currentlySelectedTiles) {

        //   this.state.map.getLayers().forEach((ele) => {
        //     console.log(ele);
        //     console.log(ele.get('name'));
        //     console.log(this.props.currentlySelectedTiles)

        //     if (ele.get('name') && ele.get('name').startsWith('tileLayer') && this.props.currentlySelectedTiles.includes(ele.get('name').split("__")[1])) {
        //       console.log(ele)
        //       let source = ele.getSource();
        //       console.log(source)

        //       let features = source.getFeatures();
        //       console.log(features)
        //       layersToSelect.push(...features);
        //       console.log('features to be seelcted added programmatically')
        //     }
        //   });

        //   layersToSelect.map((ele) => {
        //     console.log(ele)
        //     console.log('going over the features to select programmatically')
        //   })
        // }

        let aoi_style = new Style({
          stroke: new Stroke({
            color: '#e11',
            width: 2
          }),
          fill: new Fill({
            color: 'rgba(0,0,0,0)'
          }),
        });

        console.log('inside component will update')
        console.log(prevProps.activeAOI)
        console.log(this.props.activeAOI)

        if (prevProps.activeAOI !== this.props.activeAOI) {

          let map = this.state.map;
          let aoiFootprintLayer;
          let tileFootprintLayer;

          map.getLayers().forEach((ele) => {
            console.log(ele)
            console.log(ele.get('name'))
            if (ele.get('name') === 'currentAoiFootprint')
              aoiFootprintLayer = ele
            else if (ele.get('name') === 'tileFootprint')
              tileFootprintLayer = ele
          });

          console.log(this.props.activeAOI)

          if (this.props.currentAoiWkt) {
            console.log('Trying to add AOI footprint ')
            var format = new WKT();
            var feature = format.readFeature(this.props.currentAoiWkt, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            });

            // TODO: In the future, try to update the existing layer source, instead of removing it
            if (aoiFootprintLayer) {
              console.log('aoi footprint layer exists, updating')
              aoiFootprintLayer.getSource().clear()
              aoiFootprintLayer.getSource().addFeature(feature)
            } else {
              console.log('aoi footprint does not exist, create')

              aoiFootprintLayer = new VectorLayer({
                source: new VectorSource({
                  features: [feature]
                }),
                name: 'currentAoiFootprint',
                style: aoi_style
              });

              map.addLayer(aoiFootprintLayer)
            }

            let extent = feature.getGeometry().getExtent()
            console.log(extent)
            aoiFootprintLayer.setZIndex(9999)

            this.state.map.getView().fit(extent, {duration: 1500})
          }
        }

        console.log(prevProps)
        console.log(this.props)

        if (prevProps.tiles.length === 0 && this.props.tiles.length !== 0)
          this.updateMap()

        if (prevProps.currentDate !== this.props.currentDate || prevProps.activeAOI !== this.props.activeAOI) {
          console.log('updating map....')
          this.updateMap()
          this.updateAllStyle()
        }
      }

      getStyle(feature, feature_type) {

        let style;
        console.log('getting STYLE')

        if (feature_type === 'tile') {
          style = new Style({
            stroke: new Stroke({
              color: '#aaa',
              width: 1
            }),
            fill: new Fill({
              color: 'rgba(0,0,0,0)'
            }),
            text: new Text({
              font: '11px Source Sans Pro, sans-serif',
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 2
              }),
              text: feature.get('name')
            })
          });
        } else if (feature_type === 'selected') {
          console.log('SELECTED STYLE')
          style = new Style({
            stroke: new Stroke({
              color: '#5f5',
              width: 2
            }),
            fill: new Fill({
              color: 'rgba(0,255,0,0)'
            }),
            text: new Text({
              font: '11px Source Sans Pro, sans-serif',
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 2
              })
            })
          });
        } else if (feature_type === 'highlight') {
          style = new Style({
            stroke: new Stroke({
              color: '#f55',
              width: 2
            }),
            fill: new Fill({
              color: 'rgba(255,0,0,0)'
            }),
            text: new Text({
              font: '11px Source Sans Pro, sans-serif',
              fill: new Fill({
                color: '#000'
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 2
              })
            })
          });
        }

        return style
      }

      updateMap() {
        let map = this.state.map;

        console.log('this is where we would iterate over tiles for the current active date')

        let features = []
        let promiseArray = [];
        console.log('props.tiles')
        console.log(this.props.tiles)

        for (let tile in this.props.tiles) {
          let format = new GeoJSON();
          const tile_copy = {...this.props.tiles[tile]}

          console.log('TILE:')
          console.log(tile_copy)

          let feature = format.readFeature(tile_copy, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });

          tile_copy['vector_feature'] = feature

          promiseArray.push(this.getMeta(tile_copy).catch((err) => {
            console.log('this image had an err, handling it first before sending back to overall catch func')
            console.log(err)
          }))
        }

        // console.log("promiseArray")
        // console.log(promiseArray)
        // let tileLayer

        // map.getLayers().forEach((layer) => {
        //   if (layer.get('name') === 'tileLayer')
        //     tileLayer = layer
        // })

        Promise.all(promiseArray).then((values) => {

            let tiles = []

            for (let val of values) {
                  console.log('DOES THIS RUN?!')
                  let img = val.img
                  let tile = val.tile
                  console.log(tile)

                  let feature = tile['vector_feature']
                  console.log(img);

                  console.log(tile)
                  let opacity = 0.90

                  console.log(tile.properties.lowres_preview_url)
                  console.log(img.width, img.height);

                  if (tile.properties.lowres_preview_url === imgNotFound) {
                    img = {
                      width: 221,
                      height: 210
                    }
                    opacity = 0.55
                  }

                  let imageExtent = feature.getGeometry().getExtent()
                    console.log(imageExtent);
                    console.log('TILE PROPERTIES')
                    console.log(tile.properties)

                    const s2image_layer = new ImageLayer({
                      source: new Static({
                          url: tile.properties.lowres_preview_url,
                          crossOrigin: '',
                          imageSize: [img.width, img.height],
                          projection: 'EPSG:' + tile.properties.proj,
                          imageExtent: imageExtent
                      }),
                      opacity,
                      name: "lowres__" + tile.properties.name
                  })
                  console.log('trying to add the image layer');
                  tile['raster'] = s2image_layer

                  tiles.push(tile)
                }

                console.log('need to remove existing image layers')
                let layersToRemove = []
                let tileLayer

                map.getLayers().forEach((layer) => {
                  console.log(layer)
                  let name = layer.get('name')
                  if (name) {
                    if (name.search('lowres') !== -1) {
                      console.log('have existing image to remove')
                      layersToRemove.push(layer)
                    }
                    if (name.search('tileLayer') !== -1) {
                      tileLayer = layer
                    }
                  }
                });

                layersToRemove.forEach((layer) => {
                  map.removeLayer(layer)
                })

                console.log(tileLayer)
                // TODO: In the future, try to update the existing layer source, instead of removing it
                if (tileLayer) {
                  let features = tiles.map((t) => t.vector_feature)
                  console.log(features)
                  console.log('tile layer exists, clearing and adding features')
                  tileLayer.getSource().clear()
                  tileLayer.getSource().addFeatures(features)
                } else {
                  console.log('tileLayer does not exist, create')

                  tileLayer = new VectorLayer({
                      source: new VectorSource({
                        features: []
                      }),
                      name: 'tileLayer'
                    });

                    tileLayer.setZIndex(100)
                    map.addLayer(tileLayer)
                }
                console.log('tiles: ')
                console.log(tiles)
                for (let t of tiles) {
                  console.log('adding raster to map')
                  map.addLayer(t.raster)
                  let vectorFeature = t['vector_feature']
                  vectorFeature.setStyle(this.getStyle(vectorFeature, 'tile'))
                  tileLayer.getSource().addFeature(vectorFeature)
                }

                this.setState({
                  tileLayer
                }, () => {
                  this.updateAllStyle()
                })


          }).catch((errors) => {
            console.log(errors)
            console.log('handle errors in catch function')
          });

        }

      updateStyle(features) {
        console.log('UPDATE STYLE')
        console.log(features)
        this.state.tileLayer.getSource().forEachFeature((feature) => {
          for (let feat of features) {
            if (feat === feature.getId()) {
              feature.setStyle(this.getStyle(feature, 'selected'))
              console.log(feat)
            }
            console.log(feat)
          }
          console.log(feature)
        })
      }

      updateAllStyle() {
        console.log('update all styles')
        console.log(this.props.tiles)
        this.props.tiles.forEach((tile) => {
          console.log('updating tile styles')
          console.log(tile)
          let feature;
          if (this.state.tileLayer) {
            console.log('getting feature')
            console.log(tile)
            console.log(tile.id)
            console.log(this.state.tileLayer.getSource().getFeatures())
            feature = this.state.tileLayer.getSource().getFeatureById(tile.id)
          }
          console.log('FEATURE:')
          console.log(feature)
          if (feature) {
            console.log('setting style')

            if (tile.selected) {
              feature.setStyle(this.getStyle(feature, 'selected'))
            } else {
              feature.setStyle(this.getStyle(feature, 'tile'))
            }
          }
        })
      }

      handleMapClick(event) {

        console.log(event)
        console.log('Mapped was clicked')
        console.log(this.state.featuresHovered)

        this.updateStyle(this.state.featuresHovered)
        console.log(this.state)
        this.props.tileSelected(this.state.featuresHovered)

        // // create WKT writer
        // var wktWriter = new WKT();

        // // derive map coordinate (references map from Wrapper Component state)
        // var clickedCoordinate = this.state.map.getCoordinateFromPixel(event.pixel);

        // // create Point geometry from clicked coordinate
        // var clickedPointGeom = new Point( clickedCoordinate );

        // // write Point geometry to WKT with wktWriter
        // var clickedPointWkt = wktWriter.writeGeometry( clickedPointGeom );

        // // place Flux Action call to notify Store map coordinate was clicked
        // Actions.setRoutingCoord( clickedPointWkt );

      }

    render () {
      return (
        <div id="mapViewer" className="mapViewer" ref={ (mapViewer) => this.mapViewer = mapViewer}>
          <div id="map" className="map" ref="map"></div>
        </div>
      );
    }
}