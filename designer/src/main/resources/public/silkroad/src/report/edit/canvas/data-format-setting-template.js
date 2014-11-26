define(['template'], function (template) {
    function anonymous($data,$filename) {
        'use strict';
        $data=$data||{};
        var $utils=template.utils,$helpers=$utils.$helpers,defaultFormat=$data.defaultFormat,$each=$utils.$each,options=$data.options,$option=$data.$option,optionKey=$data.optionKey,$escape=$utils.$escape,dataFormat=$data.dataFormat,$formatItem=$data.$formatItem,name=$data.name,$out='';$out+='<!--\n数据例子：\nvar demoData = {\n    options: {\n        \'I,III\': \'千分位整数（18,383）\',\n        \'I,III.DD\': \'千分位两位小数（18,383.88）\',\n        \'I.DD%\': \'百分比两位小数（34.22%）\',\n        \'HH:mm:ss\': \'时间（13:23:22）\',\n        \'D天HH:mm:ss\': \'时间格式（2天1小时23分45秒）\'\n    },\n    defaultFormat: \'I,III\',\n    dataFormat: {\n        \'cash\': {\n            caption: \'现金\',\n            format: \'I,III\'\n        },\n        \'crm\': {\n            caption: \'点击消费\',\n            format: \'I,III.dd\'\n        }\n    }\n};\n-->\n<div class="data-format">\n    <div class="data-format-default">\n        <span>指标默认数据格式：</span>\n        <select name="defaultFormat">\n            <option value=""\n            ';
        if(!defaultFormat){
        $out+=' selected="selected" ';
        }
        $out+='>请选择</option>\n            ';
        $each(options,function($option,optionKey){
        $out+='\n            <option value=';
        $out+=$escape(optionKey);
        $out+='\n                ';
        if(defaultFormat && optionKey === defaultFormat){
        $out+='\n                    selected="selected"\n                ';
        }
        $out+='>';
        $out+=$escape($option);
        $out+='\n            </option>\n            ';
        });
        $out+='\n        </select>\n    </div>\n    <div class="data-format-alone">\n        <span>对各指标进行单独设置</span>\n        ';
        $each(dataFormat,function($formatItem,name){
        $out+='\n        <div class="data-format-alone-dim">\n            <span>';
        $out+=$escape($formatItem.caption);
        $out+='：</span>\n            <select name="';
        $out+=$escape(name);
        $out+='">\n                <option value="" ';
        if(!$formatItem.format){
        $out+=' selected="selected" ';
        }
        $out+='>请选择</option>\n                ';
        $each(options,function($option,optionKey){
        $out+='\n                <option value=';
        $out+=$escape(optionKey);
        $out+='\n                ';
        if($formatItem.format && optionKey === $formatItem.format){
        $out+=' selected="selected"\n                ';
        }
        $out+='>';
        $out+=$escape($option);
        $out+='</option>\n                ';
        });
        $out+='\n            </select>\n        </div>\n        ';
        });
        $out+='\n    </div>\n</div>';
        return $out;
    }
    return { render: anonymous };
});