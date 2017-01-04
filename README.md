**/!\ /!\ This is a beta version !!!!**

This FileImporter widget is made to load GIS files into the WebApp's map.

The widget can load files with a GPServer or on the client side.
The file can be selected with a file input or dropped in the widget.

Some specific symbology is made on the client side for CAD files (respecting autocad colors).


#Formats supported:
- CAD files (dxf/dwg) -> GPServer
- xls files (xls/xlsx) -> GPServer
- shape (as zip file) -> GPServer
- kml file (kml/kmz) -> GPServer. Can be client side for kml.
- formatted text (txt/csv) : client side or GPServer
- Esri json : client side (with support of symbology) or GPServer
- geojson : client side only
- gpx : GPServer or client side


#GPServer (Arcgis Server Geoprocessing Service):
The code is available in the GPServer repository.
You must publish this service and configure the url in the widget.

The GPServer take as input a single file and an optionnal spatial reference code.
If it's a zip file, the first supported file found in the zip is treated.

NB : the spatial reference code isn't used if the input dataset has his own sr.

The output is 4 featureSet (Points, Polylines, Polygons and Annotations).
Please note that you can replace this Geoprocessing Service by your own if you respect the input and output parameters.

#Client Side
Some formats can be treated on the client side.

There is a specific UI for formatted text import which allow the user to chose the X ann Y columns
and the input spatial reference.
The separator is automaticaly detected and the X and Y select are pre-filed if some fields' names are found.

## JavaScript Dependencies
- toGeoJSON (https://github.com/mapbox/togeojson) : this library is used to convert kml and gpx to geoJson
- proj4js (http://proj4js.org/) : use for reprojection in map spatial reference if needed


#Widget's configuration
- GPServer: url of the geoprocessing service used for server side treatment
- importTool: name of the GPServer tool. (default : import)
- async: is the GPServer asynchronous ?
- allowed_extensions: array of allowed files' extensions (/!\ Must be in lower case !)
- CAD: default symbology
- XY: options for formated text files
    - separators: array of separators for separator detection (/!\ The order matters !)
    - X : array of searched field's name for X coordinate (/!\ The order matters !)
    - Y : array of searched field's name for Y coordinate (/!\ The order matters !)
