import './../assets/css/MainContainer.css'

import React, { Component } from 'react';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import WKT from 'ol/format/WKT.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';

export default class MainContainer extends Component {

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

          var vector = new VectorLayer({
            source: new VectorSource({
              features: [feature]
            })
          });

          var map = new Map({
            layers: [raster, vector],
            target: 'map',
            view: new View({
              center: [2952104.0199, -3277504.823],
              zoom: 4
            })
          });
        map.on('click', this.handleMapClick.bind(this));

        // save map and layer references to local state
        this.setState({
          map: map,
        //   featuresLayer: featuresLayer
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
      }

      handleMapClick(event) {

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
        <div className="container" ref="container">
        <h1>Main Container</h1>
        <div id='map' ref='map'></div>
        </div>
      );
    }
}