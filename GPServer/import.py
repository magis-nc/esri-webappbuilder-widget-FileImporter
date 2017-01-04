import arcpy
import os

from convert_functions import *

EXTENSIONS = {
    "kml": treatKML,
    "kmz": treatKML,
    "dwg": treatCAD,
    "dxf": treatCAD,
    "csv": treatCSV,
    "txt": treatCSV,
    "json": treatJSON,
    # "geojson": treatGEOJSON, #TODO
    "gpx": treatGPX,
    "xls": treatXLS,
    "xlsx": treatXLS,
    "shp": treatSHP
}
output_index = 2

file = arcpy.GetParameterAsText(0)

crs_code = arcpy.GetParameter(1)
if not crs_code:
    crs_code = 3163
crs = arcpy.SpatialReference(crs_code)

extension = file.split(".")[-1].lower()

if extension == "shp":
    raise arcpy.ExecuteError(
        "A shapefile must be sent as zip with complementary files (shp, dbf, shx...)")

if extension == "zip":
    folder = file[:-4]
    unzipFile(file, folder)
    for (path, dirs, files) in os.walk(folder):
        for f in files:
            extension = f.split(".")[-1].lower()
            if extension in EXTENSIONS:
                file = os.path.join(path, f)
                break

if extension not in EXTENSIONS:
    msg = "The files with the {} extension are not managed".format(extension)
    raise arcpy.ExecuteError(msg)

outputs = EXTENSIONS[extension](file, crs)
for i, o in enumerate(outputs):
    if o:
        print i, o
        desc = arcpy.Describe(o)
        if not desc.spatialReference or desc.spatialReference.name == "Unknown":
            try:
                arcpy.DefineProjection_management(outputs[i], crs)
            except: pass

        arcpy.SetParameterAsText(output_index, o)

    output_index += 1



