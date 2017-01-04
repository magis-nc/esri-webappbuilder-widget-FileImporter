import arcpy
import os
import json
import shutil

POTENTIAL_GEOM_FIELDS = {
    "x": ["x", "point_x", "longitude", "long", "lon"],
    "y": ["y", "point_y", "latitude", "lat"]
}


def treatXLS(file, crs):
    arcpy.ExcelToTable_conversion(file, r"in_memory\input_table")
    points = _tableToPoints(r"in_memory\input_table", crs)
    return [points, None, None]


def treatKML(file, crs):
    if os.path.isdir(os.path.join(arcpy.env.scratchFolder, 'kml.gdb')):
        shutil.rmtree(os.path.join(arcpy.env.scratchFolder, 'kml.gdb'))
    arcpy.KMLToLayer_conversion(file, arcpy.env.scratchFolder, 'kml')
    # TODO : if folder in kml => dataset in the gdb => it doesn't work.
    return [
        os.path.join(arcpy.env.scratchFolder, 'kml.gdb', 'point'),
        os.path.join(arcpy.env.scratchFolder, 'kml.gdb', 'line'),
        os.path.join(arcpy.env.scratchFolder, 'kml.gdb', 'polygon')
    ]


def treatCAD(file, crs):
    return [
        file + r"\Point",
        file + r"\Polyline",
        file + r"\Polygon",
        file + r"\Annotation"
    ]


def treatJSON(file, crs):
    with open(file) as f:
        dico = json.load(f)

    base_points = dico
    base_points["features"] = []
    base_lines = base_polygons = base_points

    for f in dico["features"]:
        geom = f["geometry"]
        if geom["x"]:
            base_points["features"].append(f)
        elif geom["paths"]:
            base_lines["features"].append(f)
        elif geom["rings"]:
            base_polygons["features"].append(f)

    results = [None, None, None]
    if len(base_points["features"]) > 0:
        arcpy.JSONToFeatures_conversion(base_points, r"in_memory\Points")
        results[0] = r"in_memory\Points"
    if len(base_lines["features"]) > 0:
        arcpy.JSONToFeatures_conversion(base_lines, r"in_memory\Lines")
        results[1] = r"in_memory\Lines"
    if len(base_polygons["features"]) > 0:
        arcpy.JSONToFeatures_conversion(base_polygons, r"in_memory\Polygons")
        results[2] = r"in_memory\Polygons"

    return results


def treatGEOJSON(file, crs):
    with open(file) as f:
        geojson = json.load(f)
    #TODO

    return []


def treatCSV(file, crs):
    points = _tableToPoints(file, crs)
    return [points, None, None]


def treatGPX(file, crs):
    arcpy.GPXtoFeatures_conversion(file, r'in_memory\GPX_points')
    # TODO : Separate Waypoints, routes and tracks (generate lines for track's and routes' points)
    return [r'in_memory\GPX_points', None, None]


def treatSHP(file, crs):
    result = [None, None, None]

    desc = arcpy.Describe(file)
    if desc.shapeType == "Point":
        result[0] = file
    elif desc.shapeType == "Polyline":
        result[1] = file
    elif desc.shapeType == "Polygon":
        result[2] = file

    return result


def _detectGeometryField(input_table, type, numeric_fields=None):
    if not numeric_fields:
        allowed_types = ["double", "integer", "single", "smallinteger"]
        numeric_fields = [f.name for f in arcpy.ListFields(input_table) if f.type.lower() in allowed_types]

    potential_fields = POTENTIAL_GEOM_FIELDS[type]

    for name in potential_fields:
        if name.lower() in numeric_fields:
            return name

    for potential_field in potential_fields:
        for name in numeric_fields:
            if name.lower().startswith(potential_field):
                return name

    return None


def _tableToPoints(input_table, crs):
    allowed_types = ["double", "integer", "single", "smallinteger"]
    numeric_fields = [f.name for f in arcpy.ListFields(input_table) if f.type.lower() in allowed_types]

    x_field = _detectGeometryField(input_table, "x", numeric_fields)
    y_field = _detectGeometryField(input_table, "y", numeric_fields)

    if not (x_field and y_field):
        raise arcpy.ExecuteError("The table doesn't contain X and/or Y columns.")

    res = arcpy.MakeXYEventLayer_management(input_table, x_field, y_field, "xy_layer", spatial_reference=crs)
    return res.getOutput(0)


def unzipFile(filezip, pathdst=None):
    import zipfile

    if not pathdst:
        pathdst = filezip[-4:]
        os.mkdir(pathdst)

    zfile = zipfile.ZipFile(filezip, 'r')
    for i in zfile.namelist():
        print i
        if os.path.isdir(i):
            try:
                os.makedirs(pathdst + os.sep + i)
            except:
                pass
        else:
            try:
                os.makedirs(pathdst + os.sep + os.path.dirname(i))
            except:
                pass
            data = zfile.read(i)
            fp = open(pathdst + os.sep + i, "wb")
            fp.write(data)
            fp.close()
    zfile.close()
