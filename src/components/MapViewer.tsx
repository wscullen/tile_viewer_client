import './../assets/css/MapViewer.scss'

import React, { Component, createRef } from 'react'

import Map from 'ol/Map'
import View from 'ol/View'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import { Tile as TileLayer, Vector as VectorLayer, Layer } from 'ol/layer'
import ImageLayer from 'ol/layer/Image'
import { OSM, Vector as VectorSource, Vector } from 'ol/source'
import { fromLonLat } from 'ol/proj'
import Static from 'ol/source/ImageStatic'
import { DragBox, Select, defaults as InteractionDefaults } from 'ol/interaction'
import { platformModifierKeyOnly } from 'ol/events/condition'

import { Fill, Stroke, Style, Text } from 'ol/style'

import moment from 'moment'

import { Tile } from '../store/tile/types'

import Feature from 'ol/Feature'

//@ts-ignore may need to use require here instead
import imgNotFound from '../assets/img/notfound_v2.png'
import { FeatureCollection } from 'geojson'
import { MapBrowserEvent } from 'ol'
import { Pixel } from 'ol/pixel'

const middleCanada = [-97.02, 55.72]
const middleCanadaWebMercatorProj = fromLonLat(middleCanada)

interface AppProps {
  tiles: Array<Tile>
  tilesSelectedInList: string[]
  tileSelected: Function
  currentAoiWkt: string
  wrsOverlay: FeatureCollection
  activeAoi: string
  currentDate: string
  currentPlatform: string
  initializeMap: Boolean
}

interface AppState {
  currentInstance: any
  featuresHovered: any
  imageLayers: any
  map: Map
}

interface ImgObject {
  img: HTMLImageElement
  tile: Tile
}

interface ImageLayerDict<Generic> {
  [id: string]: Generic
}

export default class MapViewer extends Component<AppProps, AppState> {
  mapViewer = createRef<HTMLDivElement>()

  constructor(props: AppProps) {
    super(props)

    this.getMeta = this.getMeta.bind(this)

    this.state = {
      currentInstance: this,
      featuresHovered: [],
      imageLayers: {},
      map: undefined,
    }
  }

