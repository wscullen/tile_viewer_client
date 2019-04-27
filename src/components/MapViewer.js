import './../assets/css/MapViewer.css'

import React, { Component } from 'react';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WKT from 'ol/format/WKT';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import ImageLayer from 'ol/layer/Image';
import {OSM, Vector as VectorSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';
import Static from 'ol/source/ImageStatic';
import Select from 'ol/interaction/Select';


import {Fill, Stroke, Style, Text} from 'ol/style';


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
      tiles: props.tiles,
      currentDate: props.dateBeingViewed,
      currentAOIName: props.AOIName,
      currentInstance: this
    };
   
  }

    componentDidMount() {

        var raster = new TileLayer({
            source: new OSM()
          });

          var wkt = 'POLYGON((10.689 -25.092, 34.595 ' +
              '-20.170, 38.814 -35.639, 13.502 ' +
              '-39.155, 10.689 -25.092))';

          var format = new WKT();

          var feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          });

          for (let tile of this.state.tiles) {
            console.log(tile);
          }

          var vector = new VectorLayer({
            source: new VectorSource({
              features: [feature]
            }),
            name: 'wkt_example'
          });

          var map = new Map({
            layers: [raster, vector],
            target: 'map',
            view: new View({
              center: middleCanadaWebMercatorProj,
              zoom: 3.5
            })
          });
        
          var selectSingleClick = new Select(
            {
              filter: (feature, layer) => {
                console.log('inside the filter function')
                console.log(layer)
                console.log(layer.get('name'))


                console.log(layer.get('name') !== 'currentAoiFootprint')
                if (layer.get('name') !== 'currentAoiFootprint')
                  return true
                
                return false
              },
              multi: true
            }
          );

          map.addInteraction(selectSingleClick);

          selectSingleClick.on('select', (e) => {
            console.log(e.target.getFeatures())
            
            let layersSelected = []
            let features = e.target.getFeatures()

            features.forEach((feature) => {
              let layer = e.target.getLayer(feature)
              layersSelected.push(layer)
            })

            console.log(layersSelected)
            let tileNames = []
            for (let layer of layersSelected) {
              tileNames.push(layer.get('tile_name'))
            }

            this.props.tileSelected(tileNames, e.target)


          });

        map.on('click', this.handleMapClick.bind(this));

        // save map and layer references to local state
        this.setState({
          map: map,
          activeAOI: this.props.activeAOI
        //   featuresLayer: featuresLayer
        });

      }

      // static getDerivedStateFromProps(props, state) {
      //   // console.log(props)
      //   // if (props.activeAOI) {
      //   //   let grouparray, groups = state.currentInstance.sortTilesByDate(props.activeAOI.raw_tile_list)

      //   //   console.log(grouparray)
      //   //   console.log(groups)
      //   // }

      

      //   // return {
      //   //   ...state
      //   //         }
   

      // }

      async getMeta(tile) {
        console.log('fetching meta for image')
        console.log(tile)
        return new Promise((resolve, reject) => {
            console.log(tile)
            console.log('inside promise')
            let img = new Image();
            img.crossOrigin = "Anonymous";

            img.onload = () => resolve({img, tile});
            img.onerror = reject;
            img.src = tile.lowres_preview_url;
        });
    }
  
      // pass new features from props into the OpenLayers layer object
      componentDidUpdate(prevProps, prevState) {
        // let featuresLayer = this.state.featuresLayer;
        // console.log(featuresLayer)
        // featuresLayer.setSource(
        //   new Vector({
        //     features: this.props.routes
        //   })
        // );
        // this.setState({
        //     featuresLayer
        // })

        let aoi_style = new Style({
          stroke: new Stroke({
            color: '#0f0',
            width: 1
          }),
          fill: new Fill({
            color: 'rgba(0,0,0,0)'
          }),
          // text: new Text({
          //   font: '11px Source Sans Pro, sans-serif',
          //   fill: new Fill({
          //     color: '#000'
          //   }),
          //   stroke: new Stroke({
          //     color: '#fff',
          //     width: 2
          //   }),
            // text: feature.get('tile_name')
          // })
        });
        console.log('inside component will update')
        console.log(prevProps.activeAOI)
        console.log(this.props.activeAOI)

        if (prevProps.activeAOI !== this.props.activeAOI) {

        let map = this.state.map;
        let existingLayer;
        map.getLayers().forEach((ele) => {
          console.log(ele)
          console.log(ele.get('name'))
          if (ele.get('name') === 'currentAoiFootprint')
            existingLayer = ele
        
        }
          )
          console.log(existingLayer)
        let layers = map.getLayers()
        console.log(layers)
        
        console.log(this.props.activeAOI)
        if (this.props.currentAoiWkt) {
          var format = new WKT();

            var feature = format.readFeature(this.props.currentAoiWkt, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            });
            
            // TODO: In the future, try to update the existing layer source, instead of removing it
            if (existingLayer) {
              map.removeLayer(existingLayer)
            } 

            var vector = new VectorLayer({
              source: new VectorSource({
                features: [feature]
              }),
              name: 'currentAoiFootprint',
              style: aoi_style
            });

            let extent = feature.getGeometry().getExtent()
            console.log(extent)
            vector.setZIndex(9999)
            this.state.map.addLayer(vector)
           
            this.state.map.getView().fit(extent, {duration: 1500})
            setTimeout(() => {
              this.state.map.getView().setZoom(6.5)
            }, 1500);
          }
        }

        if (this.props.tiles) {
          console.log('updating map....')
          this.updateMap()
        }
       
      
      }

      getStyle(feature, feature_type) {
        var highlightStyle = new Style({
          stroke: new Stroke({
            color: '#f00',
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
            text: feature.get('tile_name')
          })
        });

        return highlightStyle
      }
      
      updateMap() {
        let map = this.state.map;

        console.log('this is where we would iterate over tiles for the current active date')

       



        let layersToRemove = [];

        map.getLayers().forEach((ele) => {
          console.log(ele);
          console.log(ele.get('name'));
          if (ele.get('name') && ele.get('name').startsWith('tileLayer'))
            layersToRemove.push(ele);
        })

        map.getLayers().forEach((ele) => {
          console.log(ele);
          console.log(ele.get('name'));
          if (ele.get('name') && ele.get('name').startsWith('lowres'))
            layersToRemove.push(ele);
        })


        layersToRemove.map((ele) => map.removeLayer(ele))
        
        let tileDict = {};
        let promiseArray = [];

        for (let tile of this.props.tiles) {
          console.log(tile);
          console.log('HULLO');

          // date: Moment {_isAMomentObject: true, _i: 1527893298990, _isUTC: false, _pf: {…}, _locale: Locale, …}
          // lowres_preview_url: "https://ims.cr.usgs.gov/browse/s2/s2a/2018/06/01/L1C_T11UNS_A015368_20180601T184245.jpg"
          // name: "L1C_T11UNS_A015368_20180601T184245"
          // proj: "32611"
          // wkt: "POLYGON ((-117.00028 50.46380, -115.45356 50.4
          
          (tile => {
            var format = new WKT();
            var feature = format.readFeature(tile.wkt, {
              dataProjection: 'EPSG:4326',
              featureProjection: 'EPSG:3857'
            });

            var vector = new VectorLayer({
              source: new VectorSource({
                features: [feature]
              }),
              name: 'tileLayer__' + tile.name,
              tile_name: tile.name,
              
            });

            vector.setStyle(this.getStyle(vector, 'tile'))
            
            tileDict[tile.name] = {
              vector,
              feature,
            }

            promiseArray.push(this.getMeta(tile))


         
          })(tile);
        
        }


        Promise.all(promiseArray).then((values) => {
            for (let val of values) {
                let img = val.img
                let tile = val.tile
                let feature = tileDict[tile.name]['feature']
                console.log(img);
                console.log(img.width, img.height);
                let imageExtent = feature.getGeometry().getExtent()
                  console.log(imageExtent);
    
                  const s2image_layer = new ImageLayer({
                    source: new Static({
                        url: tile.lowres_preview_url,
                        crossOrigin: '',
                        imageSize: [img.width, img.height],
                        projection: 'EPSG:' + tile.proj,
                        imageExtent: imageExtent
                    }),
                    opacity: 0.90,
                    name: "lowres__" + tile.name
    
                })
                console.log('trying to add the image layer');
                tileDict[tile.name]['raster'] = s2image_layer
              }

                      // Add all raster layers
              for (let val of Object.values(tileDict))
                map.addLayer(val.raster)
              // Add all vector layers
              for (let val of Object.values(tileDict))
                map.addLayer(val.vector)
        });
        
      }



      handleMapClick(event) {

        console.log(event)
        console.log('Mapped was clicked')

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
        <div id="mapViewer" className="mapViewer" ref="mapViewer">
          <div id="map" className="map" ref="map"></div>
        </div>
      );
    }
}