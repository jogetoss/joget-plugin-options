PluginOptionsBuilder = {
    counter : 0
};
PluginOptionsBuilder.Options = {
    "options_ajax" : {
        "[CONTEXT_PATH]/web/json/console/app/[APP_PATH]/forms/options" : "Return all available forms of current app.",
        "[CONTEXT_PATH]/web/json/console/app/[APP_PATH]/datalist/options" : "Return all available datalists of current app.",
        "[CONTEXT_PATH]/web/json/console/app/[APP_PATH]/userview/options" : "Return all available userviews of current app.",
        "[CONTEXT_PATH]/web/property/json/getElements?classname={plugin interface/abstract class name, optional}" : "Return all available plugins based on the classname filter."

    },
    "options_callback" : {
        "DatalistBuilder.getColumnOptions" : "Datalist Builder - return all available columns based on binder configuration.",
        "FormBuilder.getFieldOptions" : "Form Builder - return all field ids based on current form design.",
        "FormBuilder.getAllFieldOptions" : "Form Builder - return all field ids from all the forms having the same table name."
    }
};
PluginOptionsBuilder.Types = {
    "repeater" : {
        render : function(parent, field, values) {
            var thisObj = this;

            if (values !== null && values !== undefined && !$.isArray(values)) {
                values = values[field.name];
            }

            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            inputContainer.find(".control-input").append("<div class=\"repeater-items\"></div><a class=\"add_row\" title=\"Add Row\"><i class=\"fa fa-plus-circle\"></i></a>");
            inputContainer.find(".add_row").on("click", function(){
                thisObj.addRow($(inputContainer).find("> .control-input > .repeater-items"), field, {});
            });

            if (values !== null && values !== undefined && values.length > 0) {
                for (var i in values) {
                    thisObj.addRow($(inputContainer).find("> .control-input > .repeater-items"), field, values[i]);
                }
            }
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            var values = [];

            $(inputContainer).find(" > .control-input > .repeater-items > .repeater-item").each(function(){
                var row = $(this);
                var rowContainer = $(row).find("> .panel-body");
                var temp = {};

                if (field.fields !== null && field.fields !== undefined && field.fields.length > 0) {
                    for (var i in field.fields) {
                        var fieldkey = field.fields[i];
                        var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                        var type = fieldDef.type;
                        var fieldValue = PluginOptionsBuilder.Types[type].getData(rowContainer, fieldDef);

                        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== "") {
                            if (fieldDef.includeInResult !== undefined && !fieldDef.includeInResult) {
                                continue;
                            }
                            if (type == "type") {
                                temp = jQuery.extend(temp, fieldValue);
                            } else {
                                temp[fieldDef.name] = fieldValue;
                            }
                        }
                    }
                }

                values.push(temp);
            });
            if (values.length > 0) {
                return values;
            } else {
                return null;
            }
        },
        validate : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            $(inputContainer).find(" > .control-input > .repeater-items > .repeater-item").each(function(){
                var row = $(this);
                var rowContainer = $(row).find("> .panel-body");

                if (field.fields !== null && field.fields !== undefined && field.fields.length > 0) {
                    for (var i in field.fields) {
                        var fieldkey = field.fields[i];
                        var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                        var type = fieldDef.type;
                        PluginOptionsBuilder.Types[type].validate(rowContainer, fieldDef);
                    }
                }
            });

            if (field.required !== undefined && field.required && $(inputContainer).find(" > .control-input > .repeater-items > .repeater-item").length === 0) {
                $(inputContainer).addClass("has-error");
                $(inputContainer).find(" > .control-input").append("<span class=\"help-block\">This field is required.</span>");
            }
        },
        addRow : function(container, field, rowValues) {
            if ($(container).closest(".form-group").hasClass("has-error")) {
                $(container).closest(".form-group").find(" > .control-input > .help-block").remove();
                $(container).closest(".form-group").removeClass("has-error");
            }

            var thisObj = this;

            var row = $("<div class=\"repeater-item panel panel-default\"><div class=\"panel-body\"><span class=\"repeater-buttons\"><a class=\"add_row\" title=\"Insert Row Above\"><i class=\"fa fa-plus-circle\"></i></a><a class=\"move_row_up\" title=\"Move Row Up\"><i class=\"fa fa-arrow-circle-up\"></i></a><a class=\"move_row_down\" title=\"Move Row Down\"><i class=\"fa fa-arrow-circle-down\"></i></a><a class=\"delete_row\" title=\"Delete Row\"><i class=\"fa fa-minus-circle\"></i></a></span></div></div>");
            var rowContainer = $(row).find(".panel-body");

            if (field.fields !== null && field.fields !== undefined && field.fields.length > 0) {
                for (var i in field.fields) {
                    var fieldkey = field.fields[i];
                    var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                    var type = fieldDef.type;
                    PluginOptionsBuilder.Types[type].render(rowContainer, fieldDef, rowValues);
                }
            }

            var rowButton = $(row).find("> div > .repeater-buttons");

            $(rowButton).find(".add_row").on("click", function(){
                var currentRow = $(this).closest(".repeater-item");
                var wrapper = $("<div class=\"temp_wrapper\"></div>");
                $(currentRow).before(wrapper);
                thisObj.addRow(wrapper, field, {});
                $(wrapper).find("> .repeater-item").unwrap();
            });
            $(rowButton).find(".move_row_up").on("click", function(){
                var currentRow = $(this).closest(".repeater-item");
                var prev = $(currentRow).prev(".repeater-item");
                if ($(prev).length > 0) {
                    $(prev).before(currentRow);
                }
            });
            $(rowButton).find(".move_row_down").on("click", function(){
                var currentRow = $(this).closest(".repeater-item");
                var next = $(currentRow).next(".repeater-item");
                if ($(next).length > 0) {
                    $(next).after(currentRow);
                }
            });
            $(rowButton).find(".delete_row").on("click", function(){
                if (confirm("Are you sure?")) {
                    $(this).closest(".repeater-item").remove();
                }
            });
            $(container).append(row);
        }
    },
    "text" : {
        render : function(parent, field, values) {
            var thisObj = this;
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var value = "";
            if (values != null && values != undefined && values[field.name] !== undefined && values[field.name] !== null) {
                value = values[field.name];
            }
            var required = "";
            if (field.required !== undefined && field.required) {
                required = " data-rule-required=\"true\"";
            }
            if (field.validationRules !== null && field.validationRules !== undefined) {
                required += " " + field.validationRules;
            }
            inputContainer.find(".control-input").append("<input name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"form-control\" value=\""+value+"\" "+required+"/>");
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            return $(inputContainer).find(" > .control-input > input").val();
        },
        validate : function(parent, field) {

        }
    },
    "textarea" : {
        render : function(parent, field, values) {
            var thisObj = this;
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var value = "";
            if (values != null && values != undefined && values[field.name] !== undefined && values[field.name] !== null) {
                value = values[field.name];
            }
            var required = "";
            if (field.required !== undefined && field.required) {
                required = " data-rule-required=\"true\"";
            }
            if (field.validationRules !== null && field.validationRules !== undefined) {
                required += " " + field.validationRules;
            }
            inputContainer.find(".control-input").append("<textarea name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"form-control\" rows=\"3\" "+required+">"+value+"</textarea>");
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            return $(inputContainer).find(" > .control-input > textarea").val();
        },
        validate : function(parent, field) {

        }
    },
    "truefalse" : {
        render : function(parent, field, values) {
            var thisObj = this;
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var checked = "";
            if (values != null && values != undefined && values[field.name] !== undefined && values[field.name] !== null &&  values[field.name].toLowerCase() === "true") {
                checked = " checked";
            }
            inputContainer.find(".control-input").append("<div class=\"checkbox\"><label><input name=\"p"+(PluginOptionsBuilder.counter++)+"\" type=\"checkbox\" value=\"true\" "+checked+" /></label></div>");
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            if ($(inputContainer).find(" > .control-input input").is(":checked")) {
                return "true";
            } else {
                return "";
            }
        },
        validate : function(parent, field) {

        }
    },
    "select" : {
        render : function(parent, field, values) {
            var value = "";
            if (values != null && values != undefined ) {
                value = values[field.name];
            }
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var required = "";
            if (field.required !== undefined && field.required) {
                required = " data-rule-required=\"true\"";
            }
            if (field.validationRules !== null && field.validationRules !== undefined) {
                required += " " + field.validationRules;
            }

            inputContainer.find(".control-input").append("<select name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"form-control\" "+required+"><option></option></select>");
            var select = inputContainer.find(".control-input select");
            var options = field.options;
            if ((typeof options) === "string") {
                options = PluginOptionsBuilder.Options[options];
            }
            for (var i in options) {
                $(select).append("<option value=\""+i+"\">"+options[i]+"</option>");
            }
            $(select).val(value);
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            return $(inputContainer).find(" > .control-input > select").val();
        },
        validate : function(parent, field) {

        }
    },
    "autocomplete" : {
        render : function(parent, field, values) {
            var thisObj = this;
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var value = "";
            if (values != null && values != undefined && values[field.name] !== undefined && values[field.name] !== null) {
                value = values[field.name];
            }
            var required = "";
            if (field.required !== undefined && field.required) {
                required = " data-rule-required=\"true\"";
            }
            if (field.validationRules !== null && field.validationRules !== undefined) {
                required += " " + field.validationRules;
            }
            inputContainer.find(".control-input").append("<input name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"typeahead form-control\" "+required+" autocomplete=\"off\" value=\""+value+"\" />");

            var options = field.options;
            if (!$.isArray(options)) {
                options = PluginOptionsBuilder.Options[options];
            }
            var optionsArray = [];
            for (var i in options) {
                optionsArray.push({"id":i, "name":options[i]});
            }

            $(parent).append(inputContainer);

            inputContainer.find(".typeahead").typeahead({
                source: optionsArray,
                displayText: function(item) {
                    if (item.id === undefined) {
                        return item;
                    } else {
                        return item.id + " - " + item.name;
                    }
                },
                updater: function(item) {
                    return item.id;
                }
            });
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            return $(inputContainer).find(" > .control-input > input").val();
        },
        validate : function(parent, field) {

        }
    },
    "type" : {
        render : function(parent, field, values) {
            var value = "";
            if (values != null && values != undefined && values[field.name] !== undefined) {
                value = values[field.name].toLowerCase();
            }
            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            var required = "";
            if (field.required !== undefined && field.required) {
                required = " data-rule-required=\"true\"";
            }
            if (field.validationRules !== null && field.validationRules !== undefined) {
                required += " " + field.validationRules;
            }
            inputContainer.find(".control-input").append("<select name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"form-control\" "+required+"></select>");
            var select = inputContainer.find(".control-input select");
            if (field.options[""] === undefined) {
                $(select).append("<option></option>");
            }
            for (var i in field.options) {
                $(select).append("<option value=\""+i+"\">"+field.options[i].label+"</option>");
                if (field.options[i].conditions !== undefined && $.isFunction(field.options[i].conditions)) {
                    if (field.options[i].conditions(value, values)) {
                        value = i;
                    }
                }
            }
            $(select).val(value);

            $(parent).append(inputContainer);
            var typeFieldsContainer = $("<div class=\"type_container\"></div>");
            $(parent).append(typeFieldsContainer);
            $(select).on("change", function() {
                if ($(typeFieldsContainer).find("*").length > 0) {
                    $(typeFieldsContainer).html("");
                }
                var v = $(select).val();
                if (field.options[v] !== undefined) {
                    var fields = field.options[v].fields;
                    if (fields !== null && fields !== undefined && fields.length > 0) {
                        for (var i in fields) {
                            var fieldkey = fields[i];
                            var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                            var type = fieldDef.type;
                            PluginOptionsBuilder.Types[type].render(typeFieldsContainer, fieldDef, values);
                        }
                    }
                }
            })
            $(select).trigger("change");
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            var fieldContainer = $(inputContainer).next(".type_container");
            var temp = {};
            var typeValue = $(inputContainer).find(" > .control-input > select").val()

            if (!(field.includeInResult !== undefined && !field.includeInResult)) {
                var v = typeValue;
                if (field.options[typeValue].value !== undefined) {
                    v = field.options[typeValue].value;
                }
                if (v !== "") {
                    temp[field.name] = v;
                }
            }

            if (field.options[typeValue] !== undefined) {
                var fields = field.options[typeValue].fields;
                if (fields !== null && fields !== undefined && fields.length > 0) {
                    for (var i in fields) {
                        var fieldkey = fields[i];
                        var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                        var type = fieldDef.type;
                        var fieldValue = PluginOptionsBuilder.Types[type].getData(fieldContainer, fieldDef);

                        if (fieldValue !== null && fieldValue !== undefined && fieldValue !== "") {
                            if (type == "type") {
                                temp = jQuery.extend(temp, fieldValue);
                            } else {
                                temp[fieldDef.name] = fieldValue;
                            }
                        }
                    }
                }
            }
            return temp;
        },
        validate : function(parent, field) {

        }
    },
    "textarray" : {
        render : function(parent, field, values) {
            var thisObj = this;
            if (!$.isArray(values)) {
                values = values[field.name];
            }

            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            inputContainer.find(".control-input").append("<div class=\"textarray-items\"></div><a class=\"add_row\" title=\"Add Row\"><i class=\"fa fa-plus-circle\"></i></a>");
            inputContainer.find(".add_row").on("click", function(){
                thisObj.addRow($(inputContainer).find("> .control-input > .textarray-items"), field, "");
            });

            if (values !== null && values !== undefined && values.length > 0) {
                for (var i in values) {
                    thisObj.addRow($(inputContainer).find("> .control-input > .textarray-items"), field, values[i]);
                }
            }
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            var temp = [];

            $(inputContainer).find("input").each(function(){
                if ($(this).val() !== "") {
                    temp.push($(this).val());
                }
            });

            if (temp.length > 0) {
                return temp;
            } else {
                return null;
            }
        },
        validate : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            if (field.required !== undefined && field.required && $(inputContainer).find(" > .control-input > .textarray-items > .textarray-item").length === 0) {
                $(inputContainer).addClass("has-error");
                $(inputContainer).find(" > .control-input").append("<span class=\"help-block\">This field is required.</span>");
            }
        },
        addRow : function(container, field, rowValue) {
            if ($(container).closest(".form-group").hasClass("has-error")) {
                $(container).closest(".form-group").find(" > .control-input > .help-block").remove();
                $(container).closest(".form-group").removeClass("has-error");
            }
            var thisObj = this;

            var row = $("<div class=\"textarray-item panel panel-default\"><div class=\"panel-body\"><input name=\"p"+(PluginOptionsBuilder.counter++)+"\" class=\"form-control\" type=\"text\" value=\""+rowValue+"\" /><span class=\"textarray-buttons\"><a class=\"add_row\" title=\"Insert Row Above\"><i class=\"fa fa-plus-circle\"></i></a><a class=\"move_row_up\" title=\"Move Row Up\"><i class=\"fa fa-arrow-circle-up\"></i></a><a class=\"move_row_down\" title=\"Move Row Down\"><i class=\"fa fa-arrow-circle-down\"></i></a><a class=\"delete_row\" title=\"Delete Row\"><i class=\"fa fa-minus-circle\"></i></a></span></div></div>");

            var rowButton = $(row).find("> div > .textarray-buttons");

            $(rowButton).find(".add_row").on("click", function(){
                var currentRow = $(this).closest(".textarray-item");
                var wrapper = $("<div class=\"temp_wrapper\"></div>");
                $(currentRow).before(wrapper);
                thisObj.addRow(wrapper, field, "");
                $(wrapper).find("> .textarray-item").unwrap();
            });
            $(rowButton).find(".move_row_up").on("click", function(){
                var currentRow = $(this).closest(".textarray-item");
                var prev = $(currentRow).prev(".textarray-item");
                if ($(prev).length > 0) {
                    $(prev).before(currentRow);
                }
            });
            $(rowButton).find(".move_row_down").on("click", function(){
                var currentRow = $(this).closest(".textarray-item");
                var next = $(currentRow).next(".textarray-item");
                if ($(next).length > 0) {
                    $(next).after(currentRow);
                }
            });
            $(rowButton).find(".delete_row").on("click", function(){
                if (confirm("Are you sure?")) {
                    $(this).closest(".textarray-item").remove();
                }
            });
            $(container).append(row);
        }
    },
    "group" : {
        render : function(parent, field, values) {
            var thisObj = this;

            if (values != null && values != undefined ) {
                values = values[field.name];
            }

            var inputContainer = PluginOptionsBuilder.Methods.getFieldContainer(field);
            inputContainer.find(".control-input").append("<div class=\"group-item panel panel-default\"><div class=\"panel-body\"></div></div>");
            var container = inputContainer.find(".panel-body");
            if (field.fields !== null && field.fields !== undefined && field.fields.length > 0) {
                for (var i in field.fields) {
                    var fieldkey = field.fields[i];
                    var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                    var type = fieldDef.type;
                    PluginOptionsBuilder.Types[type].render(container, fieldDef, values);
                }
            }
            $(parent).append(inputContainer);
        },
        getData : function(parent, field) {
            var inputContainer = $(parent).find("> .form-group[data-name='"+field.name+"']");
            var fieldContainer = $(inputContainer).find(" > .control-input > .group-item > .panel-body");
            var temp = {};
            if (field.fields !== null && field.fields !== undefined && field.fields.length > 0) {
                for (var i in field.fields) {
                    var fieldkey = field.fields[i];
                    var fieldDef = PluginOptionsBuilder.Definitions[fieldkey];
                    var type = fieldDef.type;
                    var fieldValue = PluginOptionsBuilder.Types[type].getData(fieldContainer, fieldDef);

                    if (fieldValue !== null && fieldValue !== undefined && fieldValue !== "") {
                        if (fieldDef.includeInResult !== undefined && !fieldDef.includeInResult) {
                            continue;
                        }
                        if (type == "type") {
                            temp = jQuery.extend(temp, fieldValue);
                        } else {
                            temp[fieldDef.name] = fieldValue;
                        }
                    }
                }
            }
            if (Object.getOwnPropertyNames(temp).length > 0) {
                return temp;
            } else {
                return null;
            }
        },
        validate : function(parent, field) {

        }
    }
};
PluginOptionsBuilder.Definitions = {
    "pages" : {
        "name" : "pages",
        "label" : "Pages",
        "type" : "repeater",
        "fields" : ["title", "properties", "validators", "buttons", "helplink", "hidden", "control_field", "control_value", "control_use_regex"]
    },
    "title" : {
        "name": "title",
        "label" : "Page Title",
        "type" : "text",
        "required" : true
    },
    "properties" : {
        "name" : "properties",
        "label" : "Properties",
        "type" : "repeater",
        "required" : true,
        "fields" : ["name", "label", "description", "properties_type"]
    },
    "validators" : {
        "name" : "validators",
        "label" : "Validators",
        "type" : "repeater",
        "fields" : ["validators_type"]
    },
    "buttons" : {
        "name" : "buttons",
        "label" : "Buttons",
        "type" : "repeater",
        "fields" : ["button_name", "button_label", "ajax_url", "button_fields", "addition_fields"]
    },
    "helplink" : {
        "name" : "helplink",
        "label" : "Help Link",
        "type" : "text"
    },
    "hidden" : {
        "name" : "hidden",
        "label" : "Hide This Page?",
        "type" : "truefalse",
    },
    "name" : {
        "name" : "name",
        "label" : "Property Name",
        "type" : "text",
        "required" : true
    },
    "label" : {
        "name" : "label",
        "label" : "Property Label",
        "type" : "text",
        "required" : true
    },
    "description" : {
        "name" : "description",
        "label" : "Description",
        "type" : "text"
    },
    "properties_type" : {
        "name" : "type",
        "label" : "Property Type",
        "type" : "type",
        "required" : true,
        "options" : {
            "autocomplete" : {
                "label" : "Auto Complete",
                "fields" : ["value_string", "options_type", "size", "maxlength", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "checkbox" : {
                "label" : "Check Box",
                "fields" : ["value_string", "options_type", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "codeeditor" : {
                "label" : "Code Editor",
                "fields" : ["value_string", "codeeditor_theme", "codeeditor_mode", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "htmleditor" : {
              "label" : "Content Editor",
              "fields" : ["value_text", "height", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "color" : {
                "label" : "Color Picker",
                "fields" : ["value_string", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "elementselect" : {
                "label" : "Element Select Box",
                "fields" : ["value_string", "elementselect_url", "keep_value_on_change", "options_type", "required", "control_field", "control_value", "control_use_regex", "js_validation"]
            },
            "file" : {
                "label" : "File",
                "fields" : ["value_string", "allowInput", "appResourcePrefix", "isPublic", "maxFileSize", "allowType", "appPath", "size", "maxlength", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "grid" : {
              "label" : "Grid",
              "fields" : ["columns", "required", "control_field", "control_value", "control_use_regex", "js_validation"]
            },
            "gridcombine" : {
              "label" : "Grid Combine",
              "fields" : ["columns", "required", "control_field", "control_value", "control_use_regex", "js_validation"]
            },
            "gridfixedrow" : {
              "label" : "Grid Fixed Row",
              "fields" : ["columns", "grid_rows", "required", "control_field", "control_value", "control_use_regex", "js_validation"]
            },
            "header" : {
              "label" : "Header",
              "fields" : ["control_field", "control_value", "control_use_regex"]
            },
            "hidden" : {
              "label" : "Hidden",
              "fields" : ["value_string", "control_field", "control_value", "control_use_regex"]
            },
            "image" : {
                "label" : "Image",
                "fields" : ["value_string", "allowInput", "imagesize", "isPublic", "maxFileSize", "allowType", "appPath", "size", "maxlength", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "label" : {
                "label" : "Label",
                "fields" : ["value_string", "control_field", "control_value", "control_use_regex"]
            },
            "multiselect" : {
                "label" : "Multi Selectbox",
                "fields" : ["value_string", "options_type", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "password" : {
                "label" : "Password",
                "fields" : ["value_string", "size", "maxlength", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "radio" : {
                "label" : "Radio Button",
                "fields" : ["value_string", "options_type", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "readonly" : {
                "label" : "Readonly",
                "fields" : ["value_string", "control_field", "control_value", "control_use_regex"]
            },
            "selectbox" : {
                "label" : "Selectbox",
                "fields" : ["value_string", "options_type", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "sortableselect" : {
                "label" : "Sortable Selectbox",
                "fields" : ["value_string", "options_type", "supportHash", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "textarea" : {
                "label" : "Textarea",
                "fields" : ["value_text", "textarea_rows", "textarea_cols", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            },
            "textfield" : {
                "label" : "Text Field",
                "fields" : ["value_string", "size", "maxlength", "required", "control_field", "control_value", "control_use_regex", "regex_validation", "validation_message", "js_validation"]
            }
        }
    },
    "value_string" : {
        "name" : "value",
        "label" : "Default Value",
        "type" : "text"
    },
    "value_text" : {
        "name" : "value",
        "label" : "Default Value",
        "type" : "textarea"
    },
    "size" : {
        "name" : "size",
        "label" : "Field Size",
        "type" : "text",
        "validationRules" : "data-rule-digits=\"true\""
    },
    "maxlength" : {
        "name" : "maxlength",
        "label" : "Max Length",
        "type" : "text",
        "validationRules" : "data-rule-digits=\"true\""
    },
    "height" : {
      "name" : "height",
      "label" : "Editor Height",
      "type" : "text",
      "validationRules" : "data-rule-digits=\"true\""
    },
    "options_type" : {
        "name" : "type",
        "label" : "Options Type",
        "type" : "type",
        "includeInResult" : false,
        "options" : {
            "" : {
                "conditions" : function(value, properties) {
                    if (properties["options_ajax"] === undefined || properties["options_callback"] === undefined|| properties["options_script"] === undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "Normal",
                "fields" : ["options"]
            },
            "ajax" : {
                "conditions" : function(value, properties) {
                    if (properties["options_ajax"] !== undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "AJAX",
                "fields" : ["options_ajax", "options_ajax_method", "options_ajax_mapping", "options_ajax_on_change", "options_extra"]
            },
            "callback" : {
                "conditions" : function(value, properties) {
                    if (properties["options_callback"] !== undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "Callback",
                "fields" : ["options_callback", "options_callback_on_change", "options_extra"]
            },
            "script" : {
                "conditions" : function(value, properties) {
                    if (properties["options_script"] !== undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "Javascript",
                "fields" : ["options_script", "options_extra"]
            },
        }
    },
    "options" : {
        "name" : "options",
        "label" : "Options",
        "type" : "repeater",
        "fields" : ["option_value", "option_label"]
    },
    "option_value" : {
        "name" : "value",
        "label" : "Option Value",
        "type" : "text"
    },
    "option_label" : {
        "name" : "label",
        "label" : "Option Label",
        "type" : "text"
    },
    "options_ajax" : {
        "name" : "options_ajax",
        "label" : "Option AJAX URL",
        "desc" : "An URL which will return an array of JSON object with 'value' and 'label' attributes.",
        "type" : "autocomplete",
        "options" : "options_ajax",
        "required" : true
    },
    "options_ajax_method" : {
        "name" : "options_ajax_method",
        "label" : "Option AJAX Method",
        "desc" : "An URL which will return an array of JSON object with 'value' and 'label' attributes.",
        "type" : "select",
        "options" : {
            "" : "GET",
            "POST" : "POST"
        }
    },
    "options_ajax_mapping" : {
        "name" : "options_ajax_mapping",
        "label" : "Option AJAX Setting",
        "type" : "group",
        "fields" : ["oam_addEmpty", "oam_arrayObj", "oam_value", "oam_label"]
    },
    "oam_addEmpty" : {
        "name" : "addEmpty",
        "label" : "Add Empty Option?",
        "type" : "truefalse",
    },
    "oam_arrayObj" : {
        "name" : "arrayObj",
        "label" : "Options Array Object",
        "type" : "text"
    },
    "oam_value" : {
        "name" : "value",
        "label" : "Value Attribute Name",
        "type" : "text"
    },
    "oam_label" : {
        "name" : "label",
        "label" : "Label Attribute Name",
        "type" : "text"
    },
    "options_ajax_on_change" : {
        "name" : "options_ajax_on_change",
        "label" : "Option AJAX On Change",
        "desc" : "Fields on change rules to trigger AJAX call.",
        "type" : "text"
    },
    "options_callback" : {
        "name" : "options_callback",
        "label" : "Option Callback Function",
        "desc" : "A javascript function name. All attributes in the field will passed as a single JSON object parameter to this function. The function should return an array of JSON object with 'value' and 'label' attributes.",
        "type" : "autocomplete",
        "options" : "options_callback",
        "required" : true
    },
    "options_callback_on_change" : {
        "name" : "options_callback_on_change",
        "label" : "Option Callback On Change",
        "desc" : "Fields on change rules to trigger Callback function.",
        "type" : "text"
    },
    "options_script" : {
        "name" : "options_script",
        "label" : "Options Javascript",
        "desc" : "A string of javascript which will return an array of JSON object with 'value' and 'label' attributes.",
        "type" : "textarea",
        "required" : true
    },
    "options_extra" : {
        "name" : "options_extra",
        "label" : "Additional Options",
        "desc" : "Additional Options Add To AJAX/Callback/Srcipt Result",
        "type" : "repeater",
        "fields" : ["option_value", "option_label"]
    },
    "codeeditor_theme" : {
        "name" : "theme",
        "label" : "Editor Theme",
        "type" : "text"
    },
    "codeeditor_mode" : {
        "name" : "mode",
        "label" : "Editor Mode",
        "type" : "text"
    },
    "elementselect_url" : {
        "name" : "url",
        "label" : "Element Properties URL",
        "type" : "text",
        "value" : "[CONTEXT_PATH]/web/property/json[APP_PATH]/getPropertyOptions",
        "required" : true
    },
    "keep_value_on_change" : {
        "name" : "keep_value_on_change",
        "label" : "Keep Properties On Change?",
        "desc" : "Remain the configured properties value if the property name is exist for new selected element.",
        "type" : "truefalse"
    },
    "appPath" : {
        "name" : "appPath",
        "label" : "App path",
        "type" : "text",
        "value" : "[APP_PATH]",
        "required" : true
    },
    "allowType" : {
        "name" : "allowType",
        "label" : "Allowed File Type",
        "type" : "text"
    },
    "maxFileSize" : {
        "name" : "maxSize",
        "label" : "Max File Size",
        "type" : "text",
        "validationRules" : "digits"
    },
    "allowInput" : {
        "name" : "allowInput",
        "label" : "Allow Manual Input?",
        "type" : "truefalse"
    },
    "appResourcePrefix" : {
        "name" : "appResourcePrefix",
        "label" : "Auto Preprend App Resource Prefix?",
        "type" : "truefalse"
    },
    "isPublic" : {
        "name" : "isPublic",
        "label" : "Public Permisson?",
        "desc" : "Set uploaded file to public permission.",
        "type" : "truefalse"
    },
    "imagesize" : {
        "name" : "imageSize",
        "label" : "Image Size",
        "type" : "text",
        "validationRules" : "data-rule-digits=\"true\""
    },
    "columns" : {
        "name" : "columns",
        "label" : "Columns",
        "type" : "repeater",
        "fields" : ["columns_key", "columns_label", "columns_type", "required"]
    },
    "columns_key" : {
        "name" : "key",
        "label" : "Column Key",
        "type" : "text",
        "required" : true
    },
    "columns_label" : {
        "name" : "label",
        "label" : "Column Label",
        "type" : "text",
        "required" : true
    },
    "columns_type" : {
        "name" : "type",
        "label" : "Column Type",
        "type" : "type",
        "options" : {
            "" : {
                "label" : "Text Field",
                "fields" : []
            },
            "autocomplete" : {
                "label" : "Auto Complete",
                "fields" : ["column_options_type"]
            },
            "select" : {
                "conditions" : function(value, properties) {
                    if (value !== "autocomplete" && (properties["options"] !== undefined || properties["options_ajax"] !== undefined)) {
                        return true;
                    }
                    return false;
                },
                "label" : "Selectbox",
                "fields" : ["column_options_type"],
                "value" : ""
            },
            "truefalse" : {
                "label" : "True/False",
                "fields" : ["true_value", "false_value"]
            }
        }
    },
    "column_options_type" : {
        "name" : "option_type",
        "label" : "Options Type",
        "type" : "type",
        "options" : {
            "" : {
                "conditions" : function(value, properties) {
                    if (properties["options_ajax"] === undefined || properties["options_callback"] === undefined|| properties["options_script"] === undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "Normal",
                "fields" : ["options"]
            },
            "ajax" : {
                "conditions" : function(value, properties) {
                    if (properties["options_ajax"] !== undefined) {
                        return true;
                    }
                    return false;
                },
                "label" : "AJAX",
                "fields" : ["options_ajax", "options_ajax_method", "options_ajax_mapping", "options_ajax_on_change", "options_extra"]
            }
        }
    },
    "grid_rows" : {
        "name" : "rows",
        "label" : "Rows",
        "type" : "repeater",
        "fields" : ["row_label", "required"]
    },
    "row_label" : {
        "name" : "label",
        "label" : "Row Label",
        "type" : "text",
        "required" : true
    },
    "true_value" : {
        "name" : "true_value",
        "label" : "True Value",
        "type" : "text"
    },
    "false_value" : {
        "name" : "false_value",
        "label" : "False Value",
        "type" : "text"
    },
    "textarea_rows" : {
        "name" : "rows",
        "label" : "Rows",
        "type" : "text",
        "validationRules" : "data-rule-digits=\"true\""
    },
    "textarea_cols" : {
        "name" : "cols",
        "label" : "Columns",
        "type" : "text",
        "validationRules" : "data-rule-digits=\"true\""
    },
    "required" : {
        "name" : "required",
        "label" : "Mandatory?",
        "type" : "truefalse"
    },
    "supportHash" : {
        "name" : "supportHash",
        "label" : "Support Hash Variable?",
        "desc" : "Allow using to convert this field to text field to store hash variable.",
        "type" : "truefalse"
    },
    "control_field" : {
        "name" : "control_field",
        "label" : "Control Field",
        "desc" : "Use the selected field to control the show/hide of this object.",
        "type" : "text"
    },
    "control_value" : {
        "name" : "control_value",
        "label" : "Control Value",
        "type" : "text",
    },
    "control_use_regex" : {
        "name" : "control_use_regex",
        "label" : "Using Regex For Control?",
        "type" : "truefalse"
    },
    "regex_validation" : {
        "name" : "regex_validation",
        "label" : "Regex validation",
        "type" : "text"
    },
    "validation_message" : {
        "name" : "validation_message",
        "label" : "Regex validation Error Message",
        "type" : "text"
    },
    "js_validation" : {
        "name" : "js_validation",
        "label" : "Javascript Validation Function",
        "desc" : "A Javasction function accept the property name and value as argument and return the error message.",
        "type" : "text"
    },
    "validators_type" : {
        "name" : "type",
        "label" : "Validator Type",
        "type" : "type",
        "required" : true,
        "options" : {
            "ajax" : {
                "label" : "AJAX Call Validation",
                "fields" : ["url", "default_error_message"],
                "value" : "AJAX"
            }
        }
    },
    "url" : {
        "name" : "url",
        "label" : "AJAX URL",
        "desc" : "An URL return a JSON Object with status (success or fail) & message (JSONArray of String) attribute",
        "type" : "text",
        "required" : true
    },
    "default_error_message" : {
        "name" : "default_error_message",
        "label" : "Default Error Message",
        "type" : "text"
    },
    "button_name" : {
        "name" : "name",
        "label" : "Button Name",
        "type" : "text",
        "required" : true
    },
    "button_label" : {
        "name" : "label",
        "label" : "Button Label",
        "type" : "text",
        "required" : true
    },
    "ajax_url" : {
        "name" : "ajax_url",
        "label" : "Button AJAX URL",
        "desc" : "An URL to execute the button action. The URL should return a JSON Object with message (String) attribute.",
        "type" : "text",
        "required" : true
    },
    "button_fields" : {
        "name" : "fields",
        "label" : "Property Fields",
        "desc" : "An list of property fields name in the same page that will be used by this button.",
        "type" : "textarray"
    },
    "addition_fields" : {
        "name" : "addition_fields",
        "label" : "Additional Property Fields",
        "desc" : "Additional property fields will be shown in a popup dialog to collect extra data when button is click.",
        "type" : "repeater",
        "fields" : ["name", "label", "description", "properties_type"]
    }
};
PluginOptionsBuilder.Methods = {
    editor : null,
    jsonDefinition : null,
    validator : null,
    init : function() {
        // override jquery validate plugin defaults
        $.validator.setDefaults({
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            unhighlight: function(element) {
                $(element).closest('.form-group').removeClass('has-error');
            },
            errorElement: 'span',
            errorClass: 'help-block',
            errorPlacement: function(error, element) {
                if(element.parent('.input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
            }
        });
        this.initDefinitionEditor();
        this.initTabs();

        this.loadDefinition();
    },
    initDefinitionEditor : function() {
        this.editor = ace.edit("jsondefinition");
        this.editor.setTheme("ace/theme/textmate");
        this.editor.getSession().setMode("ace/mode/json");
        this.editor.getSession().setTabSize(4);
        this.editor.setAutoScrollEditorIntoView(true);
        this.editor.setOption("maxLines", 1000000);
        this.editor.setOption("minLines", 45);
        this.editor.resize();
    },
    initTabs : function() {
        $('#tabnav a').click(function (e) {
            e.preventDefault();
            if ($(this).attr("href") === "#definition") {
                if (PluginOptionsBuilder.Methods.validateData()) {
                    PluginOptionsBuilder.Methods.updateDefinition();
                    PluginOptionsBuilder.Methods.editor.resize();
                    $(this).tab('show');
                }
            } else {
                PluginOptionsBuilder.Methods.loadDefinition();
                $(this).tab('show');
            }
            return false;
        })
    },
    loadDefinition : function() {
        var newJsonDef = this.editor.getValue();
        if (this.jsonDefinition !== newJsonDef) {
            this.jsonDefinition = newJsonDef;

            var jsonDefObject = [];
            try {
                jsonDefObject = eval(this.jsonDefinition);
            } catch (err) {}

            $("form").html("");
            PluginOptionsBuilder.counter = 0;
            var pageDef = PluginOptionsBuilder.Definitions["pages"];
            var type = pageDef.type;
            PluginOptionsBuilder.Types[type].render($("form"), pageDef, jsonDefObject);
        }
    },
    updateDefinition : function() {
        var pageDef = PluginOptionsBuilder.Definitions["pages"];
        var type = pageDef.type;
        var jsonDefObject = PluginOptionsBuilder.Types[type].getData($("form"), pageDef);
        if (jsonDefObject === null) {
            jsonDefObject = [];
        }
        this.editor.setValue(JSON.stringify(jsonDefObject, null, 4));
    },
    getFieldContainer : function(fieldDef) {
        var tooltip = "";
        if (fieldDef.desc !== null && fieldDef.desc !== undefined && fieldDef.desc !== "") {
            tooltip = " <a data-toggle=\"tooltip\" data-placement=\"right\" title=\""+fieldDef.desc+"\"><i class=\"fa fa-info-circle\"></i></a>";
        }
        var required = "";
        if (fieldDef.required) {
            required = " <span class=\"required\">*</span>";
        }
        var label_width = "2";
        var value_width = "10";
        if (fieldDef.name === "pages") {
          label_width = "1";
          value_width = "11";
        }
        var container = $("<div class=\"form-group\" data-name=\""+fieldDef.name+"\"><label class=\"col-sm-"+label_width+" control-label\">"+fieldDef.label+required+tooltip+"</label><div class=\"col-sm-"+value_width+" control-input\"></div></div>");
        $(container).find('[data-toggle="tooltip"]').tooltip();

        return container;
    },
    validateData : function() {
        if (this.validator !== null) {
            this.validator.resetForm();
            this.validator.destroy();
        }
        $(".form-horizontal").find(".help-block").remove();
        $(".form-horizontal").find(".has-error").removeClass("has-error");

        this.validator = $(".form-horizontal").validate();
        var valid = $(".form-horizontal").valid();

        var pageDef = PluginOptionsBuilder.Definitions["pages"];
        var type = pageDef.type;
        PluginOptionsBuilder.Types[type].validate($("form"), pageDef);
        if (valid && $(".form-horizontal").find(".has-error").length > 0) {
            valid = false;
        }
        return valid;
    }
}
$(document).ready(function(){
    PluginOptionsBuilder.Methods.init();
});