  componentDidMount() {
    console.log('Inside Map Viewer Component Did Mount -----------')
    var style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)',
      }),
      stroke: new Stroke({
        color: '#319FD3',
        width: 1,
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({
          color: '#000',
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3,
        }),
      }),
    })

    var raster = new TileLayer({
      source: new OSM(),
    })

    var featureOverlay = new VectorLayer({
      source: new VectorSource(),
      style: this.getStyle(undefined, 'highlight'),
    })

    featureOverlay.setZIndex(99999)
    featureOverlay.setProperties({
      name: 'hoverLayer',
    })

    const selectedInListOverlay = new VectorLayer({
      source: new VectorSource(),
    })

    selectedInListOverlay.setZIndex(88888)
    selectedInListOverlay.setProperties({
      name: 'selectedLayer',
    })

    var map = new Map({
      layers: [raster, featureOverlay, selectedInListOverlay],
      target: 'map',
      view: new View({
        center: middleCanadaWebMercatorProj,
        zoom: 3.5,
      }),
      interactions: InteractionDefaults({ doubleClickZoom: false }),
    })

    map.on('pointermove', (evt: MapBrowserEvent) => {
      if (evt.dragging) {
        return
      }
      console.log('POINTER MOVE EVENT')
      console.log(evt)
      let originalEvent: MouseEvent = evt.originalEvent as MouseEvent

      let pixel = map.getEventPixel(originalEvent)

      this.displayFeatureInfo(pixel, originalEvent.ctrlKey, originalEvent.shiftKey)
    })

    var dragBox = new DragBox({
      condition: platformModifierKeyOnly,
      onBoxEnd: () => console.log('dragging finished'),
    })

    map.addInteraction(dragBox)

    dragBox.on('boxend', () => {
      // features that intersect the box are added to the collection of
      // selected features
      const selectedFeatures: string[] = []
      var extent = dragBox.getGeometry().getExtent()
      let tileLayer: Layer = this.getLayer('tileLayer') || undefined

      console.log('dragbox START')
      console.log(tileLayer)
      if (tileLayer) {
        let tileLayerVectorSource: Vector = tileLayer.getSource() as Vector
        tileLayerVectorSource.forEachFeatureIntersectingExtent(extent, function(feature: Feature) {
          selectedFeatures.push(feature.getId() as string)
          console.log(feature)
        })

        console.log('dragbox selected features')
        this.props.tileSelected(selectedFeatures)
        console.log(selectedFeatures)
      }
    })

    map.on('click', this.handleMapClick.bind(this))
    console.log('map div height')

    // save map and layer references to local state
    this.setState(
      {
        map: map,
      },
      () => {
        if (this.props.activeAoi) {
          this.initMap()
          this.updateSelectedOverlay()
          this.updateAllStyle()
          this.updateMap()
        }
      },
    )
  }

  componentWillUnmount() {
    console.log('map viewer unmounting')
  }

  getLayer = (layerName: string) => {
    let searchLayer

    this.state.map.getLayers().forEach(layer => {
      const name = layer.get('name')
      if (name) {
        if (name.search(layerName) !== -1) {
          searchLayer = layer
        }
      }
    })
    return searchLayer
  }

  clearOverlay = () => {
    let hoverLayer: VectorLayer = undefined

    this.state.map.getLayers().forEach(layer => {
      const name = layer.get('name')
      if (name) {
        if (name.search('hoverLayer') !== -1) {
          hoverLayer = layer as VectorLayer
        }
      }
    })
    console.log(hoverLayer)

    if (hoverLayer) {
      hoverLayer.getSource().clear()
      return hoverLayer
    }
  }

  displayFeatureInfo(pixel: Pixel, ctrlKey: Boolean, shiftKey: Boolean) {
    const map = this.state.map
    console.log(ctrlKey)
    console.log(shiftKey)
    const featureOverlay = this.clearOverlay()
    map.forEachFeatureAtPixel(pixel, (feature: Feature, layer) => {
      console.log(layer)
      if (layer.get('name') === 'tileLayer' || layer.get('name') === 'wrsOverlay') {
        layer.setZIndex(100)
        const featureClone = feature.clone()
        if (layer.get('name') === 'tileLayer') {
          featureClone.setStyle(this.getStyle(featureClone, 'highlighted'))
        } else {
          featureClone.setStyle(this.getStyle(featureClone, 'wrsOverlay'))
        }
        featureClone.setId(feature.getId())
        featureOverlay.getSource().addFeature(featureClone)
        featureOverlay.setZIndex(999999)
      }
    })
  }

  async getMeta(tile: Tile): Promise<ImgObject> {
    console.log('fetching meta for image')
    console.log(tile)
    return new Promise((resolve, reject) => {
      console.log(tile)
      console.log('inside promise')
      const img = new Image()
      img.crossOrigin = 'Anonymous'

      img.onload = () => {
        console.log('is img onload callback ever run??!')
        console.log(img)
        tile.properties.currentPreviewUrl = tile.properties.lowresPreviewUrl
        const imgObject: ImgObject = {
          img,
          tile,
        }
        resolve(imgObject)
      }

      img.onerror = () => {
        console.log('problem loading image')
        tile.properties.currentPreviewUrl = imgNotFound
        const imgObject: ImgObject = {
          img,
          tile,
        }

        resolve(imgObject)
      }
      console.log(tile.properties.lowresPreviewUrl)
      img.src = tile.properties.lowresPreviewUrl
    })
  }

  // pass new features from props into the OpenLayers layer object
  componentDidUpdate(prevProps: AppProps, prevState: AppState) {
    // Programmatically set selected features NOT WORKING TODO: fix this
    console.log('inside component will update')

    console.log(prevProps.activeAoi)
    console.log(this.props.activeAoi)
    console.log('updating AOI info')

    if (this.props.activeAoi === null) {
      this.clearMap()
    }

    if (this.props.activeAoi !== null && prevProps.activeAoi !== this.props.activeAoi) {
      this.initMap()
    }

    if (prevProps.tiles !== this.props.tiles) {
      this.updateSelectedOverlay()
    }

    this.updateAllStyle()

    if (
      prevProps.currentDate !== this.props.currentDate ||
      prevProps.activeAoi !== this.props.activeAoi ||
      prevProps.currentPlatform !== this.props.currentPlatform
    ) {
      console.log('updating map....')
      this.updateMap()
    }
  }

  clearMap = () => {
    const map = this.state.map

    map.getLayers().forEach((ele: VectorLayer) => {
      console.log(ele)
      console.log(ele.get('name'))
      if (
        ele.get('name') === 'currentAoiFootprint' ||
        ele.get('name') === 'tileFootprint' ||
        ele.get('name') === 'wrsOverlay'
      ) {
        ele.getSource().clear()
      }
    })
  }

  initMap = () => {
    const aoi_style = new Style({
      stroke: new Stroke({
        color: '#e11',
        width: 2,
      }),
      fill: new Fill({
        color: 'rgba(0,0,0,0)',
      }),
    })

    function getOverlayStyle(feature: Feature) {
      const wrsOverlayStyle = new Style({
        stroke: new Stroke({
          color: 'rgba(100,100,220,0.2)',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
        text: new Text({
          font: '11px Calibri,sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 1,
          }),
          text: feature.get('name'),
        }),
      })
      return wrsOverlayStyle
    }
    const map = this.state.map
    let aoiFootprintLayer: VectorLayer
    let wrsOverlayLayer: VectorLayer
    let tileFootprintLayer: VectorLayer

    map.getLayers().forEach(ele => {
      console.log(ele)
      console.log(ele.get('name'))
      if (ele.get('name') === 'currentAoiFootprint') {
        aoiFootprintLayer = ele as VectorLayer
      } else if (ele.get('name') === 'tileFootprint') {
        tileFootprintLayer = ele as VectorLayer
      } else if (ele.get('name') === 'wrsOverlay') {
        wrsOverlayLayer = ele as VectorLayer
      }
    })

    console.log('Trying to add AOI footprint ')
    var format = new WKT()
    var feature = format.readFeature(this.props.currentAoiWkt, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })

    // TODO: In the future, try to update the existing layer source, instead of removing it
    if (aoiFootprintLayer) {
      console.log('aoi footprint layer exists, updating')
      aoiFootprintLayer.getSource().clear()
      aoiFootprintLayer.getSource().addFeature(feature)
    } else {
      console.log('aoi footprint does not exist, create')

      aoiFootprintLayer = new VectorLayer({
        source: new VectorSource({
          features: [feature],
        }),
        style: aoi_style,
      })

      aoiFootprintLayer.setProperties({
        name: 'currentAoiFootprint',
      })

      map.addLayer(aoiFootprintLayer)

      const extent = feature.getGeometry().getExtent()
      console.log(extent)
      aoiFootprintLayer.setZIndex(9999)

      this.state.map.getView().fit(extent, { duration: 1500 })
    }

    if (this.props.wrsOverlay) {
      console.log('Trying to add WRS overlay')
      const featureList = []

      for (const feature of this.props.wrsOverlay.features) {
        const geojsonFormat = new GeoJSON()
        const geojsonFeature = geojsonFormat.readFeature(feature, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        })
        featureList.push(geojsonFeature)
      }

      // TODO: In the future, try to update the existing layer source, instead of removing it
      if (wrsOverlayLayer) {
        console.log('wrs overlay layer exists, updating')
        wrsOverlayLayer.getSource().clear()
        for (const feature of featureList) {
          wrsOverlayLayer.getSource().addFeature(feature)
        }
      } else {
        console.log('wrs overlay does not exist, create')

        wrsOverlayLayer = new VectorLayer({
          source: new VectorSource({
            features: featureList,
          }),
          style: getOverlayStyle,
        })

        wrsOverlayLayer.setProperties({
          name: 'wrsOverlay',
        })

        map.addLayer(wrsOverlayLayer)
      }

      const extent = feature.getGeometry().getExtent()
      console.log(extent)
      aoiFootprintLayer.setZIndex(9999)
      wrsOverlayLayer.setZIndex(99999)

      this.state.map.getView().fit(extent, { duration: 1500 })
    }
  }

  updateSelectedOverlay = () => {
    console.log('updating list selection overlay')
    let selectedLayer: VectorLayer = this.getLayer('selectedLayer') || undefined
    console.log(selectedLayer)

    if (selectedLayer) {
      console.log(selectedLayer.getSource())
      selectedLayer.getSource().clear()

      // Iterate over current tiles
      // if current tile is in selectedTilesInList,
      // create a new feature and add it to the layer
      for (const tile of this.props.tiles) {
        const tileDate = moment(tile.date).format('YYYYMMDD')
        console.log('000--------------------------------000')
        console.log(tile)
        if (this.props.tilesSelectedInList.includes(tile.id) && this.props.currentDate === tileDate) {
          const format = new GeoJSON()

          const feature = format.readFeature(tile, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          })

          feature.setStyle(this.getStyle(feature, 'selected-in-list'))
          console.log('adding overlay feature to layer')
          selectedLayer.getSource().addFeature(feature)
        }
      }
    }
  }

  getStyle(feature: Feature, feature_type: string) {
    let style
    console.log('getting STYLE')

    if (feature_type === 'tile') {
      let tileIndex = feature.get('name').startsWith('LC08') ? 2 : 5
      style = new Style({
        stroke: new Stroke({
          color: 'rgba(230,34,99,0.5)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0,0,0,0)',
        }),
        text: new Text({
          font: '13px Source Sans Pro, sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
          text: feature.get('name').split('_')[tileIndex],
        }),
      })
    } else if (feature_type === 'selected-in-list') {
      console.log('SELECTED STYLE')
      style = new Style({
        stroke: new Stroke({
          color: '#0ff',
          width: 3,
        }),
        fill: new Fill({
          color: 'rgba(0,255,0,0)',
        }),
        text: new Text({
          font: '11px Source Sans Pro, sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    } else if (feature_type === 'selected') {
      console.log('SELECTED STYLE')
      let tileIndex = feature.get('name').startsWith('LC08') ? 2 : 5
      style = new Style({
        stroke: new Stroke({
          color: '#5f5',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(0,255,0,0)',
        }),
        text: new Text({
          font: '13px Source Sans Pro, sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
          text: feature.get('name').split('_')[tileIndex],
        }),
      })
    } else if (feature_type === 'highlight') {
      style = new Style({
        stroke: new Stroke({
          color: '#f55',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255,0,0,0)',
        }),
        text: new Text({
          font: '11px Source Sans Pro, sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    } else if (feature_type === 'wrsOverlay') {
      style = new Style({
        stroke: new Stroke({
          color: '#55f',
          width: 1,
        }),
        fill: new Fill({
          color: 'rgba(255,0,0,0)',
        }),
        text: new Text({
          font: '11px Source Sans Pro, sans-serif',
          fill: new Fill({
            color: '#000',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    }

    return style
  }

  updateMap() {
    const map = this.state.map

    console.log('this is where we would iterate over tiles for the current active date')

    const features = []
    const promiseArray = []
    console.log('props.tiles')
    console.log(this.props.tiles)

    for (const tile in this.props.tiles) {
      const format = new GeoJSON()
      const tile_copy: Tile = { ...this.props.tiles[tile] }

      console.log('TILE:')
      console.log(tile_copy)

      const feature = format.readFeature(tile_copy, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })

      tile_copy['vectorFeature'] = feature

      promiseArray.push(
        this.getMeta(tile_copy).catch(err => {
          console.log('this image had an err, handling it first before sending back to overall catch func')
          console.log(err)
        }),
      )
    }

    Promise.all(promiseArray)
      .then((values: ImgObject[]) => {
        const tiles = []

        for (const val of values) {
          console.log('DOES THIS RUN?!')
          let img = val.img
          const tile = val.tile
          console.log(tile)

          const feature = tile['vectorFeature']
          console.log(img)

          console.log(tile)
          let opacity = 0.9

          console.log(tile.properties.currentPreviewUrl)
          console.log(img.width, img.height)

          if (tile.properties.currentPreviewUrl === imgNotFound) {
            img.width = 221
            img.height = 210
            opacity = 0.55
          }

          const imageExtent = feature.getGeometry().getExtent()
          console.log(imageExtent)
          console.log('TILE PROPERTIES')
          console.log(tile.properties)

          const s2image_layer = new ImageLayer({
            source: new Static({
              url: tile.properties.currentPreviewUrl,
              crossOrigin: '',
              imageSize: [img.width, img.height],
              projection: 'EPSG:' + tile.properties.projection,
              imageExtent: imageExtent,
            }),
            opacity,
          })

          s2image_layer.set('name', 'lowresPreview__' + tile.properties.name)
          s2image_layer.set('id', tile.id)
          console.log('trying to add the image layer')
          tile['rasterFeature'] = s2image_layer

          tiles.push(tile)
        }

        console.log('need to remove existing image layers')
        const layersToRemove: Array<ImageLayer | VectorLayer> = []
        let tileLayer: VectorLayer

        map.getLayers().forEach(layer => {
          console.log(layer)
          const name = layer.get('name')
          if (name) {
            if (name.search('lowres') !== -1) {
              console.log('have existing image to remove')
              layersToRemove.push(layer as ImageLayer)
            }
            if (name.search('tileLayer') !== -1) {
              tileLayer = layer as VectorLayer
            }
          }
        })

        layersToRemove.forEach(layer => {
          map.removeLayer(layer)
        })

        console.log(tileLayer)
        // TODO: In the future, try to update the existing layer source, instead of removing it
        if (tileLayer) {
          const features = tiles.map(t => t.vectorFeature)
          console.log(features)
          console.log('tile layer exists, clearing and adding features')
          tileLayer.getSource().clear()
          tileLayer.getSource().addFeatures(features)
        } else {
          console.log('tileLayer does not exist, create')

          tileLayer = new VectorLayer({
            source: new VectorSource({
              features: [],
            }),
          })

          tileLayer.setProperties({
            name: 'tileLayer',
          })

          tileLayer.setZIndex(100)
          map.addLayer(tileLayer)
        }
        console.log('tiles: ')
        console.log(tiles)
        const imageLayers: ImageLayerDict<ImageLayer> = {}
        for (const t of tiles) {
          console.log('adding raster to map')
          console.log(t)
          if (!t.visible) {
            t.rasterFeature.setOpacity(0)
          }
          map.addLayer(t.rasterFeature)
          imageLayers[t.id] = t.rasterFeature
          const vectorFeature = t['vectorFeature']
          vectorFeature.setStyle(this.getStyle(vectorFeature, 'tile'))
          tileLayer.getSource().addFeature(vectorFeature)
        }
        this.updateAllStyle()
      })
      .catch(errors => {
        console.log(errors)
        console.log('handle errors in catch function')
      })
  }

  updateStyle(features: string[]) {
    console.log('UPDATE STYLE')
    console.log(features)
    let tileLayer: VectorLayer = this.getLayer('tileLayer')

    tileLayer.getSource().forEachFeature(feature => {
      for (const feat of features) {
        if (feat === feature.getId()) {
          feature.setStyle(this.getStyle(feature, 'selected'))
          console.log(feat)
        }
        console.log(feat)
      }
      console.log(feature)
    })
  }

  getImageLayers = () => {
    let imageLayers: ImageLayerDict<ImageLayer> = {}

    this.state.map.getLayers().forEach(layer => {
      const name = layer.get('name')
      console.log(name)
      if (name) {
        if (name.search('lowresPreview__') !== -1) {
          imageLayers[layer.get('id')] = layer as ImageLayer
        }
      }
    })

    console.log(imageLayers)
    return imageLayers
  }

  updateAllStyle() {
    console.log('update all styles')
    console.log(this.props.tiles)
    let tileLayer: VectorLayer = this.getLayer('tileLayer')
    console.log(tileLayer)

    console.log('fetching image layers')
    let imageLayers = this.getImageLayers()

    this.props.tiles.forEach(tile => {
      console.log('updating tile styles')
      console.log(tile)
      let feature

      if (tileLayer) {
        console.log('getting feature')
        console.log(tile)
        console.log(tile.id)
        console.log(tileLayer.getSource().getFeatures())
        feature = tileLayer.getSource().getFeatureById(tile.id)
      }
      console.log(this.state)

      if (imageLayers.hasOwnProperty(tile.id)) {
        if (!tile.visible) {
          imageLayers[tile.id].setOpacity(0.0)
        } else {
          imageLayers[tile.id].setOpacity(0.9)
        }
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

  handleMapClick(event: MapBrowserEvent) {
    console.log(event)
    console.log('Map was clicked')
    const pixel = this.state.map.getEventPixel(event.originalEvent)
    let selectedFeatures: string[] = []

    this.state.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
      console.log(layer.get('name'))
      if (layer.get('name') === 'tileLayer') {
        console.log('tileLayer clicked')
        console.log(feature.getId())
        selectedFeatures.push(feature.getId() as string)
      }
    })
    this.props.tileSelected(selectedFeatures)
  }

  render() {
    return (
      <div id="mapViewer" className="mapViewer" ref={this.mapViewer}>
        <div id="map" className="map" ref="map" onMouseLeave={this.clearOverlay} />
      </div>
    )
  }
}
