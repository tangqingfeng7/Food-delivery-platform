// 高德地图类型定义
declare namespace AMap {
  class Map {
    constructor(container: HTMLElement | string, opts?: MapOptions)
    getCenter(): LngLat
    setCenter(position: LngLat | [number, number]): void
    setZoom(zoom: number): void
    on(event: string, handler: (e: MapsEvent) => void): void
    destroy(): void
  }

  interface MapOptions {
    zoom?: number
    center?: [number, number] | LngLat
    viewMode?: '2D' | '3D'
    layers?: Layer[]
    features?: string[]
  }

  class LngLat {
    constructor(lng: number, lat: number)
    lng: number
    lat: number
    getLng(): number
    getLat(): number
    offset(w: number, s: number): LngLat
    distance(lnglat: LngLat | [number, number]): number
  }

  interface MapsEvent {
    lnglat: LngLat
    pixel: Pixel
    type: string
    target: any
  }

  class Pixel {
    constructor(x: number, y: number)
    getX(): number
    getY(): number
  }

  class Marker {
    constructor(opts?: MarkerOptions)
    setMap(map: Map | null): void
    setPosition(position: LngLat | [number, number]): void
    getPosition(): LngLat | null
    on(event: string, handler: () => void): void
    setContent(content: string | HTMLElement): void
    setIcon(icon: Icon | string): void
  }

  interface MarkerOptions {
    position?: LngLat | [number, number]
    offset?: Pixel
    icon?: Icon | string
    content?: string | HTMLElement
    topWhenClick?: boolean
    draggable?: boolean
    cursor?: string
    animation?: string
    clickable?: boolean
    zIndex?: number
  }

  class Icon {
    constructor(opts?: IconOptions)
  }

  interface IconOptions {
    size?: Size
    imageOffset?: Pixel
    image?: string
    imageSize?: Size
  }

  class Size {
    constructor(width: number, height: number)
    getWidth(): number
    getHeight(): number
  }

  interface Layer {}

  class Geocoder {
    constructor(opts?: GeocoderOptions)
    getLocation(address: string, callback: (status: string, result: GeocodeResult) => void): void
    getAddress(location: LngLat | [number, number], callback: (status: string, result: ReGeocodeResult) => void): void
  }

  interface GeocoderOptions {
    city?: string
    radius?: number
    batch?: boolean
    extensions?: 'base' | 'all'
  }

  namespace Geocoder {
    interface GeocodeResult {
      info: string
      geocodes: Geocode[]
    }

    interface Geocode {
      formattedAddress: string
      province: string
      city: string
      district: string
      location: LngLat
    }

    interface ReGeocodeResult {
      info: string
      regeocode: ReGeocode
    }

    interface ReGeocode {
      formattedAddress: string
      addressComponent: AddressComponent
      roads: Road[]
      crosses: Cross[]
      pois: Poi[]
    }

    interface AddressComponent {
      province: string
      city: string
      citycode: string
      district: string
      adcode: string
      township: string
      towncode: string
      neighborhood: string
      building: string
      streetNumber: StreetNumber
    }

    interface StreetNumber {
      street: string
      number: string
      location: LngLat
      direction: string
      distance: number
    }

    interface Road {
      name: string
      distance: number
      location: LngLat
      direction: string
    }

    interface Cross {
      distance: number
      direction: string
      location: LngLat
      first_id: string
      first_name: string
      second_id: string
      second_name: string
    }

    interface Poi {
      id: string
      name: string
      type: string
      tel: string
      address: string
      distance: number
      direction: string
      location: LngLat
    }
  }

  type GeocodeResult = Geocoder.GeocodeResult
  type ReGeocodeResult = Geocoder.ReGeocodeResult

  class PlaceSearch {
    constructor(opts?: PlaceSearchOptions)
    search(keyword: string, callback: (status: string, result: PlaceSearch.SearchResult | string) => void): void
    searchNearBy(keyword: string, center: LngLat | [number, number], radius: number, callback: (status: string, result: PlaceSearch.SearchResult | string) => void): void
  }

  interface PlaceSearchOptions {
    city?: string
    citylimit?: boolean
    pageSize?: number
    pageIndex?: number
    extensions?: 'base' | 'all'
  }

  namespace PlaceSearch {
    interface SearchResult {
      info: string
      poiList: PoiList
      pois: Poi[]
    }

    interface PoiList {
      pois: Poi[]
      pageIndex: number
      pageSize: number
      count: number
    }

    interface Poi {
      id: string
      name: string
      type: string
      location: LngLat
      address: string | string[]
      distance: number
      tel: string
    }
  }

  class Geolocation {
    constructor(opts?: GeolocationOptions)
    getCurrentPosition(callback: (status: string, result: Geolocation.GeolocationResult | Geolocation.ErrorResult) => void): void
    watchPosition(): number
    clearWatch(watchId: number): number
  }

  interface GeolocationOptions {
    enableHighAccuracy?: boolean
    timeout?: number
    noIpLocate?: number
    noGeoLocation?: number
    GeoLocationFirst?: boolean
    maximumAge?: number
    convert?: boolean
    showButton?: boolean
    buttonPosition?: string
    buttonOffset?: Pixel
    showMarker?: boolean
    showCircle?: boolean
    panToLocation?: boolean
    zoomToAccuracy?: boolean
    markerOptions?: MarkerOptions
    circleOptions?: CircleOptions
    extensions?: string
  }

  interface CircleOptions {
    strokeColor?: string
    strokeOpacity?: number
    strokeWeight?: number
    strokeStyle?: string
    strokeDasharray?: number[]
    fillColor?: string
    fillOpacity?: number
    zIndex?: number
  }

  namespace Geolocation {
    interface GeolocationResult {
      position: LngLat
      accuracy: number
      location_type: string
      message: string
      isConverted: boolean
      info: string
      addressComponent: Geocoder.AddressComponent
      formattedAddress: string
      pois: Geocoder.Poi[]
      roads: Geocoder.Road[]
      crosses: Geocoder.Cross[]
    }

    interface ErrorResult {
      info: string
      message: string
    }
  }
}
