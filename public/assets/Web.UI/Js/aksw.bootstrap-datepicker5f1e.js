 (function () {
            function UTCDate() {
                return new Date(Date.UTC.apply(Date, arguments));
            }

            function IsValidDate(setters_order, parsed) {
                var r = 1;
                for (i = 0; i < setters_order.length; i++) {
                    var s = setters_order[i];
                    var v = parsed[s];
                    if(isNaN(parsed[s])) continue;
                    r--;
                    switch (s) {
                        case "yyyy":
                        case "yy":
                            if (v >= 1900) r++;
                            break;
                        case "MM":
                        case "M":
                        case "mm":
                        case "m":
                            if (v >= 1 && v <= 12) r++;
                            break;
                        case "dd":
                        case "d":
                            if (v >= 1 && v <= 31) r++;
                            break;
                    }
                    if (!r) break;
                }
                return r;
            }

             var DPGlobal = $.fn.datepicker.DPGlobal;
             DPGlobal.parseDate = function (date, format, language){
                 if (!date)
                     return undefined;
                 if (date instanceof Date)
                     return date;
                 if (typeof format === 'string')
                     format = DPGlobal.parseFormat(format);
                 var part_re = /([\-+]\d+)([dmwy])/,
                     parts = date.match(/([\-+]\d+)([dmwy])/g),
                     part, dir, i;
                 if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
                     date = new Date();
                     for (i = 0; i < parts.length; i++) {
                         part = part_re.exec(parts[i]);
                         dir = parseInt(part[1]);
                         switch (part[2]) {
                             case 'd':
                                 date.setUTCDate(date.getUTCDate() + dir);
                                 break;
                             case 'm':
                                 date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
                                 break;
                             case 'w':
                                 date.setUTCDate(date.getUTCDate() + dir * 7);
                                 break;
                             case 'y':
                                 date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
                                 break;
                         }
                     }
                     return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
                 }
                 parts = date && date.match(this.nonpunctuation) || [];
                 date = new Date();
                 var parsed = {},
                     setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                     setters_map = {
                         yyyy: function (d, v) {
                             return d.setUTCFullYear(v);
                         },
                         yy: function (d, v) {
                             return d.setUTCFullYear(2000 + v);
                         },
                         m: function (d, v) {
                             if (isNaN(d))
                                 return d;
                             v -= 1;
                             while (v < 0) v += 12;
                             v %= 12;
                             d.setUTCMonth(v);
                             while (d.getUTCMonth() !== v)
                                 d.setUTCDate(d.getUTCDate() - 1);
                             return d;
                         },
                         d: function (d, v) {
                             return d.setUTCDate(v);
                         }
                     },
                     val, filtered;
                 setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
                 setters_map['dd'] = setters_map['d'];
                 date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
                 var fparts = format.parts.slice();
                 // Remove noop parts
                 if (parts.length !== fparts.length) {
                     fparts = $(fparts).filter(function (i, p) {
                         return $.inArray(p, setters_order) !== -1;
                     }).toArray();
                 }
                 // Process remainder
                 function match_part() {
                     var m = this.slice(0, parts[i].length),
                         p = parts[i].slice(0, m.length);
                     return m === p;
                 }
                 if (parts.length === fparts.length) {
                     var cnt;
                     for (i = 0, cnt = fparts.length; i < cnt; i++) {
                         val = parseInt(parts[i], 10);
                         part = fparts[i];
                         if (isNaN(val)) {
                             switch (part) {
                                 case 'MM':
                                     filtered = $(dates[language].months).filter(match_part);
                                     val = $.inArray(filtered[0], dates[language].months) + 1;
                                     break;
                                 case 'M':
                                     filtered = $(dates[language].monthsShort).filter(match_part);
                                     val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                     break;
                             }
                         }
                         parsed[part] = val;
                     }

                     if (IsValidDate(setters_order, parsed))
                     {
                         var _date, s;
                         for (i = 0; i < setters_order.length; i++) {
                             s = setters_order[i];
                             if (s in parsed && !isNaN(parsed[s])) {
                                 _date = new Date(date);
                                 setters_map[s](_date, parsed[s]);
                                 if (!isNaN(_date))
                                     date = _date;
                             }
                         }
                     }
                 }
                 return date;
               
             }
        })();