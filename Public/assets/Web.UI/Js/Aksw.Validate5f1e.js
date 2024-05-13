var Aksw = Aksw ? Aksw : Aksw = {};

Aksw.Validate = function () {

    var internal = {
        ignoreValidation: function (element) {
            var ret = false;

            var panel = $(element).closest('div.a-panel');
            var dialog = $(element).closest('div.modal');

            if ($(element).attr('readonly'))
                ret = true;

            if (ret != true && panel != undefined && panel != null) {
                var contentpanel = $(panel).find('div.a-panel-content');
                var IgnoreValidateWhenCollapsed = contentpanel.data("ignorevalidatewhencollapsed");
                if (IgnoreValidateWhenCollapsed != undefined && IgnoreValidateWhenCollapsed != null && IgnoreValidateWhenCollapsed === true)
                    ret = (contentpanel.css('display') == "none");
            }

            if (ret != true && dialog != undefined && dialog != null) {
                var IgnoreValidateWhenCollapsed = dialog.data("ignorevalidatewhencollapsed");
                if (IgnoreValidateWhenCollapsed != undefined && IgnoreValidateWhenCollapsed != null && IgnoreValidateWhenCollapsed === true) {
                    var display = dialog.css('display');
                    ret = (display == undefined || display == null || display != "block");
                }
            }
            return ret;
        },
        ignoreValidationForMaskField: function (owner, element) {
            var ret = false;
            var panel = $(element).closest('div.a-panel');
            var dialog = $(element).closest('div.model');

            if (owner.attr('readonly'))
                ret = true;


            else if (panel != undefined && panel != null) {
                if ($(panel).find('div.a-panel-content').css('display') == "none")
                    ret = true;
            }

            else if (dialog != undefined && dialog != null) {
                var display = $(dialog).css('display');
                ret = (display == undefined || display == null || display != "block");
            }
            return ret;
        }
    };

    var external = {

        isDateValid: function (value, format) {
            var parts = Aksw.Util.parseDate(value, format);
            var m = parts.month;
            var d = parts.day;
            var y = parts.year;

            // validate all parts
            if (m === null || d === null || y === null)
                return false;

            // validate month
            if (m < 1 || m > 12)
                return false;

            // validate year
            if (y < 1753 || y > 9999)
                return false;

            // validate day
            if (d < 1 || d > 31)
                return false;
            var isLeapYear = ((y & 3) == 0 && (y % 100 || (y % 400 == 0 && y)));
            var daysInMonth = [31, (isLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var validDays = daysInMonth[m - 1];
            if (d < 1 || d > validDays) {
                return false;
            }

            // all good
            return true;
        },
        isDateValidMMYYYY: function (value) {
            var m = null;
            var y = null;

            if (value != undefined && value.length > 0) {
                m = value.substr(0, 2);
                y = value.substr(6, 4);
            }
            // validate all parts
            if (m === null || y === null)
                return false;

            // validate month
            if (m < 1 || m > 12)
                return false;

            // validate year
            if (y < 1753 || y > 9999)
                return false;

            // all good
            return true;
        },
        getDateMMYYYY: function (value) {
            if (value.length > 0) {
                //check if the date delimiter('/' or '-') occurs more than once, it it does the date is not in mm/yyyy format
                if (value.split('/').length == 2) {
                    return value.substr(0, 2) + '/01/' + value.substr(3, 4);
                }
                else if (value.split('-').length == 2) {
                    return value.substr(0, 2) + '-01-' + value.substr(3, 4);
                }
                else {
                    return "";
                }
            }
            else {
                return "";
            }
        },
    };

    var initialize = function () {
        $.validator.addMethod('aksw_interactionfieldvalidation', function (value, element) {

            var elem = $(element);
            if (internal.ignoreValidation(element)) {
                return true;
            }

            var autoBind = elem.data('autobind');
            if (autoBind) {
                // sometimes IE fires the validation event (blur, change) before knockout (blur, change)
                // when this happens, the custom validation is executed before the backing model has the new value from the DOM
                // therefore, the custom validation is using the previous value, not the new value
                // to avoid this sequence issue, forcibly update the backing model with the exising value being used here
                // wrap this in a try/catch because some things could go wrong (e.g. it's a calculated field, property doesn't exist for some reason, etc)
                try {
                    if (elem[0].type == 'checkbox')
                        $model.data[autoBind + '_Proxy'](elem[0].checked);
                    else
                        $model.data[autoBind + '_Proxy'](value);
                } catch (e) {
                    if (console) {
                        if (console.log) {
                            console.log('failed trying to update the backing model from element', element);
                        }
                    }
                }
            }

            var vaids = elem.data('msgvalidateids');
            if (vaids) {
                vaids = vaids.split(',');

                var vaerrids = [];
                $.each(vaids, function (i, id) {
                    var result = $model.interactions.validationChecks['id' + id].call(this);
                    if (result == true) {
                        vaerrids.push(id);
                    }
                });
                elem.data("msgerrids", vaerrids.join(',').toString());
                elem.data("msg", function (param, element) {
                    var errids = elem.data('msgerrids').split(',');
                    var msgs = [];
                    $.each(errids, function (i, id) {
                        var msg = $model.interactions.validationMessages['id' + id].call(this);
                        msgs.push(msg);
                    });
                    return msgs.join('<br/>');
                });
                return vaerrids.length == 0;
            } else {
                return true;
            }
        });
        // custom validation methods for the jquery plugin
        $.validator.addMethod('aksw_required', function (value, element) {
            return internal.ignoreValidation(element) ? true : (value.length > 0);
        });

        $.validator.addMethod('aksw_int', function (value, element) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;
            //return /^-?\d+$/.test(value);
            //this reg exp will allow commas, but commas break the server code
            return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value);
        });

        $.validator.addMethod('aksw_decimal', function (value, element) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;
            //return /^-?\d+(?:\.\d{1,4})?$/.test(value);
            //this reg exp will allow commas, but commas break the server code
            value = value.replace(/,/g, '');
            var numDecimals = $(element).data('numOfDecimals');
            numDecimals = isNaN(numDecimals) ? '0' : numDecimals;
            var regEx = new RegExp("^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)(?:\\.\\d{0," + numDecimals + "})?$");

            return regEx.test(value);
        });

        $.validator.addMethod('aksw_range', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;
            //remove commas
            value = parseFloat(value.replace(/,/g, ''));
            if (param[0] == null)
                return (value <= param[1]);

            if (param[1] == null)
                return (value >= param[0]);

            return (value >= param[0] && value <= param[1]);
        });

        $.validator.addMethod('aksw_date', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;

            return external.isDateValid(value, $(element).data('dateformat'));
        });

        $.validator.addMethod('aksw_datemin', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;

            var date = new Date(value);
            var min = new Date(param[0]);
            return (date >= min);
        });

        $.validator.addMethod('aksw_datemax', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;
            var date = new Date(value);
            var max = new Date(param[0]);
            return (date <= max);
        });

        $.validator.addMethod('aksw_daterange', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;

            var d1 = new Date(value);
            var min = new Date(param[0]);
            var max = new Date(param[1]);
            return (d1 >= min && d1 <= max);
        });

        $.validator.addMethod('aksw_dateMMYYYY', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;

            if (value.length == 0)
                return true;

            return external.isDateValidMMYYYY(external.getDateMMYYYY(value));
        });

        $.validator.addMethod('aksw_dateminMMYYYY', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;

            var dateVal = external.getDateMMYYYY(value)

            if (dateVal.length == 0)
                return true;

            var date = new Date(dateVal);
            var min = new Date(param[0]);
            return (date >= min);
        });

        $.validator.addMethod('aksw_datemaxMMYYYY', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;

            var dateVal = external.getDateMMYYYY(value)

            var date = new Date(dateVal);
            var max = new Date(param[0]);
            return (date <= max);
        });

        $.validator.addMethod('aksw_daterangeMMYYYY', function (value, element, param) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;

            var dateVal = external.getDateMMYYYY(value)

            var d1 = new Date(dateVal);
            var min = new Date(param[0]);
            var max = new Date(param[1]);
            return (d1 >= min && d1 <= max);
        });

        $.validator.addMethod('aksw_time', function (value, element) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;
            return /^((0?[1-9])|(1[0-2]))(((:)[0-5]+[0-9]+))(\s)([AaPp][Mm])$/.test(value);
        });

        $.validator.addMethod('aksw_regex', function (value, element, regex) {
            if (internal.ignoreValidation(element))
                return true;
            if (value.length == 0)
                return true;
            return regex.test(value);
        });


        // special validators for akswMaskedField
        // these validators will be attached to the masked field, but they need to test the value in the hidden raw field
        $.validator.addMethod('aksw_required_maskedfield', function (value, element) {
            var $this = $(element);
            var owner = $('#' + $this.data('ownerid'));
            value = owner.val();
            return internal.ignoreValidationForMaskField(owner, element) ? true : (value.length > 0);
        });

        $.validator.addMethod('aksw_regex_maskedfield', function (value, element, regex) {
            var $this = $(element);
            var owner = $('#' + $this.data('ownerid'));
            value = owner.val();
            if (internal.ignoreValidationForMaskField(owner, element))
                return true;
            if (value.length == 0)
                return true;
            return regex.test(value);
        });
        // end masked field

        $.validator.addMethod('aksw_required_radio', function (value, element) {
            // Confirm that a required collection of radio button fields has one option selected that is not the blank "None" radio button.
            var result = false;
            if ($(element).attr('disabled')) {
                result = true;
            }

            if (value === undefined || value.length <= 0) {
                result = false;
            } else {
                result = true;
            }

            return result;
        });
    }();

    return external;

}();
