var module_GeojsonConverter = (!wabVersion || wabVersion < 2.5) ? './GeojsonConverters' : 'jimu/GeojsonConverters';
define(
    [
        'dojo/_base/declare',
        'jimu/BaseWidget',
        'dojo/on',
        'dojo/_base/lang',
        'dojo/dom-construct',
        'esri/request',
        'esri/tasks/Geoprocessor',
        'esri/layers/FeatureLayer',
        'esri/layers/GraphicsLayer',
        'esri/graphic',
        'esri/InfoTemplate',
        'esri/graphicsUtils',
        'jimu/dijit/Message',
        'jimu/dijit/Popup',
        'esri/symbols/TextSymbol',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/PictureMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        module_GeojsonConverter,
		    'jimu/SpatialReference/utils',
        'libs/togeojson',
        'libs/proj4'
    ],
	function (declare, BaseWidget, on, lang, domConstruct, esriRequest, Geoprocessor,
	        FeatureLayer, GraphicsLayer, Graphic, InfoTemplate, graphicsUtils,
	        Message, Popup,
	        TextSymbol, SimpleMarkerSymbol, PictureMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, Color,
	        GeojsonConverters,
	        SRUtils, toGeoJSON, proj4js) {

	//To create a widget, you need to derive from BaseWidget.
	return declare([BaseWidget], {
		baseClass : 'jimu-widget-fileimporter',
		name : 'FileImporter',

        //table of autocad color codes (for dwg/dxf client symbology)
		_autocad_colors : {"0":[0,0,0],"1":[255,0,0],"2":[255,255,0],"3":[0,255,0],"4":[0,255,255],"5":[0,0,255],"6":[255,0,255],"7":[255,255,255],"8":[65,65,65],"9":[128,128,128],"10":[255,0,0],"11":[255,170,170],"12":[189,0,0],"13":[189,126,126],"14":[129,0,0],"15":[129,86,86],"16":[104,0,0],"17":[104,69,69],"18":[79,0,0],"19":[79,53,53],"20":[255,63,0],"21":[255,191,170],"22":[189,46,0],"23":[189,141,126],"24":[129,31,0],"25":[129,96,86],"26":[104,25,0],"27":[104,78,69],"28":[79,19,0],"29":[79,59,53],"30":[255,127,0],"31":[255,212,170],"32":[189,94,0],"33":[189,157,126],"34":[129,64,0],"35":[129,107,86],"36":[104,52,0],"37":[104,86,69],"38":[79,39,0],"39":[79,66,53],"40":[255,191,0],"41":[255,234,170],"42":[189,141,0],"43":[189,173,126],"44":[129,96,0],"45":[129,118,86],"46":[104,78,0],"47":[104,95,69],"48":[79,59,0],"49":[79,73,53],"50":[255,255,0],"51":[255,255,170],"52":[189,189,0],"53":[189,189,126],"54":[129,129,0],"55":[129,129,86],"56":[104,104,0],"57":[104,104,69],"58":[79,79,0],"59":[79,79,53],"60":[191,255,0],"61":[234,255,170],"62":[141,189,0],"63":[173,189,126],"64":[96,129,0],"65":[118,129,86],"66":[78,104,0],"67":[95,104,69],"68":[59,79,0],"69":[73,79,53],"70":[127,255,0],"71":[212,255,170],"72":[94,189,0],"73":[157,189,126],"74":[64,129,0],"75":[107,129,86],"76":[52,104,0],"77":[86,104,69],"78":[39,79,0],"79":[66,79,53],"80":[63,255,0],"81":[191,255,170],"82":[46,189,0],"83":[141,189,126],"84":[31,129,0],"85":[96,129,86],"86":[25,104,0],"87":[78,104,69],"88":[19,79,0],"89":[59,79,53],"90":[0,255,0],"91":[170,255,170],"92":[0,189,0],"93":[126,189,126],"94":[0,129,0],"95":[86,129,86],"96":[0,104,0],"97":[69,104,69],"98":[0,79,0],"99":[53,79,53],"100":[0,255,63],"101":[170,255,191],"102":[0,189,46],"103":[126,189,141],"104":[0,129,31],"105":[86,129,96],"106":[0,104,25],"107":[69,104,78],"108":[0,79,19],"109":[53,79,59],"110":[0,255,127],"111":[170,255,212],"112":[0,189,94],"113":[126,189,157],"114":[0,129,64],"115":[86,129,107],"116":[0,104,52],"117":[69,104,86],"118":[0,79,39],"119":[53,79,66],"120":[0,255,191],"121":[170,255,234],"122":[0,189,141],"123":[126,189,173],"124":[0,129,96],"125":[86,129,118],"126":[0,104,78],"127":[69,104,95],"128":[0,79,59],"129":[53,79,73],"130":[0,255,255],"131":[170,255,255],"132":[0,189,189],"133":[126,189,189],"134":[0,129,129],"135":[86,129,129],"136":[0,104,104],"137":[69,104,104],"138":[0,79,79],"139":[53,79,79],"140":[0,191,255],"141":[170,234,255],"142":[0,141,189],"143":[126,173,189],"144":[0,96,129],"145":[86,118,129],"146":[0,78,104],"147":[69,95,104],"148":[0,59,79],"149":[53,73,79],"150":[0,127,255],"151":[170,212,255],"152":[0,94,189],"153":[126,157,189],"154":[0,64,129],"155":[86,107,129],"156":[0,52,104],"157":[69,86,104],"158":[0,39,79],"159":[53,66,79],"160":[0,63,255],"161":[170,191,255],"162":[0,46,189],"163":[126,141,189],"164":[0,31,129],"165":[86,96,129],"166":[0,25,104],"167":[69,78,104],"168":[0,19,79],"169":[53,59,79],"170":[0,0,255],"171":[170,170,255],"172":[0,0,189],"173":[126,126,189],"174":[0,0,129],"175":[86,86,129],"176":[0,0,104],"177":[69,69,104],"178":[0,0,79],"179":[53,53,79],"180":[63,0,255],"181":[191,170,255],"182":[46,0,189],"183":[141,126,189],"184":[31,0,129],"185":[96,86,129],"186":[25,0,104],"187":[78,69,104],"188":[19,0,79],"189":[59,53,79],"190":[127,0,255],"191":[212,170,255],"192":[94,0,189],"193":[157,126,189],"194":[64,0,129],"195":[107,86,129],"196":[52,0,104],"197":[86,69,104],"198":[39,0,79],"199":[66,53,79],"200":[191,0,255],"201":[234,170,255],"202":[141,0,189],"203":[173,126,189],"204":[96,0,129],"205":[118,86,129],"206":[78,0,104],"207":[95,69,104],"208":[59,0,79],"209":[73,53,79],"210":[255,0,255],"211":[255,170,255],"212":[189,0,189],"213":[189,126,189],"214":[129,0,129],"215":[129,86,129],"216":[104,0,104],"217":[104,69,104],"218":[79,0,79],"219":[79,53,79],"220":[255,0,191],"221":[255,170,234],"222":[189,0,141],"223":[189,126,173],"224":[129,0,96],"225":[129,86,118],"226":[104,0,78],"227":[104,69,95],"228":[79,0,59],"229":[79,53,73],"230":[255,0,127],"231":[255,170,212],"232":[189,0,94],"233":[189,126,157],"234":[129,0,64],"235":[129,86,107],"236":[104,0,52],"237":[104,69,86],"238":[79,0,39],"239":[79,53,66],"240":[255,0,63],"241":[255,170,191],"242":[189,0,46],"243":[189,126,141],"244":[129,0,31],"245":[129,86,96],"246":[104,0,25],"247":[104,69,78],"248":[79,0,19],"249":[79,53,59],"250":[51,51,51],"251":[80,80,80],"252":[105,105,105],"253":[130,130,130],"254":[190,190,190],"255":[255,255,255]},

		_layers:{},
		_nb_treatments:0,

		startup : function () {
			this.inherited(arguments);

			//init drag & drop
			if (window.FileReader) {
				on(this.domNode, "dragover", lang.hitch(this, this.onFileDragOver));
				on(this.domNode, "dragenter", lang.hitch(this, this.onFileDragEnter));
				on(this.domNode, "dragleave", lang.hitch(this, this.onFileDragLeave));
				on(this.domNode, "drop", lang.hitch(this, this.onFileDrop));
			}

      //Hitch slots for upload and GPServer
			this.afterUploaded = lang.hitch(this, this.afterUploaded);
			this.onUploadError = lang.hitch(this, this.onUploadError);
			this.onGPResult = lang.hitch(this, this.onGPResult);
			this.onGPInfo = lang.hitch(this, this.onGPInfo);
			this.onGPError = lang.hitch(this, this.onGPError);
			this.onGPDataResult = lang.hitch(this, this.onGPDataResult);

      //hitch internal methods
			this.removeImport = lang.hitch(this, this.removeImport);
			this.zoomImport = lang.hitch(this, this.zoomImport);

      //hitch and define by extension symbol methods
      this.getDefaultSymbol = lang.hitch(this, this.getDefaultSymbol);
      this.getCADSymbol = lang.hitch(this, this.getCADSymbol);
      this.getGPXSymbol = lang.hitch(this, this.getGPXSymbol);
      this.getKMLSymbol = lang.hitch(this, this.getKMLSymbol);
			this._extensions_symbol_functions = {
          "dwg" : this.getCADSymbol,
          "dxf" : this.getCADSymbol,
          "gpx" : this.getGPXSymbol,
          "kml" : this.getKMLSymbol
      };

      //hitch and define client's side's imports method
      this.importJson = lang.hitch(this, this.importJson);
      this.importCSV = lang.hitch(this, this.importCSV);
      this.importGPXorKML = lang.hitch(this, this.importGPXorKML);
      this.importGeojson = lang.hitch(this, this.importGeojson);
      this._loadCSV = lang.hitch(this, this._loadCSV);
      this._onCsvUIChange = lang.hitch(this, this._onCsvUIChange);
      this._extensions_local_treatment = {
          "json" : this.importJson,
          "geojson" : this.importGeojson,
          "txt" : this.importCSV,
          "csv" : this.importCSV,
          "kml" : this.importGPXorKML,
          "gpx" : this.importGPXorKML
      };

      //Load formats icons
      for(var i=0,nb=this.config.allowed_extensions.length;i<nb;i++){
        var ext = this.config.allowed_extensions[i];
        this.formats.innerHTML += '<img src="'+this.folderUrl+'/images/formats/'+ext+'.png" title="'+ext.toUpperCase()+'"/>';
//        this.formats2.innerHTML += '<img src="'+this.folderUrl+'/images/formats/'+ext+'.png" title="'+ext.toUpperCase()+'"/>';
      }

      //Load projection ressources
      this._spatialReferences = {};
      SRUtils.loadResource().then(lang.hitch(this, function(){
          var map_wkid = this.map.spatialReference.wkid;
          for(var i =0, nb=this.config.allowed_input_spatialReferences.length;i<nb;i++){
              var wkid = this.config.allowed_input_spatialReferences[i];

              if(wkid==map_wkid) continue;
              if(!SRUtils.isValidWkid(wkid)) continue;

              this._spatialReferences[wkid] = {
                  "wkt" : SRUtils.getCSStr(wkid).split("'").join('"'),
                  "label" : SRUtils.getSRLabel(wkid)
              };
          }
      }));

		},

    showFormats:function(){

      new Message({
        message: this.formats.innerHTML
      });
    },

		loadFile : function (evt) {
			var form = false;
			if(evt && evt.type == "change"){
                var file = this.inputFile.files[0];
                var form = this.inputForm;
			}
			else if(evt && evt.files && evt.files[0]){
			    var form = new FormData();
			    var file =  evt.files[0];
                form.append('file', evt.files[0]);
			}
			if(!form)
			    return false;

			this._current_filename = file.name;
			this._current_file_extension = file.name.split(".").slice(-1)[0].toLowerCase();

			if(this.config.allowed_extensions && this.config.allowed_extensions.indexOf(this._current_file_extension) == -1){
			    this.message("Le format du fichier "+ file.name + " n'est pas supporté par le widget.", "error");
			    return;
			}

			// Local treatement ? (instead of GPServer)
			if(FileReader && this._extensions_local_treatment[this._current_file_extension]){
			    this._nb_treatments += 1;
          var reader = new FileReader();
          reader.onload = this._extensions_local_treatment[this._current_file_extension];
          this.loading("Traitement du fichier...");
          reader.readAsText(file);
			    return;
			}

      //server treatment
			var msg = "Envoi du fichier " + file.name + " sur le serveur."
			this.loading(msg);
			this._request(form, 'uploads/upload', this.afterUploaded, this.onUploadError);
		},

		message:function(msg, type){
		    if(!type) type= "info";
		    var content = '<div class="'+type+'">' + msg + '</div>';
		    new Message({"message":content});
		},

    afterUploaded:function(response){
        this._nb_treatments += 1;

        this.loading("Traitement du fichier.");
        var itemID= response["item"].itemID;
        var params= { "file": "{'itemID':" + itemID + "}" };
        this.gpTask = new Geoprocessor(this.config.GPServer + "/" + this.config.importTool);
        this.gpTask.setOutSpatialReference(this.map.spatialReference);
        if(this.config.async){
            this.gpTask.submitJob(params, this.onGPResult, this.onGPInfo);
        }
        else{
            this.gpTask.execute(params, this.onGPResult, this.onGPError);
        }
    },

    onGPInfo:function(response){
        this._currentJob = response.jobId;
        if(!response.messages || response.messages.length == 0) return;
        var msg = response.messages.slice(-1)[0];
        this.loading(msg.description,response.jobStatus);
    },

    onGPError:function(error){
        this.message("Une erreur s'est produite lors du traitement du fichier "+ this._current_filename + ".", "error");
    },

    _createResultLi:function(loading_state){
        var id = 'import'+this._nb_treatments;
        this._layers[id] = {};

        if(loading_state){
          var images = '<img id="'+id+'__loading" class="loading" src="'+this.folderUrl+'/images/loading.gif" />'
            + '<img id="'+id+'__remove" class="cancel" src="'+this.folderUrl+'/images/clear.png" style="display:none;" />'
            + '<img id="'+id+'__zoom" class="zoom" src="'+this.folderUrl+'/images/zoom.png" style="display:none;" />';
        }
        else{
          var images = '<img id="'+id+'__remove" class="cancel" src="'+this.folderUrl+'/images/clear.png" />'
            + '<img id="'+id+'__zoom" class="zoom" src="'+this.folderUrl+'/images/zoom.png" />';
        }

        var html = this._current_filename
            + images
            + '<ul id="'+id+'__ul"></ul>';
        var li = domConstruct.create(
            "li",
            {
                id : id,
                innerHTML : html
            },
            this.resultList,
            "first"
        );
        on(document.getElementById(id+'__remove'), "click", this.removeImport);
        on(document.getElementById(id+'__zoom'), "click", this.zoomImport);
    },

    onGPResult:function(response){
        this.loading(false);
        this._currentJob = false;

        switch(response.jobStatus){
            case "esriJobFailed":
                this.onGPError();
                break;
            case "esriJobSucceeded":
                this._createResultLi(this.config.async);

                if(this.config.async){
                    this._results = {}
                    for(var name in response.results){
                      this.gpTask.getResultData(response.jobId, name, this.onGPDataResult);
                      this._results[name] = false;
                    }
                }
                else{
                    this._results = false;
                    for(var i=0,nb=response.results.length;i<nb;i++){
                        this.onGPDataResult(response.results[i]);
                    }
                }

                break;
        }
    },

    onGPDataResult:function(result){
        var name = result.paramName;
        var featureSet = result.value;
        if(!featureSet || !featureSet.features)
            return;

        if(!featureSet.spatialReference.wkid && this.map.spatialReference.wkid)
            featureSet.spatialReference.wkid = this.map.spatialReference.wkid;

        var exceededTransferLimit = featureSet.exceededTransferLimit;

        var id_import =  'import'+this._nb_treatments;
        var id = id_import + "_" + name;

        if(featureSet.features.length == 0)
            return;

        var layerDefinition = {
        "geometryType": featureSet.geometryType,
        "fields": featureSet.fields
          };

          var featureCollection = {
            layerDefinition: layerDefinition,
            featureSet: featureSet
          };
          var options = {
            objectIdField:"FID",
            infoTemplate: new InfoTemplate(/*{title:this._current_filename + " " + name}*/),
            id:id,
            name:this._current_filename + " " + name
          };

        if(name=="output_annotations")
            options["showLabels"] = true;

        var layer = new FeatureLayer(featureCollection, options);

        this._registerLayer(layer, name);

        if(this._results){
          this._results[name] = true;
          for(var name in this._results)
            if(!this._results[name]) return;

          document.getElementById(this._nb_treatments+"_loading").style.display = 'none';
          document.getElementById(this._nb_treatments+"_cancel").style.display = 'block';
          document.getElementById(this._nb_treatments+"_zoom").style.display = 'block';

          this._results = false;

        }
    },

    _registerLayer:function(layer, name){
         var id_import =  'import'+this._nb_treatments;
         var id = (name) ? id_import + "_" + name : id_import;
         this._layers[id_import][id] = layer;
          if(name)
            this._layers[id_import][id].name = this._current_filename + " " + name;
          else
            this._layers[id_import][id].name = this._current_filename;
          this.setSymbols(this._layers[id_import][id]);
          this.map.addLayer(this._layers[id_import][id]);

          if(!name)
            return;
          var ul = document.getElementById(id_import+'__ul');
          ul.innerHTML += '<li>'+name+'</li>';
          this.zoomImport({id:id_import});
    },

    removeImport:function(evt){
        if(evt && evt.preventDefault)
            evt.preventDefault();
        var id = (evt.id) ? evt.id.split("__")[0]: evt.target.id.split("__")[0];
        if(this._layers[id]){
            for(var layer_id in this._layers[id])
                this.map.removeLayer(this._layers[id][layer_id]);
            delete this._layers[id];
        }
        var li = document.getElementById(id);
        if(li) li.parentNode.removeChild(li);
    },

    zoomImport:function(evt){
        if(evt && evt.preventDefault)
            evt.preventDefault();
        var id = (evt.id) ? evt.id.split("__")[0]: evt.target.id.split("__")[0];
        if(!this._layers[id])
            return;

        var graphics = [];
        for(var layer_id in this._layers[id])
            for(var g=0,nb_g=this._layers[id][layer_id].graphics.length;g<nb_g;g++)
                graphics.push(this._layers[id][layer_id].graphics[g]);

        var ext = graphicsUtils.graphicsExtent(graphics);
        this.map.setExtent(ext, true);
    },

    setSymbols:function(layer){
        var func = (this._extensions_symbol_functions[this._current_file_extension])
            ? this._extensions_symbol_functions[this._current_file_extension]
            : this.getDefaultSymbol;

        var type = layer.geometryType;

        for(var i=0,nb=layer.graphics.length;i<nb;i++){
            var g = layer.graphics[i];
            if(g.symbol) continue;
            var symbol = func(g, type);
            if(!symbol)
                symbol = this.getDefaultSymbol(g, type);
            g.setSymbol(symbol);
        }
    },

    getDefaultSymbol:function(graphic, geomType){
        if(geomType){
            switch(geomType){
                case "esriGeometryPoint":
                    return new SimpleMarkerSymbol();
                case "esriGeometryPolyline":
                    return new SimpleLineSymbol();
                case "esriGeometryPolygon":
                    return new SimpleFillSymbol();
            }
        }
        switch(graphic.geometry.type){
            case "point":
                return new SimpleMarkerSymbol();
            case "polyline":
                return new SimpleLineSymbol();
            case "polygon":
                return new SimpleFillSymbol();
            case "extent":
                return new SimpleFillSymbol();
        }

        return false;
    },

    _CAD_LineWt2Width:function(LineWt){
        return 0.1 + LineWt * 0.029;
    },
    getCADSymbol:function(graphic, geomType){
        var color = (graphic.attributes["Color"]) ? this._autocad_colors[graphic.attributes["Color"]] : null;
        if(color) color.push(255);

        switch(geomType){
            case "esriGeometryPoint":
                // If annotation
                if(graphic.attributes["Text"]!==undefined){
                    if(!graphic.attributes["Text"])
                        return false;
                    var symbol_json = this.config.CAD.txt_symbol;
                    symbol_json["text"] = graphic.attributes["Text"];
                    if(color)
                        symbol_json["color"] = color;
                    return new TextSymbol(symbol_json);
                }
                var symbol_json = this.config.CAD.point_symbol;
                 if(color){
                    symbol_json["outline"]["color"] = color;
                    color[3] = 128;
                    symbol_json["color"] = color;
                 }
                return new SimpleMarkerSymbol(symbol_json);

            case "esriGeometryPolyline":
                var symbol_json = this.config.CAD.line_symbol;
                 if(color){
                    symbol_json["color"] = color;
                 }
                 if(graphic.attributes["LineWt"])
                        symbol_json["width"] = this._CAD_LineWt2Width(graphic.attributes["LineWt"]);
                 // @TODO : symbol type en fonction cas connus de Linetype
                return new SimpleLineSymbol(symbol_json);

            case "esriGeometryPolygon":
                var symbol_json = this.config.CAD.polygon_symbol;
                 if(color){
                    symbol_json["outline"]["color"] = color;
                    color[3] = 38;
                    symbol_json["color"] = color;
                 }
                 if(graphic.attributes["LineWt"])
                    symbol_json["outline"]["width"] = this._CAD_LineWt2Width(graphic.attributes["LineWt"]);

                return new SimpleFillSymbol(symbol_json);
        }
        return null;
    },

    getGPXSymbol:function(graphic, geomType){
        if(graphic.geometry.type == "point")
            return new SimpleMarkerSymbol(this.config.GPX.wpt_symbol);

        if(graphic.geometry.type == "polyline"){
            if(graphic.attributes.cmt)
                return new SimpleLineSymbol(this.config.GPX.rte_symbol);
            else
                return new SimpleLineSymbol(this.config.GPX.trk_symbol);
        }
        return false;
    },

    getKMLSymbol:function(graphic, geomType){
        if(graphic.geometry.type == "point"){
          //if simple url icon in source kml
          if(graphic.attributes["styleUrl"] && this._kmlIconStyles[graphic.attributes["styleUrl"]]){
            return new PictureMarkerSymbol(this._kmlIconStyles[graphic.attributes["styleUrl"]], 30, 30);
          }

          //Default symbol
          return new SimpleMarkerSymbol(this.config.KML.pt_symbol);
        }


        var color = (graphic.attributes.stroke) ? graphic.attributes.stroke : "#6833ad";
        if(graphic.attributes["stroke-opacity"]){
            color = new Color(color).toRgba();
            color[3] = graphic.attributes["stroke-opacity"];
        }
        var line_width = (graphic.attributes["stroke-width"]) ? graphic.attributes["stroke-width"] : 1;

        var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(color), line_width);
        if(graphic.geometry.type == "polyline")
            return lineSymbol;

        var color = (graphic.attributes.fill) ? graphic.attributes.fill : "#6833ad";
        if(graphic.attributes["fill-opacity"]){
            color = new Color(color).toRgba();
            color[3] = graphic.attributes["fill-opacity"];
        }
        return new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol, new Color(color));
    },

    onUploadError:function(response){
        this.message("Le fichier n'a pas pu être chargé sur le serveur.");
        this.loading(false);
    },

		_request:function(form, action, successHandler, errorHandler){
		    esriRequest({
          url: this.config.GPServer + "/" + action,
          form: form,
          content: { f: "json" },
          handleAs: "json"
        })
        .then(successHandler, errorHandler)
        .otherwise(errorHandler);
		},

		setInDragAndDrop:function(boolean){
		  this.workZone.style.display = (boolean) ? 'none' : 'block';
			this.dropZone.style.display = (!boolean) ? 'none' : 'block';
		},

		onFileDragOver:function(e){
		    e.stopPropagation();
			  e.preventDefault();
			  e.dataTransfer.dropEffect = 'copy';
		},

		onFileDragEnter : function (e) {
		  e.stopPropagation();
			e.preventDefault();
			this.setInDragAndDrop(true);
		},

		onFileDragLeave : function (e) {
			this.setInDragAndDrop(false);
		},

    cancel:function(evt){
        if(evt && evt.preventDefault)
            evt.preventDefault();

        if(this._currentJob){
            this.gpTask.cancelJob(this._currentJob);
            this._currentJob = false;
        }

        this.loading(false);
    },

    onFileDrop : function (e) {
			e.stopPropagation();
			e.preventDefault();
			this.setInDragAndDrop(false);

			if (!e.dataTransfer.files[0])
				return;

			this.loadFile(e.dataTransfer);
            return;

			var reader = new FileReader();
			reader.onload = this.loadFile;
			var content = reader.readAsBinaryString(files[0]);
		},

    loading:function(message, type){
        if(message===false){
            this.loadingSection.style.display = 'none';
            this.importSection.style.display = 'block';
            return;
        }
        if(!type)
            type = 'esriJobMessageTypeInformative';
        this.loadingMessage.innerHTML = message;

        this.loadingSection.style.display = 'block';
        this.importSection.style.display = 'none';
    },

    _CSV_getOptions:function(fields, potential_fields){
        var field_options = '';
        for(var i=0,nb=fields.length;i<nb;i++){
            var f = fields[i];
            if(potential_fields.indexOf(f.toLowerCase()) != -1)
                field_options += '<option selected="selected">'+f+'</option>';
            else
                field_options += '<option>'+f+'</option>';
        }
        return field_options;
    },

    _SRs_getOptions: function(){
        var wkid = this.map.spatialReference.wkid;
        var options = '<option value="'+wkid+'">Projection de la carte ('+SRUtils.getSRLabel(wkid)+')</option>';
        for(var wkid in this._spatialReferences){
            options += '<option value="'+wkid+'">'+this._spatialReferences[wkid]["label"]+'</option>';
        }
        return options;
    },

    importCSV:function(event){
        this.loading("Analyse du fichier.");
		    var content = event.target.result
		        .replace("\r\n", "\n")
		        .replace("\n\r", "\n")
		        .replace("\r", "\n");

		    var lines = content.split("\n");
		    if(!lines[0]){
                this.error("Ce fichier a une première ligne vide :" + this._current_filename);
            }


            var separator = false;
            for(var i=0,nb=this.config.XY.separators.length;i<nb;i++){
                var values = lines[0].split(this.config.XY.separators[i]);
                if(values.length > 1){
                    separator = this.config.XY.separators[i];
                    break;
                }
            }
            if(!separator){
                this.error("Aucun séparateur n'a pu être détecté dans le fichier " + this._current_filename);
            }
            var fields = lines[0].split(separator);

            var html = '<div class="fileimporter-xy-columns">'
                + 'X : <select id="file_xy_columnx">' + this._CSV_getOptions(fields, this.config.XY.X) + '</select>'
                + '<span id="file_xy_columnx_sample" class="fileimporter-coord-view"></span>'
                + '<br />Y : <select id="file_xy_columny">' + this._CSV_getOptions(fields, this.config.XY.Y) + '</select>'
                + '<span id="file_xy_columny_sample" class="fileimporter-coord-view"></span>'
                + '<br /><br />Référence spatiale : <select style="width:100%;" id="file_xy_sr">' + this._SRs_getOptions() + '</select>'
                + '<p id="file_xy_msg" style="display:none;"></p>'
                + '</div>'

            /*
            html += '<table class="fileimporter-xy-sample"><tr>';
            for(var i=0,nb=fields.length;i<nb;i++){
                html += '<th>' + fields[i] + '</th>';
            }
            html += '</tr>';
            for(var i=1,nb=lines.length;i<nb && i<4;i++){
                var values = lines[i].split(separator);
                html += '<tr>';
                for(var k=0,nb_values=values.length;k<nb_values;k++)
                   html += '<td>' + values[k] + '</td>';
                html += '</tr>';
            }
            html += '</table>';
            */

            var confirm = new Popup({
                titleLabel: "Chargement de fichier XY : " + this._current_filename,
                autoHeight:true,
                width:400,
                content : html,
                closable:false,
                /*onClose:this._cancelLoadCSV,*/
                buttons:[
                    {
                        label:"Charger",
                        onClick:this._loadCSV
                    },{
                        label:"Annuler"
                    }
                ]
            });

            this._current_xy_file = {
                "lines" : lines,
                "separator" : separator,
                "fields":fields,
                "confirmDialog":confirm
            };
            this.loading(false);

            on(document.getElementById("file_xy_columnx"), "change", this._onCsvUIChange);
            on(document.getElementById("file_xy_columny"), "change", this._onCsvUIChange);
            on(document.getElementById("file_xy_sr"), "change", this._onCsvUIChange);
            this._onCsvUIChange();
        },

        _CSVLine2Graphic:function(values, fields, index_x, index_y, proj4JsConverter){
            var coords = proj4JsConverter.forward([parseFloat(values[index_x]), parseFloat(values[index_y])]);

            var g_json = {
                "attributes" : {},
                "geometry" : {
                    "x":coords[0],
                    "y":coords[1],
                    "spatialReference":{wkid:this.map.spatialReference.wkid}
                }
            };
            for(var i=0,nb=fields.length;i<nb;i++){
                g_json["attributes"][fields[i]] = values[i] || null;
            }
            return new Graphic(g_json)
        },

        _onCsvUIChange:function(){
            var errors = [];

            var col_x = document.getElementById("file_xy_columnx").value;
            var col_y = document.getElementById("file_xy_columny").value;
            var wkid = document.getElementById("file_xy_sr").value;

            //X coord
            var index = this._current_xy_file["fields"].indexOf(col_x);
            var x = this._current_xy_file["lines"][1].split(this._current_xy_file["separator"])[index];
            document.getElementById("file_xy_columnx_sample").innerHTML = x;
            if(isNaN(x) && isNaN(x.replace(",",".")))
                errors.push(col_x + " ne contient pas de valeurs numériques.");

            //Y coord
            var index = this._current_xy_file["fields"].indexOf(col_y);
            var y = this._current_xy_file["lines"][1].split(this._current_xy_file["separator"])[index];
            document.getElementById("file_xy_columny_sample").innerHTML = y;
            if(isNaN(y) && isNaN(y.replace(",",".")))
                errors.push(col_x + " ne contient pas de valeurs numériques.");

            if(col_x == col_y)
                errors.push("Vous avez selectionné le même champs comme X et comme Y.");

            //SR && geographic
            if(SRUtils.isGeographicCS(wkid)){
                x = parseFloat(x);
                y = parseFloat(y);
                if(x < -180 || x > 180 || y < -90 || y > 90)
                    errors.push("Les valeurs x et y sont incompatibles avec un système de coordonnées géographique.");
            }

            if(errors.length ==0){
                document.getElementById("file_xy_msg").style.display = 'none';
                this._current_xy_file["confirmDialog"].enableButton(0);
            }
            else{
                document.getElementById("file_xy_msg").style.display = 'block';
                document.getElementById("file_xy_msg").innerHTML = errors.join("<br />");
                this._current_xy_file["confirmDialog"].disableButton(0);
            }
        },

        _loadCSV:function(){
            this.loading("Traitement du fichier " + this._current_filename);
            var x_field = document.getElementById("file_xy_columnx").value;
            var y_field = document.getElementById("file_xy_columny").value;
            var src_wkid = document.getElementById("file_xy_sr").value;

            this._createResultLi();

            var layer = new GraphicsLayer({
                id:'import'+this._nb_treatments,
                infoTemplate:new InfoTemplate(/*{title:this._current_filename}*/),
                spatialReference:this.map.spatialReference
            });
            layer.name = this._current_filename;

            var index_x = this._current_xy_file.fields.indexOf(x_field);
            var index_y = this._current_xy_file.fields.indexOf(y_field);

                var converter = this._getProj4Converter(src_wkid);
            for(var i=1, nb=this._current_xy_file.lines.length;i<nb;i++){
                var line = this._current_xy_file.lines[i];
                if(!line.trim()) continue;
                var values = line.split(this._current_xy_file.separator);
                var g = this._CSVLine2Graphic(values, this._current_xy_file.fields, index_x, index_y, converter);
                if(g) layer.add(g);
            }
            this._registerLayer(layer);

		        this.loading(false);

            this._current_xy_file.confirmDialog.close();
		        this._current_xy_file = false;
        },

		importJson:function(event){
		    var content = event.target.result;
		    try{
		        var featureSet = JSON.parse(content);
		    }
		    catch(err){
		        this.message("Le fichier en entrée n'est pas un fichier json ESRI valide.");
		        this.loading(false);
		    }

            this._createResultLi();
		    var id_import =  'import'+this._nb_treatments;
            var id = id_import + "_Contenu";

		    var layer = new GraphicsLayer({
		        id:id,
		        infoTemplate:new InfoTemplate(/*{title:this._current_filename}*/),
		        spatialReference:featureSet.spatialReference || this.map.spatialReference
		    });
		    layer.name = this._current_filename;

            var sameSr = (!featureSet.spatialReference || featureSet.spatialReference.wkid == this.map.spatialReference.wkid);
		    for(var i=0,nb=featureSet.features.length;i<nb;i++){
		        var feat = featureSet.features[i];
		        if(!sameSr){
                    feat["geometry"] = this.projectGeometry(feat["geometry"], featureSet.spatialReference.wkid);
		        }
		        layer.add(new Graphic(feat));
		    }

		    this._registerLayer(layer);

		     //@TODO : gérer feature collection
		     this.loading(false);
		},

		importGPXorKML:function(event){
		    var content = event.target.result;

		    try{
		        var dom = (new DOMParser()).parseFromString(content, 'text/xml');
		    }
		    catch(err){
		        this.message("Le fichier en entrée n'est pas un fichier "+this._current_file_extension+" valide.");
		        this.loading(false);
		    }
        this._createResultLi();

		    if(this._current_file_extension == "gpx")
		        var geojson = toGeoJSON.gpx(dom);
		    else{
		      this.registerKmlStyles(dom);
		      var geojson = toGeoJSON.kml(dom);
		    }

		    this.addGeojson(geojson);
		},

    registerKmlStyles:function(dom){
      this._kmlIconStyles={};
      var styles = dom.getElementsByTagName("Style");
      for(var i=0,nb=styles.length;i<nb;i++){
        var s = styles[i];
        var id = s.id;

        var iconStyles = s.getElementsByTagName("IconStyle");
        if(iconStyles.length!=1)
          continue;

        var is = iconStyles[0];
        var hrefs = is.getElementsByTagName("href");
        if(hrefs.length != 1)
          continue;

        this._kmlIconStyles["#"+id] = hrefs[0].innerHTML;
      }
    },

		importGeojson:function(event){
		    var content = event.target.result;

		    try{
		        var geojson = JSON.parse(content);
		    }
		    catch(err){
		        this.message("Le fichier en entrée n'est pas un fichier geojson valide.");
		        this.loading(false);
		    }
		    this._createResultLi();
		    this.addGeojson(geojson);
		},

    _geojsonGeometryToJsonGeometry:function(geojson_geometry){
       return GeojsonConverters.geojsonToArcGIS(geojson_geometry);
    },

    _geojsonToJson:function(geojson){
        //result may return geometry or list of geometries or feature or list of features
        var result = GeojsonConverters.geojsonToArcGIS(geojson);
        if(!result)
          return false;

        //If single object -> to array
        if(!Array.isArray(result)) result = [result];

        // if geometries, transform to features.
        for(var i=0,nb=result.length;i<nb;i++){
           //If is geometry -> to feature
           if(!result[i].geometry && (result[i].x || result[i].paths || result[i].rings)){
              result[i] = {
                geometry: result[i],
                attributes: {}
              };
           }
        }

        //Return esri json
        return {
          "features" : result,
          "displayFieldName" : "",
          "fieldAliases" : {},
          "spatialReference" : {
            "wkid" : 4326,
            "latestWkid" : 4326
          },
          "fields" : []
        }

    },

		addGeojson:function(geojson){
		    console.log("Geojson", geojson);
        var json = this._geojsonToJson(geojson);
        console.log("geojson", geojson);
        console.log("json", json);
        delete(geojson);

        var id_import =  'import'+this._nb_treatments;
        var id = id_import;
		    var layer = new GraphicsLayer({
		        id:id,
		        infoTemplate:new InfoTemplate(/*{title:this._current_filename}*/),
		        spatialReference:this.map.spatialReference
		    });
		    layer.name = this._current_filename;

		    for(var i=json.features.length-1;i>=0;i--){
		        json.features[i]["geometry"] = this.projectGeometry(json.features[i]["geometry"]);
		        layer.add(new Graphic(json.features[i]));
		    }

		    this._registerLayer(layer);

		    this.loading(false);
		},

        _proj4Converter:{},
        _getProj4Converter:function(src_wkid){
            if(!src_wkid)
                src_wkid = 4326;

            if(this._proj4Converter[src_wkid])
                return this._proj4Converter[src_wkid];

            var target_wkid =  this.map.spatialReference.wkid;

            //On peut trouver le convertisseur ?
            if(SRUtils.indexOfWkid(src_wkid)==-1)
                return false;

            var src_wkt = SRUtils.getCSStr(src_wkid).split("'").join('"');
            var target_wkt = SRUtils.getCSStr(target_wkid).split("'").join('"');

            this._proj4Converter[src_wkid] = proj4js(src_wkt, target_wkt);
            return this._proj4Converter[src_wkid];
        },
		projectGeometry:function(geom_json, src_wkid){
		    if(!src_wkid)
		        src_wkid = 4326;

		    var map_wkid = this.map.spatialReference.wkid;

		    // In and out SR equals
		    if(src_wkid == map_wkid)
		        return geom_json;

            var conv = this._getProj4Converter(src_wkid);
            if(!conv) return false;

            geom_json.spatialReference = {wkid:map_wkid};
            if(geom_json.x){
                var coords = conv.forward([geom_json.x, geom_json.y]); //NB : contraire = forward
                geom_json.x = coords[0];
                geom_json.y = coords[1];
                return geom_json;
            }

            if(geom_json.paths){
                geom_json.paths = this._convertCoords(conv, geom_json.paths);
                return geom_json;
            }
            if(geom_json.rings){
                geom_json.rings = this._convertCoords(conv, geom_json.rings);
                return geom_json;
            }
            return false;
		},
		_convertCoords:function(proj4Converter, coords_array){
            for(var i=0,nb=coords_array.length;i<nb;i++){
                if(Array.isArray(coords_array[i][0])){
                    coords_array[i] = this._convertCoords(proj4Converter, coords_array[i]);
                }
                else{
                    coords_array[i] = proj4Converter.forward(coords_array[i])
                }
            }
            return coords_array;
		}
	});
});
